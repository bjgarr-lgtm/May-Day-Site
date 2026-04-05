import React from "react";

export default function RecordEditor({
  title,
  fields,
  value,
  onChange,
  onSave,
  onCancel,
  editorRef,
  editingLabel,
  autoFocusToken,
}) {
  const rootRef = React.useRef(null);
  const combinedRef = React.useCallback(
    (node) => {
      rootRef.current = node;
      if (!editorRef) return;
      if (typeof editorRef === "function") editorRef(node);
      else editorRef.current = node;
    },
    [editorRef]
  );

  React.useEffect(() => {
    if (!autoFocusToken || !rootRef.current) return;
    const firstField = rootRef.current.querySelector("input:not([type='checkbox']), textarea, select");
    if (firstField && typeof firstField.focus === "function") {
      firstField.focus();
      if (typeof firstField.select === "function" && firstField.tagName === "INPUT") firstField.select();
    }
  }, [autoFocusToken]);

  return (
    <div className="ops-editor" ref={combinedRef}>
      <div className="ops-editor-header">
        <div>
          <h3>{title}</h3>
          {editingLabel ? <p className="ops-editor-status">Editing: {editingLabel}</p> : null}
        </div>
      </div>
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
              <select
                value={value[field.name] || ""}
                onChange={(e) => onChange(field.name, e.target.value)}
              >
                {(field.options || []).map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : field.type === "checkbox" ? (
              <input
                type="checkbox"
                checked={Boolean(value[field.name])}
                onChange={(e) => onChange(field.name, e.target.checked)}
              />
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
        <button className="ops-button" onClick={onSave}>
          Save
        </button>
        <button className="ops-button ops-button-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
