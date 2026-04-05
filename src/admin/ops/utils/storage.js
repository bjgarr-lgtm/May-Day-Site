
const STORAGE_KEY = "mayday-ops-console-v2";

export function loadOpsState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveOpsState(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // fail quietly
  }
}

export function clearOpsState() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // fail quietly
  }
}

export function exportOpsState(state) {
  return JSON.stringify(state, null, 2);
}

export function importOpsState(text) {
  const parsed = JSON.parse(text);
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Import data is not valid.");
  }
  return parsed;
}
