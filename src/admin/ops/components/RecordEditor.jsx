import React from "react";

export default function RecordEditor({
  title,
  fields,
  value,
  onChange,
  onSave,
  onCancel,
  isOpen = true,
  onToggle,
  mode = "add",
  editorRef,
}) {
  const localRef = React.useRef(null);

  React.useEffect(() => {
    if (!isOpen) return;
    const node = (editorRef && "current" in editorRef ? editorRef.current : null) || localRef.current;
    if (!node) return;
    const firstField = node.querySelector("input:not([type='checkbox']), select, textarea");
    if (firstField) firstField.focus();
  }, [isOpen, editorRef]);

  return (
    <div className="ops-editor" ref={editorRef || localRef}>
      <div className="ops-editor-header">
        <div>
          <h3>{title}</h3>
          {mode === "edit" && isOpen ? <p className="ops-editor-kicker">Editing existing item</p> : null}
        </div>
        {onToggle ? (
          <button type="button" className="ops-button ops-button-small ops-button-secondary ops-collapsible-toggle" onClick={onToggle}>
            {isOpen ? "Hide editor" : mode === "edit" ? "Edit item" : "Add item"}
          </button>
        ) : null}
      </div>
      {isOpen ? (
        <>
          <div className="ops-form-grid">
            {fields.map((field) => (
              <label key={field.name} className={`ops-field ${field.full ? "full" : ""}`}>
                <span>{field.label}</span>
                {field.type === "textarea" ? (
                  <textarea
                    rows={field.rows || 3}
                    value={value[field.name] || ""}
                    onChange={(e) => onChange(field.name, e.target.value)}
                    placeholder={field.placeholder || ""}
                  />
                ) : field.type === "select" ? (
                  <select value={value[field.name] || ""} onChange={(e) => onChange(field.name, e.target.value)}>
                    {(field.options || []).map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                ) : field.type === "checkbox" ? (
                  <input type="checkbox" checked={Boolean(value[field.name])} onChange={(e) => onChange(field.name, e.target.checked)} />
                ) : (
                  <input
                    type={field.type || "text"}
                    value={value[field.name] || ""}
                    onChange={(e) => onChange(field.name, e.target.value)}
                    placeholder={field.placeholder || ""}
                  />
                )}
              </label>
            ))}
          </div>
          <div className="ops-editor-actions">
            <button type="button" className="ops-button" onClick={onSave}>{mode === "edit" ? "Save changes" : "Save"}</button>
            <button type="button" className="ops-button ops-button-secondary" onClick={onCancel}>Cancel</button>
          </div>
        </>
      ) : null}
    </div>
  );
}
