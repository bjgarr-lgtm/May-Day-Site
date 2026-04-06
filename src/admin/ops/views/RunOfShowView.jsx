
import React from "react";

export default function RunOfShowView({ shifts = [] }) {
  return (
    <div>
      <h2>Run of Show</h2>
      {shifts.map((s, i) => (
        <div key={i}>
          {s.role} - {s.assigned ? s.assigned : "UNASSIGNED"}
        </div>
      ))}
    </div>
  );
}
