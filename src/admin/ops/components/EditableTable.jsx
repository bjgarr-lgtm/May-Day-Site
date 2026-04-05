import React from "react";

export default function EditableTable({
  columns,
  rows,
  onEdit,
  onDelete,
  emptyLabel = "Nothing here yet.",
  rowClassName,
}) {
  if (!rows.length) {
    return <div className="ops-empty">{emptyLabel}</div>;
  }

  return (
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
          {rows.map((row) => (
            <tr key={row.id} className={rowClassName ? rowClassName(row) : ""}>
              {columns.map((column) => (
                <td key={column.key}>
                  {column.render ? column.render(row[column.key], row) : row[column.key] || "—"}
                </td>
              ))}
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
  );
}