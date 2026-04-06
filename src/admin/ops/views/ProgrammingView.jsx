
import React from "react";
import { exportCSV } from "../utils/exportCSV";

export default function ProgrammingView({ items = [] }) {
  return (
    <div>
      <h2>Programming</h2>

      <div style={{ marginBottom: "10px" }}>
        <button onClick={() => exportCSV(items, "programming.csv")}>
          Export CSV
        </button>
        <button onClick={() => window.print()}>
          Print
        </button>
      </div>

      {items.map((item, i) => (
        <div key={i}>
          {item.name} — {item.time} @ {item.location}
        </div>
      ))}
    </div>
  );
}
