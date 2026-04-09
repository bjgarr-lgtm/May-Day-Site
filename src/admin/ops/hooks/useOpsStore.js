import React from "react";
import { createInitialOpsState, normalizeOpsState } from "../seedData";
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

export function OpsStoreProvider({ children }) {
  const [state, setState] = React.useState(() => {
    const existing = loadOpsState();
    const base = existing ? normalizeOpsState(existing) : createInitialOpsState();
    return {
      ...base,
      vendors: Array.isArray(base.vendors) ? base.vendors : [],
    };
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
        const normalized = normalizeOpsState(data.state);
        setState({
          ...normalized,
          vendors: Array.isArray(normalized.vendors) ? normalized.vendors : [],
        });
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
    const addItem = (collectionName, item) => {
      setState((current) => ({
        ...current,
        [collectionName]: [item, ...(current[collectionName] || [])],
      }));
    };

    const updateItem = (collectionName, id, updates) => {
      setState((current) => ({
        ...current,
        [collectionName]: (current[collectionName] || []).map((item) =>
          item.id === id ? { ...item, ...updates } : item
        ),
      }));
    };

    const removeItem = (collectionName, id) => {
      setState((current) => ({
        ...current,
        [collectionName]: (current[collectionName] || []).filter((item) => item.id !== id),
      }));
    };

    return {
      ...state,
      remoteStatus,
      addItem,
      updateItem,
      removeItem,
      setState,
    };
  }, [state, remoteStatus]);

  return React.createElement(OpsStoreContext.Provider, { value: api }, children);
}

export function useOpsStore() {
  const ctx = React.useContext(OpsStoreContext);
  if (!ctx) throw new Error("useOpsStore must be used inside provider");
  return ctx;
}