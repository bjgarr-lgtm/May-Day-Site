import React from "react";
import { useOpsStore } from "../hooks/useOpsStore";
import SectionCard from "../components/SectionCard";
import EditableTable from "../components/EditableTable";
import RecordEditor from "../components/RecordEditor";
import { blankVolunteer } from "../seedData";

const statusOptions = ["Needs Assignment", "Assigned", "Confirmed", "Backup", "No Show"];
const areaOptions = ["General", "Safety", "Front of House", "Route", "Art Center", "Kitchen", "Clean Up"];

export default function VolunteersView() {
  const store = useOpsStore();
  const [editor, setEditor] = React.useState(blankVolunteer());
  const [isEditorOpen, setIsEditorOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [areaFilter, setAreaFilter] = React.useState("All");
  const [statusFilter, setStatusFilter] = React.useState("All");
  const [issueFilter, setIssueFilter] = React.useState("All");
  const editorRef = React.useRef(null);

  const openEditor = React.useCallback((next) => {
    setEditor(next);
    setIsEditorOpen(true);
    requestAnimationFrame(() => editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }, []);

  const rows = store.volunteers
    .filter((item) => {
      const haystack = `${item.name} ${item.role} ${item.area} ${item.contact} ${item.status} ${item.notes}`.toLowerCase();
      const matchesQuery = !query || haystack.includes(query.toLowerCase());
      const matchesArea = areaFilter === "All" || item.area === areaFilter;
      const matchesStatus = statusFilter === "All" || item.status === statusFilter;
      const hasConflict = Boolean(store.volunteerConflictsById?.[item.id]?.length);
      const isUncovered = !item.name?.trim() || item.status === "Needs Assignment";
      const matchesIssue = issueFilter === "All" || (issueFilter === "Conflicts" && hasConflict) || (issueFilter === "Uncovered" && isUncovered) || (issueFilter === "Clean" && !hasConflict && !isUncovered);
      return matchesQuery && matchesArea && matchesStatus && matchesIssue;
    })
    .sort((a, b) => `${a.shiftDate || ""} ${a.shiftStart || ""}`.localeCompare(`${b.shiftDate || ""} ${b.shiftStart || ""}`));

  const handleSave = () => {
    if (!editor.role.trim()) {
      window.alert("Role is required.");
      return;
    }
    const exists = store.volunteers.some((item) => item.id === editor.id);
    if (exists) store.updateItem("volunteers", editor.id, editor);
    else store.addItem("volunteers", editor);
    setEditor(blankVolunteer());
    setIsEditorOpen(false);
  };

  return (
    <div className="ops-page">
      <div className="ops-stat-grid ops-stat-grid-three">
        <div className="ops-stat-card"><div className="ops-stat-label">Volunteer shifts</div><div className="ops-stat-value">{store.volunteers.length}</div></div>
        <div className="ops-stat-card"><div className="ops-stat-label">Uncovered shifts</div><div className="ops-stat-value">{store.uncoveredVolunteerShifts.length}</div></div>
        <div className="ops-stat-card"><div className="ops-stat-label">Double-bookings</div><div className="ops-stat-value">{store.volunteerConflicts.length}</div></div>
      </div>

      <SectionCard title={store.volunteers.some((item) => item.id === editor.id) ? "Edit volunteer shift" : "Add volunteer shift"}>
        <RecordEditor
          editorRef={editorRef}
          title={store.volunteers.some((item) => item.id === editor.id) ? "Volunteer editor" : "New volunteer shift"}
          value={editor}
          isOpen={isEditorOpen}
          onToggle={() => {
            if (isEditorOpen) setIsEditorOpen(false);
            else {
              if (!store.volunteers.some((item) => item.id === editor.id) && !editor.role) setEditor(blankVolunteer());
              setIsEditorOpen(true);
            }
          }}
          mode={store.volunteers.some((item) => item.id === editor.id) ? "edit" : "add"}
          onChange={(key, value) => setEditor((current) => ({ ...current, [key]: value }))}
          onSave={handleSave}
          onCancel={() => {
            setEditor(blankVolunteer());
            setIsEditorOpen(false);
          }}
          fields={[
            { name: "name", label: "Volunteer" },
            { name: "role", label: "Role", full: true },
            { name: "area", label: "Area", type: "select", options: areaOptions },
            { name: "shiftDate", label: "Date", type: "date" },
            { name: "shiftStart", label: "Start", type: "time" },
            { name: "shiftEnd", label: "End", type: "time" },
            { name: "contact", label: "Contact", full: true },
            { name: "status", label: "Status", type: "select", options: statusOptions },
            { name: "checkedIn", label: "Checked in", type: "checkbox" },
            { name: "notes", label: "Notes", type: "textarea", full: true },
          ]}
        />
      </SectionCard>

      <SectionCard title="Volunteer board" subtitle="Coverage, check-ins, role fit, and where the holes still are.">
        <div className="ops-toolbar">
          <input className="ops-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search volunteers" />
          <select value={areaFilter} onChange={(e) => setAreaFilter(e.target.value)}>
            <option>All</option>
            {areaOptions.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option>All</option>
            {statusOptions.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select value={issueFilter} onChange={(e) => setIssueFilter(e.target.value)}>
            <option>All</option>
            <option>Conflicts</option>
            <option>Uncovered</option>
            <option>Clean</option>
          </select>
        </div>

        {(store.uncoveredVolunteerShifts.length > 0 || store.volunteerConflicts.length > 0) && (
          <div className="ops-warning-banner">
            {store.uncoveredVolunteerShifts.length > 0 && <span>{store.uncoveredVolunteerShifts.length} uncovered shift{store.uncoveredVolunteerShifts.length === 1 ? "" : "s"}</span>}
            {store.uncoveredVolunteerShifts.length > 0 && store.volunteerConflicts.length > 0 && <span> • </span>}
            {store.volunteerConflicts.length > 0 && <span>{store.volunteerConflicts.length} volunteer conflict{store.volunteerConflicts.length === 1 ? "" : "s"}</span>}
          </div>
        )}

        <EditableTable
          tableKey="volunteers"
          rows={rows}
          onEdit={openEditor}
          onDelete={(id) => store.removeItem("volunteers", id)}
          columns={[
            { key: "name", label: "Volunteer", width: 180, render: (value) => value || "Unassigned" },
            { key: "role", label: "Role", width: 220 },
            { key: "area", label: "Area" },
            { key: "shiftDate", label: "Date" },
            { key: "shiftStart", label: "Start" },
            { key: "shiftEnd", label: "End" },
            {
              key: "issues",
              label: "Issues",
              width: 220,
              render: (_, row) => {
                const issues = [];
                if (!row.name?.trim() || row.status === "Needs Assignment") issues.push("uncovered");
                if (store.volunteerConflictsById?.[row.id]?.length) issues.push("double-booked");
                return issues.length ? <span className="ops-pill status-at-risk">{issues.join(" • ")}</span> : "—";
              },
            },
            { key: "contact", label: "Contact", width: 200 },
            { key: "status", label: "Status", render: (value, row) => <span className={`ops-pill status-${statusSlug(row.checkedIn ? "Checked In" : value)}`}>{row.checkedIn ? "Checked In" : value}</span> },
            { key: "notes", label: "Notes", width: 220 },
          ]}
          rowClassName={(row) => (store.volunteerConflictsById?.[row.id]?.length ? "is-overdue" : "")}
          emptyLabel="No volunteer shifts match the current filters."
        />
      </SectionCard>
    </div>
  );
}

function statusSlug(value = "") {
  return value.toLowerCase().replace(/\s+/g, "-");
}
