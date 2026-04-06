import React from "react";
import { useOpsStore } from "../hooks/useOpsStore";

function DayCard({ title, children, tone = "default" }) {
  return (
    <section className={`ops-day-card tone-${tone}`}>
      <h3>{title}</h3>
      {children}
    </section>
  );
}

export default function DayOfView() {
  const store = useOpsStore();
  const day = store.dayOfView || { nowLabel: "", timelineToday: [], programmingToday: [] };
  const urgentCount =
    (store.programmingConflicts || []).length +
    (store.uncoveredVolunteerShifts || []).length +
    (store.resourceIssues || []).length +
    (store.overdueTasks || []).length;

  const now = day.timelineToday.slice(0, 3);
  const next = day.programmingToday.slice(0, 5);

  return (
    <div className="ops-dayof">
      <div className="ops-dayof-top">
        <div>
          <div className="ops-dayof-kicker">Day of Ops</div>
          <h2>{day.today || "Today"}</h2>
          <p>Mobile first triage view for running the event without swimming through the whole backend.</p>
        </div>
        <div className="ops-dayof-pill">{day.nowLabel || "Now"} · {urgentCount} urgent</div>
      </div>

      <DayCard title="Urgent issues" tone={urgentCount ? "danger" : "success"}>
        {urgentCount ? (
          <ul className="ops-dayof-list">
            {(store.programmingConflicts || []).slice(0, 3).map((item) => <li key={item.id}>Conflict: {item.summary}</li>)}
            {(store.uncoveredVolunteerShifts || []).slice(0, 3).map((item) => <li key={item.id}>Uncovered: {item.role} at {item.shiftStart || "unknown time"}</li>)}
            {(store.resourceIssues || []).slice(0, 3).map((item) => <li key={item.id}>Resource issue: {item.summary}</li>)}
            {(store.overdueTasks || []).slice(0, 3).map((item) => <li key={item.id}>Overdue: {item.title}</li>)}
          </ul>
        ) : <div className="ops-list-empty">No urgent issues. Suspicious, but nice.</div>}
      </DayCard>

      <DayCard title="Happening now">
        <div className="ops-dayof-stack">
          {now.length ? now.map((item) => (
            <div className="ops-dayof-row" key={item.id}>
              <strong>{item.time || "No time"}</strong>
              <div>
                <div>{item.activity}</div>
                <small>{item.location || item.lead || "No location"}</small>
              </div>
            </div>
          )) : <div className="ops-list-empty">No current timeline items.</div>}
        </div>
      </DayCard>

      <DayCard title="Next up">
        <div className="ops-dayof-stack">
          {next.length ? next.map((item) => (
            <div className="ops-dayof-row" key={item.id}>
              <strong>{item.time || "No time"}</strong>
              <div>
                <div>{item.activity}</div>
                <small>{item.location || item.lead || "No location"}</small>
              </div>
            </div>
          )) : <div className="ops-list-empty">No upcoming programming items.</div>}
        </div>
      </DayCard>
    </div>
  );
}
