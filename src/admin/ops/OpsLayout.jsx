import React, { useMemo, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useOpsStore } from "./hooks/useOpsStore";
import { exportOpsState, importOpsState } from "./utils/storage";

const navItems = [
  { to: "/admin/ops/dashboard", label: "Dashboard" },
  { to: "/admin/ops/tasks", label: "Tasks" },
  { to: "/admin/ops/timeline", label: "Timeline" },
  { to: "/admin/ops/programming", label: "Programming" },
  { to: "/admin/ops/resources", label: "Resources" },
];

export default function OpsLayout() {
  const store = useOpsStore();
  const [importText, setImportText] = useState("");
  const [showImport, setShowImport] = useState(false);

  const overdueCount = useMemo(
    () =>
      store.tasks.filter((task) => {
        if (!task.deadline || task.status === "Done") return false;
        const endOfDay = new Date(task.deadline);
        endOfDay.setHours(23, 59, 59, 999);
        return endOfDay < new Date();
      }).length,
    [store.tasks]
  );

  const handleExport = () => {
    const blob = new Blob([exportOpsState(store.state)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mayday-ops-console-export.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    try {
      const parsed = importOpsState(importText);
      store.replaceState(parsed);
      setImportText("");
      setShowImport(false);
    } catch (error) {
      window.alert(error.message || "Import failed.");
    }
  };

  return (
    <div className="ops-shell">
      <aside className="ops-sidebar">
        <div className="ops-brand">
          <div className="ops-brand-mark">✶</div>
          <div>
            <div className="ops-brand-title">May Day Ops Console</div>
            <div className="ops-brand-subtitle">Internal organizing backend</div>
          </div>
        </div>

        <nav className="ops-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `ops-nav-link ${isActive ? "is-active" : ""}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="ops-sidebar-card">
          <div className="ops-sidebar-stat">
            <span>Open tasks</span>
            <strong>{store.tasks.filter((t) => t.status !== "Done").length}</strong>
          </div>
          <div className="ops-sidebar-stat">
            <span>Overdue</span>
            <strong>{overdueCount}</strong>
          </div>
          <div className="ops-sidebar-stat">
            <span>This week</span>
            <strong>{store.timeline.length}</strong>
          </div>
        </div>

        <div className="ops-sidebar-actions">
          <button className="ops-button" onClick={handleExport}>
            Export JSON
          </button>
          <button className="ops-button ops-button-secondary" onClick={() => setShowImport((v) => !v)}>
            {showImport ? "Close Import" : "Import JSON"}
          </button>
        </div>

        {showImport && (
          <div className="ops-import-panel">
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Paste exported JSON here"
              rows={8}
            />
            <button className="ops-button" onClick={handleImport}>
              Replace current data
            </button>
          </div>
        )}
      </aside>

      <main className="ops-main">
        <header className="ops-topbar">
          <div>
            <h1>May Day Operations</h1>
            <p>
              Structured replacement for the spreadsheet. Less chaos, fewer mystery tabs.
            </p>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}