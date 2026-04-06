
import React from "react";

export default function DashboardView({ conflicts = [], overdue = [] }) {
  return (
    <div>
      <h2>Dashboard</h2>
      <h3>Conflicts</h3>
      <ul>
        {conflicts.map((c, i) => (
          <li key={i}>{c.a.name} vs {c.b.name}</li>
        ))}
      </ul>
      <h3>Overdue</h3>
      <ul>
        {overdue.map((t, i) => (
          <li key={i}>{t.title}</li>
        ))}
      </ul>
    </div>
  );
}
