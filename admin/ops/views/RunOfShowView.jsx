import React from "react";
import { useOpsStore } from "../hooks/useOpsStore";

function WarningBlock({ title, items, renderItem }) {
  return (
    <section className="ops-section-card">
      <h3>{title}</h3>
      {items.length ? (
        <div className="ops-compact-list">
          {items.map(renderItem)}
        </div>
      ) : (
        <div className="ops-list-empty">Nothing screaming for attention here.</div>
      )}
    </section>
  );
}

export default function RunOfShowView() {
  const store = useOpsStore();
  const timeline = [...(store.timeline || [])].sort((a, b) => {
    const left = `${a.date || ""} ${a.time || ""}`;
    const right = `${b.date || ""} ${b.time || ""}`;
    return new Date(left) - new Date(right);
  });

  return (
    <div className="ops-page">
      <div className="ops-page-header">
        <div>
          <h2>Run of Show</h2>
          <p>Operational overview with warnings first, then the timeline.</p>
        </div>
        <div className="ops-page-actions">
          <button type="button" className="ops-button ops-button-secondary" onClick={() => window.print()}>Print</button>
        </div>
      </div>

      <div className="ops-dashboard-grid ops-dashboard-grid-two">
        <WarningBlock
          title="Coverage problems"
          items={store.uncoveredVolunteerShifts || []}
          renderItem={(item) => (
            <div className="ops-alert-row ops-alert-warning" key={item.id}>
              <strong>{item.role}</strong>
              <span>{item.shiftDate || "No date"} · {item.shiftStart || ""}</span>
            </div>
          )}
        />
        <WarningBlock
          title="Programming conflicts"
          items={store.programmingConflicts || []}
          renderItem={(item) => (
            <div className="ops-alert-row ops-alert-danger" key={item.id}>
              <strong>{item.leftLabel}</strong>
              <span>{item.summary}</span>
            </div>
          )}
        />
      </div>

      <section className="ops-section-card">
        <h3>Timeline</h3>
        <div className="ops-compact-list">
          {timeline.map((item) => (
            <div className="ops-compact-row" key={item.id}>
              <div>
                <strong>{item.activity}</strong>
                <div className="ops-suggestion-meta">{item.date || "No date"} · {item.time || "No time"}</div>
              </div>
              <div className="ops-row-right">{item.location || item.lead || "No location"}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
