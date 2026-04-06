import React from "react";
import { useOpsStore } from "../hooks/useOpsStore";
import SectionCard from "../components/SectionCard";
import EditableTable from "../components/EditableTable";
import RecordEditor from "../components/RecordEditor";
import { blankProgramming, inferProgrammingCategory } from "../seedData";

const statusOptions = ["Planned", "Confirmed", "Needs Supplies", "At Risk", "Done"];
const categoryOptions = ["General", "Performance", "Food", "Operations", "Activity"];

export default function ProgrammingView() {
  const store = useOpsStore();
  const [editor, setEditor] = React.useState(blankProgramming());
  const [isEditorOpen, setIsEditorOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("All");
  const [categoryFilter, setCategoryFilter] = React.useState("All");
  const [issueFilter, setIssueFilter] = React.useState("All");
  const editorRef = React.useRef(null);

  const openEditor = React.useCallback((next) => {
    setEditor(next);
    setIsEditorOpen(true);
    requestAnimationFrame(() => editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }, []);

  const rows = store.programming
    .filter((item) => {
      const haystack = `${item.activity} ${item.location} ${item.time} ${item.lead} ${item.needs} ${item.notes} ${item.category}`.toLowerCase();
      const matchesQuery = !query || haystack.includes(query.toLowerCase());
      const matchesStatus = statusFilter === "All" || item.status === statusFilter;
      const matchesCategory = categoryFilter === "All" || (item.category || inferProgrammingCategory(item)) === categoryFilter;
      const hasConflict = Boolean(store.programmingConflictsById?.[item.id]?.length);
      const hasResourceIssue = Boolean(store.resourceIssuesByProgrammingId?.[item.id]?.length);
      const matchesIssue = issueFilter === "All" || (issueFilter === "Conflicts" && hasConflict) || (issueFilter === "Resource issues" && hasResourceIssue) || (issueFilter === "Clean" && !hasConflict && !hasResourceIssue);
      return matchesQuery && matchesStatus && matchesCategory && matchesIssue;
    })
    .sort((a, b) => `${a.time || ""}`.localeCompare(`${b.time || ""}`));

  const syncBudget = (programItem) => {
    const label = programItem.activity.trim();
    if (!label || !programItem.cost) return;
    const existing = store.budget.find((item) => item.item === label && item.category === "Programming");
    const budgetRow = {
      id: existing?.id || `budget_prog_${programItem.id}`,
      item: label,
      category: "Programming",
      cost: programItem.cost,
      paid: existing?.paid || false,
      notes: existing?.notes || "",
    };
    if (existing) store.updateItem("budget", existing.id, budgetRow);
    else store.addItem("budget", budgetRow);
  };

  const handleSave = () => {
    if (!editor.activity.trim()) {
      window.alert("Activity name is required.");
      return;
    }
    const next = { ...editor, category: editor.category || inferProgrammingCategory(editor) };
    const exists = store.programming.some((item) => item.id === next.id);
    if (exists) store.updateItem("programming", next.id, next);
    else store.addItem("programming", next);
    syncBudget(next);
    setEditor(blankProgramming());
    setIsEditorOpen(false);
  };

  return (
    <div className="ops-page">
      <SectionCard title={store.programming.some((item) => item.id === editor.id) ? "Edit programming item" : "Add programming item"}>
        <RecordEditor
          editorRef={editorRef}
          title={store.programming.some((item) => item.id === editor.id) ? "Programming editor" : "New programming entry"}
          value={editor}
          isOpen={isEditorOpen}
          onToggle={() => {
            if (isEditorOpen) setIsEditorOpen(false);
            else {
              if (!store.programming.some((item) => item.id === editor.id) && !editor.activity) setEditor(blankProgramming());
              setIsEditorOpen(true);
            }
          }}
          mode={store.programming.some((item) => item.id === editor.id) ? "edit" : "add"}
          onChange={(key, value) => setEditor((current) => ({ ...current, [key]: value }))}
          onSave={handleSave}
          onCancel={() => {
            setEditor(blankProgramming());
            setIsEditorOpen(false);
          }}
          fields={[
            { name: "activity", label: "Activity", full: true },
            { name: "category", label: "Category", type: "select", options: categoryOptions },
            { name: "location", label: "Location" },
            { name: "time", label: "Time" },
            { name: "lead", label: "Lead" },
            { name: "cost", label: "Cost", type: "number" },
            { name: "status", label: "Status", type: "select", options: statusOptions },
            { name: "needs", label: "Needs", type: "textarea", full: true },
            { name: "notes", label: "Notes", type: "textarea", full: true },
          ]}
        />
      </SectionCard>

      <SectionCard title="Programming" subtitle="Activities, rooms, leads, needs. Now with actual warning flags.">
        <div className="ops-toolbar">
          <input className="ops-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search programming" />
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option>All</option>
            {categoryOptions.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option>All</option>
            {statusOptions.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select value={issueFilter} onChange={(e) => setIssueFilter(e.target.value)}>
            <option>All</option>
            <option>Conflicts</option>
            <option>Resource issues</option>
            <option>Clean</option>
          </select>
        </div>

        {store.programmingConflicts.length > 0 && (
          <div className="ops-warning-banner">
            <strong>{store.programmingConflicts.length}</strong> programming conflict{store.programmingConflicts.length === 1 ? "" : "s"} detected.
          </div>
        )}

        <EditableTable
          tableKey="programming"
          rows={rows}
          onEdit={openEditor}
          onDelete={(id) => store.removeItem("programming", id)}
          columns={[
            { key: "activity", label: "Activity", width: 220 },
            { key: "category", label: "Category", render: (value, row) => value || inferProgrammingCategory(row) },
            { key: "location", label: "Location" },
            { key: "time", label: "Time" },
            { key: "lead", label: "Lead" },
            { key: "needs", label: "Needs", width: 220 },
            {
              key: "issues",
              label: "Issues",
              width: 260,
              render: (_, row) => {
                const problems = [];
                if (store.programmingConflictsById?.[row.id]?.length) problems.push(`${store.programmingConflictsById[row.id].length} conflict`);
                if (store.resourceIssuesByProgrammingId?.[row.id]?.length) problems.push(`${store.resourceIssuesByProgrammingId[row.id].length} resource issue`);
                return problems.length ? <span className="ops-pill status-at-risk">{problems.join(" • ")}</span> : "—";
              },
            },
            { key: "cost", label: "Cost", render: (value) => value ? `$${Number(value).toFixed(0)}` : "—" },
            {
              key: "status",
              label: "Status",
              render: (value) => <span className={`ops-pill status-${slug(value)}`}>{value}</span>,
            },
            { key: "notes", label: "Notes", width: 220 },
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
