import React from "react";
import { useOpsStore } from "../hooks/useOpsStore";
import SectionCard from "../components/SectionCard";
import EditableTable from "../components/EditableTable";
import RecordEditor from "../components/RecordEditor";
import { blankProgramming } from "../seedData";

const statusOptions = ["Planned", "Confirmed", "Needs Supplies", "At Risk", "Done"];
const categoryOptions = ["General", "Food", "Art", "Music", "Activity", "Setup", "Booth", "Logistics", "Safety", "Printing"];

function createEditor(base = blankProgramming()) {
  return { ...base, category: base.category || "General" };
}

export default function ProgrammingView() {
  const store = useOpsStore();
  const editorRef = React.useRef(null);
  const [editor, setEditor] = React.useState(createEditor());
  const [showEditor, setShowEditor] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("All");
  const [statusFilter, setStatusFilter] = React.useState("All");

  const categoryChoices = React.useMemo(() => {
    const existing = store.programming.map((item) => item.category || "General");
    return Array.from(new Set([...categoryOptions, ...existing])).sort();
  }, [store.programming]);

  const rows = store.programming
    .map((item) => ({ ...item, category: item.category || "General" }))
    .filter((item) => {
      const haystack = `${item.activity} ${item.location} ${item.lead} ${item.needs} ${item.notes} ${item.category}`.toLowerCase();
      const matchesQuery = !query || haystack.includes(query.toLowerCase());
      const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
      const matchesStatus = statusFilter === "All" || item.status === statusFilter;
      return matchesQuery && matchesCategory && matchesStatus;
    });

  const openEditor = (next) => {
    setEditor(createEditor(next));
    setShowEditor(true);
    requestAnimationFrame(() => editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const handleSave = () => {
    if (!editor.activity.trim()) {
      window.alert("Activity name is required.");
      return;
    }
    const next = { ...editor, category: editor.category || "General" };
    const exists = store.programming.some((item) => item.id === next.id);
    exists ? store.updateItem("programming", next.id, next) : store.addItem("programming", next);
    setEditor(createEditor());
    setShowEditor(false);
  };

  return (
    <div className="ops-page">
      <SectionCard
        title="Programming"
        subtitle="Activities, rooms, leads, needs. Not vibes."
        actions={<button type="button" className="ops-button ops-button-small" onClick={() => openEditor(createEditor())}>{showEditor ? "Add another" : "Add programming item"}</button>}
      >
        <div className="ops-toolbar">
          <input className="ops-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search programming" />
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option>All categories</option>
            {categoryChoices.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option>All statuses</option>
            {statusOptions.map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>

        {showEditor && (
          <div ref={editorRef} className="ops-editor-shell">
            <RecordEditor
              title={editor.activity ? "Programming editor" : "New programming entry"}
              editingLabel={editor.activity || ""}
              value={editor}
              onChange={(key, value) => setEditor((current) => ({ ...current, [key]: value }))}
              onSave={handleSave}
              onCancel={() => {
                setEditor(createEditor());
                setShowEditor(false);
              }}
              fields={[
                { name: "activity", label: "Activity", full: true },
                { name: "category", label: "Category", type: "select", options: categoryChoices },
                { name: "location", label: "Location" },
                { name: "time", label: "Time" },
                { name: "lead", label: "Lead" },
                { name: "status", label: "Status", type: "select", options: statusOptions },
                { name: "needs", label: "Needs", type: "textarea", full: true },
                { name: "notes", label: "Notes", type: "textarea", full: true },
              ]}
            />
          </div>
        )}

        <EditableTable
          rows={rows}
          onEdit={openEditor}
          onDelete={(id) => store.removeItem("programming", id)}
          columns={[
            { key: "activity", label: "Activity" },
            { key: "category", label: "Category" },
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
