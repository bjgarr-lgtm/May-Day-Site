function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  })
}

function unauthorized(message = 'Unauthorized.') {
  return json({ error: message }, 401)
}

function forbidden(message = 'Forbidden.') {
  return json({ error: message }, 403)
}

function getAuthError(request, env) {
  const expectedPassword = env.APPLICATIONS_DASHBOARD_PASSWORD
  if (!expectedPassword) {
    return json({ error: 'APPLICATIONS_DASHBOARD_PASSWORD missing.' }, 500)
  }

  const providedPassword = request.headers.get('x-applications-password') || ''
  if (!providedPassword) return unauthorized('Applications password required.')
  if (providedPassword !== expectedPassword) return forbidden('Incorrect applications password.')

  return null
}

function getDb(env) {
  return env.MAYDAY_DB
}

export async function onRequestGet(context) {
  const db = getDb(context.env)
  if (!db) return json({ error: 'DB missing' }, 500)

  const authError = getAuthError(context.request, context.env)
  if (authError) return authError

  const result = await db.prepare("SELECT * FROM form_submissions ORDER BY created_at DESC").all()
  return json({ items: result.results || [] })
}

export async function onRequestDelete(context) {
  const db = getDb(context.env)
  if (!db) return json({ error: 'DB missing' }, 500)

  const authError = getAuthError(context.request, context.env)
  if (authError) return authError

  const url = new URL(context.request.url)
  const id = url.searchParams.get('id')

  if (!id) return json({ error: 'Missing id' }, 400)

  await db.prepare("DELETE FROM form_submissions WHERE id = ?").bind(id).run()

  return json({ ok: true })
}
