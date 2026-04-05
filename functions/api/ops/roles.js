function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  })
}

const OPS_STATE_KEY = 'ops_state'

export async function onRequestGet(context) {
  try {
    const db = context.env.MAYDAY_DB
    if (!db) return json({ error: 'MAYDAY_DB binding is missing.' }, 500)
    const row = await db.prepare('SELECT value_json FROM site_runtime_state WHERE key = ?').bind(OPS_STATE_KEY).first()
    if (!row?.value_json) return json({ roles: [] })
    let state = null
    try { state = JSON.parse(row.value_json) } catch { state = null }
    const roles = Array.isArray(state?.volunteers)
      ? state.volunteers.filter((item) => item && item.role).filter((item) => !item.name || item.status === 'Needs Assignment' || item.status === 'Tentative').map((item) => ({ id: item.id, role: item.role, area: item.area || 'General', shiftDate: item.shiftDate || '', shiftStart: item.shiftStart || '', shiftEnd: item.shiftEnd || '', notes: item.notes || '' }))
      : []
    return json({ roles })
  } catch (error) {
    return json({ error: error?.message || 'Could not load volunteer roles.' }, 500)
  }
}
