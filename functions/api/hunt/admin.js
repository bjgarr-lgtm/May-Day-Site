function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })
}

function checkPassword(context) {
  const expectedPassword = context.env.APPLICATIONS_DASHBOARD_PASSWORD
  if (!expectedPassword) return { ok: false, response: json({ error: 'APPLICATIONS_DASHBOARD_PASSWORD is missing.' }, 500) }
  const providedPassword = context.request.headers.get('x-applications-password') || ''
  if (!providedPassword) return { ok: false, response: json({ error: 'Applications password required.' }, 401) }
  if (providedPassword !== expectedPassword) return { ok: false, response: json({ error: 'Incorrect applications password.' }, 403) }
  return { ok: true }
}

async function getSettings(db) {
  const results = await db.prepare(`
    SELECT route_slug, stop_id, difficulty, ticket_value, validation_mode, volunteer_code, proof_answer, reveal_next_in_ui
    FROM hunt_stop_settings
    ORDER BY route_slug, stop_id
  `).all()
  const rows = Array.isArray(results?.results) ? results.results : []
  return rows.map((row) => ({
    routeSlug: row.route_slug,
    stopId: row.stop_id,
    difficulty: row.difficulty,
    ticketValue: row.ticket_value,
    validationMode: row.validation_mode,
    volunteerCode: row.volunteer_code || '',
    proofAnswer: row.proof_answer || '',
    revealNextInUI: row.reveal_next_in_ui === 1,
  }))
}

async function getSummary(db, playerKey) {
  const totals = await db.prepare(`
    SELECT
      COALESCE(SUM(CASE WHEN event_type IN ('stop','route_bonus','full_bonus') THEN amount ELSE 0 END), 0) AS earned_total,
      COALESCE(SUM(CASE WHEN event_type = 'claimed' THEN amount ELSE 0 END), 0) AS claimed_total,
      COALESCE(SUM(CASE WHEN event_type = 'spent' THEN amount ELSE 0 END), 0) AS spent_total
    FROM hunt_ticket_ledger
    WHERE player_key = ?
  `).bind(playerKey).first()

  const events = await db.prepare(`
    SELECT id, event_key, event_type, amount, route_slug, stop_id, note, created_at
    FROM hunt_ticket_ledger
    WHERE player_key = ?
    ORDER BY created_at DESC
  `).bind(playerKey).all()

  const earnedTotal = Number(totals?.earned_total || 0)
  const claimedTotal = Number(totals?.claimed_total || 0)
  const spentTotal = Number(totals?.spent_total || 0)

  return {
    playerKey,
    earnedTotal,
    claimedTotal,
    spentTotal,
    availableTotal: earnedTotal - claimedTotal - spentTotal,
    ledger: Array.isArray(events?.results) ? events.results : [],
  }
}

export async function onRequestGet(context) {
  try {
    const auth = checkPassword(context)
    if (!auth.ok) return auth.response
    const db = context.env.MAYDAY_DB
    if (!db) return json({ error: 'MAYDAY_DB binding is missing.' }, 500)

    const url = new URL(context.request.url)
    const playerKey = url.searchParams.get('playerKey') || ''

    const settings = await getSettings(db)
    const summary = playerKey ? await getSummary(db, playerKey) : null
    return json({ settings, summary, ledger: summary?.ledger || [] })
  } catch (error) {
    return json({ error: error?.message || 'Could not load hunt admin.' }, 500)
  }
}

export async function onRequestPost(context) {
  try {
    const auth = checkPassword(context)
    if (!auth.ok) return auth.response
    const db = context.env.MAYDAY_DB
    if (!db) return json({ error: 'MAYDAY_DB binding is missing.' }, 500)

    const body = await context.request.json()

    if (body?.action === 'upsert_settings') {
      const settings = Array.isArray(body.settings) ? body.settings : []
      const now = new Date().toISOString()
      for (const item of settings) {
        const routeSlug = String(item.routeSlug || '').trim()
        const stopId = String(item.stopId || '').trim()
        if (!routeSlug || !stopId) continue
        await db.prepare(`
          INSERT INTO hunt_stop_settings (setting_key, route_slug, stop_id, difficulty, ticket_value, validation_mode, volunteer_code, proof_answer, reveal_next_in_ui, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(setting_key) DO UPDATE SET
            difficulty = excluded.difficulty,
            ticket_value = excluded.ticket_value,
            validation_mode = excluded.validation_mode,
            volunteer_code = excluded.volunteer_code,
            proof_answer = excluded.proof_answer,
            reveal_next_in_ui = excluded.reveal_next_in_ui,
            updated_at = excluded.updated_at
        `).bind(
          `${routeSlug}:${stopId}`,
          routeSlug,
          stopId,
          Number(item.difficulty || 0),
          Number(item.ticketValue || 0),
          String(item.validationMode || 'manual'),
          String(item.volunteerCode || ''),
          String(item.proofAnswer || ''),
          item.revealNextInUI === false ? 0 : 1,
          now
        ).run()
      }
      const nextSettings = await getSettings(db)
      return json({ ok: true, settings: nextSettings })
    }

    if (body?.action === 'redeem_tickets') {
      const playerKey = String(body.playerKey || '').trim()
      const amount = Number(body.amount || 0)
      const mode = body.mode === 'spent' ? 'spent' : 'claimed'
      if (!playerKey || amount <= 0) return json({ error: 'Missing ticket redemption details.' }, 400)

      await db.prepare(`
        INSERT INTO hunt_ticket_ledger (player_key, event_key, event_type, amount, route_slug, stop_id, note, created_at)
        VALUES (?, ?, ?, ?, '', '', ?, ?)
      `).bind(
        playerKey,
        `${mode}:${Date.now()}`,
        mode,
        amount,
        `${mode} via admin`,
        new Date().toISOString()
      ).run()

      const summary = await getSummary(db, playerKey)
      return json({ ok: true, summary, ledger: summary.ledger })
    }

    return json({ error: 'Unsupported admin action.' }, 400)
  } catch (error) {
    return json({ error: error?.message || 'Could not update hunt admin.' }, 500)
  }
}
