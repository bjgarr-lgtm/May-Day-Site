import React from "react";
import { useOpsStore } from "../hooks/useOpsStore";
import SectionCard from "../components/SectionCard";
import EditableTable from "../components/EditableTable";
import RecordEditor from "../components/RecordEditor";
import { blankBudget, blankInventory, blankSponsor } from "../seedData";

const sponsorStatusOptions = ["Pending", "Confirmed", "Declined", "Dead"];
const sponsorTypeOptions = ["Sponsor", "Vendor", "Partner", "Food", "Printing"];
const resourceTabs = ["Inventory", "Sponsors", "Budget"];

export default function ResourcesView() {
  const store = useOpsStore();
  const [tab, setTab] = React.useState("Inventory");
  const [editor, setEditor] = React.useState(blankInventory());

  React.useEffect(() => {
    if (tab === "Inventory") setEditor(blankInventory());
    if (tab === "Sponsors") setEditor(blankSponsor());
    if (tab === "Budget") setEditor(blankBudget());
  }, [tab]);

  const handleSave = () => {
    if (tab === "Inventory") {
      if (!editor.item.trim()) return window.alert("Item name is required.");
      const exists = store.inventory.some((item) => item.id === editor.id);
      exists ? store.updateItem("inventory", editor.id, editor) : store.addItem("inventory", editor);
      setEditor(blankInventory());
      return;
    }

    if (tab === "Sponsors") {
      if (!editor.name.trim()) return window.alert("Name is required.");
      const exists = store.sponsors.some((item) => item.id === editor.id);
      exists ? store.updateItem("sponsors", editor.id, editor) : store.addItem("sponsors", editor);
      setEditor(blankSponsor());
      return;
    }

    if (!editor.item.trim()) return window.alert("Budget item is required.");
    const exists = store.budget.some((item) => item.id === editor.id);
    exists ? store.updateItem("budget", editor.id, editor) : store.addItem("budget", editor);
    setEditor(blankBudget());
  };

  return (
    <div className="ops-page">
      <SectionCard title="Resources" subtitle="Inventory, sponsors, budget. One area, three sane tables.">
        <div className="ops-tabs">
          {resourceTabs.map((item) => (
            <button
              key={item}
              className={`ops-tab ${item === tab ? "is-active" : ""}`}
              onClick={() => setTab(item)}
            >
              {item}
            </button>
          ))}
        </div>

        {tab === "Inventory" && (
          <EditableTable
            rows={store.inventory}
            onEdit={(row) => setEditor(row)}
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
            rows={store.sponsors}
            onEdit={(row) => setEditor(row)}
            onDelete={(id) => store.removeItem("sponsors", id)}
            columns={[
              { key: "name", label: "Name" },
              { key: "type", label: "Type" },
              { key: "contact", label: "Contact" },
              {
                key: "status",
                label: "Status",
                render: (value) => <span className={`ops-pill status-${slug(value)}`}>{value}</span>,
              },
              { key: "notes", label: "Notes" },
            ]}
            emptyLabel="No sponsors yet."
          />
        )}

        {tab === "Budget" && (
          <EditableTable
            rows={store.budget}
            onEdit={(row) => setEditor(row)}
            onDelete={(id) => store.removeItem("budget", id)}
            columns={[
              { key: "item", label: "Item" },
              { key: "category", label: "Category" },
              { key: "cost", label: "Cost" },
              {
                key: "paid",
                label: "Paid?",
                render: (value) => (value ? "Yes" : "No"),
              },
              { key: "notes", label: "Notes" },
            ]}
            emptyLabel="No budget items yet."
          />
        )}
      </SectionCard>

      <SectionCard title={`Add ${tab.slice(0, -1) || tab}`}>
        {tab === "Inventory" && (
          <RecordEditor
            title="Inventory editor"
            value={editor}
            onChange={(key, value) => setEditor((current) => ({ ...current, [key]: value }))}
            onSave={handleSave}
            onCancel={() => setEditor(blankInventory())}
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
            onCancel={() => setEditor(blankSponsor())}
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
            onCancel={() => setEditor(blankBudget())}
            fields={[
              { name: "item", label: "Item", full: true },
              { name: "category", label: "Category" },
              { name: "cost", label: "Cost" },
              { name: "paid", label: "Paid", type: "checkbox" },
              { name: "notes", label: "Notes", type: "textarea", full: true },
            ]}
          />
        )}
      </SectionCard>
    </div>
  );
}

function slug(value = "") {
  return value.toLowerCase().replace(/\s+/g, "-");
}