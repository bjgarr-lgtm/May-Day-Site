
export function getConflicts(programming = []) {
  const conflicts = [];
  for (let i = 0; i < programming.length; i++) {
    for (let j = i + 1; j < programming.length; j++) {
      const a = programming[i];
      const b = programming[j];
      if (a.time === b.time && a.location === b.location) {
        conflicts.push({ a, b });
      }
    }
  }
  return conflicts;
}
