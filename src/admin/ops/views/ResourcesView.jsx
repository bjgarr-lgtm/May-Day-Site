import React from "react";
import { useOpsStore } from "../hooks/useOpsStore";
import SectionCard from "../components/SectionCard";
import EditableTable from "../components/EditableTable";

const resourceTabs = ["Inventory", "Sponsors", "Vendors", "Budget"];

export default function ResourcesView() {
  const store = useOpsStore();
  const [tab, setTab] = React.useState("Inventory");

  const safeSponsors = store.sponsors || [];
  const safeVendors = store.vendors || [];
  const safeInventory = store.inventory || [];
  const safeBudget = store.budget || [];

  return (
    <div className="ops-page">
      <SectionCard title="Resources">
        <div className="ops-tabs">
          {resourceTabs.map((t) => (
            <button
              key={t}
              className={`ops-tab ${t === tab ? "is-active" : ""}`}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "Inventory" && (
          <EditableTable
            tableKey="inventory"
            rows={safeInventory}
            columns={[{ key: "item", label: "Item" }]}
          />
        )}

        {tab === "Sponsors" && (
          <EditableTable
            tableKey="sponsors"
            rows={safeSponsors}
            columns={[{ key: "name", label: "Name" }]}
          />
        )}

        {tab === "Vendors" && (
          <EditableTable
            tableKey="vendors"
            rows={safeVendors}
            columns={[
              { key: "name", label: "Name" },
              { key: "status", label: "Status" },
              { key: "notes", label: "Notes" },
            ]}
          />
        )}

        {tab === "Budget" && (
          <EditableTable
            tableKey="budget"
            rows={safeBudget}
            columns={[{ key: "item", label: "Item" }]}
          />
        )}
      </SectionCard>
    </div>
  );
}