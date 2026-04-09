import React from "react";
import { useOpsStore } from "../hooks/useOpsStore";
import SectionCard from "../components/SectionCard";
import EditableTable from "../components/EditableTable";
import RecordEditor from "../components/RecordEditor";
import { blankBudget, blankInventory, blankSponsor } from "../seedData";

const sponsorStatusOptions = ["Pending", "Confirmed", "Declined", "Dead", "Withdrawn"];
const sponsorTypeOptions = ["Sponsor", "Vendor", "Partner", "Food", "Printing", "Priority Sponsor", "Vendor/Sponsor"];
const vendorStatusOptions = ["Pending", "Confirmed", "Waitlist", "Withdrawn", "Declined"];
const resourceTabs = ["Inventory", "Sponsors", "Vendors", "Budget"];

function blankVendor() {
  return {
    id: `vendor_${Math.random().toString(36).slice(2, 10)}`,
    name: "",
    contact: "",
    address: "",
    phone: "",
    email: "",
    wares: "",
    status: "Pending",
    sourceType: "local",
    notes: "",
  };
}

function slug(value = "") {
  return value.toLowerCase().replace(/\s+/g, "-");
}

function sourceLabel(row) {
  if (row.sourceType === "form_submission") return "Form";
  if (row.sourceType === "programming") return "Programming";
  if (row.sourceType === "seaport_import") return "Seaport";
  if (row.sourceType === "spreadsheet_import") return "Sheet";
  return "Local";
}

function normalizeHeader(value = "") {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function getCell(row, labels) {
  const wanted = labels.map(normalizeHeader);
  for (const [key, value] of Object.entries(row || {})) {
    const normalized = normalizeHeader(key);
    if (wanted.includes(normalized)) return String(value || "").trim();
  }
  return "";
}

function makeImportedId(prefix, seed, index) {
  const base = String(seed || `${prefix}-${index}`)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return `${prefix}_${base || index}_${index}`;
}

function parsePaid(value) {
  const text = String(value || "").trim().toLowerCase();
  return ["yes", "y", "true", "paid", "1"].includes(text);
}

function mergeUnique(items, keyBuilder) {
  const seen = new Set();
  return items.filter((item, index) => {
    const key = keyBuilder(item, index);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
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
    if (tab === "Vendors") setEditor(blankVendor());
    if (tab === "Budget") setEditor(blankBudget());
  }, [tab]);

  const inventory = Array.isArray(store.inventory) ? store.inventory : [];
  const sponsors = Array.isArray(store.sponsors) ? store.sponsors : [];
  const vendors = Array.isArray(store.vendors) ? store.vendors : [];
  const budget = Array.isArray(store.budget) ? store.budget : [];

  const totalBudget = budget.reduce((sum, item) => sum + (Number(item.cost) || 0), 0);

  const openEditor = React.useCallback((next) => {
    setEditor(next);
    setIsEditorOpen(true);
    requestAnimationFrame(() => editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }, []);

  const inventoryRows = inventory.filter((item) => (`${item.item} ${item.quantity} ${item.location} ${item.owner} ${item.condition} ${item.notes}`).toLowerCase().includes(query.toLowerCase()));
  const sponsorRows = sponsors.filter((item) => (`${item.name} ${item.type} ${item.contact} ${item.status} ${item.notes} ${item.syncStatus}`).toLowerCase().includes(query.toLowerCase()));
  const vendorRows = vendors.filter((item) => (`${item.name} ${item.contact} ${item.address} ${item.phone} ${item.email} ${item.wares} ${item.status} ${item.notes}`).toLowerCase().includes(query.toLowerCase()));
  const budgetRows = budget.filter((item) => (`${item.item} ${item.category} ${item.cost} ${item.notes} ${item.syncStatus}`).toLowerCase().includes(query.toLowerCase()));

  const handleSave = () => {
    if (tab === "Inventory") {
      if (!editor.item.trim()) return window.alert("Item name is required.");
      const exists = inventory.some((item) => item.id === editor.id);
      exists ? store.updateItem("inventory", editor.id, editor) : store.addItem("inventory", editor);
      setEditor(blankInventory());
      setIsEditorOpen(false);
      return;
    }

    if (tab === "Sponsors") {
      if (!editor.name.trim()) return window.alert("Name is required.");
      const exists = sponsors.some((item) => item.id === editor.id);
      exists ? store.updateItem("sponsors", editor.id, editor) : store.addItem("sponsors", editor);
      setEditor(blankSponsor());
      setIsEditorOpen(false);
      return;
    }

    if (tab === "Vendors") {
      if (!editor.name.trim()) return window.alert("Vendor name is required.");
      const exists = vendors.some((item) => item.id === editor.id);
      exists ? store.updateItem("vendors", editor.id, editor) : store.addItem("vendors", editor);
      setEditor(blankVendor());
      setIsEditorOpen(false);
      return;
    }

    if (!editor.item.trim()) return window.alert("Budget item is required.");
    const exists = budget.some((item) => item.id === editor.id);
    exists ? store.updateItem("budget", editor.id, editor) : store.addItem("budget", editor);
    setEditor(blankBudget());
    setIsEditorOpen(false);
  };

  const importRows = (collectionName, mappedRows, dedupeKey) => {
    const cleanRows = mappedRows.filter(Boolean);
    if (!cleanRows.length) {
      window.alert("No usable rows were found in that spreadsheet.");
      return;
    }

    store.setState((current) => {
      const existing = Array.isArray(current[collectionName]) ? current[collectionName] : [];
      return {
        ...current,
        [collectionName]: mergeUnique([...cleanRows, ...existing], dedupeKey),
      };
    });

    window.alert(`Imported ${cleanRows.length} row${cleanRows.length === 1 ? "" : "s"} into ${collectionName}.`);
  };

  const inventoryImportConfig = {
    buttonLabel: "Import inventory sheet",
    onRows: async (rows) => {
      importRows(
        "inventory",
        rows.map((row, index) => {
          const item = getCell(row, ["item", "name", "resource", "inventory item"]);
          if (!item) return null;
          return {
            id: makeImportedId("inv", item, index),
            item,
            quantity: getCell(row, ["quantity", "qty", "count"]),
            location: getCell(row, ["location"]),
            owner: getCell(row, ["owner", "assigned to"]),
            condition: getCell(row, ["condition", "status"]),
            notes: getCell(row, ["notes", "details", "description"]),
            sourceType: "spreadsheet_import",
          };
        }),
        (item) => `${item.id}::${String(item.item).toLowerCase()}`
      );
    },
  };

  const sponsorImportConfig = {
    buttonLabel: "Import sponsor sheet",
    onRows: async (rows) => {
      importRows(
        "sponsors",
        rows.map((row, index) => {
          const name = getCell(row, ["name", "sponsor", "organization", "business", "vendor name"]);
          if (!name) return null;
          return {
            id: makeImportedId("sponsor", name, index),
            name,
            type: getCell(row, ["type", "category"]) || "Sponsor",
            contact: getCell(row, ["contact", "contact name", "phone", "email"]),
            status: getCell(row, ["status"]) || "Pending",
            notes: getCell(row, ["notes", "wares made by vendor", "wares", "description"]),
            sourceType: "spreadsheet_import",
          };
        }),
        (item) => `${item.id}::${String(item.name).toLowerCase()}`
      );
    },
  };

  const vendorImportConfig = {
    buttonLabel: "Import vendor sheet",
    onRows: async (rows) => {
      importRows(
        "vendors",
        rows.map((row, index) => {
          const name = getCell(row, ["vendor name", "name", "business", "organization"]);
          if (!name) return null;
          const explicitStatus = getCell(row, ["status"]);
          const withdrawn = name.toLowerCase().includes("withdrawn") || explicitStatus.toLowerCase().includes("withdrawn");
          return {
            id: makeImportedId("vendor", name, index),
            name,
            contact: getCell(row, ["last name first name", "contact", "contact name", "owner"]),
            address: getCell(row, ["address"]),
            phone: getCell(row, ["phone", "phone number"]),
            email: getCell(row, ["email"]),
            wares: getCell(row, ["wares made by vendor", "wares", "products", "description"]),
            status: withdrawn ? "Withdrawn" : (explicitStatus || "Pending"),
            notes: getCell(row, ["notes"]) || "Imported from spreadsheet.",
            sourceType: "spreadsheet_import",
          };
        }),
        (item) => `${String(item.name).toLowerCase()}::${String(item.contact).toLowerCase()}`
      );
    },
  };

  const budgetImportConfig = {
    buttonLabel: "Import budget sheet",
    onRows: async (rows) => {
      importRows(
        "budget",
        rows.map((row, index) => {
          const item = getCell(row, ["item", "name", "budget item", "line item"]);
          if (!item) return null;
          return {
            id: makeImportedId("budget", item, index),
            item,
            category: getCell(row, ["category", "type"]) || "General",
            cost: getCell(row, ["cost", "amount", "price", "budget"]),
            paid: parsePaid(getCell(row, ["paid", "is paid"])),
            notes: getCell(row, ["notes", "details", "description"]),
            sourceType: "spreadsheet_import",
          };
        }),
        (item) => `${item.id}::${String(item.item).toLowerCase()}`
      );
    },
  };

  const editorTitle = tab === "Inventory" ? "Inventory editor" : tab === "Sponsors" ? "Sponsor editor" : tab === "Vendors" ? "Vendor editor" : "Budget editor";
  const addLabel = tab === "Inventory" ? "inventory item" : tab === "Sponsors" ? "sponsor" : tab === "Vendors" ? "vendor" : "budget line";
  const editLabel = addLabel;
  const isEditing = tab === "Inventory"
    ? inventory.some((item) => item.id === editor.id)
    : tab === "Sponsors"
    ? sponsors.some((item) => item.id === editor.id)
    : tab === "Vendors"
    ? vendors.some((item) => item.id === editor.id)
    : budget.some((item) => item.id === editor.id);

  return (
    <div className="ops-page">
      <div className="ops-stat-grid ops-stat-grid-four">
        <div className="ops-stat-card"><div className="ops-stat-label">Inventory items</div><div className="ops-stat-value">{inventory.length}</div></div>
        <div className="ops-stat-card"><div className="ops-stat-label">Sponsors</div><div className="ops-stat-value">{sponsors.length}</div></div>
        <div className="ops-stat-card"><div className="ops-stat-label">Vendors</div><div className="ops-stat-value">{vendors.length}</div></div>
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
                if (tab === "Vendors") setEditor(blankVendor());
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
            if (tab === "Vendors") setEditor(blankVendor());
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
          ] : tab === "Vendors" ? [
            { name: "name", label: "Vendor name", full: true },
            { name: "contact", label: "Contact", full: true },
            { name: "address", label: "Address", full: true },
            { name: "phone", label: "Phone" },
            { name: "email", label: "Email" },
            { name: "status", label: "Status", type: "select", options: vendorStatusOptions },
            { name: "wares", label: "Wares", type: "textarea", full: true },
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

      <SectionCard title="Resources" subtitle="Inventory, sponsors, vendors, and budget lines with spreadsheet import built in.">
        <div className="ops-tabs">
          {resourceTabs.map((item) => (
            <button key={item} type="button" className={`ops-tab ${item === tab ? "is-active" : ""}`} onClick={() => setTab(item)}>
              {item}
            </button>
          ))}
        </div>

        <div className="ops-toolbar">
          <input className="ops-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`Search ${tab.toLowerCase()}`} />
        </div>

        {tab === "Inventory" && (
          <EditableTable
            tableKey="inventory"
            rows={inventoryRows}
            onEdit={openEditor}
            onDelete={(id) => store.removeItem("inventory", id)}
            importConfig={inventoryImportConfig}
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
            importConfig={sponsorImportConfig}
            columns={[
              { key: "name", label: "Name", width: 220 },
              { key: "type", label: "Type" },
              { key: "contact", label: "Contact", width: 220 },
              { key: "status", label: "Status", render: (value) => <span className={`ops-pill status-${slug(value)}`}>{value}</span> },
              { key: "sourceType", label: "Source", render: (_, row) => sourceLabel(row) },
              { key: "notes", label: "Notes", width: 220 },
            ]}
            emptyLabel="No sponsors yet."
          />
        )}

        {tab === "Vendors" && (
          <EditableTable
            tableKey="vendors"
            rows={vendorRows}
            onEdit={openEditor}
            onDelete={(id) => store.removeItem("vendors", id)}
            importConfig={vendorImportConfig}
            columns={[
              { key: "name", label: "Vendor", width: 220 },
              { key: "contact", label: "Contact", width: 180 },
              { key: "phone", label: "Phone", width: 180 },
              { key: "email", label: "Email", width: 220 },
              { key: "status", label: "Status", render: (value) => <span className={`ops-pill status-${slug(value)}`}>{value}</span> },
              { key: "sourceType", label: "Source", render: (_, row) => sourceLabel(row) },
              { key: "wares", label: "Wares", width: 260 },
              { key: "notes", label: "Notes", width: 220 },
            ]}
            emptyLabel="No vendors yet."
          />
        )}

        {tab === "Budget" && (
          <EditableTable
            tableKey="budget"
            rows={budgetRows}
            onEdit={openEditor}
            onDelete={(id) => store.removeItem("budget", id)}
            importConfig={budgetImportConfig}
            columns={[
              { key: "item", label: "Item", width: 220 },
              { key: "category", label: "Category" },
              { key: "cost", label: "Cost", render: (value) => (value ? `$${Number(value).toFixed(0)}` : "—") },
              { key: "paid", label: "Paid?", render: (value) => (value ? "Yes" : "No") },
              { key: "sourceType", label: "Source", render: (_, row) => sourceLabel(row) },
              { key: "notes", label: "Notes", width: 220 },
            ]}
            emptyLabel="No budget items yet."
          />
        )}
      </SectionCard>
    </div>
  );
}
