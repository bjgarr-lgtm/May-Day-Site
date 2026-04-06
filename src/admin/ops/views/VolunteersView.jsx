
import React from "react";
import { exportCSV } from "../utils/exportCSV";

export default function VolunteersView({ volunteers = [] }) {
  return (
    <div>
      <h2>Volunteers</h2>

      <div style={{ marginBottom: "10px" }}>
        <button onClick={() => exportCSV(volunteers, "volunteers.csv")}>
          Export CSV
        </button>
        <button onClick={() => window.print()}>
          Print
        </button>
      </div>

      {volunteers.map((v, i) => (
        <div key={i}>
          {v.name} — {v.role || "No role"}
        </div>
      ))}
    </div>
  );
}
