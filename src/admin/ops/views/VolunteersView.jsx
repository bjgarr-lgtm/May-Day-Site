import React from "react";
import { useOpsStore } from "../hooks/useOpsStore";
import SectionCard from "../components/SectionCard";
import EditableTable from "../components/EditableTable";
import RecordEditor from "../components/RecordEditor";
import { blankVolunteer } from "../seedData";
import { formatDateTime, isToday } from "../utils/date";

const volunteerStatuses = ["Needs Assignment", "Confirmed", "Tentative", "Checked In", "No Show"];
const areas = ["General", "Ops", "Front of House", "Food", "Programming", "Activities", "Safety", "Cleanup"];
const quickViews = ["All", "Open", "Today", "Checked In"];
const issueOptions = ["All", "Conflicts", "Uncovered", "Clean"];

function statusSlug(value = "") {
  return value.toLowerCase().replace(/\s+/g, "-");
}

function IssuePill({ tone = "default", children }) {
  return <span className={`ops-pill tone-${tone}`}>{children}</span>;
}

export default function VolunteersView() {
  const store = useOpsStore();
  const [editor, setEditor] = React.useState(blankVolunteer());
  const [isEditorOpen, setIsEditorOpen] = React.useState(false);
  const [quickView, setQuickView] = React.useState("All");
  const [areaFilter, setAreaFilter] = React.useState("All");
  const [query, setQuery] = React.useState("");
  const [issueFilter, setIssueFilter] = React.useState("All");
  const editorRef = React.useRef(null);

  const openEditor = React.useCallback((next) => {
    setEditor(next);
    setIsEditorOpen(true);
    requestAnimationFrame(() => editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }, []);

  const rows = store.volunteers
    .filter((item) => {
      const matchesArea = areaFilter === "All" || item.area === areaFilter;
      const haystack = `${item.name} ${item.role} ${item.area} ${item.contact} ${item.notes}`.toLowerCase();
      const matchesQuery = !query || haystack.includes(query.toLowerCase());
      let matchesQuick = true;
      if (quickView === "Open") matchesQuick = !item.name?.trim() || item.status === "Needs Assignment";
      if (quickView === "Today") matchesQuick = isToday(item.shiftDate);
      if (quickView === "Checked In") matchesQuick = item.checkedIn;
      const hasConflict = Boolean(store.volunteerConflictsById?.[item.id]?.length);
      const isUncovered = !item.name?.trim() || item.status === "Needs Assignment";
      const matchesIssue =
        issueFilter === "All" ||
        (issueFilter === "Conflicts" && hasConflict) ||
        (issueFilter === "Uncovered" && isUncovered) ||
        (issueFilter === "Clean" && !hasConflict && !isUncovered);
      return matchesArea && matchesQuery && matchesQuick && matchesIssue;
    })
    .sort((a, b) => new Date(`${a.shiftDate || ""} ${a.shiftStart || ""}`) - new Date(`${b.shiftDate || ""} ${b.shiftStart || ""}`));

  const handleSave = () => {
    if (!editor.role.trim()) {
      window.alert("Volunteer role is required.");
      return;
    }
    const next = {
      ...editor,
      status: editor.checkedIn ? "Checked In" : editor.status,
    };
    const exists = store.volunteers.some((item) => item.id === next.id);
    exists ? store.updateItem("volunteers", next.id, next) : store.addItem("volunteers", next);
    setEditor(blankVolunteer());
    setIsEditorOpen(false);
  };

  const openCount = store.uncoveredVolunteerShifts?.length || 0;
  const checkedInCount = store.volunteers.filter((item) => item.checkedIn).length;
  const conflictCount = store.volunteerConflicts?.length || 0;

  return (
    <div className="ops-page">
      <div className="ops-stat-grid ops-stat-grid-three">
        <div className="ops-stat-card"><div className="ops-stat-label">Volunteer shifts</div><div className="ops-stat-value">{store.volunteers.length}</div></div>
        <div className="ops-stat-card tone-warning"><div className="ops-stat-label">Open shifts</div><div className="ops-stat-value">{openCount}</div></div>
        <div className="ops-stat-card tone-danger"><div className="ops-stat-label">Conflicts</div><div className="ops-stat-value">{conflictCount}</div></div>
      </div>

      <SectionCard title={store.volunteers.some((item) => item.id === editor.id) ? "Edit volunteer shift" : "Add volunteer shift"} subtitle="Shifts and people up top, where your sanity lives.">
        <RecordEditor
          editorRef={editorRef}
          title="Volunteer editor"
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
            { name: "role", label: "Role" },
            { name: "name", label: "Volunteer" },
            { name: "area", label: "Area", type: "select", options: areas },
            { name: "shiftDate", label: "Date", type: "date" },
            { name: "shiftStart", label: "Start" },
            { name: "shiftEnd", label: "End" },
            { name: "status", label: "Status", type: "select", options: volunteerStatuses },
            { name: "contact", label: "Contact", full: true },
            { name: "notes", label: "Notes", type: "textarea", full: true },
          ]}
        />
      </SectionCard>

      <SectionCard title="Volunteer board" subtitle="Coverage, collisions, and who still needs to be found.">
        <div className="ops-toolbar">
          <input className="ops-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search volunteer board" />
          <select value={quickView} onChange={(e) => setQuickView(e.target.value)}>
            {quickViews.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select value={areaFilter} onChange={(e) => setAreaFilter(e.target.value)}>
            <option>All</option>
            {areas.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select value={issueFilter} onChange={(e) => setIssueFilter(e.target.value)}>
            {issueOptions.map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>

        {(store.uncoveredVolunteerShifts.length || store.volunteerConflicts.length) ? (
          <div className="ops-banner-list">
            {store.uncoveredVolunteerShifts.slice(0, 3).map((item) => (
              <div className="ops-alert-row ops-alert-warning" key={`open-${item.id}`}><strong>Open shift</strong><span>{item.role} · {formatDateTime(item.shiftDate, item.shiftStart)}</span></div>
            ))}
            {store.volunteerConflicts.slice(0, 3).map((item) => (
              <div className="ops-alert-row ops-alert-danger" key={item.id}><strong>Conflict</strong><span>{item.summary}</span></div>
            ))}
          </div>
        ) : null}

        <EditableTable
          tableKey="volunteers"
          rows={rows}
          onEdit={openEditor}
          onDelete={(id) => store.removeItem("volunteers", id)}
          columns={[
            { key: "role", label: "Role", width: 180 },
            { key: "name", label: "Volunteer" },
            { key: "area", label: "Area" },
            { key: "shiftDate", label: "Date" },
            { key: "shiftStart", label: "Start" },
            { key: "shiftEnd", label: "End" },
            {
              key: "issues",
              label: "Issues",
              width: 220,
              render: (_, row) => {
                const conflicts = store.volunteerConflictsById?.[row.id] || [];
                const isUncovered = !row.name?.trim() || row.status === "Needs Assignment";
                if (!conflicts.length && !isUncovered) return <IssuePill tone="success">Clean</IssuePill>;
                return (
                  <div className="ops-inline-pills">
                    {conflicts.length ? <IssuePill tone="danger">{conflicts.length} conflict{conflicts.length > 1 ? "s" : ""}</IssuePill> : null}
                    {isUncovered ? <IssuePill tone="warning">open</IssuePill> : null}
                  </div>
                );
              },
            },
            {
              key: "status",
              label: "Status",
              render: (value) => <span className={`ops-pill status-${statusSlug(value)}`}>{value}</span>,
            },
            { key: "contact", label: "Contact", width: 180 },
            { key: "notes", label: "Notes", width: 220 },
          ]}
          emptyLabel="No volunteer shifts yet."
        />
      </SectionCard>
    </div>
  );
}
