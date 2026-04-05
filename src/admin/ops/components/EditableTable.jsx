import React from "react";

const PAGE_SIZE = 10;
const DEFAULT_WIDTH = 160;
const ACTIONS_WIDTH = 150;

function loadWidths(tableKey) {
  if (!tableKey) return {};
  try {
    return JSON.parse(window.localStorage.getItem(`ops-col-widths:${tableKey}`) || "{}");
  } catch {
    return {};
  }
}

function saveWidths(tableKey, widths) {
  if (!tableKey) return;
  try {
    window.localStorage.setItem(`ops-col-widths:${tableKey}`, JSON.stringify(widths));
  } catch {
    // ignore
  }
}

function NotesCell({ value }) {
  const [expanded, setExpanded] = React.useState(false);
  const text = value || "—";
  const isLong = String(text).length > 48;
  if (!isLong) return <span>{text}</span>;
  return (
    <div className="ops-note-preview">
      <span className="ops-note-preview-text" title={text}>{expanded ? text : `${String(text).slice(0, 48)}…`}</span>
      <button type="button" className="ops-linkish" onClick={() => setExpanded((v) => !v)}>{expanded ? "Less" : "More"}</button>
    </div>
  );
}

export default function EditableTable({ columns, rows, onEdit, onDelete, emptyLabel = "Nothing here yet.", rowClassName, tableKey }) {
  const [page, setPage] = React.useState(1);
  const [widths, setWidths] = React.useState(() => loadWidths(tableKey));
  React.useEffect(() => setPage(1), [rows]);
  React.useEffect(() => saveWidths(tableKey, widths), [tableKey, widths]);

  const startResize = (columnKey, event) => {
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = Number(widths[columnKey] || DEFAULT_WIDTH);
    function onMove(moveEvent) {
      const nextWidth = Math.max(96, startWidth + (moveEvent.clientX - startX));
      setWidths((current) => ({ ...current, [columnKey]: nextWidth }));
    }
    function onUp() {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    }
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  if (!rows.length) return <div className="ops-empty">{emptyLabel}</div>;
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const pageRows = rows.slice(start, start + PAGE_SIZE);

  return (
    <>
      <div className="ops-table-wrap">
        <table className="ops-table">
          <colgroup>
            {columns.map((column) => <col key={column.key} style={{ width: widths[column.key] || column.width || DEFAULT_WIDTH }} />)}
            <col style={{ width: ACTIONS_WIDTH }} />
          </colgroup>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key}>
                  <div className="ops-th-inner">
                    <span>{column.label}</span>
                    <button type="button" className="ops-col-resize" onMouseDown={(event) => startResize(column.key, event)} aria-label={`Resize ${column.label} column`} />
                  </div>
                </th>
              ))}
              <th className="ops-actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row) => (
              <tr key={row.id} className={rowClassName ? rowClassName(row) : ""}>
                {columns.map((column) => {
                  const rawValue = column.render ? column.render(row[column.key], row) : row[column.key];
                  const content = ["notes", "dependencies", "needs"].includes(column.key) && typeof rawValue !== "object" ? <NotesCell value={rawValue} /> : (rawValue || "—");
                  return <td key={column.key} data-col={column.key} title={typeof rawValue === 'string' ? rawValue : undefined}>{content}</td>;
                })}
                <td className="ops-row-actions" data-col="actions">
                  <button type="button" className="ops-button ops-button-small" onClick={() => onEdit(row)}>Edit</button>
                  <button type="button" className="ops-button ops-button-small ops-button-danger" onClick={() => onDelete(row.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="ops-pagination">
        <div className="ops-pagination-info">Showing {start + 1}-{Math.min(start + PAGE_SIZE, rows.length)} of {rows.length}</div>
        <div className="ops-row-actions">
          <button type="button" className="ops-button ops-button-small ops-button-secondary" disabled={safePage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</button>
          <div className="ops-pagination-info">Page {safePage} of {totalPages}</div>
          <button type="button" className="ops-button ops-button-small ops-button-secondary" disabled={safePage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</button>
        </div>
      </div>
    </>
  );
}
