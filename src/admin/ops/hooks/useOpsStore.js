import React from "react";
import { createInitialOpsState, normalizeOpsState, inferProgrammingCategory } from "../seedData";
import { loadOpsState, saveOpsState, clearOpsState } from "../utils/storage";

const OpsStoreContext = React.createContext(null);
const ADMIN_PASSWORD_KEY = 'maydayApplicationsPassword';

function getAdminPassword() {
  try {
    return window.sessionStorage.getItem(ADMIN_PASSWORD_KEY) || "";
  } catch {
    return "";
  }
}

function withAuthHeaders(extra = {}) {
  const password = getAdminPassword();
  return password
    ? { ...extra, 'x-applications-password': password }
    : extra;
}

function inferAreaFromRole(role = "") {
  const text = String(role).toLowerCase();
  if (/food|kitchen|snack|buffet/.test(text)) return "Food";
  if (/art|zine|craft/.test(text)) return "Programming";
  if (/welcome|greeting|front/.test(text)) return "Front of House";
  if (/security|safety|med/.test(text)) return "Safety";
  if (/cleanup|tear ?down/.test(text)) return "Cleanup";
  if (/hunt|game|activity/.test(text)) return "Activities";
  return "General";
}

function mergeById(currentRows, nextRows) {
  const map = new Map(currentRows.map((row) => [row.id, row]));
  nextRows.forEach((row) => map.set(row.id, { ...map.get(row.id), ...row }));
  return Array.from(map.values());
}

async function fetchSubmissions(type) {
  const response = await fetch(`/api/forms/submissions?type=${encodeURIComponent(type)}`, {
    headers: withAuthHeaders({ Accept: 'application/json' }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error || `Could not load ${type} submissions.`);
  return Array.isArray(data?.items) ? data.items : [];
}

function mapPerformerSubmission(item) {
  const payload = item.payload || {};
  return {
    id: `prog_form_${item.id}`,
    sourceSubmissionId: item.id,
    activity: item.subject_name || payload.artist_name || item.contact_name || 'Performer',
    category: 'Performance',
    location: payload.location || '',
    time: '',
    lead: item.contact_name || '',
    needs: payload.tech_needs || '',
    cost: '',
    status: 'Planned',
    notes: [payload.description, payload.links, payload.notes].filter(Boolean).join(' | '),
  };
}

function mapVendorSubmission(item) {
  const payload = item.payload || {};
  return {
    id: `sponsor_form_${item.id}`,
    sourceSubmissionId: item.id,
    name: item.subject_name || payload.organization_name || item.contact_name || 'Vendor',
    type: 'Vendor/Sponsor',
    contact: [item.contact_name, item.email, item.phone].filter(Boolean).join(' | '),
    status: 'Pending',
    notes: [payload.description, payload.needs, payload.website, payload.social_links, payload.notes].filter(Boolean).join(' | '),
  };
}

function mapVolunteerSubmission(item) {
  const payload = item.payload || {};
  const preferred = Array.isArray(payload.preferred_roles) ? payload.preferred_roles[0] : null;
  return {
    id: `vol_form_${item.id}`,
    sourceSubmissionId: item.id,
    name: item.contact_name || '',
    role: preferred?.role || item.subject_name || 'Volunteer applicant',
    area: preferred?.area || inferAreaFromRole(preferred?.role || item.subject_name || ''),
    shiftDate: preferred?.shift_date || '',
    shiftStart: preferred?.shift_start || '',
    shiftEnd: preferred?.shift_end || '',
    contact: [item.email, item.phone].filter(Boolean).join(' | '),
    status: 'Tentative',
    checkedIn: false,
    notes: [payload.availability, payload.notes].filter(Boolean).join(' | '),
  };
}

export function OpsStoreProvider({ children }) {
  const [state, setState] = React.useState(() => {
    const existing = loadOpsState();
    return existing ? normalizeOpsState(existing) : createInitialOpsState();
  });
  const [connection, setConnection] = React.useState({ hydrated: false, saving: false, lastSavedAt: '', mode: 'local', error: '' });
  const skipFirstSave = React.useRef(true);

  React.useEffect(() => {
    let alive = true;
    async function hydrate() {
      const existing = loadOpsState();
      if (existing && alive) setState(normalizeOpsState(existing));
      const password = getAdminPassword();
      if (!password) {
        if (alive) setConnection({ hydrated: true, saving: false, lastSavedAt: '', mode: 'local', error: 'Unlock admin first if you want D1-backed persistence.' });
        return;
      }
      try {
        const response = await fetch('/api/ops/state', { headers: withAuthHeaders({ Accept: 'application/json' }) });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data?.error || 'Could not load saved ops state.');
        if (!alive) return;
        if (data?.state) {
          setState(normalizeOpsState(data.state));
          saveOpsState(normalizeOpsState(data.state));
        }
        setConnection({ hydrated: true, saving: false, lastSavedAt: data?.updatedAt || '', mode: 'remote', error: '' });
      } catch (error) {
        if (!alive) return;
        setConnection({ hydrated: true, saving: false, lastSavedAt: '', mode: 'local', error: error?.message || 'Could not load remote ops state.' });
      }
    }
    hydrate();
    return () => { alive = false; };
  }, []);

  React.useEffect(() => {
    saveOpsState(state);
    if (!connection.hydrated) return;
    if (skipFirstSave.current) {
      skipFirstSave.current = false;
      return;
    }
    const password = getAdminPassword();
    if (!password) return;
    const timer = window.setTimeout(async () => {
      try {
        setConnection((current) => ({ ...current, saving: true, error: '' }));
        const response = await fetch('/api/ops/state', {
          method: 'POST',
          headers: withAuthHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ state }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data?.error || 'Could not save ops state.');
        setConnection((current) => ({ ...current, saving: false, lastSavedAt: data?.updatedAt || new Date().toISOString(), mode: 'remote', error: '' }));
      } catch (error) {
        setConnection((current) => ({ ...current, saving: false, mode: 'local', error: error?.message || 'Could not save ops state.' }));
      }
    }, 600);
    return () => window.clearTimeout(timer);
  }, [state, connection.hydrated]);

  const api = React.useMemo(() => {
    const updateCollection = (collectionName, id, updater) => {
      setState((current) => ({
        ...current,
        [collectionName]: current[collectionName].map((item) => item.id === id ? { ...item, ...updater(item) } : item),
      }));
    };

    const syncProgrammingBudget = (current, programItem) => {
      const costNumber = Number(programItem.cost || 0);
      const budgetId = `budget_prog_${programItem.id}`;
      const existing = current.budget.find((item) => item.id === budgetId);
      if (!costNumber) return existing ? current.budget.filter((item) => item.id !== budgetId) : current.budget;
      const budgetRow = { id: budgetId, item: programItem.activity || 'Programming item', category: 'Programming', cost: costNumber, paid: existing ? existing.paid : false, notes: 'Auto-linked from programming' };
      return existing ? current.budget.map((item) => item.id === budgetId ? budgetRow : item) : [budgetRow, ...current.budget];
    };

    const addItem = (collectionName, item) => {
      setState((current) => {
        let normalizedItem = item;
        let nextBudget = current.budget;
        if (collectionName === 'programming') {
          normalizedItem = { ...item, category: item.category || inferProgrammingCategory(item) };
          nextBudget = syncProgrammingBudget(current, normalizedItem);
        }
        return { ...current, budget: nextBudget, [collectionName]: [normalizedItem, ...current[collectionName]] };
      });
    };

    const updateItem = (collectionName, id, updates) => {
      if (collectionName === 'programming') {
        setState((current) => {
          const currentItem = current.programming.find((item) => item.id === id) || {};
          const nextItem = { ...currentItem, ...updates, category: (updates.category || currentItem.category || inferProgrammingCategory({ ...currentItem, ...updates })) };
          return { ...current, programming: current.programming.map((item) => item.id === id ? nextItem : item), budget: syncProgrammingBudget(current, nextItem) };
        });
        return;
      }
      updateCollection(collectionName, id, () => updates);
    };

    const removeItem = (collectionName, id) => {
      setState((current) => ({ ...current, [collectionName]: current[collectionName].filter((item) => item.id !== id) }));
    };

    const replaceState = (nextState) => setState(normalizeOpsState(nextState));
    const resetToWorkbookSeed = () => { clearOpsState(); setState(createInitialOpsState()); };

    return {
      state,
      connection,
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
      toggleVolunteerCheckIn: (id) => setState((current) => ({ ...current, volunteers: current.volunteers.map((item) => item.id === id ? { ...item, checkedIn: !item.checkedIn } : item) })),
      setState,
      syncPerformersFromForms: async () => {
        const items = await fetchSubmissions('performer');
        const mapped = items.map(mapPerformerSubmission);
        setState((current) => ({ ...current, programming: mergeById(current.programming, mapped) }));
        return mapped.length;
      },
      syncVendorsFromForms: async () => {
        const items = await fetchSubmissions('vendor');
        const mapped = items.map(mapVendorSubmission);
        setState((current) => ({ ...current, sponsors: mergeById(current.sponsors, mapped) }));
        return mapped.length;
      },
      syncVolunteersFromForms: async () => {
        const items = await fetchSubmissions('volunteer');
        const mapped = items.map(mapVolunteerSubmission);
        setState((current) => ({ ...current, volunteers: mergeById(current.volunteers, mapped) }));
        return mapped.length;
      },
    };
  }, [state, connection]);

  return React.createElement(OpsStoreContext.Provider, { value: api }, children);
}

export function useOpsStore() {
  const context = React.useContext(OpsStoreContext);
  if (!context) throw new Error('useOpsStore must be used inside OpsStoreProvider');
  return context;
}
