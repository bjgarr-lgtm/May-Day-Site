const FEED_CACHE_KEY = 'live-feed'
const FEED_SETTINGS_KEY = 'instagram_feed_settings'

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })
}

function defaultConfig() {
  return {
    hashtagEnabled: false,
    hiddenPermalinks: [],
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

async function getConfig(db) {
  const result = await db.prepare('SELECT value_json FROM site_runtime_state WHERE key = ?').bind(FEED_SETTINGS_KEY).first()
  if (!result?.value_json) return defaultConfig()
  try {
    const parsed = JSON.parse(result.value_json)
    return {
      hashtagEnabled: !!parsed?.hashtagEnabled,
      hiddenPermalinks: Array.isArray(parsed?.hiddenPermalinks) ? parsed.hiddenPermalinks.filter((item) => typeof item === 'string') : [],
    }
  } catch {
    return defaultConfig()
  }
}

async function saveConfig(db, config) {
  const now = new Date().toISOString()
  await db.prepare(`
    INSERT INTO site_runtime_state (key, value_json, updated_at)
    VALUES (?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET
      value_json = excluded.value_json,
      updated_at = excluded.updated_at
  `).bind(FEED_SETTINGS_KEY, JSON.stringify(config), now).run()
}

async function getRawFeed(env) {
  if (!env.IG_FEED) return { items: [], generatedAt: '' }
  const raw = await env.IG_FEED.get(FEED_CACHE_KEY)
  if (!raw) return { items: [], generatedAt: '' }
  try {
    const parsed = JSON.parse(raw)
    return {
      items: Array.isArray(parsed?.items) ? parsed.items : [],
      generatedAt: parsed?.generatedAt || '',
    }
  } catch {
    return { items: [], generatedAt: '' }
  }
}

export async function onRequestGet(context) {
  try {
    const auth = checkPassword(context)
    if (!auth.ok) return auth.response

    const db = context.env.MAYDAY_DB
    if (!db) return json({ error: 'MAYDAY_DB binding is missing.' }, 500)

    const [config, rawFeed] = await Promise.all([
      getConfig(db),
      getRawFeed(context.env),
    ])

    return json({
      config,
      items: rawFeed.items,
      generatedAt: rawFeed.generatedAt,
    })
  } catch (error) {
    return json({ error: error?.message || 'Could not load instagram admin data.' }, 500)
  }
}

export async function onRequestPost(context) {
  try {
    const auth = checkPassword(context)
    if (!auth.ok) return auth.response

    const db = context.env.MAYDAY_DB
    if (!db) return json({ error: 'MAYDAY_DB binding is missing.' }, 500)

    const body = await context.request.json()
    const config = {
      hashtagEnabled: !!body?.hashtagEnabled,
      hiddenPermalinks: Array.isArray(body?.hiddenPermalinks)
        ? Array.from(new Set(body.hiddenPermalinks.filter((item) => typeof item === 'string' && item.trim()).map((item) => item.trim())))
        : [],
    }

    await saveConfig(db, config)
    return json({ ok: true, config })
  } catch (error) {
    return json({ error: error?.message || 'Could not save instagram feed settings.' }, 500)
  }
}
