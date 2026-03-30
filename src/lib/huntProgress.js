const STORAGE_KEY = 'mayday_hunt_progress_v1'

function readProgress() {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeProgress(progress) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}

export function isStopComplete(category, stopId) {
  const progress = readProgress()
  return Boolean(progress?.[category]?.[stopId])
}

export function markStopComplete(category, stopId) {
  const progress = readProgress()
  const next = {
    ...progress,
    [category]: {
      ...(progress[category] || {}),
      [stopId]: true,
    },
  }
  writeProgress(next)
  return next
}

export function getRouteCompletionCount(category) {
  const progress = readProgress()
  return Object.keys(progress?.[category] || {}).length
}

export function getTotalCompletionCount() {
  const progress = readProgress()
  return Object.values(progress).reduce((sum, route) => sum + Object.keys(route || {}).length, 0)
}
