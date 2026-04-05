import React from "react";
import { useOpsStore } from "../hooks/useOpsStore";
import SectionCard from "../components/SectionCard";
import RecordEditor from "../components/RecordEditor";
import { blankTask, blankTimeline, blankVolunteer } from "../seedData";
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
  const unassignedVolunteers = volunteerShifts.filter((item) => !item.name?.trim());

  const [editorType, setEditorType] = React.useState("timeline");
  const [editor, setEditor] = React.useState(blankTimeline());
  const [focusToken, setFocusToken] = React.useState(0);
  const editorRef = React.useRef(null);

  const activateEditor = React.useCallback((type, item) => {
    setEditorType(type);
    setEditor(item);
    setFocusToken((current) => current + 1);
    window.requestAnimationFrame(() => editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }, []);

  const handleCancel = React.useCallback(() => {
    if (editorType === "task") activateEditor("task", blankTask());
    else if (editorType === "volunteer") activateEditor("volunteer", blankVolunteer());
    else activateEditor("timeline", blankTimeline());
  }, [activateEditor, editorType]);

  const handleSave = () => {
    if (editorType === "timeline") {
      if (!editor.activity?.trim()) return window.alert("Timeline activity is required.");
      const exists = store.timeline.some((item) => item.id === editor.id);
      exists ? store.updateItem("timeline", editor.id, editor) : store.addItem("timeline", editor);
      activateEditor("timeline", blankTimeline());
      return;
    }
    if (editorType === "task") {
      if (!editor.title?.trim()) return window.alert("Task title is required.");
      const exists = store.tasks.some((item) => item.id === editor.id);
      exists ? store.updateItem("tasks", editor.id, editor) : store.addItem("tasks", editor);
      activateEditor("task", blankTask());
      return;
    }
    if (!editor.role?.trim()) return window.alert("Volunteer role is required.");
    const exists = store.volunteers.some((item) => item.id === editor.id);
    exists ? store.updateItem("volunteers", editor.id, editor) : store.addItem("volunteers", editor);
    activateEditor("volunteer", blankVolunteer());
  };

  const editorFields = editorType === "timeline"
    ? [
        { name: "date", label: "Date", type: "date" },
        { name: "time", label: "Time", type: "time" },
        { name: "activity", label: "Activity", full: true },
        { name: "location", label: "Location" },
        { name: "lead", label: "Lead" },
        { name: "dependencies", label: "Dependencies", full: true },
        { name: "notes", label: "Notes", type: "textarea", full: true },
      ]
    : editorType === "task"
      ? [
          { name: "title", label: "Task title", full: true },
          { name: "category", label: "Category" },
          { name: "owner", label: "Owner" },
          { name: "status", label: "Status" },
          { name: "priority", label: "Priority" },
          { name: "deadline", label: "Deadline", type: "date" },
          { name: "notes", label: "Notes", type: "textarea", full: true },
        ]
      : [
          { name: "name", label: "Volunteer name" },
          { name: "role", label: "Role" },
          { name: "area", label: "Area" },
          { name: "shiftDate", label: "Shift date", type: "date" },
          { name: "shiftStart", label: "Start", type: "time" },
          { name: "shiftEnd", label: "End", type: "time" },
          { name: "contact", label: "Contact", full: true },
          { name: "status", label: "Status" },
          { name: "notes", label: "Notes", type: "textarea", full: true },
        ];

  const editingLabel = editorType === "timeline" ? editor.activity : editorType === "task" ? editor.title : editor.role;

  return (
    <div className="ops-page">
      <div className="ops-toolbar">
        <button type="button" className="ops-button" onClick={() => window.print()}>Print run of show</button>
      </div>

      <div className="ops-stat-grid ops-stat-grid-three">
        <div className="ops-stat-card"><div className="ops-stat-label">Today timeline items</div><div className="ops-stat-value">{todayTimeline.length}</div></div>
        <div className="ops-stat-card"><div className="ops-stat-label">Critical open tasks</div><div className="ops-stat-value">{criticalTasks.length}</div></div>
        <div className="ops-stat-card"><div className="ops-stat-label">Unassigned shifts</div><div className="ops-stat-value">{unassignedVolunteers.length}</div></div>
      </div>

      <SectionCard title="Run of show editor" subtitle="Now the edit buttons do something visible instead of gaslighting you.">
        <div className="ops-tabs">
          {["timeline", "task", "volunteer"].map((type) => (
            <button type="button" key={type} className={`ops-tab ${editorType === type ? "is-active" : ""}`} onClick={() => activateEditor(type, type === "timeline" ? blankTimeline() : type === "task" ? blankTask() : blankVolunteer())}>
              {type === "task" ? "Critical task" : type === "volunteer" ? "Volunteer shift" : "Timeline item"}
            </button>
          ))}
        </div>
        <RecordEditor
          title={editorType === "timeline" ? "Timeline editor" : editorType === "task" ? "Critical task editor" : "Volunteer shift editor"}
          value={editor}
          onChange={(key, value) => setEditor((current) => ({ ...current, [key]: value }))}
          onSave={handleSave}
          onCancel={handleCancel}
          editorRef={editorRef}
          autoFocusToken={focusToken}
          editingLabel={editingLabel || ""}
          fields={editorFields}
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
                  <button type="button" className="ops-button ops-button-small" onClick={() => activateEditor("timeline", item)}>Edit</button>
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
                  <button type="button" className="ops-button ops-button-small" onClick={() => activateEditor("task", task)}>Edit</button>
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
                  <button type="button" className="ops-button ops-button-small" onClick={() => activateEditor("volunteer", item)}>Edit</button>
                </li>
              )) : <li className="ops-list-empty">Volunteer board is empty.</li>}
            </ul>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
