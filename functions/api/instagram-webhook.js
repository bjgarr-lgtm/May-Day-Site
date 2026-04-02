function text(body, status = 200) {
  return new Response(body, {
    status,
    headers: {
      'content-type': 'text/plain; charset=utf-8',
    },
  })
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url)
  const mode = url.searchParams.get('hub.mode')
  const token = url.searchParams.get('hub.verify_token')
  const challenge = url.searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token && token === env.IG_WEBHOOK_VERIFY_TOKEN) {
    return text(challenge || '')
  }

  return text('forbidden', 403)
}

export async function onRequestPost({ request, env }) {
  try {
    const payload = await request.json()

    if (env.IG_FEED) {
      await env.IG_FEED.put(
        'webhook-last-hit',
        JSON.stringify({
          receivedAt: new Date().toISOString(),
          payload,
        }),
        { expirationTtl: 86400 }
      )

      await env.IG_FEED.delete('live-feed')
    }
  } catch {}

  return text('ok')
}
