import React from "react";
import { useOpsStore } from "../hooks/useOpsStore";
import SectionCard from "../components/SectionCard";
import EditableTable from "../components/EditableTable";
import RecordEditor from "../components/RecordEditor";
import { blankProgramming, inferProgrammingCategory } from "../seedData";

const statusOptions = ["Planned", "Confirmed", "Needs Supplies", "At Risk", "Done"];
const categoryOptions = ["General", "Performance", "Food", "Operations", "Activity"];

function syncLabel(status) {
  if (status === "loading") return "Syncing…";
  if (status === "saved") return "Synced";
  if (status === "error") return "Retry sync";
  return "Sync performers";
}

function siteImportLabel(status) {
  if (status === "loading") return "Importing…";
  if (status === "saved") return "Imported";
  return "Import website schedule";
}

function sourceLabel(row) {
  return row.sourceType === "form_submission" ? "Form" : "Local";
}

export default function ProgrammingView() {
  const store = useOpsStore();
  const [editor, setEditor] = React.useState(blankProgramming());
  const [isEditorOpen, setIsEditorOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("All");
  const [categoryFilter, setCategoryFilter] = React.useState("All");
  const [siteImportStatus, setSiteImportStatus] = React.useState("idle");
  const editorRef = React.useRef(null);

  const openEditor = React.useCallback((next) => {
    setEditor(next);
    setIsEditorOpen(true);
    requestAnimationFrame(() => editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }, []);

  const websiteRows = store.programming.filter((item) => item.sourceType === "website_schedule");
  const conflictCount = (store.programmingConflicts || []).length;

  const rows = store.programming
    .filter((item) => {
      const haystack = `${item.activity} ${item.location} ${item.time} ${item.lead} ${item.needs} ${item.notes} ${item.category} ${item.syncStatus}`.toLowerCase();
      const matchesQuery = !query || haystack.includes(query.toLowerCase());
      const matchesStatus = statusFilter === "All" || item.status === statusFilter;
      const matchesCategory = categoryFilter === "All" || (item.category || inferProgrammingCategory(item)) === categoryFilter;
      return matchesQuery && matchesStatus && matchesCategory;
    })
    .sort((a, b) => `${a.time || ""}`.localeCompare(`${b.time || ""}`));

  const syncBudget = (programItem) => {
    const label = programItem.activity.trim();
    if (!label || !programItem.cost) return;
    const existing = store.budget.find((item) => item.sourceType === "programming" && item.sourceId === programItem.id);
    const budgetRow = {
      id: existing?.id || `budget_prog_${programItem.id}`,
      item: label,
      category: "Programming",
      cost: programItem.cost,
      paid: existing?.paid || false,
      notes: existing?.notes || "",
      sourceType: "programming",
      sourceId: programItem.id,
      syncStatus: programItem.syncStatus === "modified" ? "modified" : "synced",
      linkedAt: existing?.linkedAt || new Date().toISOString(),
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

  const handleSync = async () => {
    try {
      const count = await store.syncPerformers();
      window.alert(`Synced ${count} performer submission${count === 1 ? "" : "s"}.`);
    } catch (error) {
      window.alert(error?.message || "Could not sync performers.");
    }
  };

  const handleWebsiteImport = async () => {
    try {
      setSiteImportStatus("loading");
      const counts = await store.importWebsiteSchedule();
      setSiteImportStatus("saved");
      window.alert(`Imported ${counts.programming} programming item${counts.programming === 1 ? "" : "s"} and ${counts.timeline} timeline item${counts.timeline === 1 ? "" : "s"} from the website schedule.`);
    } catch (error) {
      setSiteImportStatus("error");
      window.alert(error?.message || "Could not import the website schedule.");
    }
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

      <SectionCard title="Programming" subtitle="Activities, rooms, leads, needs, and a real source link instead of duplicated folklore.">
        <div className="ops-toolbar">
          <div className="ops-toolbar-meta">{websiteRows.length} website-sourced item{websiteRows.length === 1 ? "" : "s"} · {conflictCount} conflict{conflictCount === 1 ? "" : "s"}</div>
          <input className="ops-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search programming" />
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option>All</option>
            {categoryOptions.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option>All</option>
            {statusOptions.map((item) => <option key={item}>{item}</option>)}
          </select>
          <button type="button" className="ops-button ops-button-secondary" onClick={handleSync} disabled={store.syncStatus.performers === "loading"}>
            {syncLabel(store.syncStatus.performers)}
          </button>
          <button type="button" className="ops-button" onClick={handleWebsiteImport} disabled={siteImportStatus === "loading"}>
            {siteImportLabel(siteImportStatus)}
          </button>
        </div>
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
            { key: "cost", label: "Cost", render: (value) => value ? `$${Number(value).toFixed(0)}` : "—" },
            { key: "status", label: "Status" },
            { key: "issues", label: "Issues", width: 220, render: (_, row) => {
              const issues = (store.programmingConflicts || []).filter((item) => item.leftId === row.id || item.rightId === row.id).map((item) => item.sameLocation ? "location conflict" : "lead conflict");
              const resource = (store.resourceIssues || []).filter((item) => item.programmingId === row.id).map((item) => item.need);
              const labels = Array.from(new Set([...issues, ...resource.map((item) => `needs ${item}`)]));
              return labels.length ? labels.join(", ") : "—";
            } },
            { key: "sourceType", label: "Source", render: (_, row) => sourceLabel(row) },
            { key: "syncStatus", label: "Sync", render: (value) => value || "local" },
          ]}
          emptyLabel="No programming matches the current filters."
        />
      </SectionCard>
    </div>
  );
}
