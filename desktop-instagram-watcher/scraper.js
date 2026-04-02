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

if (!INGEST_URL || !INGEST_TOKEN) {
  console.error('Missing INGEST_URL or INGEST_TOKEN in .env')
  process.exit(1)
}

const profileUrl = `https://www.instagram.com/${OFFICIAL_PROFILE}/`
const hashtagUrl = `https://www.instagram.com/explore/tags/${HASHTAG.toLowerCase()}/`

function stamp() {
  return new Date().toLocaleTimeString()
}

async function collectPostsFromPage(page, url, source, username) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 })
  await page.waitForTimeout(3000)

  const posts = await page.evaluate(({ source, username, maxItems }) => {
    const anchors = Array.from(document.querySelectorAll('a[href*="/p/"], a[href*="/reel/"]'))
    const seen = new Set()
    const results = []

    for (const anchor of anchors) {
      const href = anchor.getAttribute('href') || ''
      const permalink = href.startsWith('http') ? href : `https://www.instagram.com${href}`
      if (!permalink || seen.has(permalink)) continue
      seen.add(permalink)

      const img = anchor.querySelector('img')
      const caption = img?.getAttribute('alt') || ''
      const mediaUrl = img?.getAttribute('src') || ''

      results.push({
        permalink,
        caption,
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

async function runOnce(browser) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1200 },
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  })

  try {
    const page = await context.newPage()
    const official = await collectPostsFromPage(page, profileUrl, 'official', OFFICIAL_PROFILE)
    const hashtag = await collectPostsFromPage(page, hashtagUrl, 'hashtag', `#${HASHTAG}`)
    const merged = [...official, ...hashtag]

    const result = await pushFeed(merged)
    console.log(`[${stamp()}] pushed ${result.count} items`)
  } finally {
    await context.close()
  }
}

async function main() {
  const browser = await chromium.launch({ headless: HEADLESS })

  async function loop() {
    try {
      console.log(`[${stamp()}] scraping ${profileUrl} and #${HASHTAG}`)
      await runOnce(browser)
    } catch (error) {
      console.error(`[${stamp()}] ${error.message}`)
    }
  }

  await loop()
  const timer = setInterval(loop, SCRAPE_INTERVAL_MS)

  const shutdown = async () => {
    clearInterval(timer)
    await browser.close()
    process.exit(0)
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
