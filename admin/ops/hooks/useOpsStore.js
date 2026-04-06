import React from "react";
import { createInitialOpsState, normalizeOpsState } from "../seedData";
import { loadOpsState, saveOpsState } from "../utils/storage";
import { isOverdue, isWithinDays } from "../utils/date";

const OpsStoreContext = React.createContext(null);
const PASSWORD_STORAGE_KEY = "maydayApplicationsPassword";

function getPassword() {
  try {
    return sessionStorage.getItem(PASSWORD_STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function slugify(value) {
  return normalizeText(value).replace(/[^a-z0-9]+/g, " ").trim();
}

function parseClockToMinutes(value) {
  if (!value) return null;
  const match = String(value).trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
  if (!match) return null;
  let hours = Number(match[1]);
  const minutes = Number(match[2] || 0);
  const suffix = (match[3] || "").toLowerCase();
  if (suffix === "pm" && hours !== 12) hours += 12;
  if (suffix === "am" && hours === 12) hours = 0;
  if (hours > 23 || minutes > 59) return null;
  return (hours * 60) + minutes;
}

function parseRangeText(value) {
  const text = String(value || "").trim();
  if (!text) return { start: null, end: null, label: "" };

  const explicitRange = text.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\s*(?:-|–|—|to)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i);
  if (explicitRange) {
    const start = parseClockToMinutes(explicitRange[1]);
    const end = parseClockToMinutes(explicitRange[2]);
    if (start != null && end != null) {
      return { start, end: end <= start ? end + (12 * 60) : end, label: text };
    }
  }

  const single = text.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i);
  if (single) {
    const start = parseClockToMinutes(single[1]);
    if (start != null) {
      return { start, end: start + 60, label: text };
    }
  }

  return { start: null, end: null, label: text };
}

function rangesOverlap(a, b) {
  if (a.start == null || a.end == null || b.start == null || b.end == null) return false;
  return a.start < b.end && b.start < a.end;
}

function sameDay(a, b) {
  const left = normalizeText(a);
  const right = normalizeText(b);
  if (!left || !right) return true;
  return left === right;
}

function splitList(value) {
  return String(value || "")
    .split(/\n|,|;|\//)
    .map((part) => part.trim())
    .filter(Boolean);
}

function parseNeedEntry(value) {
  const raw = String(value || "").trim();
  if (!raw) return null;
  const qtyMatch = raw.match(/^(\d+)\s+(.+)$/);
  if (qtyMatch) {
    return { label: qtyMatch[2].trim(), quantity: Number(qtyMatch[1]) || 1, raw };
  }
  return { label: raw, quantity: 1, raw };
}

function parseQuantity(value) {
  if (value == null || value === "") return 0;
  if (typeof value === "number") return value;
  const match = String(value).match(/\d+/);
  return match ? Number(match[0]) : 0;
}

function computeProgrammingConflicts(programming) {
  const conflicts = [];
  const byItem = {};

  for (let i = 0; i < programming.length; i += 1) {
    for (let j = i + 1; j < programming.length; j += 1) {
      const left = programming[i];
      const right = programming[j];
      const leftRange = parseRangeText(left.time);
      const rightRange = parseRangeText(right.time);
      const sameSlot = rangesOverlap(leftRange, rightRange) || (normalizeText(left.time) && normalizeText(left.time) === normalizeText(right.time));
      if (!sameSlot) continue;
      if (!sameDay(left.date, right.date)) continue;

      const reasons = [];
      if (slugify(left.location) && slugify(left.location) === slugify(right.location)) reasons.push("same location");
      if (slugify(left.lead) && slugify(left.lead) === slugify(right.lead)) reasons.push("same lead");
      if (!reasons.length && sameSlot) reasons.push("overlapping time");
      if (!reasons.length) continue;

      const record = {
        id: `prog_conflict_${left.id}_${right.id}`,
        leftId: left.id,
        rightId: right.id,
        leftLabel: left.activity,
        rightLabel: right.activity,
        date: left.date || right.date || "",
        time: left.time || right.time || "",
        reasons,
        summary: `${left.activity} conflicts with ${right.activity} (${reasons.join(", ")})`,
      };
      conflicts.push(record);
      byItem[left.id] = [...(byItem[left.id] || []), record];
      byItem[right.id] = [...(byItem[right.id] || []), record];
    }
  }

  return { conflicts, byItem };
}

function computeVolunteerConflicts(volunteers) {
  const conflicts = [];
  const byItem = {};

  for (let i = 0; i < volunteers.length; i += 1) {
    for (let j = i + 1; j < volunteers.length; j += 1) {
      const left = volunteers[i];
      const right = volunteers[j];
      if (!slugify(left.name) || slugify(left.name) !== slugify(right.name)) continue;
      if (!sameDay(left.shiftDate, right.shiftDate)) continue;
      const leftRange = { start: parseClockToMinutes(left.shiftStart), end: parseClockToMinutes(left.shiftEnd || left.shiftStart) };
      const rightRange = { start: parseClockToMinutes(right.shiftStart), end: parseClockToMinutes(right.shiftEnd || right.shiftStart) };
      if (leftRange.start != null && leftRange.end != null && leftRange.end <= leftRange.start) leftRange.end += 60;
      if (rightRange.start != null && rightRange.end != null && rightRange.end <= rightRange.start) rightRange.end += 60;
      if (!rangesOverlap(leftRange, rightRange)) continue;

      const record = {
        id: `vol_conflict_${left.id}_${right.id}`,
        leftId: left.id,
        rightId: right.id,
        volunteer: left.name,
        summary: `${left.name} is double-booked for ${left.role} and ${right.role}`,
      };
      conflicts.push(record);
      byItem[left.id] = [...(byItem[left.id] || []), record];
      byItem[right.id] = [...(byItem[right.id] || []), record];
    }
  }

  return { conflicts, byItem };
}

function computeResourceIssues(programming, inventory) {
  const inventoryPool = inventory.map((item) => ({
    id: item.id,
    label: item.item,
    slug: slugify(item.item),
    quantity: Math.max(1, parseQuantity(item.quantity) || 1),
  }));

  const issues = [];
  const byProgramming = {};

  programming.forEach((item) => {
    const needs = splitList(item.needs).map(parseNeedEntry).filter(Boolean);
    if (!needs.length) return;

    const itemIssues = [];
    needs.forEach((need) => {
      const wanted = slugify(need.label);
      const match = inventoryPool.find((resource) => resource.slug.includes(wanted) || wanted.includes(resource.slug));
      if (!match) {
        itemIssues.push({ type: "missing", need: need.raw, required: need.quantity, available: 0 });
        return;
      }
      if (match.quantity < need.quantity) {
        itemIssues.push({ type: "short", need: need.raw, required: need.quantity, available: match.quantity, resourceId: match.id });
      }
    });

    if (itemIssues.length) {
      byProgramming[item.id] = itemIssues;
      issues.push({
        id: `resource_issue_${item.id}`,
        programmingId: item.id,
        activity: item.activity,
        issues: itemIssues,
        summary: `${item.activity} is missing ${itemIssues.map((issue) => issue.need).join(", ")}`,
      });
    }
  });

  return { issues, byProgramming };
}

function computeTaskDependencies(tasks) {
  const incompleteTitles = new Set(tasks.filter((task) => task.status !== "Done").map((task) => slugify(task.title)));
  return tasks.filter((task) => {
    const deps = splitList(task.dependencies || task.notes).filter((value) => /depend/i.test(task.notes || "") || task.dependencies);
    if (!deps.length) return false;
    return deps.some((dep) => incompleteTitles.has(slugify(dep)));
  }).map((task) => ({
    ...task,
    blockedBy: splitList(task.dependencies || "").filter(Boolean),
  }));
}

function computeIntelligence(state) {
  const overdueTasks = state.tasks.filter((task) => task.status !== "Done" && isOverdue(task.deadline));
  const dueSoonTasks = state.tasks.filter((task) => task.status !== "Done" && isWithinDays(task.deadline, 3));
  const blockedTasks = computeTaskDependencies(state.tasks);
  const uncoveredVolunteerShifts = state.volunteers.filter((item) => !normalizeText(item.name) || item.status === "Needs Assignment");
  const programmingConflicts = computeProgrammingConflicts(state.programming);
  const volunteerConflicts = computeVolunteerConflicts(state.volunteers);
  const resourceIssues = computeResourceIssues(state.programming, state.inventory);

  return {
    overdueTasks,
    dueSoonTasks,
    blockedTasks,
    uncoveredVolunteerShifts,
    programmingConflicts: programmingConflicts.conflicts,
    programmingConflictsById: programmingConflicts.byItem,
    volunteerConflicts: volunteerConflicts.conflicts,
    volunteerConflictsById: volunteerConflicts.byItem,
    resourceIssues: resourceIssues.issues,
    resourceIssuesByProgrammingId: resourceIssues.byProgramming,
  };
}

export function OpsStoreProvider({ children }) {
  const [state, setState] = React.useState(() => {
    const existing = loadOpsState();
    return existing ? normalizeOpsState(existing) : createInitialOpsState();
  });
  const [remoteStatus, setRemoteStatus] = React.useState("idle");

  React.useEffect(() => {
    let isMounted = true;
    const password = getPassword();
    if (!password) return undefined;

    fetch("/api/ops/state", {
      headers: {
        Accept: "application/json",
        "x-applications-password": password,
      },
    })
      .then((response) => response.json().then((data) => ({ ok: response.ok, data })))
      .then(({ ok, data }) => {
        if (!isMounted || !ok || !data?.state) return;
        setState((current) => normalizeOpsState(data.state || current));
        setRemoteStatus("loaded");
      })
      .catch(() => {
        if (!isMounted) return;
        setRemoteStatus("offline");
      });

    return () => {
      isMounted = false;
    };
  }, []);

  React.useEffect(() => {
    saveOpsState(state);
  }, [state]);

  React.useEffect(() => {
    const password = getPassword();
    if (!password) return undefined;

    setRemoteStatus("saving");
    const timeout = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/ops/state", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-applications-password": password,
          },
          body: JSON.stringify({ state }),
        });
        if (!response.ok) throw new Error("save failed");
        setRemoteStatus("saved");
      } catch {
        setRemoteStatus("offline");
      }
    }, 500);

    return () => window.clearTimeout(timeout);
  }, [state]);

  const intelligence = React.useMemo(() => computeIntelligence(state), [state]);

  const api = React.useMemo(() => {
    const updateCollection = (collectionName, id, updater) => {
      setState((current) => ({
        ...current,
        [collectionName]: current[collectionName].map((item) =>
          item.id === id ? { ...item, ...updater(item) } : item
        ),
      }));
    };

    const addItem = (collectionName, item) => {
      setState((current) => ({
        ...current,
        [collectionName]: [item, ...current[collectionName]],
      }));
    };

    const updateItem = (collectionName, id, updates) => {
      updateCollection(collectionName, id, () => updates);
    };

    const removeItem = (collectionName, id) => {
      setState((current) => ({
        ...current,
        [collectionName]: current[collectionName].filter((item) => item.id !== id),
      }));
    };

    return {
      state,
      remoteStatus,
      tasks: state.tasks,
      timeline: state.timeline,
      programming: state.programming,
      inventory: state.inventory,
      sponsors: state.sponsors,
      budget: state.budget,
      volunteers: state.volunteers,
      runOfShow: state.runOfShow,
      ...intelligence,
      addItem,
      updateItem,
      removeItem,
      replaceState: (nextState) => setState(normalizeOpsState(nextState)),
      toggleVolunteerCheckIn: (id) =>
        setState((current) => ({
          ...current,
          volunteers: current.volunteers.map((item) =>
            item.id === id ? { ...item, checkedIn: !item.checkedIn } : item
          ),
        })),
      setState,
    };
  }, [state, remoteStatus, intelligence]);

  return React.createElement(OpsStoreContext.Provider, { value: api }, children);
}

export function useOpsStore() {
  const context = React.useContext(OpsStoreContext);
  if (!context) {
    throw new Error("useOpsStore must be used inside OpsStoreProvider");
  }
  return context;
}
