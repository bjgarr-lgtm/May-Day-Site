function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })
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
    SELECT event_key
    FROM hunt_ticket_ledger
    WHERE player_key = ?
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
    earnedEventKeys: Array.isArray(events?.results) ? events.results.map((row) => row.event_key) : [],
  }
}

async function awardIfMissing(db, playerKey, eventKey, eventType, amount, routeSlug, stopId, note) {
  if (!amount || amount <= 0) return false
  const existing = await db.prepare(`SELECT id FROM hunt_ticket_ledger WHERE player_key = ? AND event_key = ?`).bind(playerKey, eventKey).first()
  if (existing?.id) return false
  await db.prepare(`
    INSERT INTO hunt_ticket_ledger (player_key, event_key, event_type, amount, route_slug, stop_id, note, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(playerKey, eventKey, eventType, amount, routeSlug || '', stopId || '', note || '', new Date().toISOString()).run()
  return true
}

export async function onRequestGet(context) {
  try {
    const db = context.env.MAYDAY_DB
    if (!db) return json({ settings: [], summary: null })

    const url = new URL(context.request.url)
    const playerKey = url.searchParams.get('playerKey') || ''

    const settings = await getSettings(db)
    const summary = playerKey ? await getSummary(db, playerKey) : null
    return json({ settings, summary })
  } catch (error) {
    return json({ error: error?.message || 'Could not load hunt state.' }, 500)
  }
}

export async function onRequestPost(context) {
  try {
    const db = context.env.MAYDAY_DB
    if (!db) return json({ error: 'MAYDAY_DB binding is missing.' }, 500)

    const body = await context.request.json()
    if (body?.action !== 'award_completion') {
      return json({ error: 'Unsupported action.' }, 400)
    }

    const playerKey = String(body.playerKey || '').trim()
    const routeSlug = String(body.routeSlug || '').trim()
    const stopId = String(body.stopId || '').trim()
    if (!playerKey || !routeSlug || !stopId) {
      return json({ error: 'Missing completion identifiers.' }, 400)
    }

    const stopAwarded = await awardIfMissing(db, playerKey, `stop:${routeSlug}:${stopId}`, 'stop', Number(body.ticketValue || 0), routeSlug, stopId, 'stop completion')
    const newRouteBonus = await awardIfMissing(db, playerKey, `route_bonus:${routeSlug}`, 'route_bonus', Number(body.routeBonusAmount || 0), routeSlug, '', 'route bonus')
    const newFullBonus = await awardIfMissing(db, playerKey, 'full_bonus:all', 'full_bonus', Number(body.allBonusAmount || 0), '', '', 'full hunt bonus')

    const summary = await getSummary(db, playerKey)
    return json({ ok: true, stopAwarded, newRouteBonus, newFullBonus, summary })
  } catch (error) {
    return json({ error: error?.message || 'Could not award hunt completion.' }, 500)
  }
}
