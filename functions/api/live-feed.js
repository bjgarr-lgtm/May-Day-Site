const HASHTAG = 'MayDayOnTheHarbor'
const HASHTAG_URL = `https://www.instagram.com/explore/tags/${HASHTAG.toLowerCase()}/`

function fallbackItems(env) {
  const instagramHref = env?.MAYDAY_IG_PROFILE_URL || 'https://www.instagram.com/maydayontheharbor/'

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
      permalink: HASHTAG_URL,
      media_url: '',
      timestamp: new Date().toISOString(),
      username: `#${HASHTAG}`,
    },
  ]
}

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

async function getCachedFeed(env) {
  if (!env.IG_FEED) return null
  const raw = await env.IG_FEED.get('live-feed')
  if (!raw) return null

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

async function setCachedFeed(env, data) {
  if (!env.IG_FEED) return
  await env.IG_FEED.put('live-feed', JSON.stringify(data), { expirationTtl: 60 })
}

export async function onRequestGet({ env }) {
  const cached = await getCachedFeed(env)
  if (cached) return json(cached)

  const payload = {
    items: fallbackItems(env),
    generatedAt: new Date().toISOString(),
    mode: 'fallback',
  }

  await setCachedFeed(env, payload)
  return json(payload)
}
