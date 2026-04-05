import React from "react";
import { useOpsStore } from "../hooks/useOpsStore";
import SectionCard from "../components/SectionCard";
import EditableTable from "../components/EditableTable";
import RecordEditor from "../components/RecordEditor";
import { blankTimeline } from "../seedData";
import { formatDateTime, isToday, isWithinDays } from "../utils/date";

export default function TimelineView() {
  const store = useOpsStore();
  const [editor, setEditor] = React.useState(blankTimeline());
  const [isEditorOpen, setIsEditorOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [leadFilter, setLeadFilter] = React.useState("All");
  const editorRef = React.useRef(null);

  const rows = [...store.timeline]
    .filter((item) => {
      const haystack = `${item.activity} ${item.location} ${item.lead} ${item.dependencies} ${item.notes}`.toLowerCase();
      const matchesQuery = !query || haystack.includes(query.toLowerCase());
      const matchesLead = leadFilter === "All" || item.lead === leadFilter;
      return matchesQuery && matchesLead;
    })
    .sort((a, b) => {
      const aDate = `${a.date || ""} ${a.time || ""}`;
      const bDate = `${b.date || ""} ${b.time || ""}`;
      return new Date(aDate) - new Date(bDate);
    });

  const leadOptions = Array.from(new Set(store.timeline.map((item) => item.lead).filter(Boolean))).sort();
  const todayCount = rows.filter((row) => isToday(row.date)).length;
  const weekCount = rows.filter((row) => isWithinDays(row.date, 7)).length;

  const openEditor = React.useCallback((next) => {
    setEditor(next);
    setIsEditorOpen(true);
    requestAnimationFrame(() => editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }, []);

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
    setIsEditorOpen(false);
  };

  return (
    <div className="ops-page">
      <div className="ops-stat-grid ops-stat-grid-two">
        <div className="ops-stat-card"><div className="ops-stat-label">Today</div><div className="ops-stat-value">{todayCount}</div></div>
        <div className="ops-stat-card"><div className="ops-stat-label">This week</div><div className="ops-stat-value">{weekCount}</div></div>
      </div>

      <SectionCard title={store.timeline.some((item) => item.id === editor.id) ? "Edit timeline item" : "Add timeline item"}>
        <RecordEditor
          editorRef={editorRef}
          title={store.timeline.some((item) => item.id === editor.id) ? "Timeline editor" : "New timeline entry"}
          value={editor}
          isOpen={isEditorOpen}
          onToggle={() => {
            if (isEditorOpen) setIsEditorOpen(false);
            else {
              if (!store.timeline.some((item) => item.id === editor.id) && !editor.activity) setEditor(blankTimeline());
              setIsEditorOpen(true);
            }
          }}
          mode={store.timeline.some((item) => item.id === editor.id) ? "edit" : "add"}
          onChange={(key, value) => setEditor((current) => ({ ...current, [key]: value }))}
          onSave={handleSave}
          onCancel={() => {
            setEditor(blankTimeline());
            setIsEditorOpen(false);
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
      </SectionCard>

      <SectionCard title="Timeline" subtitle="Schedule is its own thing. Your spreadsheet kept pretending otherwise.">
        <div className="ops-toolbar">
          <input className="ops-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search timeline" />
          <select value={leadFilter} onChange={(e) => setLeadFilter(e.target.value)}>
            <option>All</option>
            {leadOptions.map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>
        <EditableTable
          tableKey="timeline"
          rows={rows}
          onEdit={openEditor}
          onDelete={(id) => store.removeItem("timeline", id)}
          columns={[
            { key: "date", label: "When", width: 200, render: (_, row) => formatDateTime(row.date, row.time) },
            { key: "activity", label: "What happens", width: 220 },
            { key: "location", label: "Location" },
            { key: "lead", label: "Lead" },
            { key: "dependencies", label: "Dependencies", width: 220 },
            { key: "notes", label: "Notes", width: 240 },
          ]}
          emptyLabel="No timeline entries yet."
        />
      </SectionCard>
    </div>
  );
}
