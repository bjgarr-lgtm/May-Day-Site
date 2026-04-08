import dotenv from 'dotenv'
import { chromium } from 'playwright'

dotenv.config()

const INGEST_URL = process.env.INGEST_URL
const INGEST_TOKEN = process.env.INGEST_TOKEN
const OFFICIAL_PROFILE = process.env.OFFICIAL_PROFILE || 'maydayontheharbor'
const HASHTAG = process.env.HASHTAG || 'MayDayOnTheHarbor'
const SCRAPE_INTERVAL_MS = Number(process.env.SCRAPE_INTERVAL_MS || 60000)
const HEADLESS = String(process.env.HEADLESS || 'true').toLowerCase() !== 'false'
const MAX_PER_SOURCE = 8
const PROFILE_DIR = './playwright-profile'

if (!INGEST_URL || !INGEST_TOKEN) {
  console.error('Missing INGEST_URL or INGEST_TOKEN in .env')
  process.exit(1)
}

const profileUrl = `https://www.instagram.com/${OFFICIAL_PROFILE}/`
const hashtagUrl = `https://www.instagram.com/explore/tags/${HASHTAG.toLowerCase()}/`

function stamp() {
  return new Date().toLocaleTimeString()
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function cleanCaption(value) {
  if (!value || typeof value !== 'string') return ''

  let text = value.replace(/\s+/g, ' ').trim()
  if (!text) return ''

  const quotedMatch = text.match(/["“](.*?)["”](?!.*["“].*["”])/)
  if (quotedMatch?.[1]) {
    const quoted = quotedMatch[1].trim()
    if (quoted) text = quoted
  }

  text = text
    .replace(/^Photo by .*?\.\s*/i, '')
    .replace(/^May be an image of .*?\.\s*/i, '')
    .replace(/^No photo description available\.\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim()

  return text
}

async function scrapePostDetail(context, post) {
  const detailPage = await context.newPage()

  try {
    await detailPage.goto(post.permalink, { waitUntil: 'domcontentloaded', timeout: 60000 })
    await sleep(2500)

    const detail = await detailPage.evaluate(() => {
      const readMeta = (selector) => {
        const el = document.querySelector(selector)
        return el?.getAttribute('content') || ''
      }

      const ldJsonRaw = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
        .map((node) => node.textContent || '')
        .find(Boolean) || ''

      let ldJsonCaption = ''
      if (ldJsonRaw) {
        try {
          const parsed = JSON.parse(ldJsonRaw)
          ldJsonCaption = parsed?.caption || parsed?.articleBody || ''
        } catch {}
      }

      const articleText = Array.from(document.querySelectorAll('article h1, article span, article div[dir="auto"]'))
        .map((node) => (node.textContent || '').trim())
        .filter(Boolean)
        .sort((a, b) => b.length - a.length)[0] || ''

      return {
        ogDescription: readMeta('meta[property="og:description"]'),
        metaDescription: readMeta('meta[name="description"]'),
        ldJsonCaption,
        articleText,
      }
    })

    const caption = [
      detail.articleText,
      detail.ldJsonCaption,
      detail.ogDescription,
      detail.metaDescription,
      post.caption,
    ].map(cleanCaption).find(Boolean) || ''

    return {
      ...post,
      caption,
    }
  } catch (error) {
    console.warn(`[${stamp()}] detail scrape failed for ${post.permalink}: ${error.message}`)
    return {
      ...post,
      caption: cleanCaption(post.caption),
    }
  } finally {
    await detailPage.close().catch(() => {})
  }
}

async function enrichPosts(context, posts) {
  const enriched = []

  for (const post of posts) {
    enriched.push(await scrapePostDetail(context, post))
  }

  return enriched
}

async function collectPostsFromPage(page, url, source, username) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await sleep(5000)

  const selectors = [
    'article a[href*="/p/"]',
    'article a[href*="/reel/"]',
    'a[href*="/p/"]',
    'a[href*="/reel/"]',
  ]

  let found = false

  for (const selector of selectors) {
    try {
      await page.waitForSelector(selector, { timeout: 8000 })
      found = true
      break
    } catch {}
  }

  if (!found) {
    await page.mouse.wheel(0, 1200)
    await sleep(3000)
  }

  const posts = await page.evaluate(({ source, username, maxItems }) => {
    const selectors = [
      'article a[href*="/p/"]',
      'article a[href*="/reel/"]',
      'a[href*="/p/"]',
      'a[href*="/reel/"]',
    ]

    const anchors = selectors.flatMap((selector) =>
      Array.from(document.querySelectorAll(selector))
    )

    const seen = new Set()
    const results = []

    for (const anchor of anchors) {
      const href = anchor.getAttribute('href') || ''
      const permalink = href.startsWith('http')
        ? href
        : `https://www.instagram.com${href}`

      if (!permalink || seen.has(permalink)) continue
      seen.add(permalink)

      const img =
        anchor.querySelector('img') ||
        anchor.closest('article')?.querySelector('img')

      const teaser =
        anchor.getAttribute('aria-label') ||
        img?.getAttribute('alt') ||
        ''

      const mediaUrl = img?.getAttribute('src') || ''

      results.push({
        permalink,
        caption: teaser,
        media_url: mediaUrl,
        timestamp: new Date().toISOString(),
        username,
        source,
      })

      if (results.length >= maxItems) break
    }

    return results
  }, { source, username, maxItems: MAX_PER_SOURCE })

  return posts
}

async function collectWithRetry(page, context, url, source, username) {
  let posts = await collectPostsFromPage(page, url, source, username)
  if (posts.length) return enrichPosts(context, posts)

  console.log(`[${stamp()}] no posts found on first pass for ${source}, retrying`)
  await sleep(4000)
  posts = await collectPostsFromPage(page, url, source, username)
  return enrichPosts(context, posts)
}

async function pushFeed(items) {
  const res = await fetch(INGEST_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${INGEST_TOKEN}`,
    },
    body: JSON.stringify({
      items,
      sourceRunAt: new Date().toISOString(),
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Ingest failed: ${res.status} ${body}`)
  }

  return res.json()
}

async function runOnce(context) {
  const page = context.pages()[0] || await context.newPage()

  const official = await collectWithRetry(page, context, profileUrl, 'official', OFFICIAL_PROFILE)
  const hashtag = await collectWithRetry(page, context, hashtagUrl, 'hashtag', `#${HASHTAG}`)
  const merged = [...official, ...hashtag]

  console.log(
    `[${stamp()}] found ${official.length} official and ${hashtag.length} hashtag posts`
  )

  const result = await pushFeed(merged)
  console.log(`[${stamp()}] pushed ${result.count} items`)
}

async function main() {
  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: HEADLESS,
    channel: 'chrome',
    viewport: { width: 1440, height: 1200 },
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    locale: 'en-US',
    timezoneId: 'America/Los_Angeles',
  })

  async function loop() {
    try {
      console.log(`[${stamp()}] scraping ${profileUrl} and #${HASHTAG}`)
      await runOnce(context)
    } catch (error) {
      console.error(`[${stamp()}] ${error.message}`)
    }
  }

  await loop()
  const timer = setInterval(loop, SCRAPE_INTERVAL_MS)

  const shutdown = async () => {
    clearInterval(timer)
    await context.close()
    process.exit(0)
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
