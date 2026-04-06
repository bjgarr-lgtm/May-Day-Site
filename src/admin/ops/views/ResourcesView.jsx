
import React from "react";
import { exportCSV } from "../utils/exportCSV";

export default function ResourcesView({ resources = [] }) {
  return (
    <div>
      <h2>Resources</h2>

      <div style={{ marginBottom: "10px" }}>
        <button onClick={() => exportCSV(resources, "resources.csv")}>
          Export CSV
        </button>
      </div>

      {resources.map((r, i) => (
        <div key={i}>
          {r.name} — {r.quantity}
        </div>
      ))}
    </div>
  );
}
