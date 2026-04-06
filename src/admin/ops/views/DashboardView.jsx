import React from "react";
import { Link } from "react-router-dom";
import { useOpsStore } from "../hooks/useOpsStore";
import SectionCard from "../components/SectionCard";
import StatCard from "../components/StatCard";
import { formatDateTime, isToday } from "../utils/date";

function sliceSorted(items, sorter, count = 5) { return [...items].sort(sorter).slice(0, count); }
function PreviewList({ items, renderItem, empty }) {
  const [expanded, setExpanded] = React.useState(false);
  const shown = expanded ? items : items.slice(0, 4);
  return (
    <div className="ops-card-list-limited">
      {shown.length ? shown.map(renderItem) : <div className="ops-list-empty">{empty}</div>}
      {items.length > 4 && <button type="button" className="ops-linkish ops-card-list-more" onClick={() => setExpanded((v) => !v)}>{expanded ? "Show less" : `Show ${items.length - 4} more`}</button>}
    </div>
  );
}

export default function DashboardView() {
  const store = useOpsStore();
  const overdueTasks = store.overdueTasks || [];
  const blockedTasks = store.blockedTasks || [];
  const unownedTasks = store.tasks.filter((task) => !task.owner?.trim());
  const dueThisWeek = store.dueSoonTasks || [];
  const todayTimeline = store.timeline.filter((item) => isToday(item.date));
  const upcomingTimeline = sliceSorted(store.timeline, (a, b) => new Date(`${a.date || ""} ${a.time || ""}`) - new Date(`${b.date || ""} ${b.time || ""}`), 8);
  const volunteerOpen = store.volunteers.filter((item) => !item.name?.trim() || item.status === "Needs Assignment");
  const volunteerCheckedIn = store.volunteers.filter((item) => item.checkedIn).length;
  const criticalPath = (store.state.meta?.criticalPath || []).map((title) => store.tasks.find((task) => task.title === title)).filter(Boolean);
  const outstandingNeeds = store.programming.filter((item) => item.needs && String(item.needs).trim());
  const readinessScore = store.readinessScore ?? 0;
  const programmingConflicts = store.programmingConflicts || [];
  const volunteerConflicts = store.volunteerConflicts || [];
  const resourceIssues = store.resourceIssues || [];
  const uncoveredVolunteerShifts = store.uncoveredVolunteerShifts || [];

  return (
    <div className="ops-page">
      <div className="ops-stat-grid">
        <StatCard label="Tasks" value={store.tasks.length} sublabel="Master execution list" />
        <StatCard label="Overdue" value={overdueTasks.length} tone="danger" sublabel="Needs attention now" />
        <StatCard label="Due this week" value={dueThisWeek.length} sublabel="Next seven days" />
        <StatCard label="Outstanding needs" value={outstandingNeeds.length} sublabel="Pulled from programming" />
        <StatCard label="Volunteer shifts" value={store.volunteers.length} sublabel={`${volunteerCheckedIn} checked in`} />
        <StatCard label="Readiness" value={`${readinessScore}%`} tone={readinessScore < 60 ? "danger" : readinessScore < 80 ? "warning" : "default"} sublabel="Weighted from blockers and conflicts" />
      </div>
      <div className="ops-dashboard-grid ops-dashboard-grid-three">

        <SectionCard title="Problems to fix first" subtitle="Actual operational issues, not just big feelings." actions={<Link className="ops-button ops-button-small" to="../programming">Open programming</Link>}>
          <PreviewList
            items={[
              ...programmingConflicts.map((item) => ({ kind: "programming", id: item.id, label: item.summary })),
              ...volunteerConflicts.map((item) => ({ kind: "volunteer", id: item.id, label: item.summary })),
              ...resourceIssues.map((item) => ({ kind: "resource", id: item.id, label: item.summary })),
              ...uncoveredVolunteerShifts.map((item) => ({ kind: "coverage", id: item.id, label: `${item.role} still needs coverage` })),
            ]}
            empty="No major conflicts are surfacing right now."
            renderItem={(item) => <div className="ops-preview-item" key={item.id}><strong>{item.kind}</strong><span>{item.label}</span></div>}
          />
        </SectionCard>

        <SectionCard title="Today" subtitle="Quick glance" actions={<Link className="ops-button ops-button-small" to="../timeline">Open timeline</Link>}>
          <PreviewList items={todayTimeline} empty="Nothing specifically tagged for today yet." renderItem={(item) => <div className="ops-preview-item" key={item.id}><strong>{item.activity}</strong><span>{formatDateTime(item.date, item.time)}</span><span>{item.location || "No location"}</span></div>} />
        </SectionCard>
        <SectionCard title="Critical path" subtitle="Load-bearing tasks" actions={<Link className="ops-button ops-button-small" to="../tasks">Open tasks</Link>}>
          <PreviewList items={criticalPath} empty="Critical path is not set." renderItem={(task) => <div className="ops-preview-item" key={task.id}><strong>{task.title}</strong><span>{task.category}</span><span>{task.deadline || "No date"}</span></div>} />
        </SectionCard>
        <SectionCard title="Overdue tasks" subtitle="Already late" actions={<Link className="ops-button ops-button-small" to="../tasks">Open tasks</Link>}>
          <PreviewList items={overdueTasks} empty="Nothing overdue." renderItem={(task) => <div className="ops-preview-item" key={task.id}><strong>{task.title}</strong><span>{task.category}</span><span>{task.deadline || "No date"}</span></div>} />
        </SectionCard>
        <SectionCard title="Unowned tasks" subtitle="Needs an owner" actions={<Link className="ops-button ops-button-small" to="../tasks">Assign owners</Link>}>
          <PreviewList items={unownedTasks} empty="Everything has an owner." renderItem={(task) => <div className="ops-preview-item" key={task.id}><strong>{task.title}</strong><span>{task.category}</span></div>} />
        </SectionCard>
        <SectionCard title="Blocked tasks" subtitle="Dependency trouble" actions={<Link className="ops-button ops-button-small" to="../tasks">Review blockers</Link>}>
          <PreviewList items={blockedTasks} empty="No blockers right now." renderItem={(task) => <div className="ops-preview-item" key={task.id}><strong>{task.title}</strong><span>{task.notes || "No notes"}</span></div>} />
        </SectionCard>
        <SectionCard title="Outstanding needs" subtitle="From programming" actions={<Link className="ops-button ops-button-small" to="../programming">Open programming</Link>}>
          <PreviewList items={outstandingNeeds} empty="No needs listed." renderItem={(item) => <div className="ops-preview-item" key={item.id}><strong>{item.activity}</strong><span>{item.category || "General"}</span><span>{item.needs}</span></div>} />
        </SectionCard>
        <SectionCard title="Volunteer coverage" subtitle="Open shifts" actions={<Link className="ops-button ops-button-small" to="../volunteers">Open volunteers</Link>}>
          <PreviewList items={volunteerOpen} empty="All volunteer shifts have people assigned." renderItem={(item) => <div className="ops-preview-item" key={item.id}><strong>{item.role}</strong><span>{item.area}</span><span>{item.shiftDate || "No date"} {item.shiftStart ? `at ${item.shiftStart}` : ""}</span></div>} />
        </SectionCard>
        <SectionCard title="Upcoming timeline" subtitle="Next key moments" actions={<Link className="ops-button ops-button-small" to="../timeline">Open timeline</Link>}>
          <PreviewList items={upcomingTimeline} empty="Timeline is empty." renderItem={(item) => <div className="ops-preview-item" key={item.id}><strong>{item.activity}</strong><span>{formatDateTime(item.date, item.time)}</span><span>{item.location || "No location"}</span></div>} />
        </SectionCard>
      </div>
    </div>
  );
}
