
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
  const rows = [...store.timeline].sort((a, b) => {
    const aDate = `${a.date || ""} ${a.time || ""}`;
    const bDate = `${b.date || ""} ${b.time || ""}`;
    return new Date(aDate) - new Date(bDate);
  });

  const todayCount = rows.filter((row) => isToday(row.date)).length;
  const weekCount = rows.filter((row) => isWithinDays(row.date, 7)).length;

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

      <SectionCard title="Timeline" subtitle="Schedule is its own thing. Your spreadsheet kept pretending otherwise.">
        <EditableTable
          rows={rows}
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
          emptyLabel="No timeline entries yet."
        />
      </SectionCard>

      <SectionCard title={editor.activity ? "Edit timeline item" : "Add timeline item"}>
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
    </div>
  );
}
