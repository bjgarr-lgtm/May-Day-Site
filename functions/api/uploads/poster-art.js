function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  })
}

function sanitizeFilename(name) {
  if (!name || typeof name !== 'string') return 'upload'
  return name
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'upload'
}

function buildKey(filename) {
  const now = new Date()
  const yyyy = now.getUTCFullYear()
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0')
  return `poster-art/${yyyy}/${mm}/${crypto.randomUUID()}-${sanitizeFilename(filename)}`
}

export async function onRequestPost(context) {
  try {
    const bucket = context.env.MAYDAY_UPLOADS
    if (!bucket) {
      return json(
        { error: 'MAYDAY_UPLOADS binding is missing. Add an R2 bucket binding named MAYDAY_UPLOADS.' },
        500
      )
    }

    const formData = await context.request.formData()
    const file = formData.get('file')

    if (!(file instanceof File)) {
      return json({ error: 'A file is required.' }, 400)
    }

    const maxBytes = 15 * 1024 * 1024
    if (file.size > maxBytes) {
      return json({ error: 'File is too large. Max size is 15 MB.' }, 400)
    }

    const key = buildKey(file.name)

    await bucket.put(key, await file.arrayBuffer(), {
      httpMetadata: {
        contentType: file.type || 'application/octet-stream',
      },
      customMetadata: {
        originalFilename: file.name || 'upload',
      },
    })

    return json({
      ok: true,
      key,
      filename: file.name || 'upload',
      contentType: file.type || 'application/octet-stream',
      size: file.size,
      viewUrl: `/api/uploads/poster-art?key=${encodeURIComponent(key)}`,
    })
  } catch (error) {
    return json({ error: error?.message || 'Upload failed.' }, 500)
  }
}

export async function onRequestGet(context) {
  try {
    const bucket = context.env.MAYDAY_UPLOADS
    if (!bucket) {
      return new Response('Upload bucket missing.', { status: 500 })
    }

    const url = new URL(context.request.url)
    const key = (url.searchParams.get('key') || '').trim()

    if (!key) {
      return new Response('Missing key.', { status: 400 })
    }

    const object = await bucket.get(key)
    if (!object) {
      return new Response('Not found.', { status: 404 })
    }

    const headers = new Headers()
    object.writeHttpMetadata(headers)
    headers.set('etag', object.httpEtag)
    headers.set('Cache-Control', 'public, max-age=3600')

    return new Response(object.body, { headers })
  } catch (error) {
    return new Response(error?.message || 'Could not load file.', { status: 500 })
  }
}
