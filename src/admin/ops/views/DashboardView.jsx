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
  const overdueTasks = store.overdueTasks;
  const blockedTasks = store.blockedTasks;
  const unownedTasks = store.tasks.filter((task) => !task.owner?.trim());
  const dueThisWeek = store.tasks.filter((task) => task.status !== "Done" && !store.overdueTasks.some((item) => item.id === task.id)).slice(0, 999);
  const todayTimeline = store.timeline.filter((item) => isToday(item.date));
  const upcomingTimeline = sliceSorted(store.timeline, (a, b) => new Date(`${a.date || ""} ${a.time || ""}`) - new Date(`${b.date || ""} ${b.time || ""}`), 8);
  const criticalPath = (store.state.meta?.criticalPath || []).map((title) => store.tasks.find((task) => task.title === title)).filter(Boolean);

  return (
    <div className="ops-page">
      <div className="ops-stat-grid">
        <StatCard label="Tasks" value={store.tasks.length} sublabel="Master execution list" />
        <StatCard label="Overdue" value={overdueTasks.length} tone="danger" sublabel="Needs attention now" />
        <StatCard label="Programming conflicts" value={store.programmingConflicts.length} tone={store.programmingConflicts.length ? "danger" : "default"} sublabel="Time, room, or lead overlap" />
        <StatCard label="Resource issues" value={store.resourceIssues.length} tone={store.resourceIssues.length ? "danger" : "default"} sublabel="Needs not covered by inventory" />
        <StatCard label="Uncovered shifts" value={store.uncoveredVolunteerShifts.length} sublabel="Volunteer gaps" />
      </div>
      <div className="ops-dashboard-grid ops-dashboard-grid-three">
        <SectionCard title="Today" subtitle="Quick glance" actions={<Link className="ops-button ops-button-small" to="../timeline">Open timeline</Link>}>
          <PreviewList items={todayTimeline} empty="Nothing specifically tagged for today yet." renderItem={(item) => <div className="ops-preview-item" key={item.id}><strong>{item.activity}</strong><span>{formatDateTime(item.date, item.time)}</span><span>{item.location || "No location"}</span></div>} />
        </SectionCard>
        <SectionCard title="Critical path" subtitle="Load-bearing tasks" actions={<Link className="ops-button ops-button-small" to="../tasks">Open tasks</Link>}>
          <PreviewList items={criticalPath} empty="Critical path is not set." renderItem={(task) => <div className="ops-preview-item" key={task.id}><strong>{task.title}</strong><span>{task.category}</span><span>{task.deadline || "No date"}</span></div>} />
        </SectionCard>
        <SectionCard title="Overdue tasks" subtitle="Already late" actions={<Link className="ops-button ops-button-small" to="../tasks">Open tasks</Link>}>
          <PreviewList items={overdueTasks} empty="Nothing overdue." renderItem={(task) => <div className="ops-preview-item" key={task.id}><strong>{task.title}</strong><span>{task.category}</span><span>{task.deadline || "No date"}</span></div>} />
        </SectionCard>
        <SectionCard title="Blocked tasks" subtitle="Dependency trouble" actions={<Link className="ops-button ops-button-small" to="../tasks">Review blockers</Link>}>
          <PreviewList items={blockedTasks} empty="No blockers right now." renderItem={(task) => <div className="ops-preview-item" key={task.id}><strong>{task.title}</strong><span>{task.blockedBy?.join(", ") || task.notes || "Dependency issue"}</span></div>} />
        </SectionCard>
        <SectionCard title="Programming conflicts" subtitle="Conflicts to resolve" actions={<Link className="ops-button ops-button-small" to="../programming">Open programming</Link>}>
          <PreviewList items={store.programmingConflicts} empty="No programming conflicts right now." renderItem={(item) => <div className="ops-preview-item" key={item.id}><strong>{item.leftLabel}</strong><span>{item.rightLabel}</span><span>{item.reasons.join(", ")}</span></div>} />
        </SectionCard>
        <SectionCard title="Missing resources" subtitle="Programming needs not covered" actions={<Link className="ops-button ops-button-small" to="../resources">Open resources</Link>}>
          <PreviewList items={store.resourceIssues} empty="No missing resources right now." renderItem={(item) => <div className="ops-preview-item" key={item.id}><strong>{item.activity}</strong><span>{item.issues.map((issue) => issue.need).join(", ")}</span></div>} />
        </SectionCard>
        <SectionCard title="Volunteer coverage" subtitle="Open shifts and double-bookings" actions={<Link className="ops-button ops-button-small" to="../volunteers">Open volunteers</Link>}>
          <PreviewList items={[...store.uncoveredVolunteerShifts, ...store.volunteerConflicts]} empty="Volunteer coverage looks clean." renderItem={(item) => <div className="ops-preview-item" key={item.id}><strong>{item.role || item.volunteer || "Volunteer issue"}</strong><span>{item.summary || `${item.area || ""} ${item.shiftDate || ""}`.trim()}</span></div>} />
        </SectionCard>
        <SectionCard title="Upcoming timeline" subtitle="Next key moments" actions={<Link className="ops-button ops-button-small" to="../timeline">Open timeline</Link>}>
          <PreviewList items={upcomingTimeline} empty="Timeline is empty." renderItem={(item) => <div className="ops-preview-item" key={item.id}><strong>{item.activity}</strong><span>{formatDateTime(item.date, item.time)}</span><span>{item.location || "No location"}</span></div>} />
        </SectionCard>
      </div>
    </div>
  );
}
