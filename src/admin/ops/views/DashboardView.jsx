import React from "react";
import { Link } from "react-router-dom";
import { useOpsStore } from "../hooks/useOpsStore";
import SectionCard from "../components/SectionCard";
import StatCard from "../components/StatCard";
import { formatDateTime, isOverdue, isToday, isWithinDays } from "../utils/date";

function sliceSorted(items, sorter, count = 8) {
  return [...items].sort(sorter).slice(0, count);
}

function PreviewList({ items, renderItem, emptyLabel, previewCount = 4 }) {
  const [expanded, setExpanded] = React.useState(false);
  const visible = expanded ? items : items.slice(0, previewCount);

  if (!items.length) {
    return <ul className="ops-list"><li className="ops-list-empty">{emptyLabel}</li></ul>;
  }

  return (
    <>
      <ul className="ops-list ops-list-compact">
        {visible.map(renderItem)}
      </ul>
      {items.length > previewCount && (
        <button type="button" className="ops-link-button" onClick={() => setExpanded((v) => !v)}>
          {expanded ? "Show less" : `Show ${items.length - previewCount} more`}
        </button>
      )}
    </>
  );
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
  const outstandingNeeds = store.programming.filter((item) => (item.needs || "").trim()).slice(0, 12);

  return (
    <div className="ops-page">
      <div className="ops-stat-grid">
        <StatCard label="Tasks" value={store.tasks.length} sublabel="Master execution list" />
        <StatCard label="Overdue" value={overdueTasks.length} tone="danger" sublabel="Needs attention now" />
        <StatCard label="Due this week" value={dueThisWeek.length} tone="warning" sublabel="Next seven days" />
        <StatCard label="Outstanding needs" value={outstandingNeeds.length} sublabel="Pulled from programming" />
        <StatCard label="Volunteer shifts" value={store.volunteers.length} sublabel={`${volunteerCheckedIn} checked in`} />
      </div>

      <div className="ops-dashboard-grid ops-dashboard-grid-three">
        <SectionCard
          title="Today"
          subtitle="What is actually happening today, assuming the universe cooperates."
          actions={<Link className="ops-button ops-button-small" to="../timeline">Open timeline</Link>}
        >
          <PreviewList
            items={todayTimeline}
            emptyLabel="Nothing specifically tagged for today yet."
            renderItem={(item) => (
              <li key={item.id}>
                <strong>{item.activity}</strong>
                <span>{formatDateTime(item.date, item.time)}</span>
                <span>{item.location || "No location"}</span>
              </li>
            )}
          />
        </SectionCard>

        <SectionCard
          title="Critical path"
          subtitle="The workbook implied these are the load-bearing tasks."
          actions={<Link className="ops-button ops-button-small" to="../tasks">Open tasks</Link>}
        >
          <PreviewList
            items={criticalPath}
            emptyLabel="Critical path is not set."
            renderItem={(task) => (
              <li key={task.id}>
                <strong>{task.title}</strong>
                <span>{task.category}</span>
                <span>{task.deadline || "Verify date"}</span>
              </li>
            )}
          />
        </SectionCard>

        <SectionCard
          title="Outstanding needs"
          subtitle="A quick read of what programming still needs."
          actions={<Link className="ops-button ops-button-small" to="../programming">Open programming</Link>}
        >
          <PreviewList
            items={outstandingNeeds}
            emptyLabel="No outstanding needs logged."
            renderItem={(item) => (
              <li key={item.id}>
                <strong>{item.activity}</strong>
                <span>{item.category || "General"}</span>
                <span>{item.needs}</span>
              </li>
            )}
          />
        </SectionCard>

        <SectionCard
          title="Overdue tasks"
          subtitle="Things already late and pretending otherwise."
          actions={<Link className="ops-button ops-button-small" to="../tasks">Open tasks</Link>}
        >
          <PreviewList
            items={overdueTasks}
            emptyLabel="Nothing overdue. Suspicious, but good."
            renderItem={(task) => (
              <li key={task.id}>
                <strong>{task.title}</strong>
                <span>{task.category}</span>
                <span>{task.deadline}</span>
              </li>
            )}
          />
        </SectionCard>

        <SectionCard
          title="Unowned tasks"
          subtitle="If nobody owns it, nobody is doing it."
          actions={<Link className="ops-button ops-button-small" to="../tasks">Assign owners</Link>}
        >
          <PreviewList
            items={unownedTasks}
            emptyLabel="Everything has an owner. Miracles continue."
            renderItem={(task) => (
              <li key={task.id}>
                <strong>{task.title}</strong>
                <span>{task.category}</span>
              </li>
            )}
          />
        </SectionCard>

        <SectionCard
          title="Blocked tasks"
          subtitle="Things stuck on dependency hell."
          actions={<Link className="ops-button ops-button-small" to="../tasks">Review blockers</Link>}
        >
          <PreviewList
            items={blockedTasks}
            emptyLabel="No blockers right now."
            renderItem={(task) => (
              <li key={task.id}>
                <strong>{task.title}</strong>
                <span>{task.notes || "No notes"}</span>
              </li>
            )}
          />
        </SectionCard>

        <SectionCard
          title="Volunteer coverage"
          subtitle="Blank shifts are future emergencies in disguise."
          actions={<Link className="ops-button ops-button-small" to="../volunteers">Open volunteers</Link>}
        >
          <PreviewList
            items={volunteerOpen}
            emptyLabel="All volunteer shifts have people assigned."
            renderItem={(item) => (
              <li key={item.id}>
                <strong>{item.role}</strong>
                <span>{item.area}</span>
                <span>{item.shiftDate || "No date"} {item.shiftStart ? `at ${item.shiftStart}` : ""}</span>
              </li>
            )}
          />
        </SectionCard>

        <SectionCard
          title="Upcoming timeline"
          subtitle="Next key moments across setup and event flow."
          actions={<Link className="ops-button ops-button-small" to="../timeline">Open timeline</Link>}
        >
          <PreviewList
            items={upcomingTimeline}
            emptyLabel="Timeline is empty."
            renderItem={(item) => (
              <li key={item.id}>
                <strong>{item.activity}</strong>
                <span>{formatDateTime(item.date, item.time)}</span>
                <span>{item.location || "No location"}</span>
              </li>
            )}
          />
        </SectionCard>
      </div>
    </div>
  );
}
