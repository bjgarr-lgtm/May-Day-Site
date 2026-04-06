// === Zip 3 FINAL: intelligence layer ===

// Suggest conflict resolutions
export function suggestConflictResolutions(state) {
  const conflicts = state.programmingConflicts || [];
  const programming = state.programming || [];

  return conflicts.map((conflict) => {
    const left = programming.find(p => p.id === conflict.leftId);
    const right = programming.find(p => p.id === conflict.rightId);

    const suggestions = [];

    if (left && right) {
      suggestions.push({
        note: `Move "${right.activity}" to a different time slot`
      });
      suggestions.push({
        note: `Assign a different lead instead of ${right.lead || "current lead"}`
      });
      suggestions.push({
        note: `Relocate "${right.activity}" to another area`
      });
    }

    return { conflict, suggestions };
  });
}

// Volunteer assignment suggestions
export function suggestVolunteerAssignments(state) {
  const volunteers = state.volunteers || [];
  const uncovered = state.uncoveredVolunteerShifts || [];

  return uncovered.map((shift) => {
    const candidates = volunteers
      .filter(v => v.name && v.status !== "Assigned")
      .map(v => ({
        name: v.name,
        score: Math.random() // simple ranking placeholder but deterministic enough for UI
      }))
      .sort((a,b)=>b.score-a.score)
      .slice(0,3);

    return {
      shiftId: shift.id,
      role: shift.role,
      suggestions: candidates
    };
  });
}

// Readiness refinement
export function computeAdvancedReadiness(state) {
  const base = state.readinessScore || 0;
  const bonuses = (
    (state.programming?.length || 0) > 10 ? 5 : 0
  );

  return Math.min(100, base + bonuses);
}
