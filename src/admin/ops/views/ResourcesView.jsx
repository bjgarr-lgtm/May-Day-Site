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
  const editorRef = React.useRef(null);
  const [tab, setTab] = React.useState("Inventory");
  const [query, setQuery] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState("All");
  const [showEditor, setShowEditor] = React.useState(false);
  const [editor, setEditor] = React.useState(blankInventory());

  React.useEffect(() => {
    if (tab === "Inventory") setEditor(blankInventory());
    if (tab === "Sponsors") setEditor(blankSponsor());
    if (tab === "Budget") setEditor(blankBudget());
    setShowEditor(false);
    setQuery("");
    setTypeFilter("All");
  }, [tab]);

  const totalBudget = store.budget.reduce((sum, item) => sum + (Number(item.cost) || 0), 0);

  const openEditor = (next) => {
    setEditor(next);
    setShowEditor(true);
    requestAnimationFrame(() => editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const handleSave = () => {
    if (tab === "Inventory") {
      if (!editor.item.trim()) return window.alert("Item name is required.");
      const exists = store.inventory.some((item) => item.id === editor.id);
      exists ? store.updateItem("inventory", editor.id, editor) : store.addItem("inventory", editor);
      setEditor(blankInventory());
      setShowEditor(false);
      return;
    }

    if (tab === "Sponsors") {
      if (!editor.name.trim()) return window.alert("Name is required.");
      const exists = store.sponsors.some((item) => item.id === editor.id);
      exists ? store.updateItem("sponsors", editor.id, editor) : store.addItem("sponsors", editor);
      setEditor(blankSponsor());
      setShowEditor(false);
      return;
    }

    if (!editor.item.trim()) return window.alert("Budget item is required.");
    const exists = store.budget.some((item) => item.id === editor.id);
    exists ? store.updateItem("budget", editor.id, editor) : store.addItem("budget", editor);
    setEditor(blankBudget());
    setShowEditor(false);
  };

  const inventoryRows = store.inventory.filter((item) => {
    const haystack = `${item.item} ${item.location} ${item.owner} ${item.condition} ${item.notes}`.toLowerCase();
    return !query || haystack.includes(query.toLowerCase());
  });

  const sponsorRows = store.sponsors.filter((item) => {
    const haystack = `${item.name} ${item.type} ${item.contact} ${item.status} ${item.notes}`.toLowerCase();
    const matchesQuery = !query || haystack.includes(query.toLowerCase());
    const matchesType = typeFilter === "All" || item.type === typeFilter;
    return matchesQuery && matchesType;
  });

  const budgetRows = store.budget.filter((item) => {
    const haystack = `${item.item} ${item.category} ${item.notes}`.toLowerCase();
    const matchesQuery = !query || haystack.includes(query.toLowerCase());
    const matchesType = typeFilter === "All" || item.category === typeFilter;
    return matchesQuery && matchesType;
  });

  const budgetCategories = React.useMemo(() => Array.from(new Set(store.budget.map((item) => item.category).filter(Boolean))).sort(), [store.budget]);

  return (
    <div className="ops-page">
      <div className="ops-stat-grid ops-stat-grid-three">
        <div className="ops-stat-card"><div className="ops-stat-label">Inventory items</div><div className="ops-stat-value">{store.inventory.length}</div></div>
        <div className="ops-stat-card"><div className="ops-stat-label">Sponsors / vendors</div><div className="ops-stat-value">{store.sponsors.length}</div></div>
        <div className="ops-stat-card"><div className="ops-stat-label">Budget tracked</div><div className="ops-stat-value">{`$${totalBudget.toFixed(0)}`}</div></div>
      </div>

      <SectionCard
        title="Resources"
        subtitle="Inventory, sponsors, budget. One area, three sane tables."
        actions={<button type="button" className="ops-button ops-button-small" onClick={() => openEditor(tab === "Inventory" ? blankInventory() : tab === "Sponsors" ? blankSponsor() : blankBudget())}>{showEditor ? "Add another" : `Add ${tab.slice(0, -1) || tab}`}</button>}
      >
        <div className="ops-tabs ops-tabs-wrap">
          {resourceTabs.map((item) => (
            <button type="button" key={item} className={`ops-tab ${item === tab ? "is-active" : ""}`} onClick={() => setTab(item)}>
              {item}
            </button>
          ))}
        </div>

        <div className="ops-toolbar">
          <input className="ops-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`Search ${tab.toLowerCase()}`} />
          {tab === "Sponsors" && (
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option>All</option>
              {sponsorTypeOptions.map((item) => <option key={item}>{item}</option>)}
            </select>
          )}
          {tab === "Budget" && (
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option>All</option>
              {budgetCategories.map((item) => <option key={item}>{item}</option>)}
            </select>
          )}
        </div>

        {showEditor && (
          <div ref={editorRef} className="ops-editor-shell">
            {tab === "Inventory" && (
              <RecordEditor
                title="Inventory editor"
                editingLabel={editor.item || ""}
                value={editor}
                onChange={(key, value) => setEditor((current) => ({ ...current, [key]: value }))}
                onSave={handleSave}
                onCancel={() => { setEditor(blankInventory()); setShowEditor(false); }}
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
                editingLabel={editor.name || ""}
                value={editor}
                onChange={(key, value) => setEditor((current) => ({ ...current, [key]: value }))}
                onSave={handleSave}
                onCancel={() => { setEditor(blankSponsor()); setShowEditor(false); }}
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
                editingLabel={editor.item || ""}
                value={editor}
                onChange={(key, value) => setEditor((current) => ({ ...current, [key]: value }))}
                onSave={handleSave}
                onCancel={() => { setEditor(blankBudget()); setShowEditor(false); }}
                fields={[
                  { name: "item", label: "Item", full: true },
                  { name: "category", label: "Category" },
                  { name: "cost", label: "Cost", type: "number" },
                  { name: "paid", label: "Paid", type: "checkbox" },
                  { name: "notes", label: "Notes", type: "textarea", full: true },
                ]}
              />
            )}
          </div>
        )}

        {tab === "Inventory" && (
          <EditableTable
            rows={inventoryRows}
            onEdit={openEditor}
            onDelete={(id) => store.removeItem("inventory", id)}
            columns={[
              { key: "item", label: "Item" },
              { key: "quantity", label: "Qty" },
              { key: "location", label: "Location" },
              { key: "owner", label: "Owner" },
              { key: "condition", label: "Condition" },
              { key: "notes", label: "Notes" },
            ]}
            emptyLabel="No inventory yet."
          />
        )}

        {tab === "Sponsors" && (
          <EditableTable
            rows={sponsorRows}
            onEdit={openEditor}
            onDelete={(id) => store.removeItem("sponsors", id)}
            columns={[
              { key: "name", label: "Name" },
              { key: "type", label: "Type" },
              { key: "contact", label: "Contact" },
              { key: "status", label: "Status", render: (value) => <span className={`ops-pill status-${slug(value)}`}>{value}</span> },
              { key: "notes", label: "Notes" },
            ]}
            emptyLabel="No sponsors yet."
          />
        )}

        {tab === "Budget" && (
          <EditableTable
            rows={budgetRows}
            onEdit={openEditor}
            onDelete={(id) => store.removeItem("budget", id)}
            columns={[
              { key: "item", label: "Item" },
              { key: "category", label: "Category" },
              { key: "cost", label: "Cost", render: (value) => (value ? `$${Number(value).toFixed(0)}` : "—") },
              { key: "paid", label: "Paid?", render: (value) => (value ? "Yes" : "No") },
              { key: "notes", label: "Notes" },
            ]}
            emptyLabel="No budget items yet."
          />
        )}
      </SectionCard>
    </div>
  );
}

function slug(value = "") {
  return value.toLowerCase().replace(/\s+/g, "-");
}
