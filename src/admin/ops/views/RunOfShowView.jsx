import React from "react";
import { useOpsStore } from "../hooks/useOpsStore";
import SectionCard from "../components/SectionCard";
import { formatDate, formatDateTime, isToday } from "../utils/date";

function sortByDateTime(items) { return [...items].sort((a, b) => new Date(`${a.date || a.shiftDate || ""} ${a.time || a.shiftStart || ""}`) - new Date(`${b.date || b.shiftDate || ""} ${b.time || b.shiftStart || ""}`)); }

export default function RunOfShowView() {
  const store = useOpsStore();
  const timeline = sortByDateTime(store.timeline);
  const todayTimeline = timeline.filter((item) => isToday(item.date));
  const openTasks = store.tasks.filter((task) => task.status !== "Done");
  const criticalTasks = openTasks.filter((task) => ["Critical", "High"].includes(task.priority)).slice(0, 12);
  const volunteerShifts = sortByDateTime(store.volunteers);
  const unassignedVolunteers = volunteerShifts.filter((item) => !item.name?.trim());

  return (
    <div className="ops-page">
      <div className="ops-toolbar"><button type="button" className="ops-button" onClick={() => window.print()}>Print run of show</button></div>
      <div className="ops-stat-grid ops-stat-grid-three">
        <div className="ops-stat-card"><div className="ops-stat-label">Today timeline items</div><div className="ops-stat-value">{todayTimeline.length}</div></div>
        <div className="ops-stat-card"><div className="ops-stat-label">Critical open tasks</div><div className="ops-stat-value">{criticalTasks.length}</div></div>
        <div className="ops-stat-card"><div className="ops-stat-label">Unassigned shifts</div><div className="ops-stat-value">{unassignedVolunteers.length}</div></div>
      </div>
      <SectionCard title="Run of show" subtitle="Day-of control sheet.">
        <div className="ops-run-grid">
          <div className="ops-run-column"><h3>Timeline</h3><ul className="ops-list">{timeline.length ? timeline.map((item) => <li key={item.id}><strong>{item.activity}</strong><span>{formatDateTime(item.date, item.time)}</span><span>{item.location || "No location"}</span><span>{item.lead ? `Lead: ${item.lead}` : "No lead assigned"}</span></li>) : <li className="ops-list-empty">Timeline is empty.</li>}</ul></div>
          <div className="ops-run-column"><h3>Critical tasks</h3><ul className="ops-list">{criticalTasks.length ? criticalTasks.map((task) => <li key={task.id}><strong>{task.title}</strong><span>{task.deadline ? formatDate(task.deadline) : "No date"}</span><span>{task.owner || "Unassigned"}</span><span>{task.status}</span></li>) : <li className="ops-list-empty">No critical tasks are open.</li>}</ul></div>
          <div className="ops-run-column"><h3>Volunteer shifts</h3><ul className="ops-list">{volunteerShifts.length ? volunteerShifts.map((item) => <li key={item.id}><strong>{item.role}</strong><span>{item.name || "Unassigned"}</span><span>{formatDateTime(item.shiftDate, item.shiftStart)}{item.shiftEnd ? ` to ${item.shiftEnd}` : ""}</span><span>{item.area}</span></li>) : <li className="ops-list-empty">Volunteer board is empty.</li>}</ul></div>
        </div>
      </SectionCard>
    </div>
  );
}
