
import React from "react";

export default function RunOfShowPrint({ items = [] }) {
  return (
    <div>
      <h1>Run of Show</h1>
      {items.map((item, i) => (
        <div key={i}>
          <strong>{item.time}</strong> — {item.name} ({item.location})
        </div>
      ))}
    </div>
  );
}
