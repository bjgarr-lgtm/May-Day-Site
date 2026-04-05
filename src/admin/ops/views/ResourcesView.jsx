import React from "react";
import { useOpsStore } from "../hooks/useOpsStore";
import SectionCard from "../components/SectionCard";
import EditableTable from "../components/EditableTable";
import RecordEditor from "../components/RecordEditor";
import { blankBudget, blankInventory, blankSponsor } from "../seedData";

const sponsorStatusOptions = ["Pending", "Confirmed", "Declined", "Dead"];
const sponsorTypeOptions = ["Sponsor", "Vendor", "Partner", "Food", "Printing", "Priority Sponsor", "Vendor/Sponsor"];
const resourceTabs = ["Inventory", "Sponsors", "Budget"];

export default function ResourcesView() {
  const store = useOpsStore();
  const [tab, setTab] = React.useState("Inventory");
  const [editor, setEditor] = React.useState(blankInventory());
  const [focusToken, setFocusToken] = React.useState(0);
  const editorRef = React.useRef(null);

  const activateEditor = React.useCallback((next, nextTab = tab) => {
    if (nextTab !== tab) setTab(nextTab);
    setEditor(next);
    setFocusToken((current) => current + 1);
    window.requestAnimationFrame(() => editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }, [tab]);

  React.useEffect(() => {
    if (tab === "Inventory") setEditor(blankInventory());
    if (tab === "Sponsors") setEditor(blankSponsor());
    if (tab === "Budget") setEditor(blankBudget());
  }, [tab]);

  const totalBudget = store.budget.reduce((sum, item) => sum + (Number(item.cost) || 0), 0);

  const handleSave = () => {
    if (tab === "Inventory") {
      if (!editor.item.trim()) return window.alert("Item name is required.");
      const exists = store.inventory.some((item) => item.id === editor.id);
      exists ? store.updateItem("inventory", editor.id, editor) : store.addItem("inventory", editor);
      activateEditor(blankInventory(), "Inventory");
      return;
    }

    if (tab === "Sponsors") {
      if (!editor.name.trim()) return window.alert("Name is required.");
      const exists = store.sponsors.some((item) => item.id === editor.id);
      exists ? store.updateItem("sponsors", editor.id, editor) : store.addItem("sponsors", editor);
      activateEditor(blankSponsor(), "Sponsors");
      return;
    }

    if (!editor.item.trim()) return window.alert("Budget item is required.");
    const exists = store.budget.some((item) => item.id === editor.id);
    exists ? store.updateItem("budget", editor.id, editor) : store.addItem("budget", editor);
    activateEditor(blankBudget(), "Budget");
  };

  return (
    <div className="ops-page">
      <div className="ops-stat-grid ops-stat-grid-three">
        <div className="ops-stat-card"><div className="ops-stat-label">Inventory items</div><div className="ops-stat-value">{store.inventory.length}</div></div>
        <div className="ops-stat-card"><div className="ops-stat-label">Sponsors / vendors</div><div className="ops-stat-value">{store.sponsors.length}</div></div>
        <div className="ops-stat-card"><div className="ops-stat-label">Budget tracked</div><div className="ops-stat-value">{`$${totalBudget.toFixed(0)}`}</div></div>
      </div>

      <SectionCard title={`Add ${tab === "Inventory" ? "inventory item" : tab === "Sponsors" ? "sponsor or vendor" : "budget line"}`}>
        {tab === "Inventory" && (
          <RecordEditor
            title="Inventory editor"
            value={editor}
            onChange={(key, value) => setEditor((current) => ({ ...current, [key]: value }))}
            onSave={handleSave}
            onCancel={() => activateEditor(blankInventory(), "Inventory")}
            editorRef={editorRef}
            autoFocusToken={focusToken}
            editingLabel={editor.item || ""}
            fields={[
              { name: "item", label: "Item", full: true },
              { name: "quantity", label: "Quantity" },
              { name: "location", label: "Location" },
              { name: "owner", label: "Owner" },
              { name: "condition", label: "Condition" },
              { name: "notes", label: "Notes", type: "textarea", full: true },
            ]}
          />
        )}

        {tab === "Sponsors" && (
          <RecordEditor
            title="Sponsor / vendor editor"
            value={editor}
            onChange={(key, value) => setEditor((current) => ({ ...current, [key]: value }))}
            onSave={handleSave}
            onCancel={() => activateEditor(blankSponsor(), "Sponsors")}
            editorRef={editorRef}
            autoFocusToken={focusToken}
            editingLabel={editor.name || ""}
            fields={[
              { name: "name", label: "Name", full: true },
              { name: "type", label: "Type", type: "select", options: sponsorTypeOptions },
              { name: "contact", label: "Contact", full: true },
              { name: "status", label: "Status", type: "select", options: sponsorStatusOptions },
              { name: "notes", label: "Notes", type: "textarea", full: true },
            ]}
          />
        )}

        {tab === "Budget" && (
          <RecordEditor
            title="Budget editor"
            value={editor}
            onChange={(key, value) => setEditor((current) => ({ ...current, [key]: value }))}
            onSave={handleSave}
            onCancel={() => activateEditor(blankBudget(), "Budget")}
            editorRef={editorRef}
            autoFocusToken={focusToken}
            editingLabel={editor.item || ""}
            fields={[
              { name: "item", label: "Item", full: true },
              { name: "category", label: "Category" },
              { name: "cost", label: "Cost", type: "number" },
              { name: "paid", label: "Paid", type: "checkbox" },
              { name: "notes", label: "Notes", type: "textarea", full: true },
            ]}
          />
        )}
      </SectionCard>

      <SectionCard title="Resources" subtitle="Inventory, sponsors, budget. One area, three sane tables.">
        <div className="ops-tabs">
          {resourceTabs.map((item) => (
            <button type="button" key={item} className={`ops-tab ${item === tab ? "is-active" : ""}`} onClick={() => setTab(item)}>
              {item}
            </button>
          ))}
        </div>

        {tab === "Inventory" && (
          <EditableTable rows={store.inventory} onEdit={(row) => activateEditor(row, "Inventory")} onDelete={(id) => store.removeItem("inventory", id)} columns={[
            { key: "item", label: "Item" },
            { key: "quantity", label: "Qty" },
            { key: "location", label: "Location" },
            { key: "owner", label: "Owner" },
            { key: "condition", label: "Condition" },
            { key: "notes", label: "Notes" },
          ]} emptyLabel="No inventory yet." />
        )}

        {tab === "Sponsors" && (
          <EditableTable rows={store.sponsors} onEdit={(row) => activateEditor(row, "Sponsors")} onDelete={(id) => store.removeItem("sponsors", id)} columns={[
            { key: "name", label: "Name" },
            { key: "type", label: "Type" },
            { key: "contact", label: "Contact" },
            { key: "status", label: "Status", render: (value) => <span className={`ops-pill status-${slug(value)}`}>{value}</span> },
            { key: "notes", label: "Notes" },
          ]} emptyLabel="No sponsors yet." />
        )}

        {tab === "Budget" && (
          <EditableTable rows={store.budget} onEdit={(row) => activateEditor(row, "Budget")} onDelete={(id) => store.removeItem("budget", id)} columns={[
            { key: "item", label: "Item" },
            { key: "category", label: "Category" },
            { key: "cost", label: "Cost", render: (value) => (value ? `$${Number(value).toFixed(0)}` : "—") },
            { key: "paid", label: "Paid?", render: (value) => (value ? "Yes" : "No") },
            { key: "notes", label: "Notes" },
          ]} emptyLabel="No budget items yet." />
        )}
      </SectionCard>
    </div>
  );
}

function slug(value = "") {
  return value.toLowerCase().replace(/\s+/g, "-");
}
