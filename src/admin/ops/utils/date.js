
export function isOverdue(value) {
  if (!value) return false;
  const endOfDay = new Date(value);
  if (Number.isNaN(endOfDay.getTime())) return false;
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay < new Date();
}

export function isToday(value) {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const now = new Date();
  return date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
}

export function isWithinDays(value, days = 7) {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const now = new Date();
  const max = new Date();
  max.setDate(now.getDate() + days);
  return date >= startOfToday() && date <= max;
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
