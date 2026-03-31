function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  })
}

function isEmail(value) {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function clean(value) {
  if (typeof value !== 'string') return ''
  return value.trim()
}

async function insertSubmission(context, submissionType, payload) {
  const db = context.env.MAYDAY_DB
  if (!db) {
    return json(
      {
        error:
          'MAYDAY_DB binding is missing. Create a D1 database binding named MAYDAY_DB before using these forms.',
      },
      500
    )
  }

  const now = new Date().toISOString()
  const id = crypto.randomUUID()

  await db
    .prepare(
      `INSERT INTO form_submissions (
        id,
        submission_type,
        contact_name,
        email,
        phone,
        subject_name,
        payload_json,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      id,
      submissionType,
      payload.name,
      payload.email,
      payload.phone || null,
      payload.subject_name || null,
      JSON.stringify(payload),
      now
    )
    .run()

  console.log(`[mayday-form] ${submissionType} submission stored for ${payload.email}`)

  return json({ ok: true, id })
}

export { clean, insertSubmission, isEmail, json }
