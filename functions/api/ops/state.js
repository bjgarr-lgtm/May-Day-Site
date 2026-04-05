function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  })
}

function unauthorized(message = 'Unauthorized.') { return json({ error: message }, 401) }
function forbidden(message = 'Forbidden.') { return json({ error: message }, 403) }

function getAuthError(request, env) {
  const expectedPassword = env.APPLICATIONS_DASHBOARD_PASSWORD
  if (!expectedPassword) return json({ error: 'APPLICATIONS_DASHBOARD_PASSWORD is missing.' }, 500)
  const providedPassword = request.headers.get('x-applications-password') || ''
  if (!providedPassword) return unauthorized('Applications password required.')
  if (providedPassword !== expectedPassword) return forbidden('Incorrect applications password.')
  return null
}

const OPS_STATE_KEY = 'ops_state'

export async function onRequestGet(context) {
  try {
    const db = context.env.MAYDAY_DB
    if (!db) return json({ error: 'MAYDAY_DB binding is missing.' }, 500)
    const authError = getAuthError(context.request, context.env)
    if (authError) return authError
    const row = await db.prepare('SELECT value_json, updated_at FROM site_runtime_state WHERE key = ?').bind(OPS_STATE_KEY).first()
    if (!row) return json({ state: null, updatedAt: null })
    let state = null
    try { state = JSON.parse(row.value_json || 'null') } catch { state = null }
    return json({ state, updatedAt: row.updated_at || null })
  } catch (error) {
    return json({ error: error?.message || 'Could not load ops state.' }, 500)
  }
}

export async function onRequestPost(context) {
  try {
    const db = context.env.MAYDAY_DB
    if (!db) return json({ error: 'MAYDAY_DB binding is missing.' }, 500)
    const authError = getAuthError(context.request, context.env)
    if (authError) return authError
    const body = await context.request.json().catch(() => null)
    const state = body?.state ?? body
    if (!state || typeof state !== 'object') return json({ error: 'A valid ops state payload is required.' }, 400)
    const now = new Date().toISOString()
    await db.prepare(`INSERT INTO site_runtime_state (key, value_json, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json, updated_at = excluded.updated_at`).bind(OPS_STATE_KEY, JSON.stringify(state), now).run()
    return json({ ok: true, updatedAt: now })
  } catch (error) {
    return json({ error: error?.message || 'Could not save ops state.' }, 500)
  }
}
