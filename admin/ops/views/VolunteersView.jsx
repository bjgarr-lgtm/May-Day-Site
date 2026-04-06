import React from "react";
import { exportCSV } from "../utils/exportCSV";
import { useOpsStore } from "../hooks/useOpsStore";

function SuggestionCard({ item, onApply }) {
  return (
    <div className="ops-suggestion-card">
      <div className="ops-suggestion-head">
        <div>
          <strong>{item.role}</strong>
          <div className="ops-suggestion-meta">{item.area || "No area"} · {item.shiftDate || "No date"} {item.shiftStart || ""}{item.shiftEnd ? ` to ${item.shiftEnd}` : ""}</div>
        </div>
      </div>
      <div className="ops-suggestion-list">
        {item.candidates.map((candidate) => (
          <div className="ops-suggestion-row" key={`${item.shiftId}-${candidate.name}`}>
            <div>
              <strong>{candidate.name}</strong>
              <div className="ops-suggestion-meta">{candidate.role || "No role"} · score {candidate.score}</div>
              <div className="ops-suggestion-reasons">{candidate.reasons.join(", ")}</div>
            </div>
            <button type="button" className="ops-button ops-button-small" onClick={() => onApply(item.shiftId, candidate.name)}>
              Assign
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function VolunteersView() {
  const store = useOpsStore();
  const volunteers = store.volunteers || [];
  const suggestions = store.volunteerSuggestions || [];
  const uncovered = store.uncoveredVolunteerShifts || [];
  const conflicts = store.volunteerConflicts || [];

  return (
    <div className="ops-page">
      <div className="ops-page-header">
        <div>
          <h2>Volunteers</h2>
          <p>Coverage, assignment suggestions, and quick exports.</p>
        </div>
        <div className="ops-page-actions">
          <button type="button" className="ops-button" onClick={() => exportCSV(volunteers, "volunteers.csv")}>Export CSV</button>
          <button type="button" className="ops-button ops-button-secondary" onClick={() => window.print()}>Print</button>
        </div>
      </div>

      <div className="ops-stat-grid">
        <div className="ops-stat-card"><span>Volunteer shifts</span><strong>{volunteers.length}</strong></div>
        <div className="ops-stat-card"><span>Open shifts</span><strong>{uncovered.length}</strong></div>
        <div className="ops-stat-card"><span>Conflicts</span><strong>{conflicts.length}</strong></div>
        <div className="ops-stat-card"><span>Suggestions</span><strong>{suggestions.length}</strong></div>
      </div>

      <div className="ops-dashboard-grid ops-dashboard-grid-two">
        <section className="ops-section-card">
          <h3>Assignment suggestions</h3>
          <p className="ops-section-subtitle">Best fit volunteers for uncovered shifts. Ranked so you do not have to eyeball the whole mess.</p>
          {suggestions.length ? suggestions.map((item) => (
            <SuggestionCard key={item.shiftId} item={item} onApply={store.applyVolunteerSuggestion} />
          )) : <div className="ops-list-empty">No suggestions yet. You need named volunteers in the system first.</div>}
        </section>

        <section className="ops-section-card">
          <h3>Current board</h3>
          <div className="ops-compact-list">
            {volunteers.map((item) => (
              <div className={`ops-compact-row ${!item.name ? "is-warning" : ""}`} key={item.id}>
                <div>
                  <strong>{item.role}</strong>
                  <div className="ops-suggestion-meta">{item.shiftDate || "No date"} · {item.shiftStart || ""}{item.shiftEnd ? ` to ${item.shiftEnd}` : ""}</div>
                </div>
                <div className="ops-row-right">
                  <span>{item.name || "Needs assignment"}</span>
                  <button type="button" className="ops-button ops-button-small" onClick={() => store.toggleVolunteerCheckIn(item.id)}>
                    {item.checkedIn ? "Undo check in" : "Check in"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
