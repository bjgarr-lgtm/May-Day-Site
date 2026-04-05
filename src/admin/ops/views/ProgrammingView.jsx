import React from "react";
import { useOpsStore } from "../hooks/useOpsStore";
import SectionCard from "../components/SectionCard";
import EditableTable from "../components/EditableTable";
import RecordEditor from "../components/RecordEditor";
import { blankProgramming } from "../seedData";

const statusOptions = ["Planned", "Confirmed", "Needs Supplies", "At Risk", "Done"];
const categoryOptions = ["General", "Logistics", "Art", "Music", "Food", "Games", "Outreach", "Kids", "Merch", "Facilities"];

export default function ProgrammingView() {
  const store = useOpsStore();
  const [editor, setEditor] = React.useState(blankProgramming());
  const [focusToken, setFocusToken] = React.useState(0);
  const editorRef = React.useRef(null);

  const activateEditor = React.useCallback((next) => {
    setEditor({ category: "General", ...next });
    setFocusToken((current) => current + 1);
    window.requestAnimationFrame(() => editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }, []);

  const handleSave = () => {
    if (!editor.activity.trim()) {
      window.alert("Activity name is required.");
      return;
    }
    const next = { category: "General", ...editor };
    const exists = store.programming.some((item) => item.id === next.id);
    if (exists) {
      store.updateItem("programming", next.id, next);
    } else {
      store.addItem("programming", next);
    }
    activateEditor(blankProgramming());
  };

  return (
    <div className="ops-page">
      <SectionCard title={editor.activity ? "Edit programming item" : "Add programming item"}>
        <RecordEditor
          title={editor.activity ? "Programming editor" : "New programming entry"}
          value={editor}
          onChange={(key, value) => setEditor((current) => ({ ...current, [key]: value }))}
          onSave={handleSave}
          onCancel={() => activateEditor(blankProgramming())}
          editorRef={editorRef}
          autoFocusToken={focusToken}
          editingLabel={editor.activity || ""}
          fields={[
            { name: "activity", label: "Activity", full: true },
            { name: "category", label: "Category", type: "select", options: categoryOptions },
            { name: "location", label: "Location" },
            { name: "time", label: "Time" },
            { name: "lead", label: "Lead" },
            { name: "status", label: "Status", type: "select", options: statusOptions },
            { name: "needs", label: "Needs", type: "textarea", full: true },
            { name: "notes", label: "Notes", type: "textarea", full: true },
          ]}
        />
      </SectionCard>

      <SectionCard title="Programming" subtitle="Activities, rooms, leads, needs. Not vibes.">
        <EditableTable
          rows={store.programming}
          onEdit={activateEditor}
          onDelete={(id) => store.removeItem("programming", id)}
          columns={[
            { key: "activity", label: "Activity" },
            { key: "category", label: "Category", render: (value) => value || "General" },
            { key: "location", label: "Location" },
            { key: "time", label: "Time" },
            { key: "lead", label: "Lead" },
            { key: "needs", label: "Needs" },
            {
              key: "status",
              label: "Status",
              render: (value) => <span className={`ops-pill status-${slug(value)}`}>{value}</span>,
            },
            { key: "notes", label: "Notes" },
          ]}
          emptyLabel="No programming items yet."
        />
      </SectionCard>
    </div>
  );
}

function slug(value = "") {
  return value.toLowerCase().replace(/\s+/g, "-");
}
