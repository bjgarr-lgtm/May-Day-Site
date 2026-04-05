function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  })
}

function deriveRolesFromState(state) {
  const volunteers = Array.isArray(state?.volunteers) ? state.volunteers : []
  const grouped = new Map()

  volunteers.forEach((item) => {
    const role = (item.role || '').trim()
    if (!role) return
    const key = `${role}__${item.area || ''}`
    const current = grouped.get(key) || {
      role,
      area: item.area || 'General',
      shiftDate: item.shiftDate || '',
      shiftStart: item.shiftStart || '',
      shiftEnd: item.shiftEnd || '',
      openSlots: 0,
      notes: item.notes || '',
    }
    if (!item.name || item.status === 'Needs Assignment') current.openSlots += 1
    grouped.set(key, current)
  })

  return Array.from(grouped.values()).sort((a, b) => {
    const aKey = `${a.shiftDate} ${a.shiftStart} ${a.role}`
    const bKey = `${b.shiftDate} ${b.shiftStart} ${b.role}`
    return aKey.localeCompare(bKey)
  })
}

export async function onRequestGet(context) {
  try {
    const db = context.env.MAYDAY_DB
    if (!db) return json({ roles: [] })

    const row = await db
      .prepare('SELECT value_json FROM site_runtime_state WHERE key = ?')
      .bind('ops_state')
      .first()

    if (!row?.value_json) {
      return json({ roles: [] })
    }

    let state = null
    try {
      state = JSON.parse(row.value_json)
    } catch {
      state = null
    }

    return json({ roles: deriveRolesFromState(state) })
  } catch (error) {
    return json({ roles: [], error: error?.message || 'Could not load roles.' }, 500)
  }
}
