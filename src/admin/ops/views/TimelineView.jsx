import React from "react";
import { useOpsStore } from "../hooks/useOpsStore";
import SectionCard from "../components/SectionCard";
import EditableTable from "../components/EditableTable";
import RecordEditor from "../components/RecordEditor";
import { blankTimeline } from "../seedData";
import { formatDateTime, isToday, isWithinDays } from "../utils/date";

function monthValue(date) {
  return date ? String(date).slice(0, 7) : "";
}

export default function TimelineView() {
  const store = useOpsStore();
  const editorRef = React.useRef(null);
  const [editor, setEditor] = React.useState(blankTimeline());
  const [showEditor, setShowEditor] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [leadFilter, setLeadFilter] = React.useState("All");
  const [monthFilter, setMonthFilter] = React.useState("All");

  const leadOptions = React.useMemo(() => Array.from(new Set(store.timeline.map((item) => item.lead).filter(Boolean))).sort(), [store.timeline]);
  const monthOptions = React.useMemo(() => Array.from(new Set(store.timeline.map((item) => monthValue(item.date)).filter(Boolean))).sort(), [store.timeline]);

  const rows = [...store.timeline]
    .filter((row) => {
      const haystack = `${row.activity} ${row.location} ${row.lead} ${row.dependencies} ${row.notes}`.toLowerCase();
      const matchesQuery = !query || haystack.includes(query.toLowerCase());
      const matchesLead = leadFilter === "All" || row.lead === leadFilter;
      const matchesMonth = monthFilter === "All" || monthValue(row.date) === monthFilter;
      return matchesQuery && matchesLead && matchesMonth;
    })
    .sort((a, b) => new Date(`${a.date || ""} ${a.time || ""}`) - new Date(`${b.date || ""} ${b.time || ""}`));

  const todayCount = rows.filter((row) => isToday(row.date)).length;
  const weekCount = rows.filter((row) => isWithinDays(row.date, 7)).length;

  const openEditor = (next) => {
    setEditor(next);
    setShowEditor(true);
    requestAnimationFrame(() => editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const handleSave = () => {
    if (!editor.activity.trim()) {
      window.alert("Activity name is required.");
      return;
    }
    const exists = store.timeline.some((item) => item.id === editor.id);
    exists ? store.updateItem("timeline", editor.id, editor) : store.addItem("timeline", editor);
    setEditor(blankTimeline());
    setShowEditor(false);
  };

  return (
    <div className="ops-page">
      <div className="ops-stat-grid ops-stat-grid-two">
        <div className="ops-stat-card"><div className="ops-stat-label">Today</div><div className="ops-stat-value">{todayCount}</div></div>
        <div className="ops-stat-card"><div className="ops-stat-label">This week</div><div className="ops-stat-value">{weekCount}</div></div>
      </div>

      <SectionCard
        title="Timeline"
        subtitle="Schedule is its own thing. Your spreadsheet kept pretending otherwise."
        actions={<button type="button" className="ops-button ops-button-small" onClick={() => openEditor(blankTimeline())}>{showEditor ? "Add another" : "Add timeline item"}</button>}
      >
        <div className="ops-toolbar">
          <input className="ops-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search timeline" />
          <select value={leadFilter} onChange={(e) => setLeadFilter(e.target.value)}>
            <option>All leads</option>
            {leadOptions.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}>
            <option>All months</option>
            {monthOptions.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>

        {showEditor && (
          <div ref={editorRef} className="ops-editor-shell">
            <RecordEditor
              title={editor.activity ? "Timeline editor" : "New timeline entry"}
              editingLabel={editor.activity || ""}
              value={editor}
              onChange={(key, value) => setEditor((current) => ({ ...current, [key]: value }))}
              onSave={handleSave}
              onCancel={() => {
                setEditor(blankTimeline());
                setShowEditor(false);
              }}
              fields={[
                { name: "date", label: "Date", type: "date" },
                { name: "time", label: "Time", type: "time" },
                { name: "activity", label: "Activity", full: true },
                { name: "location", label: "Location" },
                { name: "lead", label: "Lead" },
                { name: "dependencies", label: "Dependencies", full: true },
                { name: "notes", label: "Notes", type: "textarea", full: true },
              ]}
            />
          </div>
        )}

        <EditableTable
          rows={rows}
          onEdit={openEditor}
          onDelete={(id) => store.removeItem("timeline", id)}
          columns={[
            { key: "date", label: "When", render: (_, row) => formatDateTime(row.date, row.time) },
            { key: "activity", label: "What happens" },
            { key: "location", label: "Location" },
            { key: "lead", label: "Lead" },
            { key: "dependencies", label: "Dependencies" },
            { key: "notes", label: "Notes" },
          ]}
          emptyLabel="No timeline entries yet."
        />
      </SectionCard>
    </div>
  );
}
