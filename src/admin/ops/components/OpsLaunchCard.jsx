
import React from "react";
import { Link } from "react-router-dom";

export default function OpsLaunchCard() {
  return (
    <Link to="/admin/ops" className="ops-launch-card">
      <div className="ops-launch-eyebrow">Backend</div>
      <div className="ops-launch-title">May Day Ops Console</div>
      <div className="ops-launch-copy">
        Tasks, timeline, programming, inventory, sponsors, and budget in one place.
      </div>
      <div className="ops-launch-cta">Open console</div>
    </Link>
  );
}
