import React from "react";
import { useOpsStore } from "../hooks/useOpsStore";
import SectionCard from "../components/SectionCard";
import EditableTable from "../components/EditableTable";
import RecordEditor from "../components/RecordEditor";
import { blankInventory, blankSponsor, blankBudget } from "../seedData";
import { exportRowsAsCsv } from "../utils/exportSpreadsheet";

const sponsorTypeOptions = ["Sponsor", "Priority Sponsor", "Vendor/Sponsor"];
const sponsorStatusOptions = ["Pending", "Confirmed", "Declined", "Dead"];
function slug(value = "") { return value.toLowerCase().replace(/\s+/g, "-"); }

export default function ResourcesView() {
  const store = useOpsStore();
  const [tab, setTab] = React.useState("Inventory");
  const [query, setQuery] = React.useState("");
  const [editorOpen, setEditorOpen] = React.useState(false);
  const [editor, setEditor] = React.useState(blankInventory());

  const inventoryRows = store.inventory.filter((row) => `${row.item} ${row.location} ${row.owner} ${row.condition} ${row.notes}`.toLowerCase().includes(query.toLowerCase()));
  const sponsorRows = store.sponsors.filter((row) => `${row.name} ${row.type} ${row.contact} ${row.status} ${row.notes}`.toLowerCase().includes(query.toLowerCase()));
  const budgetRows = store.budget.filter((row) => `${row.item} ${row.category} ${row.notes}`.toLowerCase().includes(query.toLowerCase()));

  const inventoryColumns = [{ key: "item", label: "Item" },{ key: "quantity", label: "Qty" },{ key: "location", label: "Location" },{ key: "owner", label: "Owner" },{ key: "condition", label: "Condition" },{ key: "notes", label: "Notes" }];
  const sponsorColumns = [{ key: "name", label: "Name" },{ key: "type", label: "Type" },{ key: "contact", label: "Contact" },{ key: "status", label: "Status", render: (value) => <span className={`ops-pill status-${slug(value)}`}>{value}</span>, exportValue: (value) => value },{ key: "notes", label: "Notes" }];
  const budgetColumns = [{ key: "item", label: "Item" },{ key: "category", label: "Category" },{ key: "cost", label: "Cost", render: (value) => value ? `$${Number(value).toFixed(0)}` : "—", exportValue: (value) => value || "" },{ key: "paid", label: "Paid?", render: (value) => (value ? "Yes" : "No"), exportValue: (value) => value ? 'Yes' : 'No' },{ key: "notes", label: "Notes" }];

  const handleSave = () => {
    if (tab === "Inventory") {
      if (!editor.item?.trim()) return window.alert("Item name is required.");
      const exists = store.inventory.some((item) => item.id === editor.id);
      exists ? store.updateItem("inventory", editor.id, editor) : store.addItem("inventory", editor);
      setEditor(blankInventory());
    }
    if (tab === "Sponsors") {
      if (!editor.name?.trim()) return window.alert("Name is required.");
      const exists = store.sponsors.some((item) => item.id === editor.id);
      exists ? store.updateItem("sponsors", editor.id, editor) : store.addItem("sponsors", editor);
      setEditor(blankSponsor());
    }
    if (tab === "Budget") {
      if (!editor.item?.trim()) return window.alert("Budget item is required.");
      const exists = store.budget.some((item) => item.id === editor.id);
      exists ? store.updateItem("budget", editor.id, editor) : store.addItem("budget", editor);
      setEditor(blankBudget());
    }
    setEditorOpen(false);
  };

  const handleTab = (nextTab) => { setTab(nextTab); setQuery(""); setEditorOpen(false); setEditor(nextTab === "Inventory" ? blankInventory() : nextTab === "Sponsors" ? blankSponsor() : blankBudget()); };
  const handleEdit = (row) => { setEditor(row); setEditorOpen(true); window.requestAnimationFrame(() => document.querySelector('.ops-editor')?.scrollIntoView({ behavior: 'smooth', block: 'start' })); };
  const currentRows = tab === 'Inventory' ? inventoryRows : tab === 'Sponsors' ? sponsorRows : budgetRows;
  const currentColumns = tab === 'Inventory' ? inventoryColumns : tab === 'Sponsors' ? sponsorColumns : budgetColumns;

  return (
    <div className="ops-page">
      <SectionCard title="Resources" subtitle="Inventory, sponsors, and budget.">
        <div className="ops-tabs">{["Inventory", "Sponsors", "Budget"].map((item) => <button type="button" key={item} className={`ops-tab ${tab === item ? 'is-active' : ''}`} onClick={() => handleTab(item)}>{item}</button>)}</div>
        <div className="ops-toolbar">
          <button type="button" className="ops-button ops-button-small" onClick={() => exportRowsAsCsv(`${tab.toLowerCase()}.csv`, currentColumns, currentRows)}>Export CSV</button>
          <button type="button" className="ops-button ops-button-small ops-button-secondary" onClick={() => window.print()}>Print</button>
          <input className="ops-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`Search ${tab.toLowerCase()}`} />
        </div>
        {tab === "Inventory" && <EditableTable rows={inventoryRows} onEdit={handleEdit} onDelete={(id) => store.removeItem("inventory", id)} columns={inventoryColumns} emptyLabel="No inventory yet." />}
        {tab === "Sponsors" && <EditableTable rows={sponsorRows} onEdit={handleEdit} onDelete={(id) => store.removeItem("sponsors", id)} columns={sponsorColumns} emptyLabel="No sponsors yet." />}
        {tab === "Budget" && <EditableTable rows={budgetRows} onEdit={handleEdit} onDelete={(id) => store.removeItem("budget", id)} columns={budgetColumns} emptyLabel="No budget items yet." />}
      </SectionCard>
      <SectionCard title={`${editor.id ? 'Edit' : 'Add'} ${tab === 'Inventory' ? 'inventory item' : tab === 'Sponsors' ? 'sponsor or vendor' : 'budget line'}`}>
        {tab === "Inventory" && <RecordEditor title="Inventory editor" value={editor} isOpen={editorOpen} onToggle={() => setEditorOpen((v) => !v)} mode={editor.id ? 'edit' : 'add'} onChange={(key, value) => setEditor((current) => ({ ...current, [key]: value }))} onSave={handleSave} onCancel={() => { setEditor(blankInventory()); setEditorOpen(false); }} fields={[{ name: "item", label: "Item", full: true },{ name: "quantity", label: "Quantity" },{ name: "location", label: "Location" },{ name: "owner", label: "Owner" },{ name: "condition", label: "Condition" },{ name: "notes", label: "Notes", type: "textarea", full: true }]} />}
        {tab === "Sponsors" && <RecordEditor title="Sponsor / vendor editor" value={editor} isOpen={editorOpen} onToggle={() => setEditorOpen((v) => !v)} mode={editor.id ? 'edit' : 'add'} onChange={(key, value) => setEditor((current) => ({ ...current, [key]: value }))} onSave={handleSave} onCancel={() => { setEditor(blankSponsor()); setEditorOpen(false); }} fields={[{ name: "name", label: "Name", full: true },{ name: "type", label: "Type", type: "select", options: sponsorTypeOptions },{ name: "contact", label: "Contact", full: true },{ name: "status", label: "Status", type: "select", options: sponsorStatusOptions },{ name: "notes", label: "Notes", type: "textarea", full: true }]} />}
        {tab === "Budget" && <RecordEditor title="Budget editor" value={editor} isOpen={editorOpen} onToggle={() => setEditorOpen((v) => !v)} mode={editor.id ? 'edit' : 'add'} onChange={(key, value) => setEditor((current) => ({ ...current, [key]: value }))} onSave={handleSave} onCancel={() => { setEditor(blankBudget()); setEditorOpen(false); }} fields={[{ name: "item", label: "Item", full: true },{ name: "category", label: "Category" },{ name: "cost", label: "Cost", type: "number" },{ name: "paid", label: "Paid", type: "checkbox" },{ name: "notes", label: "Notes", type: "textarea", full: true }]} />}
      </SectionCard>
    </div>
  );
}
