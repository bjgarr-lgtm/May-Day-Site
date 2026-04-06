import React from "react";
import { createInitialOpsState, normalizeOpsState, inferProgrammingCategory } from "../seedData";
import { loadOpsState, saveOpsState } from "../utils/storage";

const OpsStoreContext = React.createContext(null);
const PASSWORD_STORAGE_KEY = "maydayApplicationsPassword";

function getPassword() {
  try {
    return sessionStorage.getItem(PASSWORD_STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

function textIncludes(a = "", b = "") {
  const aa = String(a).trim().toLowerCase();
  const bb = String(b).trim().toLowerCase();
  return !!aa && !!bb && (aa.includes(bb) || bb.includes(aa));
}

function makeSourceKey(item = {}) {
  return `${item.sourceType || ""}::${item.sourceId || ""}`;
}

function upsertBySource(collection = [], incoming = []) {
  const existingBySource = new Map();
  const existingById = new Map();
  collection.forEach((item) => {
    existingById.set(item.id, item);
    if (item.sourceType && item.sourceId) existingBySource.set(makeSourceKey(item), item);
  });

  const next = [...collection];
  incoming.forEach((item) => {
    const sourceKey = makeSourceKey(item);
    const existing = (item.sourceType && item.sourceId && existingBySource.get(sourceKey)) || existingById.get(item.id);
    if (existing) {
      Object.assign(existing, { ...existing, ...item });
    } else {
      next.unshift(item);
    }
  });

  return next.map((item) => ({ ...item }));
}

function mapPerformerSubmission(submission) {
  const payload = submission?.payload || {};
  return {
    id: `prog_form_${submission.id}`,
    sourceType: "form_submission",
    sourceId: submission.id,
    activity: payload.artist_name || submission.subject_name || "Performer",
    category: "Performance",
    location: payload.location || "",
    time: "",
    lead: submission.contact_name || "",
    needs: payload.tech_needs || "",
    cost: "",
    status: "Confirmed",
    notes: [payload.genre, payload.links, payload.description, payload.notes].filter(Boolean).join(" • "),
  };
}

function mapVendorSubmission(submission) {
  const payload = submission?.payload || {};
  return {
    id: `sponsor_form_${submission.id}`,
    sourceType: "form_submission",
    sourceId: submission.id,
    name: payload.organization_name || submission.subject_name || submission.contact_name || "Vendor",
    type: "Vendor",
    contact: [submission.contact_name, submission.email, submission.phone].filter(Boolean).join(" • "),
    status: "Pending",
    notes: [payload.description, payload.needs, payload.website, payload.social_links, payload.notes].filter(Boolean).join(" • "),
  };
}

function tryAssignVolunteerToOpenShift(volunteers, submission) {
  const payload = submission?.payload || {};
  const preferredRole = payload.preferred_role || submission.subject_name || "";
  const backupRole = payload.backup_role || "";
  const notes = [payload.availability, payload.notes].filter(Boolean).join(" • ");
  const contact = [submission.email, submission.phone].filter(Boolean).join(" • ");

  const matchIndex = volunteers.findIndex((item) => {
    const open = !String(item.name || "").trim() || item.status === "Needs Assignment";
    return open && (textIncludes(item.role, preferredRole) || textIncludes(item.role, backupRole));
  });

  if (matchIndex >= 0) {
    const next = volunteers.map((item, index) =>
      index === matchIndex
        ? {
            ...item,
            sourceType: "form_submission",
            sourceId: submission.id,
            name: submission.contact_name || item.name,
            contact: contact || item.contact,
            status: "Confirmed",
            notes: [item.notes, notes].filter(Boolean).join(" • "),
          }
        : item
    );
    return { volunteers: next, matched: true };
  }

  return {
    volunteers: upsertBySource(volunteers, [
      {
        id: `vol_form_${submission.id}`,
        sourceType: "form_submission",
        sourceId: submission.id,
        name: submission.contact_name || "",
        role: preferredRole || "Volunteer",
        area: "General",
        shiftDate: "",
        shiftStart: "",
        shiftEnd: "",
        contact,
        status: "Confirmed",
        checkedIn: false,
        notes,
      },
    ]),
    matched: false,
  };
}

async function fetchSubmissions(type) {
  const password = getPassword();
  if (!password) throw new Error("Unlock admin first so sync can authenticate.");
  const response = await fetch(`/api/forms/submissions?type=${encodeURIComponent(type)}`, {
    headers: {
      Accept: "application/json",
      "x-applications-password": password,
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error || `Could not sync ${type} submissions.`);
  return Array.isArray(data?.items) ? data.items : [];
}

export function OpsStoreProvider({ children }) {
  const [state, setState] = React.useState(() => {
    const existing = loadOpsState();
    return existing ? normalizeOpsState(existing) : createInitialOpsState();
  });
  const [remoteStatus, setRemoteStatus] = React.useState("idle");
  const [syncStatus, setSyncStatus] = React.useState({
    vendors: "idle",
    performers: "idle",
    volunteers: "idle",
  });

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

    const syncPerformers = async () => {
      setSyncStatus((current) => ({ ...current, performers: "syncing" }));
      try {
        const items = await fetchSubmissions("performer");
        const mapped = items.map(mapPerformerSubmission).map((item) => ({
          ...item,
          category: item.category || inferProgrammingCategory(item),
        }));
        setState((current) => normalizeOpsState({
          ...current,
          programming: upsertBySource(current.programming, mapped),
        }));
        setSyncStatus((current) => ({ ...current, performers: "done" }));
        return mapped.length;
      } catch (error) {
        setSyncStatus((current) => ({ ...current, performers: error?.message || "error" }));
        throw error;
      }
    };

    const syncVendors = async () => {
      setSyncStatus((current) => ({ ...current, vendors: "syncing" }));
      try {
        const items = await fetchSubmissions("vendor");
        const mapped = items.map(mapVendorSubmission);
        setState((current) => normalizeOpsState({
          ...current,
          sponsors: upsertBySource(current.sponsors, mapped),
        }));
        setSyncStatus((current) => ({ ...current, vendors: "done" }));
        return mapped.length;
      } catch (error) {
        setSyncStatus((current) => ({ ...current, vendors: error?.message || "error" }));
        throw error;
      }
    };

    const syncVolunteers = async () => {
      setSyncStatus((current) => ({ ...current, volunteers: "syncing" }));
      try {
        const items = await fetchSubmissions("volunteer");
        setState((current) => {
          let volunteers = [...current.volunteers];
          items.forEach((submission) => {
            const result = tryAssignVolunteerToOpenShift(volunteers, submission);
            volunteers = result.volunteers;
          });
          return normalizeOpsState({ ...current, volunteers });
        });
        setSyncStatus((current) => ({ ...current, volunteers: "done" }));
        return items.length;
      } catch (error) {
        setSyncStatus((current) => ({ ...current, volunteers: error?.message || "error" }));
        throw error;
      }
    };

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
      replaceState: (nextState) => setState(normalizeOpsState(nextState)),
      toggleVolunteerCheckIn: (id) =>
        setState((current) => ({
          ...current,
          volunteers: current.volunteers.map((item) =>
            item.id === id ? { ...item, checkedIn: !item.checkedIn } : item
          ),
        })),
      syncPerformers,
      syncVendors,
      syncVolunteers,
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
