import React from "react";
import { useOpsStore } from "../hooks/useOpsStore";
import SectionCard from "../components/SectionCard";
import EditableTable from "../components/EditableTable";
import RecordEditor from "../components/RecordEditor";
import { blankProgramming, inferProgrammingCategory } from "../seedData";
import { exportRowsAsCsv } from "../utils/exportSpreadsheet";

const statusOptions = ["Planned", "Confirmed", "Needs Supplies", "At Risk", "Done"];
const categoryOptions = ["All", "General", "Performance", "Food", "Operations", "Activity"];
function slug(value = "") { return value.toLowerCase().replace(/\s+/g, "-"); }

export default function ProgrammingView() {
  const store = useOpsStore();
  const [editor, setEditor] = React.useState(blankProgramming());
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("All");
  const [categoryFilter, setCategoryFilter] = React.useState("All");
  const [editorOpen, setEditorOpen] = React.useState(false);

  const rows = store.programming
    .map((item) => ({ ...item, category: item.category || inferProgrammingCategory(item) }))
    .filter((item) => {
      const hay = `${item.activity} ${item.location} ${item.time} ${item.lead} ${item.needs} ${item.notes} ${item.category}`.toLowerCase();
      const matchesQuery = !query || hay.includes(query.toLowerCase());
      const matchesStatus = statusFilter === "All" || item.status === statusFilter;
      const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
      return matchesQuery && matchesStatus && matchesCategory;
    });

  const handleSave = () => {
    if (!editor.activity.trim()) { window.alert("Activity name is required."); return; }
    const next = { ...editor, category: editor.category || inferProgrammingCategory(editor) };
    const exists = store.programming.some((item) => item.id === editor.id);
    exists ? store.updateItem("programming", editor.id, next) : store.addItem("programming", next);
    setEditor(blankProgramming());
    setEditorOpen(false);
  };

  const handleEdit = (row) => { setEditor({ ...row, category: row.category || inferProgrammingCategory(row) }); setEditorOpen(true); window.requestAnimationFrame(() => document.querySelector('.ops-editor')?.scrollIntoView({ behavior: 'smooth', block: 'start' })); };
  const columns = [
    { key: "activity", label: "Activity" },
    { key: "category", label: "Category" },
    { key: "location", label: "Location" },
    { key: "time", label: "Time" },
    { key: "lead", label: "Lead" },
    { key: "needs", label: "Needs" },
    { key: "cost", label: "Cost", render: (value) => value ? `$${Number(value).toFixed(0)}` : "—", exportValue: (value) => value || "" },
    { key: "status", label: "Status", render: (value) => <span className={`ops-pill status-${slug(value)}`}>{value}</span>, exportValue: (value) => value },
    { key: "notes", label: "Notes" },
  ];

  return (
    <div className="ops-page">
      <SectionCard title="Programming" subtitle="Activities, rooms, leads, needs, and cost.">
        <div className="ops-toolbar">
          <button type="button" className="ops-button ops-button-small" onClick={() => exportRowsAsCsv('programming.csv', columns, rows)}>Export CSV</button>
          <button type="button" className="ops-button ops-button-small ops-button-secondary" onClick={() => window.print()}>Print</button>
          <input className="ops-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search programming" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option value="All">All statuses</option>{statusOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>{categoryOptions.map((item) => <option key={item} value={item}>{item === 'All' ? 'All categories' : item}</option>)}</select>
        </div>
        <EditableTable rows={rows} onEdit={handleEdit} onDelete={(id) => store.removeItem("programming", id)} columns={columns} emptyLabel="No programming items yet." />
      </SectionCard>
      <SectionCard title={editor.id && editor.activity ? "Edit programming item" : "Add programming item"}>
        <RecordEditor title={editor.id && editor.activity ? "Programming editor" : "New programming entry"} value={editor} isOpen={editorOpen} onToggle={() => setEditorOpen((v) => !v)} mode={editor.id && editor.activity ? "edit" : "add"} onChange={(key, value) => setEditor((current) => ({ ...current, [key]: value }))} onSave={handleSave} onCancel={() => { setEditor(blankProgramming()); setEditorOpen(false); }} fields={[{ name: "activity", label: "Activity", full: true },{ name: "category", label: "Category", type: "select", options: categoryOptions.filter((item) => item !== 'All') },{ name: "location", label: "Location" },{ name: "time", label: "Time" },{ name: "lead", label: "Lead" },{ name: "cost", label: "Cost", type: "number" },{ name: "status", label: "Status", type: "select", options: statusOptions },{ name: "needs", label: "Needs", type: "textarea", full: true },{ name: "notes", label: "Notes", type: "textarea", full: true }]} />
      </SectionCard>
    </div>
  );
}
