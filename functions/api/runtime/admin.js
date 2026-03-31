function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })
}

async function getState(db) {
  const result = await db.prepare('SELECT value_json FROM site_runtime_state WHERE key = ?').bind('homepage_runtime').first()
  if (!result?.value_json) {
    return { liveMode: false, announcement: { enabled: false, text: '', level: 'info' }, happeningNow: '', upNext: '' }
  }
  try {
    return JSON.parse(result.value_json)
  } catch {
    return { liveMode: false, announcement: { enabled: false, text: '', level: 'info' }, happeningNow: '', upNext: '' }
  }
}

function checkPassword(context) {
  const expectedPassword = context.env.APPLICATIONS_DASHBOARD_PASSWORD
  if (!expectedPassword) return { ok: false, response: json({ error: 'APPLICATIONS_DASHBOARD_PASSWORD is missing.' }, 500) }
  const providedPassword = context.request.headers.get('x-applications-password') || ''
  if (!providedPassword) return { ok: false, response: json({ error: 'Applications password required.' }, 401) }
  if (providedPassword !== expectedPassword) return { ok: false, response: json({ error: 'Incorrect applications password.' }, 403) }
  return { ok: true }
}

export async function onRequestGet(context) {
  try {
    const auth = checkPassword(context)
    if (!auth.ok) return auth.response
    const db = context.env.MAYDAY_DB
    if (!db) return json({ error: 'MAYDAY_DB binding is missing.' }, 500)
    const state = await getState(db)
    return json({ state })
  } catch (error) {
    return json({ error: error?.message || 'Could not load runtime state.' }, 500)
  }
}

export async function onRequestPost(context) {
  try {
    const auth = checkPassword(context)
    if (!auth.ok) return auth.response
    const db = context.env.MAYDAY_DB
    if (!db) return json({ error: 'MAYDAY_DB binding is missing.' }, 500)

    const body = await context.request.json()
    const state = {
      liveMode: !!body.liveMode,
      announcement: {
        enabled: !!body?.announcement?.enabled,
        text: typeof body?.announcement?.text === 'string' ? body.announcement.text.trim() : '',
        level: ['info', 'warning', 'urgent'].includes(body?.announcement?.level) ? body.announcement.level : 'info',
      },
      happeningNow: typeof body?.happeningNow === 'string' ? body.happeningNow.trim() : '',
      upNext: typeof body?.upNext === 'string' ? body.upNext.trim() : '',
    }

    const now = new Date().toISOString()
    await db.prepare(`
      INSERT INTO site_runtime_state (key, value_json, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET
        value_json = excluded.value_json,
        updated_at = excluded.updated_at
    `).bind('homepage_runtime', JSON.stringify(state), now).run()

    return json({ ok: true, state })
  } catch (error) {
    return json({ error: error?.message || 'Could not save runtime state.' }, 500)
  }
}