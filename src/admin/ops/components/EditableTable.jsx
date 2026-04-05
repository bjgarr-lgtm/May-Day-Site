import React from "react";

export default function EditableTable({
  columns,
  rows,
  onEdit,
  onDelete,
  emptyLabel = "Nothing here yet.",
  rowClassName,
  pageSize = 10,
}) {
  const [page, setPage] = React.useState(1);
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));

  React.useEffect(() => {
    setPage(1);
  }, [rows.length]);

  React.useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount);
    }
  }, [page, pageCount]);

  if (!rows.length) {
    return <div className="ops-empty">{emptyLabel}</div>;
  }

  const start = (page - 1) * pageSize;
  const currentRows = rows.slice(start, start + pageSize);

  return (
    <div className="ops-table-stack">
      <div className="ops-table-wrap">
        <table className="ops-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key}>{column.label}</th>
              ))}
              <th className="ops-actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentRows.map((row) => (
              <tr key={row.id} className={rowClassName ? rowClassName(row) : ""}>
                {columns.map((column) => (
                  <td key={column.key} data-label={column.label}>
                    {column.render ? column.render(row[column.key], row) : row[column.key] || "—"}
                  </td>
                ))}
                <td data-label="Actions">
                  <div className="ops-row-actions">
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
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pageCount > 1 && (
        <div className="ops-pagination">
          <button type="button" className="ops-button ops-button-small ops-button-secondary" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            Prev
          </button>
          <span className="ops-pagination-label">Page {page} of {pageCount}</span>
          <button type="button" className="ops-button ops-button-small ops-button-secondary" onClick={() => setPage((p) => Math.min(pageCount, p + 1))} disabled={page === pageCount}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}
