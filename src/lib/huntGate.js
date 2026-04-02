export function getStopStorageKey(routeSlug, stopId) { return `mayday-hunt-stop:${routeSlug}:${stopId}` }
export function isStopComplete(routeSlug, stopId) { try { return localStorage.getItem(getStopStorageKey(routeSlug, stopId)) === "done" } catch { return false } }
export function markStopComplete(routeSlug, stopId) { try { localStorage.setItem(getStopStorageKey(routeSlug, stopId), "done") } catch {} }
export function getUnlockedStopCount(route) { if (!route?.stops?.length) return 0; let unlocked=Math.min(3, route.stops.length); for (let i=3;i<route.stops.length;i+=1){ const prev=route.stops[i-1]; if(prev && isStopComplete(route.slug, prev.id)) unlocked +=1; else break } return unlocked }
export function isStopUnlocked(route, stopId) { if(!route?.stops?.length) return false; const index=route.stops.findIndex((item)=>item.id===stopId); return index > -1 && index < getUnlockedStopCount(route) }
export function getFirstAvailableStop(route) { if(!route?.stops?.length) return null; const unlocked=route.stops.slice(0, getUnlockedStopCount(route)); return unlocked.find((item)=>!isStopComplete(route.slug,item.id)) || unlocked[unlocked.length-1] || route.stops[0] }
export function getRouteCompletionCount(route) { return route?.stops?.filter((item)=>isStopComplete(route.slug,item.id)).length || 0 }
export function getTotalCompletionCount(routes) { return (routes || []).reduce((sum, route)=> sum + getRouteCompletionCount(route), 0) }
export function verifyStopAnswer(stop, value) { const expected=String(stop?.proofAnswer || '').trim().toLowerCase(); return expected && String(value || '').trim().toLowerCase() === expected }
export function verifyVolunteerCode(stop, value) { const expected=String(stop?.volunteerCode || '').trim().toLowerCase(); return expected && String(value || '').trim().toLowerCase() === expected }
export function hasValidScan(stop) { try { const params = new URLSearchParams(window.location.search); const expected=String(stop?.scanCode || '').trim().toLowerCase(); if(!expected) return false; return String(params.get('scan') || '').trim().toLowerCase() === expected } catch { return false } }

export function getCompletedCount(route) {
  return route?.stops?.filter((item) => isStopComplete(route.slug, item.id)).length || 0
}

export function isRouteComplete(route) {
  return !!route?.stops?.length && getCompletedCount(route) === route.stops.length
}

export function areAllRoutesComplete(routes = []) {
  return routes.length > 0 && routes.every((route) => isRouteComplete(route))
}
