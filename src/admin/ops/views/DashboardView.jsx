

// ===== Zip A additions =====
import { selectReadiness, selectProgrammingConflicts, selectUncoveredShifts, selectOverdueTasks, selectResourceIssues } from "../hooks/useOpsStore";

function __ZipA_ReadinessPanel({ state }) {
  const r = selectReadiness(state);
  const conflicts = selectProgrammingConflicts(state);
  const uncovered = selectUncoveredShifts(state);
  const overdue = selectOverdueTasks(state);
  const resources = selectResourceIssues(state);

  return (
    <div className="ops-card zipA-panel">
      <div className="zipA-score">
        <div className="zipA-score-num">{r.score}%</div>
        <div className="zipA-score-label">Readiness</div>
      </div>
      <div className="zipA-breakdown">
        <div>Conflicts: {conflicts.length}</div>
        <div>Uncovered: {uncovered.length}</div>
        <div>Overdue: {overdue.length}</div>
        <div>Resources: {resources.length}</div>
      </div>
    </div>
  );
}
