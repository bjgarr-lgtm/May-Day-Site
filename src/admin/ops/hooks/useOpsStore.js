import React from "react";
import { createInitialOpsState, normalizeOpsState } from "../seedData";
import { loadOpsState, saveOpsState } from "../utils/storage";
import { buildWebsiteProgrammingRows, buildWebsiteTimelineRows } from "../utils/siteScheduleImport";

const OpsStoreContext = React.createContext(null);
const PASSWORD_STORAGE_KEY = "maydayApplicationsPassword";
const LINKED_COLLECTIONS = ["tasks", "timeline", "programming", "inventory", "sponsors", "budget", "volunteers", "runOfShow"];

function getPassword() {
  try {
    return sessionStorage.getItem(PASSWORD_STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

function nowIso() {
  return new Date().toISOString();
}

function normalizeLinkedItem(item, fallbackType = "local") {
  const linked = item && typeof item === "object" ? item : {};
  return {
    ...linked,
    sourceType: linked.sourceType || fallbackType,
    sourceId: linked.sourceId || "",
    syncStatus: linked.syncStatus || (linked.sourceId ? "synced" : "local"),
    linkedAt: linked.linkedAt || (linked.sourceId ? linked.updatedAt || nowIso() : ""),
    updatedAt: linked.updatedAt || "",
  };
}

function normalizeLinkedState(state) {
  const next = normalizeOpsState(state || createInitialOpsState());
  for (const key of LINKED_COLLECTIONS) {
    next[key] = Array.isArray(next[key]) ? next[key].map((item) => normalizeLinkedItem(item)) : [];
  }
  return next;
}

function parseResponse(response) {
  return response.json().catch(() => ({})).then((data) => ({ ok: response.ok, data }));
}

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}


function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function parseClockToMinutes(value) {
  const raw = cleanText(value).toLowerCase();
  if (!raw) return null;
  const match = raw.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (!match) return null;
  let hours = Number(match[1]);
  const minutes = Number(match[2] || 0);
  const meridiem = match[3];
  if (meridiem === "pm" && hours !== 12) hours += 12;
  if (meridiem === "am" && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

function parseRange(rawValue) {
  const raw = cleanText(rawValue).toLowerCase();
  if (!raw) return { start: null, end: null };
  if (raw.includes(" to ")) {
    const [left, right] = raw.split(/\s+to\s+/i);
    const start = parseClockToMinutes(left);
    let end = parseClockToMinutes(right);
    if (start != null && end != null && end <= start) end += 12 * 60;
    return { start, end };
  }
  const start = parseClockToMinutes(raw);
  return { start, end: start != null ? start + 60 : null };
}

function sameDay(left, right) {
  return cleanText(left) && cleanText(right) && cleanText(left) === cleanText(right);
}

function rangesOverlap(a, b) {
  if (a.start == null || a.end == null || b.start == null || b.end == null) return false;
  return a.start < b.end && b.start < a.end;
}

function buildResourceNeedList(value) {
  return cleanText(value)
    .split(/[;,\n]/)
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function computeProgrammingConflicts(programming) {
  const conflicts = [];
  const items = Array.isArray(programming) ? programming : [];
  for (let i = 0; i < items.length; i += 1) {
    for (let j = i + 1; j < items.length; j += 1) {
      const left = items[i];
      const right = items[j];
      const sameDate = !cleanText(left.date) || !cleanText(right.date) || sameDay(left.date, right.date);
      if (!sameDate) continue;

      const leftRange = parseRange(left.timeStart && left.timeEnd ? `${left.timeStart} to ${left.timeEnd}` : left.time);
      const rightRange = parseRange(right.timeStart && right.timeEnd ? `${right.timeStart} to ${right.timeEnd}` : right.time);
      const overlap = rangesOverlap(leftRange, rightRange) || (cleanText(left.time) && cleanText(left.time) === cleanText(right.time));

      if (!overlap) continue;

      const sameLocation = cleanText(left.location) && slugify(left.location) === slugify(right.location);
      const sameLead = cleanText(left.lead) && slugify(left.lead) === slugify(right.lead);
      if (!sameLocation && !sameLead) continue;

      conflicts.push({
        id: `conflict_${left.id}_${right.id}`,
        leftId: left.id,
        rightId: right.id,
        leftLabel: left.activity,
        rightLabel: right.activity,
        summary: `${left.activity} conflicts with ${right.activity}${sameLocation ? ` at ${left.location}` : ""}${sameLead ? ` with lead ${left.lead}` : ""}`,
        sameLocation,
        sameLead,
      });
    }
  }
  return conflicts;
}

function computeVolunteerConflicts(volunteers) {
  const conflicts = [];
  const items = (Array.isArray(volunteers) ? volunteers : []).filter((item) => cleanText(item.name));
  for (let i = 0; i < items.length; i += 1) {
    for (let j = i + 1; j < items.length; j += 1) {
      const left = items[i];
      const right = items[j];
      if (slugify(left.name) !== slugify(right.name)) continue;
      if (!sameDay(left.shiftDate, right.shiftDate)) continue;
      const overlap = rangesOverlap(
        { start: parseClockToMinutes(left.shiftStart), end: parseClockToMinutes(left.shiftEnd) || (parseClockToMinutes(left.shiftStart) != null ? parseClockToMinutes(left.shiftStart) + 60 : null) },
        { start: parseClockToMinutes(right.shiftStart), end: parseClockToMinutes(right.shiftEnd) || (parseClockToMinutes(right.shiftStart) != null ? parseClockToMinutes(right.shiftStart) + 60 : null) }
      );
      if (!overlap) continue;
      conflicts.push({
        id: `vol_conflict_${left.id}_${right.id}`,
        summary: `${left.name} is double booked for ${left.role} and ${right.role}`,
        volunteer: left.name,
        leftId: left.id,
        rightId: right.id,
      });
    }
  }
  return conflicts;
}

function computeUncoveredVolunteerShifts(volunteers) {
  return (Array.isArray(volunteers) ? volunteers : []).filter((item) => !cleanText(item.name) || item.status === "Needs Assignment");
}

function computeResourceIssues(programming, inventory) {
  const stock = Array.isArray(inventory) ? inventory : [];
  const issues = [];
  (Array.isArray(programming) ? programming : []).forEach((item) => {
    buildResourceNeedList(item.needs).forEach((need) => {
      const match = stock.find((resource) => slugify(resource.item || resource.name) === slugify(need));
      if (!match) {
        issues.push({
          id: `resource_${item.id}_${need}`,
          programmingId: item.id,
          summary: `${item.activity} needs ${need} but inventory does not list it`,
          need,
        });
      }
    });
  });
  return issues;
}

function computeBlockedTasks(tasks) {
  const list = Array.isArray(tasks) ? tasks : [];
  const titleMap = new Map(list.map((item) => [slugify(item.title), item]));
  return list.filter((task) => {
    if (task.status === "Blocked") return true;
    const dependencies = cleanText(task.dependencies || task.notes)
      .split(/[;,\n]/)
      .map((item) => slugify(item))
      .filter(Boolean);
    if (!dependencies.length) return false;
    return dependencies.some((dep) => {
      const linked = titleMap.get(dep);
      return linked && linked.status !== "Done";
    });
  });
}

function computeDueSoonTasks(tasks, days = 7) {
  const now = Date.now();
  const limit = now + days * 24 * 60 * 60 * 1000;
  return (Array.isArray(tasks) ? tasks : []).filter((task) => {
    if (task.status === "Done" || !task.deadline) return false;
    const stamp = new Date(task.deadline).getTime();
    return Number.isFinite(stamp) && stamp >= now && stamp <= limit;
  });
}

function computeOverdueTasks(tasks) {
  const now = Date.now();
  return (Array.isArray(tasks) ? tasks : []).filter((task) => {
    if (task.status === "Done" || !task.deadline) return false;
    const stamp = new Date(task.deadline).getTime();
    return Number.isFinite(stamp) && stamp < now;
  });
}

function computeReadiness(overdueTasks, blockedTasks, programmingConflicts, volunteerConflicts, uncoveredVolunteerShifts, resourceIssues) {
  const penalty = (
    overdueTasks.length * 5 +
    blockedTasks.length * 4 +
    programmingConflicts.length * 8 +
    volunteerConflicts.length * 6 +
    uncoveredVolunteerShifts.length * 3 +
    resourceIssues.length * 4
  );
  const score = Math.max(0, 100 - penalty);
  return {
    score,
    breakdown: {
      overdue: overdueTasks.length,
      blocked: blockedTasks.length,
      programmingConflicts: programmingConflicts.length,
      volunteerConflicts: volunteerConflicts.length,
      uncoveredVolunteerShifts: uncoveredVolunteerShifts.length,
      resourceIssues: resourceIssues.length,
    },
  };
}


function makeRoleSlug(value) {
  return cleanText(value).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function chooseVolunteerArea(role) {
  const text = makeRoleSlug(role);
  if (/safety|security|medic/.test(text)) return "Safety";
  if (/food|kitchen|bev|coffee/.test(text)) return "Food";
  if (/art|zine|activity|craft|hunt/.test(text)) return "Activities";
  if (/welcome|front|greeter|table/.test(text)) return "Front of House";
  if (/cleanup|teardown|ops|setup/.test(text)) return "Ops";
  if (/music|perform|program/.test(text)) return "Programming";
  return "General";
}

function mergeItemBySource(items, nextItem) {
  const sourceType = nextItem.sourceType || "form_submission";
  const sourceId = nextItem.sourceId || "";
  if (sourceId) {
    const index = items.findIndex((item) => item.sourceType === sourceType && item.sourceId === sourceId);
    if (index >= 0) {
      const existing = items[index];
      const merged = {
        ...existing,
        ...nextItem,
        id: existing.id,
        sourceType,
        sourceId,
        syncStatus: existing.syncStatus === "modified" ? "modified" : "synced",
        linkedAt: existing.linkedAt || nextItem.linkedAt || nowIso(),
      };
      return [merged, items.filter((_, idx) => idx !== index)];
    }
  }
  return [normalizeLinkedItem(nextItem, sourceType), items];
}

function applyCollectionMerge(items, incomingItems) {
  let working = Array.isArray(items) ? [...items] : [];
  for (const incoming of incomingItems) {
    const [merged, rest] = mergeItemBySource(working, incoming);
    working = [merged, ...rest];
  }
  return working;
}

function performerSubmissionToProgramming(submission) {
  const payload = submission.payload || {};
  const links = [cleanText(payload.links), cleanText(payload.location)].filter(Boolean).join(" · ");
  return normalizeLinkedItem({
    id: `prog_${submission.id}`,
    activity: cleanText(payload.artist_name || submission.subject_name) || "Unnamed performer",
    category: "Performance",
    location: "",
    time: "",
    lead: cleanText(payload.name || submission.contact_name),
    needs: cleanText(payload.tech_needs),
    cost: "",
    status: "Planned",
    notes: [cleanText(payload.description), links, cleanText(payload.notes)].filter(Boolean).join(" | "),
    sourceType: "form_submission",
    sourceId: submission.id,
    linkedAt: submission.created_at || nowIso(),
    updatedAt: submission.created_at || nowIso(),
    syncStatus: "synced",
  }, "form_submission");
}

function vendorSubmissionToSponsor(submission) {
  const payload = submission.payload || {};
  const notes = [
    cleanText(payload.description),
    cleanText(payload.needs),
    cleanText(payload.website),
    cleanText(payload.social_links),
    cleanText(payload.notes),
  ].filter(Boolean).join(" | ");
  return normalizeLinkedItem({
    id: `sponsor_${submission.id}`,
    name: cleanText(payload.organization_name || submission.subject_name) || "Unnamed vendor",
    type: "Vendor",
    contact: [cleanText(payload.name || submission.contact_name), cleanText(payload.email || submission.email), cleanText(payload.phone || submission.phone)].filter(Boolean).join(" · "),
    status: "Pending",
    notes,
    sourceType: "form_submission",
    sourceId: submission.id,
    linkedAt: submission.created_at || nowIso(),
    updatedAt: submission.created_at || nowIso(),
    syncStatus: "synced",
  }, "form_submission");
}

function volunteerSubmissionToVolunteer(submission, currentVolunteers) {
  const payload = submission.payload || {};
  const preferredRole = cleanText(payload.preferred_role || submission.subject_name) || "Volunteer";
  const backupRole = cleanText(payload.backup_role);
  const availability = cleanText(payload.availability);
  const notes = [backupRole ? `Backup: ${backupRole}` : "", availability ? `Availability: ${availability}` : "", cleanText(payload.notes)].filter(Boolean).join(" | ");
  const sourceType = "form_submission";
  const sourceId = submission.id;
  const linkedAt = submission.created_at || nowIso();

  const existingLinked = (currentVolunteers || []).find((item) => item.sourceType === sourceType && item.sourceId === sourceId);
  if (existingLinked) {
    return normalizeLinkedItem({
      ...existingLinked,
      name: cleanText(payload.name || submission.contact_name),
      role: existingLinked.role || preferredRole,
      area: existingLinked.area || chooseVolunteerArea(preferredRole),
      contact: [cleanText(payload.email || submission.email), cleanText(payload.phone || submission.phone)].filter(Boolean).join(" · "),
      notes,
      sourceType,
      sourceId,
      linkedAt: existingLinked.linkedAt || linkedAt,
      updatedAt: linkedAt,
      syncStatus: existingLinked.syncStatus === "modified" ? "modified" : "synced",
    }, sourceType);
  }

  const preferredSlug = makeRoleSlug(preferredRole);
  const matchingOpenShift = (currentVolunteers || []).find((item) => {
    if (item.name && cleanText(item.name)) return false;
    if (item.sourceId) return false;
    const roleSlug = makeRoleSlug(item.role);
    return roleSlug && preferredSlug && (roleSlug.includes(preferredSlug) || preferredSlug.includes(roleSlug));
  });

  if (matchingOpenShift) {
    return normalizeLinkedItem({
      ...matchingOpenShift,
      name: cleanText(payload.name || submission.contact_name),
      role: matchingOpenShift.role || preferredRole,
      area: matchingOpenShift.area || chooseVolunteerArea(preferredRole),
      contact: [cleanText(payload.email || submission.email), cleanText(payload.phone || submission.phone)].filter(Boolean).join(" · "),
      status: "Confirmed",
      notes: [matchingOpenShift.notes, notes].filter(Boolean).join(" | "),
      sourceType,
      sourceId,
      linkedAt,
      updatedAt: linkedAt,
      syncStatus: "synced",
    }, sourceType);
  }

  return normalizeLinkedItem({
    id: `vol_${submission.id}`,
    name: cleanText(payload.name || submission.contact_name),
    role: preferredRole,
    area: chooseVolunteerArea(preferredRole),
    shiftDate: "",
    shiftStart: "",
    shiftEnd: "",
    contact: [cleanText(payload.email || submission.email), cleanText(payload.phone || submission.phone)].filter(Boolean).join(" · "),
    status: "Confirmed",
    checkedIn: false,
    notes,
    sourceType,
    sourceId,
    linkedAt,
    updatedAt: linkedAt,
    syncStatus: "synced",
  }, sourceType);
}

export function OpsStoreProvider({ children }) {
  const [state, setState] = React.useState(() => {
    const existing = loadOpsState();
    return existing ? normalizeLinkedState(existing) : normalizeLinkedState(createInitialOpsState());
  });
  const [remoteStatus, setRemoteStatus] = React.useState("idle");
  const [syncStatus, setSyncStatus] = React.useState({ performers: "idle", vendors: "idle", volunteers: "idle" });

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
      .then(parseResponse)
      .then(({ ok, data }) => {
        if (!isMounted || !ok || !data?.state) return;
        setState((current) => normalizeLinkedState(data.state || current));
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

  const api = React.useMemo(() => {
    const updateCollection = (collectionName, id, updater) => {
      setState((current) => ({
        ...current,
        [collectionName]: current[collectionName].map((item) => {
          if (item.id !== id) return item;
          const next = normalizeLinkedItem({ ...item, ...updater(item) }, item.sourceType || "local");
          if (next.sourceId) next.syncStatus = "modified";
          next.updatedAt = nowIso();
          return next;
        }),
      }));
    };

    const addItem = (collectionName, item) => {
      const nextItem = normalizeLinkedItem({
        ...item,
        updatedAt: nowIso(),
      }, item?.sourceType || "local");
      setState((current) => ({
        ...current,
        [collectionName]: [nextItem, ...current[collectionName]],
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

    const syncFromSubmissions = async (type) => {
      const password = getPassword();
      if (!password) throw new Error("Unlock admin first.");
      const syncKey = `${type}s`;
      setSyncStatus((current) => ({ ...current, [syncKey]: "loading" }));
      const response = await fetch(`/api/forms/submissions?type=${encodeURIComponent(type)}`, {
        headers: {
          Accept: "application/json",
          "x-applications-password": password,
        },
      });
      const { ok, data } = await parseResponse(response);
      if (!ok) {
        setSyncStatus((current) => ({ ...current, [syncKey]: "error" }));
        throw new Error(data?.error || `Could not sync ${type} submissions.`);
      }
      const items = Array.isArray(data?.items) ? data.items : [];
      setState((current) => {
        if (type === "performer") {
          return {
            ...current,
            programming: applyCollectionMerge(current.programming, items.map(performerSubmissionToProgramming)),
          };
        }
        if (type === "vendor") {
          return {
            ...current,
            sponsors: applyCollectionMerge(current.sponsors, items.map(vendorSubmissionToSponsor)),
          };
        }
        if (type === "volunteer") {
          const mapped = items.map((submission) => volunteerSubmissionToVolunteer(submission, current.volunteers));
          return {
            ...current,
            volunteers: applyCollectionMerge(current.volunteers, mapped),
          };
        }
        return current;
      });
      setSyncStatus((current) => ({ ...current, [syncKey]: "saved" }));
      return items.length;
    };

    const importWebsiteSchedule = () => {
      const incomingProgramming = buildWebsiteProgrammingRows();
      const incomingTimeline = buildWebsiteTimelineRows();
      setState((current) => ({
        ...current,
        programming: applyCollectionMerge(current.programming, incomingProgramming),
        timeline: applyCollectionMerge(current.timeline, incomingTimeline),
      }));
      return {
        programming: incomingProgramming.length,
        timeline: incomingTimeline.length,
      };
    };

    const markRecordSynced = (collectionName, id) => {
      setState((current) => ({
        ...current,
        [collectionName]: current[collectionName].map((item) =>
          item.id === id ? normalizeLinkedItem({ ...item, syncStatus: "synced", updatedAt: nowIso() }, item.sourceType || "local") : item
        ),
      }));
    };

    const overdueTasks = computeOverdueTasks(state.tasks);
    const dueSoonTasks = computeDueSoonTasks(state.tasks);
    const blockedTasks = computeBlockedTasks(state.tasks);
    const programmingConflicts = computeProgrammingConflicts(state.programming);
    const volunteerConflicts = computeVolunteerConflicts(state.volunteers);
    const uncoveredVolunteerShifts = computeUncoveredVolunteerShifts(state.volunteers);
    const resourceIssues = computeResourceIssues(state.programming, state.inventory);
    const readiness = computeReadiness(
      overdueTasks,
      blockedTasks,
      programmingConflicts,
      volunteerConflicts,
      uncoveredVolunteerShifts,
      resourceIssues
    );

    return {
      state,
      remoteStatus,
      syncStatus,
      tasks: state.tasks,
      timeline: state.timeline,
      programming: state.programming,
      inventory: state.inventory,
      sponsors: state.sponsors,
      budget: state.budget,
      volunteers: state.volunteers,
      runOfShow: state.runOfShow,
      addItem,
      updateItem,
      removeItem,
      replaceState: (nextState) => setState(normalizeLinkedState(nextState)),
      toggleVolunteerCheckIn: (id) =>
        setState((current) => ({
          ...current,
          volunteers: current.volunteers.map((item) =>
            item.id === id ? { ...item, checkedIn: !item.checkedIn, updatedAt: nowIso(), syncStatus: item.sourceId ? "modified" : item.syncStatus } : item
          ),
        })),
      syncPerformers: () => syncFromSubmissions("performer"),
      syncVendors: () => syncFromSubmissions("vendor"),
      syncVolunteers: () => syncFromSubmissions("volunteer"),
      importWebsiteSchedule,
      markRecordSynced,
      overdueTasks,
      dueSoonTasks,
      blockedTasks,
      programmingConflicts,
      volunteerConflicts,
      uncoveredVolunteerShifts,
      resourceIssues,
      readinessScore: readiness.score,
      readinessBreakdown: readiness.breakdown,
      setState,
    };
  }, [state, remoteStatus, syncStatus]);

  return React.createElement(OpsStoreContext.Provider, { value: api }, children);
}

export function useOpsStore() {
  const context = React.useContext(OpsStoreContext);
  if (!context) {
    throw new Error("useOpsStore must be used inside OpsStoreProvider");
  }
  return context;
}
