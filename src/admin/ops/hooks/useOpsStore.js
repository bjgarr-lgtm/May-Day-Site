
import React from "react";
import { createInitialOpsState, normalizeOpsState } from "../seedData";
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

  return <OpsStoreContext.Provider value={api}>{children}</OpsStoreContext.Provider>;
}

export function useOpsStore() {
  const context = React.useContext(OpsStoreContext);
  if (!context) {
    throw new Error("useOpsStore must be used inside OpsStoreProvider");
  }
  return context;
}
