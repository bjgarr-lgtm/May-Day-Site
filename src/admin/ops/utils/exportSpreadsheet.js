export function exportRowsAsCsv(filename, columns, rows) {
  const header = columns.map((c) => c.label);
  const lines = [header, ...rows.map((row) => columns.map((column) => {
    const value = typeof column.exportValue === "function"
      ? column.exportValue(row[column.key], row)
      : row[column.key];
    return value == null ? "" : String(value).replace(/"/g, '""');
  }))];
  const csv = lines.map((line) => line.map((cell) => `"${cell}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
