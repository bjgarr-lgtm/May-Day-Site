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
    if (previous && isStopComplete(route.slug, previous.id)) unlocked += 1
    else break
  }
  return unlocked
}

export function isStopUnlocked(route, stopId) {
  const index = route?.stops?.findIndex((item) => item.id === stopId) ?? -1
  return index > -1 && index < getUnlockedStopCount(route)
}

export function getFirstAvailableStop(route) {
  if (!route?.stops?.length) return null
  const unlocked = route.stops.slice(0, getUnlockedStopCount(route))
  return unlocked.find((item) => !isStopComplete(route.slug, item.id)) || unlocked[unlocked.length - 1] || route.stops[0]
}

export function getRouteCompletionCount(route) {
  return route?.stops?.filter((item) => isStopComplete(route.slug, item.id)).length || 0
}

export function getTotalCompletionCount(routes) {
  return (routes || []).reduce((sum, route) => sum + getRouteCompletionCount(route), 0)
}

export function verifyStopAnswer(stop, value) {
  const expected = String(stop?.proofAnswer || '').trim().toLowerCase()
  if (!expected) return { ok: true }
  return { ok: expected === String(value || '').trim().toLowerCase() }
}
