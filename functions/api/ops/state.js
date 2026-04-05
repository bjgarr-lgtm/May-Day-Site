function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  })
}

function getAuthError(request, env) {
  const expectedPassword = env.APPLICATIONS_DASHBOARD_PASSWORD
  if (!expectedPassword) {
    return json({ error: 'APPLICATIONS_DASHBOARD_PASSWORD is missing.' }, 500)
  }

  const providedPassword = request.headers.get('x-applications-password') || ''
  if (!providedPassword) return json({ error: 'Applications password required.' }, 401)
  if (providedPassword !== expectedPassword) return json({ error: 'Incorrect applications password.' }, 403)
  return null
}

function getDb(env) {
  return env.MAYDAY_DB
}

async function readOpsState(db) {
  const row = await db
    .prepare('SELECT value_json, updated_at FROM site_runtime_state WHERE key = ?')
    .bind('ops_state')
    .first()

  if (!row) {
    return { state: null, updatedAt: null }
  }

  let state = null
  try {
    state = JSON.parse(row.value_json || 'null')
  } catch {
    state = null
  }

  return { state, updatedAt: row.updated_at || null }
}

export async function onRequestGet(context) {
  try {
    const db = getDb(context.env)
    if (!db) return json({ error: 'MAYDAY_DB binding is missing.' }, 500)

    const authError = getAuthError(context.request, context.env)
    if (authError) return authError

    const { state, updatedAt } = await readOpsState(db)
    return json({ state, updatedAt })
  } catch (error) {
    return json({ error: error?.message || 'Could not load ops state.' }, 500)
  }
}

export async function onRequestPost(context) {
  try {
    const db = getDb(context.env)
    if (!db) return json({ error: 'MAYDAY_DB binding is missing.' }, 500)

    const authError = getAuthError(context.request, context.env)
    if (authError) return authError

    const body = await context.request.json().catch(() => ({}))
    const state = body?.state
    if (!state || typeof state !== 'object') {
      return json({ error: 'Valid ops state is required.' }, 400)
    }

    const now = new Date().toISOString()
    await db
      .prepare(
        `INSERT INTO site_runtime_state (key, value_json, updated_at)
         VALUES (?, ?, ?)
         ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json, updated_at = excluded.updated_at`
      )
      .bind('ops_state', JSON.stringify(state), now)
      .run()

    return json({ ok: true, updatedAt: now })
  } catch (error) {
    return json({ error: error?.message || 'Could not save ops state.' }, 500)
  }
}
