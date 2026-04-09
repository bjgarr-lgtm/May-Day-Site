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

    // ✅ ensure vendors always exists (this fixes your crash indirectly)
    return {
      ...base,
      vendors: base.vendors || [],
    };
  });

  const [remoteStatus, setRemoteStatus] = React.useState("idle");

  React.useEffect(() => {
    let isMounted = true;
    const password = getPassword();
    if (!password) return;

    fetch("/api/ops/state", {
      headers: {
        Accept: "application/json",
        "x-applications-password": password,
      },
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!isMounted || !ok || !data?.state) return;

        const normalized = normalizeOpsState(data.state);

        setState({
          ...normalized,
          vendors: normalized.vendors || [],
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
    if (!password) return;

    setRemoteStatus("saving");

    const timeout = setTimeout(async () => {
      try {
        const res = await fetch("/api/ops/state", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-applications-password": password,
          },
          body: JSON.stringify({ state }),
        });

        if (!res.ok) throw new Error();

        setRemoteStatus("saved");
      } catch {
        setRemoteStatus("offline");
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [state]);

  const api = React.useMemo(() => {
    const addItem = (collection, item) => {
      setState((current) => ({
        ...current,
        [collection]: [item, ...(current[collection] || [])],
      }));
    };

    const updateItem = (collection, id, updates) => {
      setState((current) => ({
        ...current,
        [collection]: current[collection].map((i) =>
          i.id === id ? { ...i, ...updates } : i
        ),
      }));
    };

    const removeItem = (collection, id) => {
      setState((current) => ({
        ...current,
        [collection]: current[collection].filter((i) => i.id !== id),
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

  return (
    <OpsStoreContext.Provider value={api}>
      {children}
    </OpsStoreContext.Provider>
  );
}

export function useOpsStore() {
  const ctx = React.useContext(OpsStoreContext);
  if (!ctx) throw new Error("useOpsStore must be used inside provider");
  return ctx;
}