import React from "react";
import { useOpsStore } from "../hooks/useOpsStore";
import SectionCard from "../components/SectionCard";
import { formatDate, formatDateTime, isToday } from "../utils/date";

function sortByDateTime(items) {
  return [...items].sort((a, b) => new Date(`${a.date || a.shiftDate || ""} ${a.time || a.shiftStart || ""}`) - new Date(`${b.date || b.shiftDate || ""} ${b.time || b.shiftStart || ""}`));
}

export default function RunOfShowView() {
  const store = useOpsStore();
  const timeline = sortByDateTime(store.timeline);
  const todayTimeline = timeline.filter((item) => isToday(item.date));
  const openTasks = store.tasks.filter((task) => task.status !== "Done");
  const criticalTasks = openTasks.filter((task) => ["Critical", "High"].includes(task.priority)).slice(0, 12);
  const volunteerShifts = sortByDateTime(store.volunteers);
  const uncovered = store.uncoveredVolunteerShifts || [];
  const volunteerConflicts = store.volunteerConflicts || [];
  const programConflicts = store.programmingConflicts || [];
  const resourceIssues = store.resourceIssues || [];

  return (
    <div className="ops-page">
      <div className="ops-toolbar">
        <button type="button" className="ops-button" onClick={() => window.print()}>Print run of show</button>
      </div>

      <div className="ops-stat-grid ops-stat-grid-three">
        <div className="ops-stat-card"><div className="ops-stat-label">Today timeline items</div><div className="ops-stat-value">{todayTimeline.length}</div></div>
        <div className="ops-stat-card"><div className="ops-stat-label">Critical open tasks</div><div className="ops-stat-value">{criticalTasks.length}</div></div>
        <div className="ops-stat-card tone-danger"><div className="ops-stat-label">Operational warnings</div><div className="ops-stat-value">{uncovered.length + volunteerConflicts.length + programConflicts.length + resourceIssues.length}</div></div>
      </div>

      <SectionCard title="Operational warnings" subtitle="Things that will bite you on event day if ignored.">
        <div className="ops-banner-list">
          {programConflicts.slice(0, 4).map((item) => (
            <div className="ops-alert-row ops-alert-danger" key={item.id}><strong>Programming</strong><span>{item.summary}</span></div>
          ))}
          {volunteerConflicts.slice(0, 4).map((item) => (
            <div className="ops-alert-row ops-alert-danger" key={item.id}><strong>Volunteer</strong><span>{item.summary}</span></div>
          ))}
          {resourceIssues.slice(0, 4).map((item) => (
            <div className="ops-alert-row ops-alert-warning" key={item.id}><strong>Resource</strong><span>{item.summary}</span></div>
          ))}
          {uncovered.slice(0, 4).map((item) => (
            <div className="ops-alert-row ops-alert-warning" key={item.id}><strong>Open shift</strong><span>{item.role} · {formatDateTime(item.shiftDate, item.shiftStart)}</span></div>
          ))}
          {!programConflicts.length && !volunteerConflicts.length && !resourceIssues.length && !uncovered.length ? (
            <div className="ops-list-empty">No active warnings right now.</div>
          ) : null}
        </div>
      </SectionCard>

      <SectionCard title="Run of show" subtitle="Day-of control sheet.">
        <div className="ops-run-grid">
          <div className="ops-run-column">
            <h3>Timeline</h3>
            <ul className="ops-list">
              {timeline.length ? timeline.map((item) => (
                <li key={item.id}>
                  <strong>{item.activity}</strong>
                  <span>{formatDateTime(item.date, item.time)}</span>
                  <span>{item.location || "No location"}</span>
                  <span>{item.lead ? `Lead: ${item.lead}` : "No lead assigned"}</span>
                </li>
              )) : <li className="ops-list-empty">Timeline is empty.</li>}
            </ul>
          </div>

          <div className="ops-run-column">
            <h3>Critical tasks</h3>
            <ul className="ops-list">
              {criticalTasks.length ? criticalTasks.map((task) => (
                <li key={task.id}>
                  <strong>{task.title}</strong>
                  <span>{task.deadline ? formatDate(task.deadline) : "No date"}</span>
                  <span>{task.owner || "Unassigned"}</span>
                  <span>{task.status}</span>
                </li>
              )) : <li className="ops-list-empty">No critical tasks are open.</li>}
            </ul>
          </div>

          <div className="ops-run-column">
            <h3>Volunteer shifts</h3>
            <ul className="ops-list">
              {volunteerShifts.length ? volunteerShifts.map((item) => {
                const hasConflict = Boolean(store.volunteerConflictsById?.[item.id]?.length);
                const isOpen = !item.name?.trim() || item.status === "Needs Assignment";
                return (
                  <li key={item.id}>
                    <strong>{item.role}</strong>
                    <span>{item.name || "Unassigned"}</span>
                    <span>{formatDateTime(item.shiftDate, item.shiftStart)}{item.shiftEnd ? ` to ${item.shiftEnd}` : ""}</span>
                    <span>{item.area}</span>
                    {hasConflict ? <span className="ops-inline-flag ops-inline-flag-danger">conflict</span> : null}
                    {isOpen ? <span className="ops-inline-flag ops-inline-flag-warning">open</span> : null}
                  </li>
                );
              }) : <li className="ops-list-empty">Volunteer board is empty.</li>}
            </ul>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
