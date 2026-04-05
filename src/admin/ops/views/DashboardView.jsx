import React from "react";
import { Link } from "react-router-dom";
import { useOpsStore } from "../hooks/useOpsStore";
import SectionCard from "../components/SectionCard";
import StatCard from "../components/StatCard";
import { formatDateTime, isOverdue } from "../utils/date";

export default function DashboardView() {
  const store = useOpsStore();

  const overdueTasks = store.tasks.filter(
    (task) => task.status !== "Done" && isOverdue(task.deadline)
  );
  const blockedTasks = store.tasks.filter((task) => task.status === "Blocked");
  const unownedTasks = store.tasks.filter((task) => !task.owner?.trim());
  const upcomingTimeline = [...store.timeline]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 6);

  return (
    <div className="ops-page">
      <div className="ops-stat-grid">
        <StatCard label="Tasks" value={store.tasks.length} sublabel="Master execution list" />
        <StatCard label="Overdue" value={overdueTasks.length} tone="danger" sublabel="Needs attention now" />
        <StatCard label="Programming" value={store.programming.length} sublabel="Activities tracked" />
        <StatCard label="Resources" value={store.inventory.length + store.sponsors.length + store.budget.length} sublabel="Inventory, sponsors, budget" />
      </div>

      <div className="ops-dashboard-grid">
        <SectionCard
          title="Overdue tasks"
          subtitle="Things already late and pretending otherwise."
          actions={<Link className="ops-button ops-button-small" to="/admin/ops/tasks">Open tasks</Link>}
        >
          <ul className="ops-list">
            {overdueTasks.length ? overdueTasks.map((task) => (
              <li key={task.id}>
                <strong>{task.title}</strong>
                <span>{task.category}</span>
                <span>{task.deadline}</span>
              </li>
            )) : <li className="ops-list-empty">Nothing overdue. Suspicious, but good.</li>}
          </ul>
        </SectionCard>

        <SectionCard
          title="Blocked tasks"
          subtitle="Things stuck on dependency hell."
          actions={<Link className="ops-button ops-button-small" to="/admin/ops/tasks">Review blockers</Link>}
        >
          <ul className="ops-list">
            {blockedTasks.length ? blockedTasks.map((task) => (
              <li key={task.id}>
                <strong>{task.title}</strong>
                <span>{task.notes || "No notes"}</span>
              </li>
            )) : <li className="ops-list-empty">No blockers right now.</li>}
          </ul>
        </SectionCard>

        <SectionCard
          title="Unowned tasks"
          subtitle="If nobody owns it, nobody is doing it."
          actions={<Link className="ops-button ops-button-small" to="/admin/ops/tasks">Assign owners</Link>}
        >
          <ul className="ops-list">
            {unownedTasks.length ? unownedTasks.map((task) => (
              <li key={task.id}>
                <strong>{task.title}</strong>
                <span>{task.category}</span>
              </li>
            )) : <li className="ops-list-empty">Everything has an owner. Miracles continue.</li>}
          </ul>
        </SectionCard>

        <SectionCard
          title="Upcoming timeline"
          subtitle="Next key moments across setup and event flow."
          actions={<Link className="ops-button ops-button-small" to="/admin/ops/timeline">Open timeline</Link>}
        >
          <ul className="ops-list">
            {upcomingTimeline.length ? upcomingTimeline.map((item) => (
              <li key={item.id}>
                <strong>{item.activity}</strong>
                <span>{formatDateTime(item.date, item.time)}</span>
                <span>{item.location || "No location"}</span>
              </li>
            )) : <li className="ops-list-empty">Timeline is empty.</li>}
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}