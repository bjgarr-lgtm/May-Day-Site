import React from "react";

function readLocal(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocal(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function CellText({ value }) {
  const [expanded, setExpanded] = React.useState(false);
  const text = value == null || value === "" ? "—" : String(value);
  const long = text.length > 70;
  if (!long) return <span>{text}</span>;
  return (
    <button type="button" className="ops-cell-toggle" onClick={() => setExpanded((current) => !current)}>
      {expanded ? text : `${text.slice(0, 67)}...`}
    </button>
  );
}

export default function EditableTable({
  tableKey = "default",
  columns,
  rows,
  onEdit,
  onDelete,
  emptyLabel = "Nothing here yet.",
  rowClassName,
  pageSize = 10,
}) {
  const widthsKey = `opsTableWidths:${tableKey}`;
  const hiddenKey = `opsTableHidden:${tableKey}`;
  const [widths, setWidths] = React.useState(() => readLocal(widthsKey, {}));
  const [hiddenKeys, setHiddenKeys] = React.useState(() => readLocal(hiddenKey, []));
  const [managerOpen, setManagerOpen] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const resizeRef = React.useRef(null);
  const managerRef = React.useRef(null);

  React.useEffect(() => writeLocal(widthsKey, widths), [widths, widthsKey]);
  React.useEffect(() => writeLocal(hiddenKey, hiddenKeys), [hiddenKey, hiddenKeys]);

  React.useEffect(() => () => {
    if (resizeRef.current?.cleanup) resizeRef.current.cleanup();
  }, []);

  React.useEffect(() => {
    setPage(1);
  }, [rows.length, tableKey]);

  React.useEffect(() => {
    const onClick = (event) => {
      if (!managerRef.current?.contains(event.target)) setManagerOpen(false);
    };
    if (managerOpen) window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [managerOpen]);

  const visibleColumns = columns.filter((column) => !hiddenKeys.includes(column.key));

  const startResize = (columnKey, event) => {
    event.preventDefault();
    event.stopPropagation();
    const startX = event.clientX;
    const currentWidth = Number(widths[columnKey] || columns.find((item) => item.key === columnKey)?.width || 180);

    const onMove = (moveEvent) => {
      const delta = moveEvent.clientX - startX;
      const next = Math.max(96, currentWidth + delta);
      setWidths((current) => ({ ...current, [columnKey]: next }));
    };

    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    resizeRef.current = { cleanup: onUp };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const toggleColumn = (columnKey) => {
    setHiddenKeys((current) =>
      current.includes(columnKey) ? current.filter((item) => item !== columnKey) : [...current, columnKey]
    );
  };

  const restoreColumns = () => {
    setHiddenKeys([]);
    setWidths({});
  };

  if (!rows.length) {
    return <div className="ops-empty">{emptyLabel}</div>;
  }

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = rows.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <div className="ops-table-shell">
      <div className="ops-table-controls">
        <div className="ops-table-controls-note">Resize, hide, and restore columns without losing the whole damn table.</div>
        <div className="ops-column-manager-wrap" ref={managerRef}>
          <button type="button" className="ops-button ops-button-secondary ops-button-small" onClick={() => setManagerOpen((current) => !current)}>
            Columns
          </button>
          {managerOpen ? (
            <div className="ops-column-manager">
              {columns.map((column) => {
                const checked = !hiddenKeys.includes(column.key);
                return (
                  <label key={column.key} className="ops-column-option">
                    <input type="checkbox" checked={checked} onChange={() => toggleColumn(column.key)} />
                    <span>{column.label}</span>
                  </label>
                );
              })}
              <button type="button" className="ops-button ops-button-small" onClick={restoreColumns}>Restore all</button>
            </div>
          ) : null}
        </div>
      </div>
      <div className="ops-table-wrap">
        <table className="ops-table ops-table-spreadsheet">
          <thead>
            <tr>
              {visibleColumns.map((column) => (
                <th key={column.key} style={{ width: widths[column.key] || column.width || 180 }}>
                  <div className="ops-th-inner">
                    <span>{column.label}</span>
                    <span className="ops-resize-handle" onMouseDown={(event) => startResize(column.key, event)} />
                  </div>
                </th>
              ))}
              <th className="ops-actions-col" style={{ width: 120 }}>
                <div className="ops-th-inner"><span>Actions</span></div>
              </th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row) => (
              <tr key={row.id} className={rowClassName ? rowClassName(row) : ""}>
                {visibleColumns.map((column) => {
                  const rendered = column.render ? column.render(row[column.key], row) : row[column.key];
                  return (
                    <td key={column.key} style={{ width: widths[column.key] || column.width || 180 }}>
                      {React.isValidElement(rendered) ? rendered : <CellText value={rendered} />}
                    </td>
                  );
                })}
                <td className="ops-row-actions">
                  <button type="button" className="ops-button ops-button-small" onClick={() => onEdit(row)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="ops-button ops-button-small ops-button-danger"
                    onClick={() => onDelete(row.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 ? (
        <div className="ops-table-pagination">
          <span className="ops-table-pagination-copy">Showing {(safePage - 1) * pageSize + 1} to {Math.min(safePage * pageSize, rows.length)} of {rows.length}</span>
          <div className="ops-table-pagination-actions">
            <button type="button" className="ops-button ops-button-small ops-button-secondary" disabled={safePage === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</button>
            <span className="ops-table-page-pill">Page {safePage} of {totalPages}</span>
            <button type="button" className="ops-button ops-button-small ops-button-secondary" disabled={safePage === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>Next</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
