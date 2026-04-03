const FEED_CACHE_KEY = 'live-feed'
const HASHTAG = 'MayDayOnTheHarbor'
const FEED_SETTINGS_KEY = 'instagram_feed_settings'

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

async function getFeedConfig(env) {
  const db = env.MAYDAY_DB
  if (!db) {
    return { hashtagEnabled: false, hiddenPermalinks: [] }
  }

  const result = await db.prepare('SELECT value_json FROM site_runtime_state WHERE key = ?').bind(FEED_SETTINGS_KEY).first()
  if (!result?.value_json) return { hashtagEnabled: false, hiddenPermalinks: [] }

  try {
    const parsed = JSON.parse(result.value_json)
    return {
      hashtagEnabled: !!parsed?.hashtagEnabled,
      hiddenPermalinks: Array.isArray(parsed?.hiddenPermalinks) ? parsed.hiddenPermalinks.filter((item) => typeof item === 'string') : [],
    }
  } catch {
    return { hashtagEnabled: false, hiddenPermalinks: [] }
  }
}

function applyFeedConfig(items, config) {
  const hidden = new Set(config.hiddenPermalinks || [])
  return (Array.isArray(items) ? items : []).filter((item) => {
    if (!config.hashtagEnabled && item?.source === 'hashtag') return false
    if (item?.permalink && hidden.has(item.permalink)) return false
    return true
  })
}

export async function onRequestGet({ env }) {
  const [cached, config] = await Promise.all([
    getCachedFeed(env),
    getFeedConfig(env),
  ])

  if (cached) {
    return json({
      ...cached,
      items: applyFeedConfig(cached.items, config),
      mode: cached.mode || 'desktop-cached',
      feedConfig: config,
    })
  }

  const payload = {
    items: fallbackItems(env),
    generatedAt: new Date().toISOString(),
    mode: 'fallback',
  }

  await setCachedFeed(env, payload)
  return json({
    ...payload,
    items: applyFeedConfig(payload.items, config),
    feedConfig: config,
  })
}
