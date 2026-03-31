function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  })
}

export async function onRequestGet(context) {
  try {
    const db = context.env.MAYDAY_DB
    if (!db) {
      return json(
        {
          error:
            'MAYDAY_DB binding is missing. Create a D1 database binding named MAYDAY_DB before using the submissions dashboard.',
        },
        500
      )
    }

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

    if (type === 'vendor' || type === 'performer') {
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
