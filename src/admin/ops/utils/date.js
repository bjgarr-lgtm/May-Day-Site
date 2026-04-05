export function isOverdue(dateValue) {
  if (!dateValue) return false;
  const d = new Date(dateValue);
  d.setHours(23, 59, 59, 999);
  return d < new Date();
}

export function toDateInput(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export function formatDate(value) {
  if (!value) return "Unscheduled";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(dateValue, timeValue) {
  const date = formatDate(dateValue);
  return timeValue ? `${date} at ${timeValue}` : date;
}

export function startOfToday() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}