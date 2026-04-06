import React from "react";
import { Link } from "react-router-dom";
import { useOpsStore } from "../hooks/useOpsStore";
import SectionCard from "../components/SectionCard";
import StatCard from "../components/StatCard";
import { formatDateTime, isToday, formatDate } from "../utils/date";

function PreviewList({ items, renderItem, empty, initial = 4 }) {
  const [expanded, setExpanded] = React.useState(false);
  const shown = expanded ? items : items.slice(0, initial);
  return (
    <div className="ops-card-list-limited">
      {shown.length ? shown.map(renderItem) : <div className="ops-list-empty">{empty}</div>}
      {items.length > initial ? (
        <button
          type="button"
          className="ops-linkish ops-card-list-more"
          onClick={() => setExpanded((current) => !current)}
        >
          {expanded ? "Show less" : `Show ${items.length - initial} more`}
        </button>
      ) : null}
    </div>
  );
}

function IssueStack({ items, empty, renderItem }) {
  return (
    <div className="ops-issue-stack">
      {items.length ? items.map(renderItem) : <div className="ops-list-empty">{empty}</div>}
    </div>
  );
}

export default function DashboardView() {
  const store = useOpsStore();
  const overdueTasks = store.overdueTasks || [];
  const blockedTasks = store.blockedTasks || [];
  const programmingConflicts = store.programmingConflicts || [];
  const volunteerConflicts = store.volunteerConflicts || [];
  const uncoveredVolunteerShifts = store.uncoveredVolunteerShifts || [];
  const resourceIssues = store.resourceIssues || [];
  const dueSoonTasks = store.tasks.filter((task) =>
    task.status !== "Done" &&
    !overdueTasks.some((item) => item.id === task.id) &&
    task.deadline
  );
  const todayTimeline = store.timeline.filter((item) => isToday(item.date));
  const upcomingTimeline = [...store.timeline]
    .sort((a, b) => new Date(`${a.date || ""} ${a.time || ""}`) - new Date(`${b.date || ""} ${b.time || ""}`))
    .slice(0, 8);
  const criticalPath = (store.state.meta?.criticalPath || [])
    .map((title) => store.tasks.find((task) => task.title === title))
    .filter(Boolean);
  const totalIssues =
    programmingConflicts.length +
    volunteerConflicts.length +
    uncoveredVolunteerShifts.length +
    resourceIssues.length +
    overdueTasks.length +
    blockedTasks.length;

  return (
    <div className="ops-page">
      <div className="ops-stat-grid">
        <StatCard label="Tasks" value={store.tasks.length} sublabel="Master execution list" />
        <StatCard label="Problem count" value={totalIssues} tone={totalIssues ? "danger" : "default"} sublabel="Conflicts, shortages, coverage, overdue" />
        <StatCard label="Programming conflicts" value={programmingConflicts.length} tone={programmingConflicts.length ? "danger" : "default"} sublabel="Overlaps and collisions" />
        <StatCard label="Volunteer coverage" value={uncoveredVolunteerShifts.length} tone={uncoveredVolunteerShifts.length ? "warning" : "default"} sublabel="Still unassigned" />
        <StatCard label="Missing resources" value={resourceIssues.length} tone={resourceIssues.length ? "warning" : "default"} sublabel="Needs vs inventory" />
      </div>

      <div className="ops-dashboard-grid ops-dashboard-grid-three">
        <SectionCard title="Problems that need fixing" subtitle="Compact view so you can see the mess without scrolling to hell." actions={<div className="ops-inline-actions"><Link className="ops-button ops-button-small" to="../run-of-show">Open run of show</Link><Link className="ops-button ops-button-small ops-button-secondary" to="../day-of">Open day of view</Link></div>}>
          <IssueStack
            items={[
              ...programmingConflicts.slice(0, 4).map((item) => ({ kind: "conflict", data: item, key: item.id })),
              ...resourceIssues.slice(0, 4).map((item) => ({ kind: "resource", data: item, key: item.id })),
              ...uncoveredVolunteerShifts.slice(0, 4).map((item) => ({ kind: "coverage", data: item, key: item.id })),
              ...overdueTasks.slice(0, 4).map((item) => ({ kind: "overdue", data: item, key: item.id })),
            ]}
            empty="No major issues are surfacing right now."
            renderItem={(item) => {
              if (item.kind === "conflict") {
                return <div className="ops-alert-row ops-alert-danger" key={item.key}><strong>Conflict</strong><span>{item.data.summary}</span></div>;
              }
              if (item.kind === "resource") {
                return <div className="ops-alert-row ops-alert-warning" key={item.key}><strong>Missing</strong><span>{item.data.summary}</span></div>;
              }
              if (item.kind === "coverage") {
                return <div className="ops-alert-row ops-alert-warning" key={item.key}><strong>Open shift</strong><span>{item.data.role} · {formatDateTime(item.data.shiftDate, item.data.shiftStart)}</span></div>;
              }
              return <div className="ops-alert-row ops-alert-danger" key={item.key}><strong>Overdue</strong><span>{item.data.title}</span></div>;
            }}
          />
        </SectionCard>

        <SectionCard title="Today" subtitle="Immediate timeline" actions={<Link className="ops-button ops-button-small" to="../timeline">Open timeline</Link>}>
          <PreviewList
            items={todayTimeline}
            empty="Nothing tagged for today yet."
            renderItem={(item) => (
              <div className="ops-preview-item" key={item.id}>
                <strong>{item.activity}</strong>
                <span>{formatDateTime(item.date, item.time)}</span>
                <span>{item.location || "No location"}</span>
              </div>
            )}
          />
        </SectionCard>

        <SectionCard title="Critical path" subtitle="Load-bearing tasks" actions={<Link className="ops-button ops-button-small" to="../tasks">Open tasks</Link>}>
          <PreviewList
            items={criticalPath}
            empty="Critical path is not set."
            renderItem={(task) => (
              <div className="ops-preview-item" key={task.id}>
                <strong>{task.title}</strong>
                <span>{task.category || "General"}</span>
                <span>{task.deadline ? formatDate(task.deadline) : "No date"}</span>
              </div>
            )}
          />
        </SectionCard>

        <SectionCard title="Overdue and blocked" subtitle="What is already dragging" actions={<Link className="ops-button ops-button-small" to="../tasks">Open tasks</Link>}>
          <PreviewList
            items={[...overdueTasks, ...blockedTasks]}
            empty="Nothing overdue or blocked."
            renderItem={(task) => (
              <div className="ops-preview-item" key={`${task.id}-${task.status}`}>
                <strong>{task.title}</strong>
                <span>{task.status}</span>
                <span>{task.owner || "Unassigned"}</span>
              </div>
            )}
          />
        </SectionCard>

        <SectionCard title="Upcoming timeline" subtitle="Next scheduled items" actions={<Link className="ops-button ops-button-small" to="../timeline">Open timeline</Link>}>
          <PreviewList
            items={upcomingTimeline}
            empty="Timeline is empty."
            renderItem={(item) => (
              <div className="ops-preview-item" key={item.id}>
                <strong>{item.activity}</strong>
                <span>{formatDateTime(item.date, item.time)}</span>
                <span>{item.lead || "No lead"}</span>
              </div>
            )}
          />
        </SectionCard>

        <SectionCard title="Volunteer issues" subtitle="Coverage and collisions" actions={<Link className="ops-button ops-button-small" to="../volunteers">Open volunteers</Link>}>
          <IssueStack
            items={[
              ...uncoveredVolunteerShifts.map((item) => ({ kind: "open", data: item, key: `open-${item.id}` })),
              ...volunteerConflicts.map((item) => ({ kind: "double", data: item, key: item.id })),
            ]}
            empty="Volunteer board looks clean."
            renderItem={(item) => item.kind === "open" ? (
              <div className="ops-alert-row ops-alert-warning" key={item.key}>
                <strong>Open</strong>
                <span>{item.data.role} · {formatDateTime(item.data.shiftDate, item.data.shiftStart)}</span>
              </div>
            ) : (
              <div className="ops-alert-row ops-alert-danger" key={item.key}>
                <strong>Double-booked</strong>
                <span>{item.data.summary}</span>
              </div>
            )}
          />
        </SectionCard>
      </div>
    </div>
  );
}
