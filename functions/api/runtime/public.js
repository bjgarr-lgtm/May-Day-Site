function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })
}

const fallback = {
  liveMode: false,
  announcement: { enabled: false, text: '', level: 'info' },
  happeningNow: '',
  upNext: '',
}

export async function onRequestGet(context) {
  try {
    const db = context.env.MAYDAY_DB
    if (!db) return json({ state: fallback })

    const result = await db.prepare('SELECT value_json FROM site_runtime_state WHERE key = ?').bind('homepage_runtime').first()
    if (!result?.value_json) return json({ state: fallback })

    try {
      return json({ state: JSON.parse(result.value_json) })
    } catch {
      return json({ state: fallback })
    }
  } catch {
    return json({ state: fallback })
  }
}