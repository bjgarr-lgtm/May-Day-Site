import React from "react";
import { OpsStoreProvider } from "./hooks/useOpsStore";

const DEFAULT_STATUS = "Not Started";
const DEFAULT_PRIORITY = "Medium";
const DEFAULT_RESOURCE_STATUS = "Pending";
const DEFAULT_PROGRAM_STATUS = "Planned";

function makeId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function blankTask() {
  return {
    id: makeId("task"),
    title: "",
    category: "Operations",
    owner: "",
    status: DEFAULT_STATUS,
    priority: DEFAULT_PRIORITY,
    deadline: "",
    notes: "",
  };
}

export function blankTimeline() {
  return {
    id: makeId("time"),
    date: "",
    time: "",
    activity: "",
    location: "",
    lead: "",
    dependencies: "",
    notes: "",
  };
}

export function blankProgramming() {
  return {
    id: makeId("prog"),
    activity: "",
    location: "",
    time: "",
    lead: "",
    needs: "",
    status: DEFAULT_PROGRAM_STATUS,
    notes: "",
  };
}

export function blankInventory() {
  return {
    id: makeId("inv"),
    item: "",
    quantity: "",
    location: "",
    owner: "",
    condition: "",
    notes: "",
  };
}

export function blankSponsor() {
  return {
    id: makeId("sponsor"),
    name: "",
    type: "Sponsor",
    contact: "",
    status: DEFAULT_RESOURCE_STATUS,
    notes: "",
  };
}

export function blankBudget() {
  return {
    id: makeId("budget"),
    item: "",
    category: "General",
    cost: "",
    paid: false,
    notes: "",
  };
}

export function createInitialOpsState() {
  return {
    tasks: [
      {
        id: makeId("task"),
        title: "Finalize radio ad copy",
        category: "Publicity",
        owner: "",
        status: "In Progress",
        priority: "High",
        deadline: "2026-04-10",
        notes: "Pulled from publicity and old labor-plan style notes.",
      },
      {
        id: makeId("task"),
        title: "Assign welcome table printing list",
        category: "Printing",
        owner: "",
        status: DEFAULT_STATUS,
        priority: "High",
        deadline: "2026-04-14",
        notes: "Move anything actionable out of printing sheet into owned tasks.",
      },
      {
        id: makeId("task"),
        title: "Confirm food transport plan",
        category: "Food",
        owner: "",
        status: DEFAULT_STATUS,
        priority: "Critical",
        deadline: "2026-04-12",
        notes: "Spreadsheet had food costs but weak transport accountability.",
      },
      {
        id: makeId("task"),
        title: "Consolidate duplicate sponsor outreach",
        category: "Sponsors",
        owner: "",
        status: "Blocked",
        priority: "Medium",
        deadline: "2026-04-11",
        notes: "Priority sponsors and vendor sheets need one source of truth.",
      },
    ],
    timeline: [
      {
        id: makeId("time"),
        date: "2026-04-10",
        time: "10:00",
        activity: "Publicity push deadline",
        location: "Remote",
        lead: "",
        dependencies: "Promo graphics, copy, post schedule",
        notes: "",
      },
      {
        id: makeId("time"),
        date: "2026-04-14",
        time: "18:00",
        activity: "Print and pack prep",
        location: "Welcome Center",
        lead: "",
        dependencies: "Final zines, maps, signage",
        notes: "",
      },
      {
        id: makeId("time"),
        date: "2026-04-30",
        time: "17:00",
        activity: "Set up night before event",
        location: "Historical Seaport",
        lead: "",
        dependencies: "Decor, AV, signs, volunteers",
        notes: "",
      },
    ],
    programming: [
      {
        id: makeId("prog"),
        activity: "Popcorn station",
        location: "Main hall",
        time: "12:00",
        lead: "Historical Seaport",
        needs: "Machine, oil, popcorn, cleanup plan",
        status: "Confirmed",
        notes: "",
      },
      {
        id: makeId("prog"),
        activity: "Cotton candy",
        location: "Main hall",
        time: "12:30",
        lead: "Historical Seaport",
        needs: "Machine, sugar, cleanup plan",
        status: "Confirmed",
        notes: "",
      },
      {
        id: makeId("prog"),
        activity: "Art center tables",
        location: "Art room",
        time: "All day",
        lead: "",
        needs: "Paint, markers, brushes, gloves, signs",
        status: DEFAULT_PROGRAM_STATUS,
        notes: "",
      },
    ],
    inventory: [
      {
        id: makeId("inv"),
        item: "May Day banner",
        quantity: "1",
        location: "",
        owner: "",
        condition: "Good",
        notes: "",
      },
      {
        id: makeId("inv"),
        item: "IWW flags",
        quantity: "8",
        location: "",
        owner: "",
        condition: "Good",
        notes: "",
      },
      {
        id: makeId("inv"),
        item: "Haymarket Martyrs banner",
        quantity: "1",
        location: "",
        owner: "",
        condition: "Needs replacement",
        notes: "",
      },
    ],
    sponsors: [
      {
        id: makeId("sponsor"),
        name: "Historical Seaport",
        type: "Partner",
        contact: "Brandi Bednarik",
        status: "Confirmed",
        notes: "500 dollar discount on space",
      },
      {
        id: makeId("sponsor"),
        name: "Jodesha Broadcasting",
        type: "Sponsor",
        contact: "Jon Connors",
        status: "Confirmed",
        notes: "1000 dollar trade for ads",
      },
      {
        id: makeId("sponsor"),
        name: "Timberland Regional Library",
        type: "Partner",
        contact: "Ariana Scott-Zechlin",
        status: DEFAULT_RESOURCE_STATUS,
        notes: "",
      },
    ],
    budget: [
      {
        id: makeId("budget"),
        item: "Rental space",
        category: "Venue",
        cost: "650",
        paid: true,
        notes: "",
      },
      {
        id: makeId("budget"),
        item: "Emergency fund",
        category: "Ops",
        cost: "300",
        paid: false,
        notes: "Cash box target",
      },
      {
        id: makeId("budget"),
        item: "Art supplies",
        category: "Programming",
        cost: "100",
        paid: false,
        notes: "",
      },
    ],
  };
}

export function normalizeOpsState(input) {
  const base = createInitialOpsState();
  return {
    tasks: Array.isArray(input?.tasks) ? input.tasks : base.tasks,
    timeline: Array.isArray(input?.timeline) ? input.timeline : base.timeline,
    programming: Array.isArray(input?.programming) ? input.programming : base.programming,
    inventory: Array.isArray(input?.inventory) ? input.inventory : base.inventory,
    sponsors: Array.isArray(input?.sponsors) ? input.sponsors : base.sponsors,
    budget: Array.isArray(input?.budget) ? input.budget : base.budget,
  };
}

export function withOpsProvider(element) {
  return <OpsStoreProvider>{element}</OpsStoreProvider>;
}