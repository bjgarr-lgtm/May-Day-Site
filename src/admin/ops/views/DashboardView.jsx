// === Zip 3 FINAL additions ===

import { suggestConflictResolutions, suggestVolunteerAssignments, computeAdvancedReadiness } from "../hooks/intelligence";

// inside component:
const conflictSuggestions = suggestConflictResolutions(store);
const volunteerSuggestions = suggestVolunteerAssignments(store);
const advancedReadiness = computeAdvancedReadiness(store);

{/* Add below readiness */}
<StatCard label="Advanced readiness" value={`${advancedReadiness}%`} />

{/* Conflict suggestions */}
<SectionCard title="Conflict suggestions">
  {conflictSuggestions.map((c, i) => (
    <div key={i}>
      <strong>{c.conflict.summary}</strong>
      <ul>
        {c.suggestions.map((s, j) => <li key={j}>{s.note}</li>)}
      </ul>
    </div>
  ))}
</SectionCard>

{/* Volunteer suggestions */}
<SectionCard title="Volunteer suggestions">
  {volunteerSuggestions.map((v, i) => (
    <div key={i}>
      <strong>{v.role}</strong>
      <ul>
        {v.suggestions.map((s, j) => <li key={j}>{s.name}</li>)}
      </ul>
    </div>
  ))}
</SectionCard>
