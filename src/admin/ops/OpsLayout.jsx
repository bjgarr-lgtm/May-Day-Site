import React, { useMemo } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useOpsStore } from "./hooks/useOpsStore";
import { isOverdue, isWithinDays, isToday } from "./utils/date";

const navItems = [
  { to: "dashboard", label: "Dashboard" },
  { to: "tasks", label: "Tasks" },
  { to: "timeline", label: "Timeline" },
  { to: "programming", label: "Programming" },
  { to: "resources", label: "Resources" },
  { to: "volunteers", label: "Volunteers" },
  { to: "run-of-show", label: "Run of Show" },
];

export default function OpsLayout() {
  const store = useOpsStore();

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
          <div className="ops-sidebar-stat">
            <span>Volunteer shifts</span>
            <strong>{store.volunteers.length}</strong>
          </div>
        </div>

        <div className="ops-sidebar-help">
          <p>Use Run of Show when you want a printable day-of page. Browser print already gives you PDF output without dragging JSON around like a cursed backup ritual.</p>
        </div>
      </aside>

      <main className="ops-main">
        <div className="ops-topbar">
          <h1>Operations Backend</h1>
          <p>Fast read, fast edits, less scrolling, zero sideways nonsense.</p>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
