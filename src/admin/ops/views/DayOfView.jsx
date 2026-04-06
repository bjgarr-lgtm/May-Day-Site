import React from "react";

export default function DayOfView({ store }) {
  const nowItems = store.timeline?.slice(0,5) || [];

  return (
    <div className="ops-dayof">
      <h2>Day Of</h2>

      <section>
        <h3>Happening Now</h3>
        {nowItems.map(i => <div key={i.id}>{i.activity}</div>)}
      </section>

      <section>
        <h3>Urgent Issues</h3>
        {(store.overdueTasks || []).map(i => <div key={i.id}>{i.title}</div>)}
      </section>
    </div>
  );
}
