export function getStopStorageKey(routeSlug, stopId) {
  return `mayday-hunt-stop:${routeSlug}:${stopId}`
}

export function isStopComplete(routeSlug, stopId) {
  try {
    return localStorage.getItem(getStopStorageKey(routeSlug, stopId)) === 'done'
  } catch {
    return false
  }
}

export function markStopComplete(routeSlug, stopId) {
  try {
    localStorage.setItem(getStopStorageKey(routeSlug, stopId), 'done')
  } catch {}
}

export function getUnlockedStopCount(route) {
  if (!route?.stops?.length) return 0

  let unlocked = Math.min(3, route.stops.length)

  for (let index = 3; index < route.stops.length; index += 1) {
    const previous = route.stops[index - 1]
    if (previous && isStopComplete(route.slug, previous.id)) {
      unlocked += 1
    } else {
      break
    }
  }

  return unlocked
}

export function isStopUnlocked(route, stopId) {
  if (!route?.stops?.length) return false
  const index = route.stops.findIndex((item) => item.id === stopId)
  if (index === -1) return false
  return index < getUnlockedStopCount(route)
}

export function getFirstAvailableStop(route) {
  if (!route?.stops?.length) return null
  const unlockedCount = getUnlockedStopCount(route)
  const visibleStops = route.stops.slice(0, unlockedCount)
  const firstIncomplete = visibleStops.find((item) => !isStopComplete(route.slug, item.id))
  return firstIncomplete || visibleStops[visibleStops.length - 1] || route.stops[0]
}

export function getRouteCompletionCount(route) {
  if (!route?.stops?.length) return 0
  return route.stops.filter((item) => isStopComplete(route.slug, item.id)).length
}

export function getTotalCompletionCount(routes) {
  if (!Array.isArray(routes)) return 0
  return routes.reduce((sum, route) => sum + getRouteCompletionCount(route), 0)
}

export function verifyStopAnswer(stop, value) {
  const expected =
    stop?.proofAnswer ??
    stop?.proof_answer ??
    stop?.answer ??
    stop?.verificationCode ??
    stop?.verification_code ??
    ''

  const normalizedExpected = String(expected || '').trim().toLowerCase()
  const normalizedValue = String(value || '').trim().toLowerCase()

  if (!normalizedExpected) {
    return { ok: true, mode: 'manual' }
  }

  return {
    ok: normalizedExpected === normalizedValue,
    mode: 'answer',
  }
}
