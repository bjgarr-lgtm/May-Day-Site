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

function sourceLabel(row) {
  return row.sourceType === "form_submission" ? "Form" : "Local";
}

export default function VolunteersView() {
  const store = useOpsStore();
  const volunteers = Array.isArray(store?.volunteers) ? store.volunteers : [];
  const syncStatus = store?.syncStatus?.volunteers || "idle";

  const [editor, setEditor] = React.useState(blankVolunteer());
  const [isEditorOpen, setIsEditorOpen] = React.useState(false);
  const [quickView, setQuickView] = React.useState("All");
  const [areaFilter, setAreaFilter] = React.useState("All");
  const [query, setQuery] = React.useState("");
  const editorRef = React.useRef(null);

  const openEditor = React.useCallback((next) => {
    setEditor(next);
    setIsEditorOpen(true);
    requestAnimationFrame(() => {
      editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  const rows = volunteers
    .filter((item) => {
      const matchesArea = areaFilter === "All" || item.area === areaFilter;
      const haystack = `${item.name} ${item.role} ${item.area} ${item.contact} ${item.notes} ${item.syncStatus}`.toLowerCase();
      const matchesQuery = !query || haystack.includes(query.toLowerCase());

      let matchesQuick = true;
      if (quickView === "Open") matchesQuick = !item.name?.trim() || item.status === "Needs Assignment";
      if (quickView === "Today") matchesQuick = isToday(item.shiftDate);
      if (quickView === "Checked In") matchesQuick = item.checkedIn;

      return matchesArea && matchesQuery && matchesQuick;
    })
    .sort((a, b) => {
      const left = new Date(`${a.shiftDate || ""} ${a.shiftStart || ""}`).getTime();
      const right = new Date(`${b.shiftDate || ""} ${b.shiftStart || ""}`).getTime();
      return left - right;
    });

  const handleSave = () => {
    if (!editor.role.trim()) {
      window.alert("Volunteer role is required.");
      return;
    }

    const next = {
      ...editor,
      status: editor.checkedIn ? "Checked In" : editor.status,
    };

    const exists = volunteers.some((item) => item.id === next.id);
    if (exists) {
      store.updateItem("volunteers", next.id, next);
    } else {
      store.addItem("volunteers", next);
    }

    setEditor(blankVolunteer());
    setIsEditorOpen(false);
  };

  const handleSync = async () => {
    try {
      const count = await store.syncVolunteers();
      window.alert(`Synced ${count} volunteer submission${count === 1 ? "" : "s"}.`);
    } catch (error) {
      window.alert(error?.message || "Could not sync volunteers.");
    }
  };

  const openCount = volunteers.filter((item) => !item.name?.trim() || item.status === "Needs Assignment").length;
  const checkedInCount = volunteers.filter((item) => item.checkedIn).length;
  const editingExisting = volunteers.some((item) => item.id === editor.id);

  return (
    <div className="ops-page">
      <div className="ops-stat-grid ops-stat-grid-three">
        <div className="ops-stat-card">
          <div className="ops-stat-label">Volunteer shifts</div>
          <div className="ops-stat-value">{volunteers.length}</div>
        </div>
        <div className="ops-stat-card">
          <div className="ops-stat-label">Open shifts</div>
          <div className="ops-stat-value">{openCount}</div>
        </div>
        <div className="ops-stat-card">
          <div className="ops-stat-label">Checked in</div>
          <div className="ops-stat-value">{checkedInCount}</div>
        </div>
      </div>

      <SectionCard
        title={editingExisting ? "Edit volunteer shift" : "Add volunteer shift"}
        subtitle="Linked submissions stay linked. Miraculous, I know."
      >
        <RecordEditor
          editorRef={editorRef}
          title="Volunteer editor"
          value={editor}
          isOpen={isEditorOpen}
          onToggle={() => {
            if (isEditorOpen) {
              setIsEditorOpen(false);
            } else {
              if (!editingExisting && !editor.role) setEditor(blankVolunteer());
              setIsEditorOpen(true);
            }
          }}
          mode={editingExisting ? "edit" : "add"}
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

      <SectionCard title="Volunteer board" subtitle="Shifts, people, and sync state all in one place.">
        <div className="ops-tabs">
          {quickViews.map((item) => (
            <button
              key={item}
              type="button"
              className={`ops-tab ${quickView === item ? "is-active" : ""}`}
              onClick={() => setQuickView(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="ops-toolbar">
          <input
            className="ops-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search volunteers or roles"
          />
          <select value={areaFilter} onChange={(e) => setAreaFilter(e.target.value)}>
            <option>All</option>
            {areas.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <button
            type="button"
            className="ops-button ops-button-secondary"
            onClick={handleSync}
            disabled={syncStatus === "loading"}
          >
            {syncStatus === "loading" ? "Syncing…" : syncStatus === "saved" ? "Synced" : "Sync volunteers"}
          </button>
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
            {
              key: "shiftDate",
              label: "Shift",
              width: 220,
              render: (_, row) =>
                formatDateTime(row.shiftDate, row.shiftStart) + (row.shiftEnd ? ` to ${row.shiftEnd}` : ""),
            },
            { key: "contact", label: "Contact", width: 220 },
            {
              key: "status",
              label: "Status",
              render: (value, row) => (
                <span className={`ops-pill status-${statusSlug(row.checkedIn ? "Checked In" : value)}`}>
                  {row.checkedIn ? "Checked In" : value}
                </span>
              ),
            },
            { key: "sourceType", label: "Source", render: (_, row) => sourceLabel(row) },
            { key: "syncStatus", label: "Sync", render: (value) => value || "local" },
            { key: "notes", label: "Notes", width: 220 },
          ]}
          rowClassName={(row) => (!row.name?.trim() ? "is-overdue" : "")}
          emptyLabel="No volunteer shifts match the current filters."
        />
      </SectionCard>
    </div>
  );
}