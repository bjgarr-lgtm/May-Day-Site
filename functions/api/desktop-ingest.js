const FEED_CACHE_KEY = 'live-feed'
const MAX_ITEMS = 12

function text(body, status = 200) {
  return new Response(body, {
    status,
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'POST,OPTIONS',
      'access-control-allow-headers': 'content-type,authorization',
    },
  })
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'POST,OPTIONS',
      'access-control-allow-headers': 'content-type,authorization',
    },
  })
}

function normalizeItem(item) {
  return {
    id: String(item.id || item.permalink || item.timestamp || Math.random()),
    source: item.source === 'hashtag' ? 'hashtag' : 'official',
    caption: typeof item.caption === 'string' ? item.caption : '',
    permalink: typeof item.permalink === 'string' ? item.permalink : '',
    media_url: typeof item.media_url === 'string' ? item.media_url : '',
    timestamp: typeof item.timestamp === 'string' ? item.timestamp : '',
    username: typeof item.username === 'string' ? item.username : '',
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

export async function onRequestOptions() {
  return text('ok')
}

export async function onRequestPost({ request, env }) {
  const expected = env.DESKTOP_INGEST_TOKEN
  const auth = request.headers.get('authorization') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''

  if (!expected || token !== expected) {
    return text('unauthorized', 401)
  }

  if (!env.IG_FEED) {
    return text('missing IG_FEED binding', 500)
  }

  let body
  try {
    body = await request.json()
  } catch {
    return text('invalid json', 400)
  }

  const items = Array.isArray(body?.items) ? body.items.map(normalizeItem) : []
  const payload = {
    items: dedupeAndSort(items).slice(0, MAX_ITEMS),
    generatedAt: new Date().toISOString(),
    mode: 'desktop-live',
    sourceRunAt: typeof body?.sourceRunAt === 'string' ? body.sourceRunAt : '',
  }

  await env.IG_FEED.put(FEED_CACHE_KEY, JSON.stringify(payload), { expirationTtl: 3600 })

  return json({
    ok: true,
    count: payload.items.length,
    generatedAt: payload.generatedAt,
  })
}
