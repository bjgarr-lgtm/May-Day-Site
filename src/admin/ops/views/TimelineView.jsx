import React from "react";
import { useOpsStore } from "../hooks/useOpsStore";
import SectionCard from "../components/SectionCard";
import EditableTable from "../components/EditableTable";
import RecordEditor from "../components/RecordEditor";
import { blankTimeline } from "../seedData";
import { formatDateTime, isToday, isWithinDays } from "../utils/date";

function sortRows(rows) {
  return [...rows].sort((a, b) => {
    const aDate = `${a.date || ""} ${a.time || ""}`;
    const bDate = `${b.date || ""} ${b.time || ""}`;
    return new Date(aDate) - new Date(bDate);
  });
}

function monthLabel(value) {
  if (!value) return "Unscheduled";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unscheduled";
  return date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

export default function TimelineView() {
  const store = useOpsStore();
  const [editor, setEditor] = React.useState(blankTimeline());
  const [query, setQuery] = React.useState("");
  const [leadFilter, setLeadFilter] = React.useState("All");
  const [monthFilter, setMonthFilter] = React.useState("All");
  const [viewMode, setViewMode] = React.useState("table");

  const rows = sortRows(store.timeline);
  const todayCount = rows.filter((row) => isToday(row.date)).length;
  const weekCount = rows.filter((row) => isWithinDays(row.date, 7)).length;

  const leadOptions = React.useMemo(() => Array.from(new Set(rows.map((row) => row.lead).filter(Boolean))).sort(), [rows]);
  const monthOptions = React.useMemo(() => Array.from(new Set(rows.map((row) => monthLabel(row.date)).filter(Boolean))), [rows]);

  const filteredRows = rows.filter((row) => {
    const haystack = `${row.activity} ${row.location} ${row.lead} ${row.dependencies} ${row.notes}`.toLowerCase();
    const matchesQuery = !query || haystack.includes(query.toLowerCase());
    const matchesLead = leadFilter === "All" || row.lead === leadFilter;
    const matchesMonth = monthFilter === "All" || monthLabel(row.date) === monthFilter;
    return matchesQuery && matchesLead && matchesMonth;
  });

  const groupedRows = filteredRows.reduce((acc, row) => {
    const label = monthLabel(row.date);
    acc[label] ||= [];
    acc[label].push(row);
    return acc;
  }, {});

  const handleSave = () => {
    if (!editor.activity.trim()) {
      window.alert("Activity name is required.");
      return;
    }
    const exists = store.timeline.some((item) => item.id === editor.id);
    if (exists) {
      store.updateItem("timeline", editor.id, editor);
    } else {
      store.addItem("timeline", editor);
    }
    setEditor(blankTimeline());
  };

  return (
    <div className="ops-page">
      <div className="ops-stat-grid ops-stat-grid-two">
        <div className="ops-stat-card"><div className="ops-stat-label">Today</div><div className="ops-stat-value">{todayCount}</div></div>
        <div className="ops-stat-card"><div className="ops-stat-label">This week</div><div className="ops-stat-value">{weekCount}</div></div>
      </div>

      <SectionCard title={editor.activity ? "Edit timeline item" : "Add timeline item"} subtitle="Add and correct the schedule from up here where normal people can reach it.">
        <RecordEditor
          title={editor.activity ? "Timeline editor" : "New timeline entry"}
          value={editor}
          onChange={(key, value) => setEditor((current) => ({ ...current, [key]: value }))}
          onSave={handleSave}
          onCancel={() => setEditor(blankTimeline())}
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
      </SectionCard>

      <SectionCard title="Timeline" subtitle="Schedule, sorted and searchable, instead of a haunted notebook.">
        <div className="ops-tabs ops-tabs-inline">
          <button className={`ops-tab ${viewMode === "table" ? "is-active" : ""}`} onClick={() => setViewMode("table")}>Table view</button>
          <button className={`ops-tab ${viewMode === "month" ? "is-active" : ""}`} onClick={() => setViewMode("month")}>By month</button>
        </div>

        <div className="ops-toolbar ops-toolbar-stack">
          <input className="ops-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search timeline" />
          <select value={leadFilter} onChange={(e) => setLeadFilter(e.target.value)}>
            <option value="All">All leads</option>
            {leadOptions.map((option) => <option key={option}>{option}</option>)}
          </select>
          <select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}>
            <option value="All">All months</option>
            {monthOptions.map((option) => <option key={option}>{option}</option>)}
          </select>
        </div>

        {viewMode === "table" ? (
          <EditableTable
            rows={filteredRows}
            onEdit={setEditor}
            onDelete={(id) => store.removeItem("timeline", id)}
            columns={[
              { key: "date", label: "When", render: (_, row) => formatDateTime(row.date, row.time) },
              { key: "activity", label: "What happens" },
              { key: "location", label: "Location" },
              { key: "lead", label: "Lead" },
              { key: "dependencies", label: "Dependencies" },
              { key: "notes", label: "Notes" },
            ]}
            emptyLabel="No timeline entries match these filters."
          />
        ) : (
          <div className="ops-month-groups">
            {Object.keys(groupedRows).length ? Object.entries(groupedRows).map(([label, items]) => (
              <div key={label} className="ops-month-group">
                <h3>{label}</h3>
                <ul className="ops-list">
                  {items.map((item) => (
                    <li key={item.id}>
                      <strong>{item.activity}</strong>
                      <span>{formatDateTime(item.date, item.time)}</span>
                      <span>{item.location || "No location"}</span>
                      <span>{item.lead || "No lead"}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )) : <div className="ops-empty">No timeline entries match these filters.</div>}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
