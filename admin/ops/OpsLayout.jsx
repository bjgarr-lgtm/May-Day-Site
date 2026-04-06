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
  const overdueCount = useMemo(() => store.tasks.filter((task) => task.status !== "Done" && isOverdue(task.deadline)).length, [store.tasks]);
  const weekCount = useMemo(() => store.timeline.filter((item) => isWithinDays(item.date, 7)).length, [store.timeline]);
  const todayCount = useMemo(() => store.timeline.filter((item) => isToday(item.date)).length, [store.timeline]);

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
            <NavLink key={item.to} to={item.to} end={item.to === "dashboard"} className={({ isActive }) => `ops-nav-link ${isActive ? "is-active" : ""}`}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="ops-sidebar-card">
          <div className="ops-sidebar-stat"><span>Open tasks</span><strong>{store.tasks.filter((t) => t.status !== "Done").length}</strong></div>
          <div className="ops-sidebar-stat"><span>Overdue</span><strong>{overdueCount}</strong></div>
          <div className="ops-sidebar-stat"><span>Today</span><strong>{todayCount}</strong></div>
          <div className="ops-sidebar-stat"><span>This week</span><strong>{weekCount}</strong></div>
          <div className="ops-sidebar-stat"><span>Volunteer shifts</span><strong>{store.volunteers.length}</strong></div>
        </div>
      </aside>
      <main className="ops-main">
        <header className="ops-topbar">
          <div>
            <h1>May Day Operations</h1>
            <p>Planning, scheduling, resources, volunteers, and day-of flow in one place.</p>
          </div>
          <div className="ops-topbar-note">
            <strong>Workbook seed</strong>
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
