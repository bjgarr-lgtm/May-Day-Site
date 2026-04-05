import React from "react";

export default function StatCard({ label, value, tone = "default", sublabel }) {
  return (
    <div className={`ops-stat-card tone-${tone}`}>
      <div className="ops-stat-label">{label}</div>
      <div className="ops-stat-value">{value}</div>
      {sublabel ? <div className="ops-stat-sublabel">{sublabel}</div> : null}
    </div>
  );
}