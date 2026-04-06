import React from "react";
import { createInitialOpsState, normalizeOpsState } from "../seedData";
import { loadOpsState, saveOpsState } from "../utils/storage";

const OpsStoreContext = React.createContext(null);
const PASSWORD_STORAGE_KEY = "maydayApplicationsPassword";


function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeProgrammingItem(item) {
  return {
    ...item,
    activity: cleanText(item.activity),
    category: cleanText(item.category) || "General",
    location: cleanText(item.location),
    date: cleanText(item.date),
    time: cleanText(item.time),
    lead: cleanText(item.lead),
    needs: cleanText(item.needs),
    cost: item.cost === 0 ? 0 : item.cost || "",
    status: cleanText(item.status) || "Planned",
    notes: cleanText(item.notes),
  };
}

function buildTimelineRowFromProgramming(programItem) {
  const timelineId = programItem.linkedTimelineId || `timeline_prog_${programItem.id}`;
  return {
    id: timelineId,
    date: programItem.date || "",
    time: programItem.time || "",
    activity: programItem.activity || "",
    location: programItem.location || "",
    lead: programItem.lead || "",
    dependencies: "",
    notes: programItem.notes || "",
    sourceType: "programming",
    sourceId: programItem.id,
    linkedProgrammingId: programItem.id,
  };
}

function buildBudgetRowFromProgramming(programItem, existing) {
  const budgetId = existing?.id || programItem.linkedBudgetId || `budget_prog_${programItem.id}`;
  return {
    id: budgetId,
    item: programItem.activity || "",
    category: "Programming",
    cost: programItem.cost,
    paid: existing?.paid || false,
    notes: existing?.notes || "",
    sourceType: "programming",
    sourceId: programItem.id,
    linkedProgrammingId: programItem.id,
  };
}

function removeLinkedRows(current, programId) {
  return {
    ...current,
    timeline: current.timeline.filter((item) => item.linkedProgrammingId !== programId && item.sourceId !== programId),
    budget: current.budget.filter((item) => item.linkedProgrammingId !== programId && item.sourceId !== programId),
  };
}

function applyProgrammingPropagation(current, programItem) {
  const nextProgram = normalizeProgrammingItem(programItem);
  const timelineRow = buildTimelineRowFromProgramming(nextProgram);
  const existingBudget = current.budget.find((item) => item.linkedProgrammingId === nextProgram.id || item.sourceId === nextProgram.id);
  const budgetRow = nextProgram.cost ? buildBudgetRowFromProgramming(nextProgram, existingBudget) : null;

  const nextTimeline = nextProgram.date || nextProgram.time
    ? [
        timelineRow,
        ...current.timeline.filter((item) => item.id !== timelineRow.id && item.linkedProgrammingId !== nextProgram.id && item.sourceId !== nextProgram.id),
      ]
    : current.timeline.filter((item) => item.linkedProgrammingId !== nextProgram.id && item.sourceId !== nextProgram.id);

  const nextBudget = budgetRow
    ? [
        budgetRow,
        ...current.budget.filter((item) => item.id !== budgetRow.id && item.linkedProgrammingId !== nextProgram.id && item.sourceId !== nextProgram.id),
      ]
    : current.budget.filter((item) => item.linkedProgrammingId !== nextProgram.id && item.sourceId !== nextProgram.id);

  return {
    ...current,
    timeline: nextTimeline,
    budget: nextBudget,
  };
}

function getPassword() {
  try {
    return sessionStorage.getItem(PASSWORD_STORAGE_KEY) || "";
  } catch {
    return "";
  }
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
      if (collectionName === "programming") {
        const nextProgram = normalizeProgrammingItem(item);
        setState((current) => applyProgrammingPropagation({
          ...current,
          programming: [nextProgram, ...current.programming],
        }, nextProgram));
        return;
      }

      setState((current) => ({
        ...current,
        [collectionName]: [item, ...current[collectionName]],
      }));
    };

    const updateItem = (collectionName, id, updates) => {
      if (collectionName === "programming") {
        setState((current) => {
          const merged = normalizeProgrammingItem({ ...current.programming.find((item) => item.id === id), ...updates });
          const nextState = {
            ...current,
            programming: current.programming.map((item) => (item.id === id ? merged : item)),
          };
          return applyProgrammingPropagation(nextState, merged);
        });
        return;
      }

      updateCollection(collectionName, id, () => updates);
    };

    const removeItem = (collectionName, id) => {
      if (collectionName === "programming") {
        setState((current) => {
          const stripped = {
            ...current,
            programming: current.programming.filter((item) => item.id !== id),
          };
          return removeLinkedRows(stripped, id);
        });
        return;
      }

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
  }, [state, remoteStatus]);

  return React.createElement(OpsStoreContext.Provider, { value: api }, children);
}

export function useOpsStore() {
  const context = React.useContext(OpsStoreContext);
  if (!context) {
    throw new Error("useOpsStore must be used inside OpsStoreProvider");
  }
  return context;
}
