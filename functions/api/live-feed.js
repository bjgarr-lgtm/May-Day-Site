const FEED_CACHE_KEY = 'live-feed'
const HASHTAG = 'MayDayOnTheHarbor'

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=60',
      'access-control-allow-origin': '*',
    },
  })
}

function fallbackItems(env) {
  const instagramHref = env?.MAYDAY_IG_PROFILE_URL || 'https://www.instagram.com/maydayontheharbor/'
  const hashtagUrl = `https://www.instagram.com/explore/tags/${HASHTAG.toLowerCase()}/`

  return [
    {
      id: 'official-instagram',
      source: 'official',
      caption: 'Follow the official event account for live updates.',
      permalink: instagramHref,
      media_url: '',
      timestamp: new Date().toISOString(),
      username: 'maydayontheharbor',
    },
    {
      id: 'event-hashtag',
      source: 'hashtag',
      caption: `Post with #${HASHTAG} so it can appear here once the desktop watcher is running.`,
      permalink: hashtagUrl,
      media_url: '',
      timestamp: new Date().toISOString(),
      username: `#${HASHTAG}`,
    },
  ]
}

async function getCachedFeed(env) {
  if (!env.IG_FEED) return null
  const raw = await env.IG_FEED.get(FEED_CACHE_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

async function setCachedFeed(env, data) {
  if (!env.IG_FEED) return
  await env.IG_FEED.put(FEED_CACHE_KEY, JSON.stringify(data), { expirationTtl: 3600 })
}

export async function onRequestGet({ env }) {
  const cached = await getCachedFeed(env)
  if (cached) {
    return json({
      ...cached,
      mode: cached.mode || 'desktop-cached',
    })
  }

  const payload = {
    items: fallbackItems(env),
    generatedAt: new Date().toISOString(),
    mode: 'fallback',
  }

  await setCachedFeed(env, payload)
  return json(payload)
}
