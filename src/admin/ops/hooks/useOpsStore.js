
import React from "react";
import { createInitialOpsState, normalizeOpsState, inferProgrammingCategory } from "../seedData";
import { loadOpsState, saveOpsState, clearOpsState } from "../utils/storage";

const OpsStoreContext = React.createContext(null);

export function OpsStoreProvider({ children }) {
  const [state, setState] = React.useState(() => {
    const existing = loadOpsState();
    return existing ? normalizeOpsState(existing) : createInitialOpsState();
  });

  React.useEffect(() => {
    saveOpsState(state);
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

    const syncProgrammingBudget = (current, programItem) => {
      const costNumber = Number(programItem.cost || 0);
      const budgetId = `budget_prog_${programItem.id}`;
      const existing = current.budget.find((item) => item.id === budgetId);
      if (!costNumber) {
        return existing
          ? current.budget.filter((item) => item.id !== budgetId)
          : current.budget;
      }
      const budgetRow = {
        id: budgetId,
        item: programItem.activity || "Programming item",
        category: "Programming",
        cost: costNumber,
        paid: existing ? existing.paid : false,
        notes: "Auto-linked from programming",
      };
      if (existing) {
        return current.budget.map((item) => item.id === budgetId ? budgetRow : item);
      }
      return [budgetRow, ...current.budget];
    };

    const addItem = (collectionName, item) => {
      setState((current) => {
        let normalizedItem = item;
        let nextBudget = current.budget;
        if (collectionName === "programming") {
          normalizedItem = { ...item, category: item.category || inferProgrammingCategory(item) };
          nextBudget = syncProgrammingBudget(current, normalizedItem);
        }
        return {
          ...current,
          budget: nextBudget,
          [collectionName]: [normalizedItem, ...current[collectionName]],
        };
      });
    };

    const updateItem = (collectionName, id, updates) => {
      if (collectionName === "programming") {
        setState((current) => {
          const currentItem = current.programming.find((item) => item.id === id) || {};
          const nextItem = { ...currentItem, ...updates, category: (updates.category || currentItem.category || inferProgrammingCategory({ ...currentItem, ...updates })) };
          return {
            ...current,
            programming: current.programming.map((item) => item.id === id ? nextItem : item),
            budget: syncProgrammingBudget(current, nextItem),
          };
        });
        return;
      }
      updateCollection(collectionName, id, () => updates);
    };

    const removeItem = (collectionName, id) => {
      setState((current) => ({
        ...current,
        [collectionName]: current[collectionName].filter((item) => item.id !== id),
      }));
    };

    const replaceState = (nextState) => setState(normalizeOpsState(nextState));
    const resetToWorkbookSeed = () => {
      clearOpsState();
      setState(createInitialOpsState());
    };

    return {
      state,
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
      replaceState,
      resetToWorkbookSeed,
      toggleVolunteerCheckIn: (id) =>
        setState((current) => ({
          ...current,
          volunteers: current.volunteers.map((item) =>
            item.id === id ? { ...item, checkedIn: !item.checkedIn } : item
          ),
        })),
      setState,
    };
  }, [state]);

  return React.createElement(OpsStoreContext.Provider, { value: api }, children);
}

export function useOpsStore() {
  const context = React.useContext(OpsStoreContext);
  if (!context) {
    throw new Error("useOpsStore must be used inside OpsStoreProvider");
  }
  return context;
}
