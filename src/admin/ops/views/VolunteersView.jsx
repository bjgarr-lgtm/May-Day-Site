
import React from "react";
import { exportCSV } from "../utils/exportCSV";

export default function VolunteersView({ volunteers = [] }) {
  return (
    <div>
      <h2>Volunteers</h2>
      <button onClick={() => exportCSV(volunteers, "volunteers.csv")}>
        Export CSV
      </button>

      {volunteers.map((v, i) => (
        <div key={i}>
          {v.name}
        </div>
      ))}
    </div>
  );
}
