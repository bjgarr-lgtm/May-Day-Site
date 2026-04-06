import React from "react";
import { useOpsStore } from "../hooks/useOpsStore";
import SectionCard from "../components/SectionCard";
import EditableTable from "../components/EditableTable";
import RecordEditor from "../components/RecordEditor";
import { blankBudget, blankInventory, blankSponsor } from "../seedData";

const sponsorStatusOptions = ["Pending", "Confirmed", "Declined", "Dead"];
const sponsorTypeOptions = ["Sponsor", "Vendor", "Partner", "Food", "Printing", "Priority Sponsor", "Vendor/Sponsor"];
const resourceTabs = ["Inventory", "Sponsors", "Budget"];

function slug(value = "") {
  return value.toLowerCase().replace(/\s+/g, "-");
}

function sourceLabel(row) {
  if (row.sourceType === "form_submission") return "Form";
  if (row.sourceType === "programming") return "Programming";
  return "Local";
}

export default function ResourcesView() {
  const store = useOpsStore();
  const [tab, setTab] = React.useState("Inventory");
  const [editor, setEditor] = React.useState(blankInventory());
  const [isEditorOpen, setIsEditorOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const editorRef = React.useRef(null);

  React.useEffect(() => {
    setQuery("");
    setIsEditorOpen(false);
    if (tab === "Inventory") setEditor(blankInventory());
    if (tab === "Sponsors") setEditor(blankSponsor());
    if (tab === "Budget") setEditor(blankBudget());
  }, [tab]);

  const totalBudget = store.budget.reduce((sum, item) => sum + (Number(item.cost) || 0), 0);

  const openEditor = React.useCallback((next) => {
    setEditor(next);
    setIsEditorOpen(true);
    requestAnimationFrame(() => editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }, []);

  const inventoryRows = store.inventory.filter((item) => (`${item.item} ${item.location} ${item.owner} ${item.condition} ${item.notes}`).toLowerCase().includes(query.toLowerCase()));
  const sponsorRows = store.sponsors.filter((item) => (`${item.name} ${item.type} ${item.contact} ${item.status} ${item.notes} ${item.syncStatus}`).toLowerCase().includes(query.toLowerCase()));
  const budgetRows = store.budget.filter((item) => (`${item.item} ${item.category} ${item.cost} ${item.notes} ${item.syncStatus}`).toLowerCase().includes(query.toLowerCase()));

  const handleSave = () => {
    if (tab === "Inventory") {
      if (!editor.item.trim()) return window.alert("Item name is required.");
      const exists = store.inventory.some((item) => item.id === editor.id);
      exists ? store.updateItem("inventory", editor.id, editor) : store.addItem("inventory", editor);
      setEditor(blankInventory());
      setIsEditorOpen(false);
      return;
    }

    if (tab === "Sponsors") {
      if (!editor.name.trim()) return window.alert("Name is required.");
      const exists = store.sponsors.some((item) => item.id === editor.id);
      exists ? store.updateItem("sponsors", editor.id, editor) : store.addItem("sponsors", editor);
      setEditor(blankSponsor());
      setIsEditorOpen(false);
      return;
    }

    if (!editor.item.trim()) return window.alert("Budget item is required.");
    const exists = store.budget.some((item) => item.id === editor.id);
    exists ? store.updateItem("budget", editor.id, editor) : store.addItem("budget", editor);
    setEditor(blankBudget());
    setIsEditorOpen(false);
  };

  const handleSync = async () => {
    try {
      const count = await store.syncVendors();
      window.alert(`Synced ${count} vendor submission${count === 1 ? "" : "s"}.`);
    } catch (error) {
      window.alert(error?.message || "Could not sync vendors.");
    }
  };

  const editorTitle = tab === "Inventory" ? "Inventory editor" : tab === "Sponsors" ? "Sponsor or vendor editor" : "Budget editor";
  const addLabel = tab === "Inventory" ? "inventory item" : tab === "Sponsors" ? "sponsor or vendor" : "budget line";
  const editLabel = tab === "Inventory" ? "inventory item" : tab === "Sponsors" ? "sponsor or vendor" : "budget line";
  const isEditing = tab === "Inventory" ? store.inventory.some((item) => item.id === editor.id) : tab === "Sponsors" ? store.sponsors.some((item) => item.id === editor.id) : store.budget.some((item) => item.id === editor.id);

  return (
    <div className="ops-page">
      <div className="ops-stat-grid ops-stat-grid-three">
        <div className="ops-stat-card"><div className="ops-stat-label">Inventory items</div><div className="ops-stat-value">{store.inventory.length}</div></div>
        <div className="ops-stat-card"><div className="ops-stat-label">Sponsors / vendors</div><div className="ops-stat-value">{store.sponsors.length}</div></div>
        <div className="ops-stat-card"><div className="ops-stat-label">Budget tracked</div><div className="ops-stat-value">{`$${totalBudget.toFixed(0)}`}</div></div>
      </div>

      <SectionCard title={isEditing ? `Edit ${editLabel}` : `Add ${addLabel}`}>
        <RecordEditor
          editorRef={editorRef}
          title={editorTitle}
          value={editor}
          isOpen={isEditorOpen}
          onToggle={() => {
            if (isEditorOpen) setIsEditorOpen(false);
            else {
              if (!isEditing) {
                if (tab === "Inventory") setEditor(blankInventory());
                if (tab === "Sponsors") setEditor(blankSponsor());
                if (tab === "Budget") setEditor(blankBudget());
              }
              setIsEditorOpen(true);
            }
          }}
          mode={isEditing ? "edit" : "add"}
          onChange={(key, value) => setEditor((current) => ({ ...current, [key]: value }))}
          onSave={handleSave}
          onCancel={() => {
            if (tab === "Inventory") setEditor(blankInventory());
            if (tab === "Sponsors") setEditor(blankSponsor());
            if (tab === "Budget") setEditor(blankBudget());
            setIsEditorOpen(false);
          }}
          fields={tab === "Inventory" ? [
            { name: "item", label: "Item", full: true },
            { name: "quantity", label: "Quantity" },
            { name: "location", label: "Location" },
            { name: "owner", label: "Owner" },
            { name: "condition", label: "Condition" },
            { name: "notes", label: "Notes", type: "textarea", full: true },
          ] : tab === "Sponsors" ? [
            { name: "name", label: "Name", full: true },
            { name: "type", label: "Type", type: "select", options: sponsorTypeOptions },
            { name: "contact", label: "Contact", full: true },
            { name: "status", label: "Status", type: "select", options: sponsorStatusOptions },
            { name: "notes", label: "Notes", type: "textarea", full: true },
          ] : [
            { name: "item", label: "Item", full: true },
            { name: "category", label: "Category" },
            { name: "cost", label: "Cost", type: "number" },
            { name: "paid", label: "Paid", type: "checkbox" },
            { name: "notes", label: "Notes", type: "textarea", full: true },
          ]}
        />
      </SectionCard>

      <SectionCard title="Resources" subtitle="Inventory, sponsors, and budget lines with actual source linkage instead of mystery copies.">
        <div className="ops-tabs">
          {resourceTabs.map((item) => (
            <button key={item} type="button" className={`ops-tab ${item === tab ? "is-active" : ""}`} onClick={() => setTab(item)}>
              {item}
            </button>
          ))}
        </div>

        <div className="ops-toolbar">
          <input className="ops-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`Search ${tab.toLowerCase()}`} />
          {tab === "Sponsors" ? (
            <button type="button" className="ops-button ops-button-secondary" onClick={handleSync} disabled={store.syncStatus.vendors === "loading"}>
              {store.syncStatus.vendors === "loading" ? "Syncing…" : store.syncStatus.vendors === "saved" ? "Synced" : "Sync vendors"}
            </button>
          ) : null}
        </div>

        {tab === "Inventory" && (
          <EditableTable
            tableKey="inventory"
            rows={inventoryRows}
            onEdit={openEditor}
            onDelete={(id) => store.removeItem("inventory", id)}
            columns={[
              { key: "item", label: "Item", width: 220 },
              { key: "quantity", label: "Qty" },
              { key: "location", label: "Location" },
              { key: "owner", label: "Owner" },
              { key: "condition", label: "Condition" },
              { key: "notes", label: "Notes", width: 220 },
            ]}
            emptyLabel="No inventory yet."
          />
        )}

        {tab === "Sponsors" && (
          <EditableTable
            tableKey="sponsors"
            rows={sponsorRows}
            onEdit={openEditor}
            onDelete={(id) => store.removeItem("sponsors", id)}
            columns={[
              { key: "name", label: "Name", width: 220 },
              { key: "type", label: "Type" },
              { key: "contact", label: "Contact", width: 220 },
              { key: "status", label: "Status", render: (value) => <span className={`ops-pill status-${slug(value)}`}>{value}</span> },
              { key: "sourceType", label: "Source", render: (_, row) => sourceLabel(row) },
              { key: "syncStatus", label: "Sync", render: (value) => value || "local" },
              { key: "notes", label: "Notes", width: 220 },
            ]}
            emptyLabel="No sponsors yet."
          />
        )}

        {tab === "Budget" && (
          <EditableTable
            tableKey="budget"
            rows={budgetRows}
            onEdit={openEditor}
            onDelete={(id) => store.removeItem("budget", id)}
            columns={[
              { key: "item", label: "Item", width: 220 },
              { key: "category", label: "Category" },
              { key: "cost", label: "Cost", render: (value) => (value ? `$${Number(value).toFixed(0)}` : "—") },
              { key: "paid", label: "Paid?", render: (value) => (value ? "Yes" : "No") },
              { key: "sourceType", label: "Source", render: (_, row) => sourceLabel(row) },
              { key: "syncStatus", label: "Sync", render: (value) => value || "local" },
              { key: "notes", label: "Notes", width: 220 },
            ]}
            emptyLabel="No budget items yet."
          />
        )}
      </SectionCard>
    </div>
  );
}
