import React from "react";
import { useOpsStore } from "../hooks/useOpsStore";
import SectionCard from "../components/SectionCard";
import EditableTable from "../components/EditableTable";
import RecordEditor from "../components/RecordEditor";
import { blankTimeline } from "../seedData";
import { formatDateTime, isToday, isWithinDays } from "../utils/date";
import { exportRowsAsCsv } from "../utils/exportSpreadsheet";

function monthKey(date) { return date ? date.slice(0, 7) : "undated"; }
function monthLabel(key) {
  if (key === "undated") return "Undated";
  const [year, month] = key.split("-");
  return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

export default function TimelineView() {
  const store = useOpsStore();
  const [editor, setEditor] = React.useState(blankTimeline());
  const [query, setQuery] = React.useState("");
  const [leadFilter, setLeadFilter] = React.useState("All");
  const [monthFilter, setMonthFilter] = React.useState("All");
  const [viewMode, setViewMode] = React.useState("List");
  const [editorOpen, setEditorOpen] = React.useState(false);

  const rows = [...store.timeline]
    .filter((row) => {
      const hay = `${row.activity} ${row.location} ${row.lead} ${row.dependencies} ${row.notes}`.toLowerCase();
      const matchesQuery = !query || hay.includes(query.toLowerCase());
      const matchesLead = leadFilter === "All" || (row.lead || "") === leadFilter;
      const matchesMonth = monthFilter === "All" || monthKey(row.date) === monthFilter;
      return matchesQuery && matchesLead && matchesMonth;
    })
    .sort((a, b) => new Date(`${a.date || ""} ${a.time || ""}`) - new Date(`${b.date || ""} ${b.time || ""}`));

  const todayCount = rows.filter((row) => isToday(row.date)).length;
  const weekCount = rows.filter((row) => isWithinDays(row.date, 7)).length;
  const leadOptions = Array.from(new Set(store.timeline.map((row) => row.lead).filter(Boolean))).sort();
  const monthOptions = Array.from(new Set(store.timeline.map((row) => monthKey(row.date)).filter(Boolean))).sort();
  const grouped = rows.reduce((acc, row) => { const key = monthKey(row.date); (acc[key] ||= []).push(row); return acc; }, {});

  const handleSave = () => {
    if (!editor.activity.trim()) { window.alert("Activity name is required."); return; }
    const exists = store.timeline.some((item) => item.id === editor.id);
    exists ? store.updateItem("timeline", editor.id, editor) : store.addItem("timeline", editor);
    setEditor(blankTimeline());
    setEditorOpen(false);
  };

  const handleEdit = (row) => { setEditor(row); setEditorOpen(true); window.requestAnimationFrame(() => document.querySelector('.ops-editor')?.scrollIntoView({ behavior: 'smooth', block: 'start' })); };

  const columns = [
    { key: "date", label: "When", render: (_, row) => formatDateTime(row.date, row.time), exportValue: (_, row) => formatDateTime(row.date, row.time) },
    { key: "activity", label: "What happens" },
    { key: "location", label: "Location" },
    { key: "lead", label: "Lead" },
    { key: "dependencies", label: "Dependencies" },
    { key: "notes", label: "Notes" },
  ];

  return (
    <div className="ops-page">
      <div className="ops-stat-grid ops-stat-grid-two">
        <div className="ops-stat-card"><div className="ops-stat-label">Today</div><div className="ops-stat-value">{todayCount}</div></div>
        <div className="ops-stat-card"><div className="ops-stat-label">This week</div><div className="ops-stat-value">{weekCount}</div></div>
      </div>
      <SectionCard title="Timeline" subtitle="Schedule and sequencing.">
        <div className="ops-toolbar">
          <button type="button" className="ops-button ops-button-small" onClick={() => exportRowsAsCsv('timeline.csv', columns, rows)}>Export CSV</button>
          <button type="button" className="ops-button ops-button-small ops-button-secondary" onClick={() => window.print()}>Print</button>
          <input className="ops-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search timeline" />
          <select value={leadFilter} onChange={(e) => setLeadFilter(e.target.value)}><option value="All">All leads</option>{leadOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select>
          <select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}><option value="All">All months</option>{monthOptions.map((item) => <option key={item} value={item}>{monthLabel(item)}</option>)}</select>
        </div>
        <div className="ops-tabs">
          {["List", "Calendar"].map((tab) => <button type="button" key={tab} className={`ops-tab ${viewMode === tab ? 'is-active' : ''}`} onClick={() => setViewMode(tab)}>{tab} view</button>)}
        </div>
        {viewMode === "List" ? <EditableTable rows={rows} onEdit={handleEdit} onDelete={(id) => store.removeItem("timeline", id)} columns={columns} emptyLabel="No timeline entries yet." /> : (
          <div className="ops-calendar-grid">
            {Object.keys(grouped).length ? Object.entries(grouped).map(([key, items]) => (
              <div className="ops-calendar-month" key={key}><h3>{monthLabel(key)}</h3>{items.map((item) => <div className="ops-calendar-entry" key={item.id}><strong>{item.activity}</strong><span>{formatDateTime(item.date, item.time)}</span><span>{item.location || 'No location'}</span></div>)}</div>
            )) : <div className="ops-empty">No timeline entries yet.</div>}
          </div>
        )}
      </SectionCard>
      <SectionCard title={editor.id && editor.activity ? "Edit timeline item" : "Add timeline item"}>
        <RecordEditor title={editor.id && editor.activity ? "Timeline editor" : "New timeline entry"} value={editor} isOpen={editorOpen} onToggle={() => setEditorOpen((v) => !v)} mode={editor.id && editor.activity ? "edit" : "add"} onChange={(key, value) => setEditor((current) => ({ ...current, [key]: value }))} onSave={handleSave} onCancel={() => { setEditor(blankTimeline()); setEditorOpen(false); }} fields={[{ name: "date", label: "Date", type: "date" },{ name: "time", label: "Time", type: "time" },{ name: "activity", label: "Activity", full: true },{ name: "location", label: "Location" },{ name: "lead", label: "Lead" },{ name: "dependencies", label: "Dependencies", full: true },{ name: "notes", label: "Notes", type: "textarea", full: true }]} />
      </SectionCard>
    </div>
  );
}
