
import React from "react";

export default function RunOfShowView({ items = [], warnings = [] }) {
  return (
    <div>
      <h2>Run of Show</h2>

      {warnings.length > 0 && (
        <div style={{ background: "#fee", padding: "10px", marginBottom: "10px" }}>
          <strong>Warnings:</strong>
          <ul>
            {warnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      )}

      {items.map((item, i) => (
        <div key={i} style={{ padding: "6px 0", borderBottom: "1px solid #ddd" }}>
          <strong>{item.time}</strong> — {item.name} ({item.location})
        </div>
      ))}

      <button onClick={() => window.print()}>Print</button>
    </div>
  );
}
