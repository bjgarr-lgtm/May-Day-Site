import React from "react";
import { useOpsStore } from "../hooks/useOpsStore";
import SectionCard from "../components/SectionCard";
import EditableTable from "../components/EditableTable";
import RecordEditor from "../components/RecordEditor";
import { blankProgramming } from "../seedData";

const statusOptions = ["Planned", "Confirmed", "Needs Supplies", "At Risk", "Done"];

export default function ProgrammingView() {
  const store = useOpsStore();
  const [editor, setEditor] = React.useState(blankProgramming());

  const handleSave = () => {
    if (!editor.activity.trim()) {
      window.alert("Activity name is required.");
      return;
    }
    const exists = store.programming.some((item) => item.id === editor.id);
    if (exists) {
      store.updateItem("programming", editor.id, editor);
    } else {
      store.addItem("programming", editor);
    }
    setEditor(blankProgramming());
  };

  return (
    <div className="ops-page">
      <SectionCard title="Programming" subtitle="Activities, rooms, leads, needs. Not vibes.">
        <EditableTable
          rows={store.programming}
          onEdit={setEditor}
          onDelete={(id) => store.removeItem("programming", id)}
          columns={[
            { key: "activity", label: "Activity" },
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

      <SectionCard title={editor.activity ? "Edit programming item" : "Add programming item"}>
        <RecordEditor
          title={editor.activity ? "Programming editor" : "New programming entry"}
          value={editor}
          onChange={(key, value) => setEditor((current) => ({ ...current, [key]: value }))}
          onSave={handleSave}
          onCancel={() => setEditor(blankProgramming())}
          fields={[
            { name: "activity", label: "Activity", full: true },
            { name: "location", label: "Location" },
            { name: "time", label: "Time" },
            { name: "lead", label: "Lead" },
            { name: "status", label: "Status", type: "select", options: statusOptions },
            { name: "needs", label: "Needs", type: "textarea", full: true },
            { name: "notes", label: "Notes", type: "textarea", full: true },
          ]}
        />
      </SectionCard>
    </div>
  );
}

function slug(value = "") {
  return value.toLowerCase().replace(/\s+/g, "-");
}