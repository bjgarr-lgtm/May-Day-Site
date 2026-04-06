
import React from "react";
import { exportCSV } from "../utils/exportCSV";

export default function ResourcesView({ resources = [] }) {
  return (
    <div>
      <h2>Resources</h2>
      <button onClick={() => exportCSV(resources, "resources.csv")}>
        Export CSV
      </button>

      {resources.map((r, i) => (
        <div key={i}>
          {r.name} — {r.quantity}
        </div>
      ))}
    </div>
  );
}
