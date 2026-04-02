const GRAPH_BASE = 'https://graph.facebook.com/v24.0'
const HASHTAG = 'MayDayOnTheHarbor'
const FEED_CACHE_KEY = 'live-feed'
const WEBHOOK_LOG_KEY = 'webhook-last-hit'

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
      caption: `Post with #${HASHTAG} so it can appear here once the Meta token is wired.`,
      permalink: hashtagUrl,
      media_url: '',
      timestamp: new Date().toISOString(),
      username: `#${HASHTAG}`,
    },
  ]
}

async function graphFetch(path, token) {
  const res = await fetch(`${GRAPH_BASE}${path}${path.includes('?') ? '&' : '?'}access_token=${encodeURIComponent(token)}`)
  const data = await res.json()
  if (!res.ok || data.error) {
    const message = data?.error?.message || `Graph request failed with ${res.status}`
    throw new Error(message)
  }
  return data
}

function normalizeMedia(item, source) {
  return {
    id: `${source}-${item.id}`,
    source,
    caption: item.caption || '',
    permalink: item.permalink || '',
    media_url: item.media_url || item.thumbnail_url || '',
    timestamp: item.timestamp || '',
    username: item.username || '',
    media_type: item.media_type || '',
  }
}

function dedupeAndSort(items) {
  const seen = new Set()
  const deduped = []

  for (const item of items) {
    const key = item.permalink || item.id
    if (!key || seen.has(key)) continue
    seen.add(key)
    deduped.push(item)
  }

  return deduped.sort((a, b) => {
    const aTime = Date.parse(a.timestamp || 0)
    const bTime = Date.parse(b.timestamp || 0)
    return bTime - aTime
  })
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
  await env.IG_FEED.put(FEED_CACHE_KEY, JSON.stringify(data), { expirationTtl: 60 })
}

async function fetchOfficialMedia(env) {
  const fields = [
    'id',
    'caption',
    'media_type',
    'media_url',
    'thumbnail_url',
    'permalink',
    'timestamp',
    'username',
  ].join(',')

  const data = await graphFetch(`/${env.IG_USER_ID}/media?fields=${encodeURIComponent(fields)}&limit=8`, env.IG_ACCESS_TOKEN)
  return Array.isArray(data.data) ? data.data.map((item) => normalizeMedia(item, 'official')) : []
}

async function fetchHashtagMedia(env) {
  const hashtagSearch = await graphFetch(
    `/ig_hashtag_search?user_id=${encodeURIComponent(env.IG_USER_ID)}&q=${encodeURIComponent(HASHTAG)}`,
    env.IG_ACCESS_TOKEN
  )

  const hashtagId = hashtagSearch?.data?.[0]?.id
  if (!hashtagId) return []

  const fields = [
    'id',
    'caption',
    'media_type',
    'media_url',
    'thumbnail_url',
    'permalink',
    'timestamp',
  ].join(',')

  const recent = await graphFetch(
    `/${hashtagId}/recent_media?user_id=${encodeURIComponent(env.IG_USER_ID)}&fields=${encodeURIComponent(fields)}&limit=8`,
    env.IG_ACCESS_TOKEN
  )

  return Array.isArray(recent.data)
    ? recent.data.map((item) =>
        normalizeMedia(
          {
            ...item,
            username: `#${HASHTAG}`,
          },
          'hashtag'
        )
      )
    : []
}

export async function onRequestGet({ env, request }) {
  const url = new URL(request.url)
  const force = url.searchParams.get('force') === '1'
  const hasMetaConfig = Boolean(env.IG_ACCESS_TOKEN && env.IG_USER_ID)

  if (!force) {
    const cached = await getCachedFeed(env)
    if (cached) return json({ ...cached, mode: cached.mode || 'cached-live' })
  }

  if (!hasMetaConfig) {
    const payload = {
      items: fallbackItems(env),
      generatedAt: new Date().toISOString(),
      mode: 'fallback',
    }
    await setCachedFeed(env, payload)
    return json(payload)
  }

  try {
    const [official, hashtag] = await Promise.all([
      fetchOfficialMedia(env),
      fetchHashtagMedia(env),
    ])

    const payload = {
      items: dedupeAndSort([...official, ...hashtag]).slice(0, 12),
      generatedAt: new Date().toISOString(),
      mode: 'meta-live',
    }

    await setCachedFeed(env, payload)
    return json(payload)
  } catch (error) {
    const cached = await getCachedFeed(env)
    if (cached) {
      return json({
        ...cached,
        mode: 'cached-live',
        warning: error.message,
      })
    }

    const payload = {
      items: fallbackItems(env),
      generatedAt: new Date().toISOString(),
      mode: 'fallback',
      warning: error.message,
    }

    await setCachedFeed(env, payload)
    return json(payload)
  }
}
