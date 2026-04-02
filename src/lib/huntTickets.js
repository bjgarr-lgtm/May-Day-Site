const PLAYER_KEY_STORAGE = 'maydayHuntPlayerKey'
const difficultyScale = [1, 2, 2, 3, 3, 5, 6, 8, 10, 20]

export function getDefaultDifficulty(stopNumber) {
  return difficultyScale[(stopNumber || 1) - 1] || stopNumber || 1
}

export function getDefaultTicketValue(stopNumber) {
  return getDefaultDifficulty(stopNumber)
}

export function getPlayerKey() {
  try {
    let value = localStorage.getItem(PLAYER_KEY_STORAGE)
    if (value) return value
    value = `MDH-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
    localStorage.setItem(PLAYER_KEY_STORAGE, value)
    return value
  } catch {
    return 'MDH-LOCAL'
  }
}

export function getStopKey(routeSlug, stopId) {
  return `${routeSlug}:${stopId}`
}

export function buildRuntimeSettingsMap(settings = []) {
  const map = {}
  for (const item of settings) {
    map[getStopKey(item.routeSlug, item.stopId)] = item
  }
  return map
}

export function applyRuntimeToRoute(route, settingsMap = {}) {
  return {
    ...route,
    stops: route.stops.map((stop, index) => {
      const runtime = settingsMap[getStopKey(route.slug, stop.id)] || {}
      const stopNumber = index + 1
      return {
        ...stop,
        difficulty: runtime.difficulty ?? stop.difficulty ?? getDefaultDifficulty(stopNumber),
        ticketValue: runtime.ticketValue ?? stop.ticketValue ?? getDefaultTicketValue(stopNumber),
        validationMode: runtime.validationMode ?? stop.validationMode ?? 'manual',
        volunteerCode: runtime.volunteerCode ?? stop.volunteerCode ?? '',
        proofAnswer: runtime.proofAnswer ?? stop.proofAnswer ?? '',
        revealNextInUI: runtime.revealNextInUI ?? stop.revealNextInUI ?? true,
      }
    }),
  }
}

export function applyRuntimeToRoutes(routes = [], settingsMap = {}) {
  return routes.map((route) => applyRuntimeToRoute(route, settingsMap))
}

export async function fetchHuntPublicState(playerKey) {
  const query = playerKey ? `?playerKey=${encodeURIComponent(playerKey)}` : ''
  const response = await fetch(`/api/hunt/public${query}`, { headers: { Accept: 'application/json' } })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data?.error || 'Could not load hunt state.')
  return data
}

export async function awardStopCompletion(payload) {
  const response = await fetch('/api/hunt/public', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'award_completion', ...payload }),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data?.error || 'Could not award tickets.')
  return data
}
