

// ===== Zip A additions =====
import { selectProgrammingConflicts, suggestConflictResolutions } from "../hooks/useOpsStore";

function __ZipA_Conflicts({ state }) {
  const conflicts = selectProgrammingConflicts(state);
  const suggestions = suggestConflictResolutions(state);
  if (!conflicts.length) return null;

  return (
    <div className="zipA-warn">
      <strong>{conflicts.length} conflict(s)</strong>
      {suggestions.map((s, i) => (
        <div key={i} className="zipA-suggest">
          <div>Conflict between items</div>
          <ul>
            {s.suggestions.map((opt, j) => (
              <li key={j}>{opt.note}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
