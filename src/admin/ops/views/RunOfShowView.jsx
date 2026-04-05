import React from "react";
import { useOpsStore } from "../hooks/useOpsStore";
import SectionCard from "../components/SectionCard";
import RecordEditor from "../components/RecordEditor";
import { formatDate, formatDateTime, isToday } from "../utils/date";
import { blankTimeline, blankTask, blankVolunteer } from "../seedData";

function sortByDateTime(items) {
  return [...items].sort((a, b) => new Date(`${a.date || a.shiftDate || ""} ${a.time || a.shiftStart || ""}`) - new Date(`${b.date || b.shiftDate || ""} ${b.time || b.shiftStart || ""}`));
}

export default function RunOfShowView() {
  const store = useOpsStore();
  const [editorType, setEditorType] = React.useState("timeline");
  const [editor, setEditor] = React.useState(blankTimeline());

  const timeline = sortByDateTime(store.timeline);
  const todayTimeline = timeline.filter((item) => isToday(item.date));
  const openTasks = store.tasks.filter((task) => task.status !== "Done");
  const criticalTasks = openTasks.filter((task) => ["Critical", "High"].includes(task.priority)).slice(0, 12);
  const volunteerShifts = sortByDateTime(store.volunteers);
  const unassignedVolunteers = volunteerShifts.filter((item) => !item.name?.trim());

  const startEdit = (type, value) => {
    setEditorType(type);
    setEditor(value);
  };

  const resetEditor = () => {
    if (editorType === "task") setEditor(blankTask());
    else if (editorType === "volunteer") setEditor(blankVolunteer());
    else setEditor(blankTimeline());
  };

  const saveEditor = () => {
    if (editorType === "task") {
      if (!editor.title?.trim()) return window.alert("Task title is required.");
      store.updateItem("tasks", editor.id, editor);
      return resetEditor();
    }
    if (editorType === "volunteer") {
      if (!editor.role?.trim()) return window.alert("Volunteer role is required.");
      store.updateItem("volunteers", editor.id, editor);
      return resetEditor();
    }
    if (!editor.activity?.trim()) return window.alert("Timeline activity is required.");
    store.updateItem("timeline", editor.id, editor);
    resetEditor();
  };

  const timelineEditorFields = [
    { name: "date", label: "Date", type: "date" },
    { name: "time", label: "Time", type: "time" },
    { name: "activity", label: "Activity", full: true },
    { name: "location", label: "Location" },
    { name: "lead", label: "Lead" },
    { name: "dependencies", label: "Dependencies", full: true },
    { name: "notes", label: "Notes", type: "textarea", full: true },
  ];
  const taskEditorFields = [
    { name: "title", label: "Task", full: true },
    { name: "owner", label: "Owner" },
    { name: "status", label: "Status" },
    { name: "priority", label: "Priority" },
    { name: "deadline", label: "Deadline", type: "date" },
    { name: "notes", label: "Notes", type: "textarea", full: true },
  ];
  const volunteerEditorFields = [
    { name: "role", label: "Role", full: true },
    { name: "name", label: "Assigned volunteer" },
    { name: "area", label: "Area" },
    { name: "shiftDate", label: "Date", type: "date" },
    { name: "shiftStart", label: "Start", type: "time" },
    { name: "shiftEnd", label: "End", type: "time" },
    { name: "status", label: "Status" },
    { name: "notes", label: "Notes", type: "textarea", full: true },
  ];

  return (
    <div className="ops-page">
      <div className="ops-toolbar">
        <button className="ops-button" onClick={() => window.print()}>Print run of show</button>
      </div>

      <div className="ops-stat-grid ops-stat-grid-three">
        <div className="ops-stat-card"><div className="ops-stat-label">Today timeline items</div><div className="ops-stat-value">{todayTimeline.length}</div></div>
        <div className="ops-stat-card"><div className="ops-stat-label">Critical open tasks</div><div className="ops-stat-value">{criticalTasks.length}</div></div>
        <div className="ops-stat-card"><div className="ops-stat-label">Unassigned shifts</div><div className="ops-stat-value">{unassignedVolunteers.length}</div></div>
      </div>

      <SectionCard title="Run of show editor" subtitle="Edit the day-of cards from up top instead of screaming at static lists.">
        <div className="ops-tabs ops-tabs-inline">
          <button className={`ops-tab ${editorType === "timeline" ? "is-active" : ""}`} onClick={() => startEdit("timeline", blankTimeline())}>Timeline</button>
          <button className={`ops-tab ${editorType === "task" ? "is-active" : ""}`} onClick={() => startEdit("task", blankTask())}>Critical task</button>
          <button className={`ops-tab ${editorType === "volunteer" ? "is-active" : ""}`} onClick={() => startEdit("volunteer", blankVolunteer())}>Volunteer shift</button>
        </div>
        <RecordEditor
          title={editorType === "timeline" ? "Timeline card editor" : editorType === "task" ? "Critical task editor" : "Volunteer shift editor"}
          value={editor}
          onChange={(key, value) => setEditor((current) => ({ ...current, [key]: value }))}
          onSave={saveEditor}
          onCancel={resetEditor}
          fields={editorType === "timeline" ? timelineEditorFields : editorType === "task" ? taskEditorFields : volunteerEditorFields}
        />
      </SectionCard>

      <SectionCard title="Run of show" subtitle="This is the day-of control sheet, not a place for philosophical experimentation.">
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
                  <button className="ops-button ops-button-small" onClick={() => startEdit("timeline", item)}>Edit</button>
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
                  <span>{task.deadline ? formatDate(task.deadline) : "Verify date"}</span>
                  <span>{task.owner || "Unassigned"}</span>
                  <span>{task.status}</span>
                  <button className="ops-button ops-button-small" onClick={() => startEdit("task", task)}>Edit</button>
                </li>
              )) : <li className="ops-list-empty">No critical tasks are open.</li>}
            </ul>
          </div>

          <div className="ops-run-column">
            <h3>Volunteer shifts</h3>
            <ul className="ops-list">
              {volunteerShifts.length ? volunteerShifts.map((item) => (
                <li key={item.id}>
                  <strong>{item.role}</strong>
                  <span>{item.name || "Unassigned"}</span>
                  <span>{formatDateTime(item.shiftDate, item.shiftStart)}{item.shiftEnd ? ` to ${item.shiftEnd}` : ""}</span>
                  <span>{item.area}</span>
                  <button className="ops-button ops-button-small" onClick={() => startEdit("volunteer", item)}>Edit</button>
                </li>
              )) : <li className="ops-list-empty">Volunteer board is empty.</li>}
            </ul>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
