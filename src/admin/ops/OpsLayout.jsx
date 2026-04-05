
import React, { useMemo, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useOpsStore } from "./hooks/useOpsStore";
import { exportOpsState, importOpsState } from "./utils/storage";
import { isOverdue, isWithinDays, isToday } from "./utils/date";

const navItems = [
  { to: "dashboard", label: "Dashboard" },
  { to: "tasks", label: "Tasks" },
  { to: "timeline", label: "Timeline" },
  { to: "programming", label: "Programming" },
  { to: "resources", label: "Resources" },
];

export default function OpsLayout() {
  const store = useOpsStore();
  const [importText, setImportText] = useState("");
  const [showImport, setShowImport] = useState(false);

  const overdueCount = useMemo(
    () => store.tasks.filter((task) => task.status !== "Done" && isOverdue(task.deadline)).length,
    [store.tasks]
  );
  const weekCount = useMemo(
    () => store.timeline.filter((item) => isWithinDays(item.date, 7)).length,
    [store.timeline]
  );
  const todayCount = useMemo(
    () => store.timeline.filter((item) => isToday(item.date)).length,
    [store.timeline]
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

  const handleReset = () => {
    if (window.confirm("Replace your local edits with the workbook-seeded data?")) {
      store.resetToWorkbookSeed();
    }
  };

  return (
    <div className="ops-shell">
      <aside className="ops-sidebar">
        <div className="ops-brand">
          <div className="ops-brand-mark">✶</div>
          <div>
            <div className="ops-brand-title">May Day Ops Console</div>
            <div className="ops-brand-subtitle">Private organizing backend</div>
          </div>
        </div>

        <nav className="ops-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "dashboard"}
              className={({ isActive }) => `ops-nav-link ${isActive ? "is-active" : ""}`}
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
            <span>Today</span>
            <strong>{todayCount}</strong>
          </div>
          <div className="ops-sidebar-stat">
            <span>This week</span>
            <strong>{weekCount}</strong>
          </div>
        </div>

        <div className="ops-sidebar-actions">
          <button className="ops-button" onClick={handleExport}>Export JSON</button>
          <button className="ops-button ops-button-secondary" onClick={() => setShowImport((v) => !v)}>
            {showImport ? "Close Import" : "Import JSON"}
          </button>
          <button className="ops-button ops-button-ghost" onClick={handleReset}>
            Reset to workbook seed
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
            <button className="ops-button" onClick={handleImport}>Replace current data</button>
          </div>
        )}
      </aside>

      <main className="ops-main">
        <header className="ops-topbar">
          <div>
            <h1>May Day Operations</h1>
            <p>Seeded from your workbook, stripped of credential nonsense, and organized into something usable.</p>
          </div>
          <div className="ops-topbar-note">
            <strong>Import notes</strong>
            <ul>
              {(store.state.meta?.notes || []).map((note) => <li key={note}>{note}</li>)}
            </ul>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
