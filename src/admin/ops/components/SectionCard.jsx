import React from "react";

export default function SectionCard({ title, subtitle, actions, children }) {
  return (
    <section className="ops-section-card">
      <div className="ops-section-header">
        <div>
          <h2>{title}</h2>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        {actions ? <div className="ops-section-actions">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}