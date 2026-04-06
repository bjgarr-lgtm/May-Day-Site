

// ===== Zip A: Intelligence Selectors (non-destructive append) =====

// Normalize time to minutes from HH:MM or ISO
function __toMinutes(t) {
  if (!t) return null;
  try {
    if (typeof t === 'number') return t;
    if (typeof t === 'string') {
      // HH:MM
      const m = t.match(/^(\d{1,2}):(\d{2})$/);
      if (m) return parseInt(m[1],10)*60 + parseInt(m[2],10);
      // ISO
      const d = new Date(t);
      if (!isNaN(d.getTime())) return d.getHours()*60 + d.getMinutes();
    }
  } catch(e) {}
  return null;
}

export function selectProgrammingConflicts(state) {
  const items = state?.programming || state?.programmingItems || [];
  const out = [];
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const a = items[i], b = items[j];
      const aStart = __toMinutes(a.start || a.timeStart || a.time);
      const aEnd   = __toMinutes(a.end   || a.timeEnd   || a.time);
      const bStart = __toMinutes(b.start || b.timeStart || b.time);
      const bEnd   = __toMinutes(b.end   || b.timeEnd   || b.time);

      const overlap = (aStart != null && aEnd != null && bStart != null && bEnd != null)
        ? (aStart < bEnd && bStart < aEnd)
        : (a.time && b.time && a.time === b.time);

      const sameLocation = (a.location && b.location && a.location === b.location);
      const sameLead = (a.lead && b.lead && a.lead === b.lead);

      if (overlap && (sameLocation || sameLead)) {
        out.push({ a, b, overlap, sameLocation, sameLead });
      }
    }
  }
  return out;
}

export function selectUncoveredShifts(state) {
  const shifts = state?.volunteerShifts || state?.shifts || [];
  return shifts.filter(s => !s.assigned && !s.volunteer);
}

export function selectOverdueTasks(state) {
  const tasks = state?.tasks || [];
  const now = Date.now();
  return tasks.filter(t => {
    if (!t.due) return false;
    const d = new Date(t.due).getTime();
    return !isNaN(d) && d < now && !t.completed;
  });
}

export function selectDueSoonTasks(state, days=3) {
  const tasks = state?.tasks || [];
  const now = Date.now();
  const limit = now + days*24*60*60*1000;
  return tasks.filter(t => {
    if (!t.due) return false;
    const d = new Date(t.due).getTime();
    return !isNaN(d) && d >= now && d <= limit && !t.completed;
  });
}

export function selectResourceIssues(state) {
  const items = state?.programming || state?.programmingItems || [];
  const resources = state?.resources || [];
  const issues = [];
  items.forEach(p => {
    const needs = Array.isArray(p.needs) ? p.needs : (typeof p.needs === 'string' ? p.needs.split(',').map(s=>s.trim()).filter(Boolean) : []);
    needs.forEach(n => {
      const r = resources.find(x => (x.name||'').toLowerCase() === n.toLowerCase());
      if (!r) {
        issues.push({ program: p, need: n, type: 'missing' });
      } else if (r.quantity != null && p.needQty != null && r.quantity < p.needQty) {
        issues.push({ program: p, need: n, type: 'insufficient' });
      }
    });
  });
  return issues;
}

export function selectBlockedTasks(state) {
  const tasks = state?.tasks || [];
  const byId = Object.fromEntries(tasks.map(t => [t.id, t]));
  return tasks.filter(t => {
    if (!t.dependencies || !t.dependencies.length) return false;
    return t.dependencies.some(depId => {
      const dep = byId[depId];
      return !dep || !dep.completed;
    });
  });
}

export function selectReadiness(state) {
  const conflicts = selectProgrammingConflicts(state).length;
  const uncovered = selectUncoveredShifts(state).length;
  const overdue   = selectOverdueTasks(state).length;
  const resources = selectResourceIssues(state).length;
  const blocked   = selectBlockedTasks(state).length;

  const weights = {
    conflicts: 3,
    uncovered: 3,
    overdue: 2,
    resources: 2,
    blocked: 2,
  };

  const maxPenalty = 100;
  const penalty = Math.min(maxPenalty,
    conflicts*weights.conflicts +
    uncovered*weights.uncovered +
    overdue*weights.overdue +
    resources*weights.resources +
    blocked*weights.blocked
  );

  const score = Math.max(0, 100 - penalty);

  return {
    score,
    breakdown: { conflicts, uncovered, overdue, resources, blocked }
  };
}

// Suggest simple resolutions for each conflict
export function suggestConflictResolutions(state) {
  const conflicts = selectProgrammingConflicts(state);
  const items = state?.programming || state?.programmingItems || [];
  const locations = Array.from(new Set(items.map(i => i.location).filter(Boolean)));

  return conflicts.map(c => {
    const suggestions = [];
    // try different location
    if (c.a.location && locations.length > 1) {
      const alt = locations.find(l => l !== c.a.location);
      if (alt) suggestions.push({ type: 'move_location', itemId: c.a.id, to: alt, note: 'Move to alternate location' });
    }
    // try shift time by 30 minutes
    const aStart = __toMinutes(c.a.start || c.a.time);
    const aEnd   = __toMinutes(c.a.end   || c.a.time);
    if (aStart != null && aEnd != null) {
      const newStart = aStart + 30;
      const newEnd   = aEnd + 30;
      const hh = m => String(Math.floor(m/60)).padStart(2,'0') + ':' + String(m%60).padStart(2,'0');
      suggestions.push({ type: 'move_time', itemId: c.a.id, to: { start: hh(newStart), end: hh(newEnd) }, note: 'Shift by +30m' });
    }
    return { conflict: c, suggestions };
  });
}
