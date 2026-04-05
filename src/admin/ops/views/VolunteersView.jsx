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

function statusSlug(value = "") {
  return value.toLowerCase().replace(/\s+/g, "-");
}

export default function VolunteersView() {
  const store = useOpsStore();
  const editorRef = React.useRef(null);
  const [editor, setEditor] = React.useState(blankVolunteer());
  const [showEditor, setShowEditor] = React.useState(false);
  const [quickView, setQuickView] = React.useState("All");
  const [areaFilter, setAreaFilter] = React.useState("All");
  const [query, setQuery] = React.useState("");

  const rows = store.volunteers
    .filter((item) => {
      const matchesArea = areaFilter === "All" || item.area === areaFilter;
      const haystack = `${item.name} ${item.role} ${item.area} ${item.contact} ${item.notes}`.toLowerCase();
      const matchesQuery = !query || haystack.includes(query.toLowerCase());
      let matchesQuick = true;
      if (quickView === "Open") matchesQuick = !item.name?.trim() || item.status === "Needs Assignment";
      if (quickView === "Today") matchesQuick = isToday(item.shiftDate);
      if (quickView === "Checked In") matchesQuick = item.checkedIn;
      return matchesArea && matchesQuery && matchesQuick;
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
    setShowEditor(false);
  };

  const openEditor = (next) => {
    setEditor(next);
    setShowEditor(true);
    requestAnimationFrame(() => editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const openCount = store.volunteers.filter((item) => !item.name?.trim() || item.status === "Needs Assignment").length;
  const checkedInCount = store.volunteers.filter((item) => item.checkedIn).length;

  return (
    <div className="ops-page">
      <div className="ops-stat-grid ops-stat-grid-three">
        <div className="ops-stat-card"><div className="ops-stat-label">Volunteer shifts</div><div className="ops-stat-value">{store.volunteers.length}</div></div>
        <div className="ops-stat-card"><div className="ops-stat-label">Open shifts</div><div className="ops-stat-value">{openCount}</div></div>
        <div className="ops-stat-card"><div className="ops-stat-label">Checked in</div><div className="ops-stat-value">{checkedInCount}</div></div>
      </div>

      <SectionCard title="Volunteer board" subtitle="Day-of staffing without turning your brain into powder." actions={<button type="button" className="ops-button ops-button-small" onClick={() => openEditor(blankVolunteer())}>{showEditor ? "Add another" : "Add volunteer shift"}</button>}>
        <div className="ops-tabs ops-tabs-wrap">
          {quickViews.map((item) => (
            <button type="button" key={item} className={`ops-tab ${quickView === item ? "is-active" : ""}`} onClick={() => setQuickView(item)}>
              {item}
            </button>
          ))}
        </div>

        <div className="ops-toolbar">
          <input className="ops-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search volunteers or roles" />
          <select value={areaFilter} onChange={(e) => setAreaFilter(e.target.value)}>
            <option>All</option>
            {areas.map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>

        {showEditor && (
          <div ref={editorRef} className="ops-editor-shell">
            <RecordEditor
              title="Volunteer editor"
              editingLabel={editor.role || editor.name || ""}
              value={editor}
              onChange={(key, value) => setEditor((current) => ({ ...current, [key]: value }))}
              onSave={handleSave}
              onCancel={() => {
                setEditor(blankVolunteer());
                setShowEditor(false);
              }}
              fields={[
                { name: "name", label: "Volunteer name" },
                { name: "role", label: "Role" },
                { name: "area", label: "Area", type: "select", options: areas },
                { name: "contact", label: "Contact", full: true },
                { name: "shiftDate", label: "Shift date", type: "date" },
                { name: "shiftStart", label: "Start", type: "time" },
                { name: "shiftEnd", label: "End", type: "time" },
                { name: "status", label: "Status", type: "select", options: volunteerStatuses },
                { name: "checkedIn", label: "Checked in", type: "checkbox" },
                { name: "notes", label: "Notes", type: "textarea", full: true, rows: 4 },
              ]}
            />
          </div>
        )}

        <EditableTable
          rows={rows}
          onEdit={openEditor}
          onDelete={(id) => store.removeItem("volunteers", id)}
          columns={[
            { key: "name", label: "Volunteer", render: (value) => value || "Unassigned" },
            { key: "role", label: "Role" },
            { key: "area", label: "Area" },
            { key: "shiftDate", label: "Shift", render: (_, row) => formatDateTime(row.shiftDate, row.shiftStart) + (row.shiftEnd ? ` to ${row.shiftEnd}` : "") },
            { key: "contact", label: "Contact" },
            { key: "status", label: "Status", render: (value, row) => <span className={`ops-pill status-${statusSlug(row.checkedIn ? "Checked In" : value)}`}>{row.checkedIn ? "Checked In" : value}</span> },
            { key: "notes", label: "Notes" },
          ]}
          rowClassName={(row) => (!row.name?.trim() ? "is-overdue" : "")}
          emptyLabel="No volunteer shifts match the current filters."
        />
      </SectionCard>
    </div>
  );
}
