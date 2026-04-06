import React from "react";
import { RefreshCw } from "lucide-react";
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
  const [editor, setEditor] = React.useState(blankVolunteer());
  const [isEditorOpen, setIsEditorOpen] = React.useState(false);
  const [quickView, setQuickView] = React.useState("All");
  const [areaFilter, setAreaFilter] = React.useState("All");
  const [query, setQuery] = React.useState("");
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
    setIsEditorOpen(false);
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

      <SectionCard title={store.volunteers.some((item) => item.id === editor.id) ? "Edit volunteer shift" : "Add volunteer shift"} subtitle="Shifts and people up top, not buried at the bottom.">
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
      </SectionCard>

      <SectionCard title="Volunteer board" subtitle="Day-of staffing without turning your brain into powder.">
        <div className="ops-tabs">
          {quickViews.map((item) => (
            <button key={item} type="button" className={`ops-tab ${quickView === item ? "is-active" : ""}`} onClick={() => setQuickView(item)}>
              {item}
            </button>
          ))}
        </div>

        <div className="ops-toolbar">
          <button
            type="button"
            className="ops-button ops-button-secondary ops-button-small"
            onClick={async () => {
              try {
                const count = await store.syncVolunteers();
                window.alert(`Synced ${count} volunteer submissions into the volunteer board.`);
              } catch (error) {
                window.alert(error?.message || "Could not sync volunteers.");
              }
            }}
          >
            <RefreshCw className="h-4 w-4" /> Sync volunteers
          </button>
          <input className="ops-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search volunteers or roles" />
          <select value={areaFilter} onChange={(e) => setAreaFilter(e.target.value)}>
            <option>All</option>
            {areas.map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>

        <EditableTable
          tableKey="volunteers"
          rows={rows}
          onEdit={openEditor}
          onDelete={(id) => store.removeItem("volunteers", id)}
          columns={[
            { key: "name", label: "Volunteer", width: 220, render: (value) => value || "Unassigned" },
            { key: "role", label: "Role", width: 220 },
            { key: "area", label: "Area" },
            { key: "shiftDate", label: "Shift", width: 220, render: (_, row) => formatDateTime(row.shiftDate, row.shiftStart) + (row.shiftEnd ? ` to ${row.shiftEnd}` : "") },
            { key: "contact", label: "Contact", width: 220 },
            { key: "status", label: "Status", render: (value, row) => <span className={`ops-pill status-${statusSlug(row.checkedIn ? "Checked In" : value)}`}>{row.checkedIn ? "Checked In" : value}</span> },
            { key: "notes", label: "Notes", width: 220 },
          ]}
          rowClassName={(row) => (!row.name?.trim() ? "is-overdue" : "")}
          emptyLabel="No volunteer shifts match the current filters."
        />
      </SectionCard>
    </div>
  );
}
