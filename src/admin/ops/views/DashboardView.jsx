
import React from "react";
import { Link } from "react-router-dom";
import { useOpsStore } from "../hooks/useOpsStore";
import SectionCard from "../components/SectionCard";
import StatCard from "../components/StatCard";
import { formatDateTime, isOverdue, isToday, isWithinDays } from "../utils/date";

function sliceSorted(items, sorter, count = 8) {
  return [...items].sort(sorter).slice(0, count);
}

export default function DashboardView() {
  const store = useOpsStore();

  const overdueTasks = store.tasks.filter((task) => task.status !== "Done" && isOverdue(task.deadline));
  const blockedTasks = store.tasks.filter((task) => task.status === "Blocked");
  const unownedTasks = store.tasks.filter((task) => !task.owner?.trim());
  const dueThisWeek = store.tasks.filter((task) => task.status !== "Done" && isWithinDays(task.deadline, 7));
  const todayTimeline = store.timeline.filter((item) => isToday(item.date));
  const upcomingTimeline = sliceSorted(store.timeline, (a, b) => new Date(`${a.date || ""} ${a.time || ""}`) - new Date(`${b.date || ""} ${b.time || ""}`), 8);
  const volunteerOpen = store.volunteers.filter((item) => !item.name?.trim() || item.status === "Needs Assignment");
  const volunteerCheckedIn = store.volunteers.filter((item) => item.checkedIn).length;
  const criticalPath = (store.state.meta?.criticalPath || [])
    .map((title) => store.tasks.find((task) => task.title === title))
    .filter(Boolean);

  return (
    <div className="ops-page">
      <div className="ops-stat-grid">
        <StatCard label="Tasks" value={store.tasks.length} sublabel="Master execution list" />
        <StatCard label="Overdue" value={overdueTasks.length} tone="danger" sublabel="Needs attention now" />
        <StatCard label="Due this week" value={dueThisWeek.length} tone="warning" sublabel="Next seven days" />
        <StatCard label="Resources" value={store.inventory.length + store.sponsors.length + store.budget.length} sublabel="Inventory, sponsors, budget" />
        <StatCard label="Volunteer shifts" value={store.volunteers.length} sublabel={`${volunteerCheckedIn} checked in`} />
      </div>

      <div className="ops-dashboard-grid ops-dashboard-grid-three">
        <SectionCard
          title="Today"
          subtitle="What is actually happening today, assuming the universe cooperates."
          actions={<Link className="ops-button ops-button-small" to="../timeline">Open timeline</Link>}
        >
          <ul className="ops-list">
            {todayTimeline.length ? todayTimeline.map((item) => (
              <li key={item.id}>
                <strong>{item.activity}</strong>
                <span>{formatDateTime(item.date, item.time)}</span>
                <span>{item.location || "No location"}</span>
              </li>
            )) : <li className="ops-list-empty">Nothing specifically tagged for today yet.</li>}
          </ul>
        </SectionCard>

        <SectionCard
          title="Critical path"
          subtitle="The workbook implied these are the load-bearing tasks."
          actions={<Link className="ops-button ops-button-small" to="../tasks">Open tasks</Link>}
        >
          <ul className="ops-list">
            {criticalPath.length ? criticalPath.map((task) => (
              <li key={task.id}>
                <strong>{task.title}</strong>
                <span>{task.category}</span>
                <span>{task.deadline || "Verify date"}</span>
              </li>
            )) : <li className="ops-list-empty">Critical path is not set.</li>}
          </ul>
        </SectionCard>

        <SectionCard
          title="Overdue tasks"
          subtitle="Things already late and pretending otherwise."
          actions={<Link className="ops-button ops-button-small" to="../tasks">Open tasks</Link>}
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
          title="Unowned tasks"
          subtitle="If nobody owns it, nobody is doing it."
          actions={<Link className="ops-button ops-button-small" to="../tasks">Assign owners</Link>}
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
          title="Blocked tasks"
          subtitle="Things stuck on dependency hell."
          actions={<Link className="ops-button ops-button-small" to="../tasks">Review blockers</Link>}
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
          title="Volunteer coverage"
          subtitle="Blank shifts are future emergencies in disguise."
          actions={<Link className="ops-button ops-button-small" to="../volunteers">Open volunteers</Link>}
        >
          <ul className="ops-list">
            {volunteerOpen.length ? volunteerOpen.slice(0, 8).map((item) => (
              <li key={item.id}>
                <strong>{item.role}</strong>
                <span>{item.area}</span>
                <span>{item.shiftDate || "No date"} {item.shiftStart ? `at ${item.shiftStart}` : ""}</span>
              </li>
            )) : <li className="ops-list-empty">All volunteer shifts have people assigned.</li>}
          </ul>
        </SectionCard>

        <SectionCard
          title="Upcoming timeline"
          subtitle="Next key moments across setup and event flow."
          actions={<Link className="ops-button ops-button-small" to="../timeline">Open timeline</Link>}
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
