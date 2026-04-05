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
    return json(
      {
        error:
          'APPLICATIONS_DASHBOARD_PASSWORD is missing. Set that worker secret before using the submissions dashboard.',
      },
      500
    )
  }

  const providedPassword = request.headers.get('x-applications-password') || ''
  if (!providedPassword) {
    return unauthorized('Applications password required.')
  }

  if (providedPassword !== expectedPassword) {
    return forbidden('Incorrect applications password.')
  }

  return null
}

function getDb(env) {
  return env.MAYDAY_DB
}

export async function onRequestGet(context) {
  try {
    const db = getDb(context.env)
    if (!db) {
      return json(
        {
          error:
            'MAYDAY_DB binding is missing. Create a D1 database binding named MAYDAY_DB before using the submissions dashboard.',
        },
        500
      )
    }

    const authError = getAuthError(context.request, context.env)
    if (authError) return authError

    const url = new URL(context.request.url)
    const type = (url.searchParams.get('type') || '').trim()

    let query = `
      SELECT
        id,
        submission_type,
        contact_name,
        email,
        phone,
        subject_name,
        payload_json,
        created_at
      FROM form_submissions
    `
    const bindings = []

    if (type === 'vendor' || type === 'performer' || type === 'volunteer') {
      query += ' WHERE submission_type = ?'
      bindings.push(type)
    }

    query += ' ORDER BY created_at DESC'

    let statement = db.prepare(query)
    if (bindings.length) {
      statement = statement.bind(...bindings)
    }

    const result = await statement.all()
    const rows = Array.isArray(result?.results) ? result.results : []

    const items = rows.map((row) => {
      let payload = {}
      try {
        payload = JSON.parse(row.payload_json || '{}')
      } catch {
        payload = {}
      }

      return {
        id: row.id,
        submission_type: row.submission_type,
        contact_name: row.contact_name,
        email: row.email,
        phone: row.phone,
        subject_name: row.subject_name,
        created_at: row.created_at,
        payload,
      }
    })

    return json({ items })
  } catch (error) {
    return json({ error: error?.message || 'Could not load submissions.' }, 500)
  }
}

export async function onRequestDelete(context) {
  try {
    const db = getDb(context.env)
    if (!db) {
      return json(
        {
          error:
            'MAYDAY_DB binding is missing. Create a D1 database binding named MAYDAY_DB before using the submissions dashboard.',
        },
        500
      )
    }

    const authError = getAuthError(context.request, context.env)
    if (authError) return authError

    const url = new URL(context.request.url)
    const id = (url.searchParams.get('id') || '').trim()

    if (!id) {
      return json({ error: 'Submission id is required.' }, 400)
    }

    const existing = await db
      .prepare('SELECT id FROM form_submissions WHERE id = ?')
      .bind(id)
      .first()

    if (!existing) {
      return json({ error: 'Submission not found.' }, 404)
    }

    await db.prepare('DELETE FROM form_submissions WHERE id = ?').bind(id).run()

    return json({ ok: true, id })
  } catch (error) {
    return json({ error: error?.message || 'Could not delete submission.' }, 500)
  }
}
