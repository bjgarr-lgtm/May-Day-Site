import React from "react";
import { useOpsStore } from "../hooks/useOpsStore";
import SectionCard from "../components/SectionCard";
import EditableTable from "../components/EditableTable";
import RecordEditor from "../components/RecordEditor";
import { blankProgramming } from "../seedData";

const statusOptions = ["Planned", "Confirmed", "Needs Supplies", "At Risk", "Done"];
const categoryOptions = ["General", "Food", "Art", "Music", "Logistics", "Games", "Vendors", "Decor", "Safety"];

function ensureCategory(item) {
  return item.category || inferCategory(item);
}

function inferCategory(item) {
  const text = `${item.activity} ${item.needs} ${item.notes}`.toLowerCase();
  if (/food|popcorn|cotton candy|potluck|coffee|donut|taco|snack/.test(text)) return "Food";
  if (/art|zine|weaving|paint|chalk|photo booth|face painting/.test(text)) return "Art";
  if (/music|playlist|open mic|dance|poetry|jam|film/.test(text)) return "Music";
  if (/tent|porta potty|seating|tables|parking|med|radio|dry erase|electronics/.test(text)) return "Logistics";
  if (/cornhole|bowling|pinata|pin the tail|jelly bean|raffle|scavenger/.test(text)) return "Games";
  if (/vendor|merch|booth/.test(text)) return "Vendors";
  if (/banner|flag|decor|maypole|flower/.test(text)) return "Decor";
  if (/med|safety/.test(text)) return "Safety";
  return "General";
}

export default function ProgrammingView() {
  const store = useOpsStore();
  const [editor, setEditor] = React.useState({ ...blankProgramming(), category: "General" });
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("All");
  const [categoryFilter, setCategoryFilter] = React.useState("All");

  const normalizedRows = React.useMemo(
    () => store.programming.map((item) => ({ ...item, category: ensureCategory(item) })),
    [store.programming]
  );

  const filteredRows = normalizedRows.filter((item) => {
    const haystack = `${item.activity} ${item.location} ${item.lead} ${item.needs} ${item.status} ${item.notes} ${item.category}`.toLowerCase();
    const matchesQuery = !query || haystack.includes(query.toLowerCase());
    const matchesStatus = statusFilter === "All" || item.status === statusFilter;
    const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
    return matchesQuery && matchesStatus && matchesCategory;
  });

  const handleSave = () => {
    if (!editor.activity.trim()) {
      window.alert("Activity name is required.");
      return;
    }
    const nextItem = { ...editor, category: editor.category || "General" };
    const exists = store.programming.some((item) => item.id === editor.id);
    if (exists) {
      store.updateItem("programming", editor.id, nextItem);
    } else {
      store.addItem("programming", nextItem);
    }
    setEditor({ ...blankProgramming(), category: "General" });
  };

  return (
    <div className="ops-page">
      <SectionCard title={editor.activity ? "Edit programming item" : "Add programming item"} subtitle="Top-loaded editor, because buried forms are stupid.">
        <RecordEditor
          title={editor.activity ? "Programming editor" : "New programming entry"}
          value={editor}
          onChange={(key, value) => setEditor((current) => ({ ...current, [key]: value }))}
          onSave={handleSave}
          onCancel={() => setEditor({ ...blankProgramming(), category: "General" })}
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

      <SectionCard title="Programming" subtitle="Activities, rooms, leads, needs, and actual categories instead of feral guessing.">
        <div className="ops-toolbar ops-toolbar-stack">
          <input className="ops-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search programming" />
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="All">All categories</option>
            {categoryOptions.map((option) => <option key={option}>{option}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All statuses</option>
            {statusOptions.map((option) => <option key={option}>{option}</option>)}
          </select>
        </div>

        <EditableTable
          rows={filteredRows}
          onEdit={(row) => setEditor({ ...row, category: ensureCategory(row) })}
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
          emptyLabel="No programming items match these filters."
        />
      </SectionCard>
    </div>
  );
}

function slug(value = "") {
  return value.toLowerCase().replace(/\s+/g, "-");
}
