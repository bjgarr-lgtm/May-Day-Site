
import React from "react";

export default function VolunteerSheetPrint({ shifts = [] }) {
  return (
    <div>
      <h1>Volunteer Sheet</h1>
      {shifts.map((s, i) => (
        <div key={i}>
          {s.role} — {s.volunteer || "UNASSIGNED"}
        </div>
      ))}
    </div>
  );
}
