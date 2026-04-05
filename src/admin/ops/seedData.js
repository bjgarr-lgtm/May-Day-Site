
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
  return finalizeState({
    id: makeId("task"),
    title: "",
    category: "Operations",
    owner: "",
    status: DEFAULT_STATUS,
    priority: DEFAULT_PRIORITY,
    deadline: "",
    notes: "",
  });
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
    category: "General",
    location: "",
    time: "",
    lead: "",
    needs: "",
    cost: "",
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

export function blankVolunteer() {
  return {
    id: makeId("vol"),
    name: "",
    role: "",
    area: "General",
    shiftDate: "",
    shiftStart: "",
    shiftEnd: "",
    contact: "",
    status: "Needs Assignment",
    checkedIn: false,
    notes: "",
  };
}

export const WORKBOOK_IMPORT_NOTES = ["Seeded from the uploaded May Day 2026 workbook."];

export function inferProgrammingCategory(item = {}) {
  const text = `${item.activity || ""} ${item.needs || ""} ${item.notes || ""} ${item.lead || ""}`.toLowerCase();
  if (/music|band|poetry|open mic|dance|film|artist|jam/.test(text)) return "Performance";
  if (/food|popcorn|cotton candy|potluck|coffee|tea|donut|truck/.test(text)) return "Food";
  if (/tent|table|porta|parking|supply|chalk|radio|med|seating|banner|flag/.test(text)) return "Operations";
  if (/art|zine|button|weaving|face paint|photo booth|piñata|pinata|seed|scavenger|jelly bean|bowling|cornhole|chalkboard/.test(text)) return "Activity";
  return "General";
}

function cleanTimelineItem(item) {
  const notes = item.notes && /imported from 2025|verify/i.test(item.notes) ? "" : (item.notes || "");
  return { ...item, notes };
}

function cleanTaskItem(item) {
  const notes = item.notes && /Imported from 2025|Verify\.?/i.test(item.notes) ? item.notes.replace(/Imported from 2025[^.]*\.?/gi, "").replace(/Verify\.?/gi, "").trim() : (item.notes || "");
  return { ...item, notes };
}

function enrichProgrammingItem(item) {
  return { ...item, category: item.category || inferProgrammingCategory(item), cost: item.cost || "" };
}

function finalizeState(state) {
  return {
    ...state,
    meta: { ...state.meta, notes: ["Seeded from the uploaded May Day 2026 workbook."] },
    tasks: (state.tasks || []).map(cleanTaskItem),
    timeline: (state.timeline || []).map(cleanTimelineItem),
    programming: (state.programming || []).map(enrichProgrammingItem),
  };
}


function buildVolunteerSeed() {
  return [
    {
      id: "vol_shift_1",
      name: "",
      role: "Security team",
      area: "Safety",
      shiftDate: "2026-05-01",
      shiftStart: "10:00",
      shiftEnd: "18:00",
      contact: "",
      status: "Needs Assignment",
      checkedIn: false,
      notes: "Seeded from workbook notes mentioning security team.",
    },
    {
      id: "vol_shift_2",
      name: "",
      role: "Welcome table",
      area: "Front of House",
      shiftDate: "2026-05-01",
      shiftStart: "10:00",
      shiftEnd: "14:00",
      contact: "",
      status: "Needs Assignment",
      checkedIn: false,
      notes: "Greeting area support during setup and opening rush.",
    },
    {
      id: "vol_shift_3",
      name: "",
      role: "Art center helper",
      area: "Programming",
      shiftDate: "2026-05-01",
      shiftStart: "11:00",
      shiftEnd: "16:00",
      contact: "",
      status: "Needs Assignment",
      checkedIn: false,
      notes: "Supports collaborative art tables and zine making.",
    },
    {
      id: "vol_shift_4",
      name: "",
      role: "Food and bev helper",
      area: "Food",
      shiftDate: "2026-05-01",
      shiftStart: "08:00",
      shiftEnd: "14:00",
      contact: "",
      status: "Needs Assignment",
      checkedIn: false,
      notes: "Supports breakfast and lunch flow.",
    },
    {
      id: "vol_shift_5",
      name: "",
      role: "Scavenger hunt support",
      area: "Activities",
      shiftDate: "2026-05-01",
      shiftStart: "11:00",
      shiftEnd: "17:00",
      contact: "",
      status: "Needs Assignment",
      checkedIn: false,
      notes: "Helps with route questions and prize flow.",
    },
    {
      id: "vol_shift_6",
      name: "",
      role: "Cleanup crew",
      area: "Ops",
      shiftDate: "2026-05-01",
      shiftStart: "17:00",
      shiftEnd: "20:00",
      contact: "",
      status: "Needs Assignment",
      checkedIn: false,
      notes: "End of day teardown and machine cleaning.",
    },
  ];
}

function deriveRunOfShowChecklist(tasks, timeline) {
  const nearEventTasks = tasks
    .filter((task) =>
      ["Critical", "High"].includes(task.priority) ||
      /print|shopping|inventory|button|setup|cleanup|cash|check|security/i.test(task.title || "")
    )
    .slice(0, 20)
    .map((task) => ({
      id: `run_${task.id}`,
      sourceTaskId: task.id,
      title: task.title,
      when: task.deadline || "Verify date",
      owner: task.owner || "",
      status: task.status,
      notes: task.notes || "",
    }));

  const timelineChecklist = timeline
    .filter((item) => item.date || item.time)
    .slice(0, 20)
    .map((item) => ({
      id: `timeline_${item.id}`,
      sourceTaskId: "",
      title: item.activity,
      when: `${item.date || ""} ${item.time || ""}`.trim(),
      owner: item.lead || "",
      status: "Scheduled",
      notes: item.location || "",
    }));

  return [...nearEventTasks, ...timelineChecklist];
}


export function createInitialOpsState() {
  return {
    meta: {
      source: "May Day 2026 workbook",
      importedAt: "2026-04-05",
      notes: WORKBOOK_IMPORT_NOTES,
      phase: "Phase Three",
      version: 3,
      criticalPath: [
  "final shopping, more budgeting",
  "dollar store trip",
  "gather supplies, inventory finished",
  "Printing, Press Buttons, count jelly beans",
  "Last minute printing Buying food and ice, double check all materials organize and arrange for tomorrow payment app and cash box with cash activities / art supplies secured equipment and bands check in",
  "printing, buttons",
  "final check",
  "Set up at 10AM - tables, walls, balloons, baskets, flags, flower baskets, banners, signage, table set ups, posters, memorial, history set up, zines, snow cone, popcorn, breakfast, greeting area",
  "Call First Artist",
  "Say good bye and thank everyone",
  "Plug ins for next year's organizing committee",
  "Clean cotton candy and popcorn machines"
]
    },
    tasks: [
  {
    "id": "task_prepare-programming-list_1",
    "title": "Prepare Programming List",
    "category": "Operations",
    "owner": "",
    "status": "Not Started",
    "priority": "Medium",
    "deadline": "",
    "notes": "Imported from Labor Plan row \"Admin\""
  },
  {
    "id": "task_budget-for-programming_2",
    "title": "budget for programming",
    "category": "Operations",
    "owner": "",
    "status": "Not Started",
    "priority": "Medium",
    "deadline": "",
    "notes": "Imported from Labor Plan row \"Admin\""
  },
  {
    "id": "task_sign-rental-agreement_3",
    "title": "Sign rental agreement",
    "category": "Operations",
    "owner": "",
    "status": "Not Started",
    "priority": "Medium",
    "deadline": "",
    "notes": "Imported from Labor Plan row \"Admin\""
  },
  {
    "id": "task_pay-deposit_4",
    "title": "pay deposit",
    "category": "Operations",
    "owner": "",
    "status": "Not Started",
    "priority": "Medium",
    "deadline": "",
    "notes": "Imported from Labor Plan row \"Admin\""
  },
  {
    "id": "task_vegan-menu-for-potluck_5",
    "title": "vegan menu for potluck",
    "category": "Food",
    "owner": "",
    "status": "Not Started",
    "priority": "Medium",
    "deadline": "",
    "notes": "Imported from Labor Plan row \"Food\""
  },
  {
    "id": "task_find-volunteers_6",
    "title": "find volunteers",
    "category": "Food",
    "owner": "",
    "status": "Not Started",
    "priority": "Medium",
    "deadline": "",
    "notes": "Imported from Labor Plan row \"Food\""
  },
  {
    "id": "task_prepare-food-budget_7",
    "title": "Prepare Food Budget",
    "category": "Food",
    "owner": "",
    "status": "Not Started",
    "priority": "Medium",
    "deadline": "",
    "notes": "Imported from Labor Plan row \"Food\""
  },
  {
    "id": "task_food-handlers-cards_8",
    "title": "Food handlers cards",
    "category": "Food",
    "owner": "",
    "status": "Not Started",
    "priority": "Medium",
    "deadline": "",
    "notes": "Imported from Labor Plan row \"Food\""
  },
  {
    "id": "task_contact-radio_9",
    "title": "Contact Radio",
    "category": "Publicity",
    "owner": "",
    "status": "Not Started",
    "priority": "Medium",
    "deadline": "",
    "notes": "Imported from Labor Plan row \"Publicity\""
  },
  {
    "id": "task_write-scripts-for-ads_10",
    "title": "write scripts for ads",
    "category": "Publicity",
    "owner": "",
    "status": "Not Started",
    "priority": "Medium",
    "deadline": "",
    "notes": "Imported from Labor Plan row \"Publicity\""
  },
  {
    "id": "task_write-and-record-promo_11",
    "title": "Write and record promo",
    "category": "Publicity",
    "owner": "",
    "status": "Not Started",
    "priority": "Medium",
    "deadline": "",
    "notes": "Imported from Labor Plan row \"Publicity\""
  },
  {
    "id": "task_promo-in-molotov-now_12",
    "title": "Promo in Molotov Now",
    "category": "Publicity",
    "owner": "",
    "status": "Not Started",
    "priority": "Medium",
    "deadline": "",
    "notes": "Imported from Labor Plan row \"Publicity\""
  },
  {
    "id": "task_event-map_13",
    "title": "Event Map",
    "category": "Operations",
    "owner": "",
    "status": "Not Started",
    "priority": "Medium",
    "deadline": "",
    "notes": "Imported from Labor Plan row \"Site Operations\""
  },
  {
    "id": "task_start-inventory_14",
    "title": "start inventory",
    "category": "Operations",
    "owner": "",
    "status": "Not Started",
    "priority": "Medium",
    "deadline": "",
    "notes": "Imported from Labor Plan row \"Site Operations\""
  },
  {
    "id": "task_press-buttons_15",
    "title": "Press buttons",
    "category": "Operations",
    "owner": "",
    "status": "Not Started",
    "priority": "Medium",
    "deadline": "",
    "notes": "Imported from Labor Plan row \"Site Operations\""
  },
  {
    "id": "task_prepare-playlist-slideshow_17",
    "title": "Prepare Playlist/slideshow",
    "category": "Programming",
    "owner": "",
    "status": "Not Started",
    "priority": "Medium",
    "deadline": "",
    "notes": "Imported from Labor Plan row \"Programming\""
  },
  {
    "id": "task_make-pinatas_18",
    "title": "make pinatas",
    "category": "Programming",
    "owner": "",
    "status": "Not Started",
    "priority": "Medium",
    "deadline": "",
    "notes": "Imported from Labor Plan row \"Programming\""
  },
  {
    "id": "task_weaving-station_19",
    "title": "weaving station",
    "category": "Programming",
    "owner": "",
    "status": "Not Started",
    "priority": "Medium",
    "deadline": "",
    "notes": "Imported from Labor Plan row \"Programming\""
  },
  {
    "id": "task_secure-face-painter_20",
    "title": "secure face painter",
    "category": "Programming",
    "owner": "",
    "status": "Not Started",
    "priority": "Medium",
    "deadline": "",
    "notes": "Imported from Labor Plan row \"Programming\""
  },
  {
    "id": "task_community-calls-to-gauge-inter_21",
    "title": "community calls (to gauge interests, offerings, and solicit sponsors, vendors, and donations)",
    "category": "Operations",
    "owner": "",
    "status": "Not Started",
    "priority": "Medium",
    "deadline": "",
    "notes": "(In advance)."
  },
  {
    "id": "task_trainings_22",
    "title": "trainings?",
    "category": "Operations",
    "owner": "",
    "status": "Not Started",
    "priority": "Medium",
    "deadline": "",
    "notes": "(In advance)."
  },
  {
    "id": "task_shopping-budgeting-decorations_23",
    "title": "Shopping, budgeting, decorations, prizes",
    "category": "Operations",
    "owner": "",
    "status": "Not Started",
    "priority": "Medium",
    "deadline": "",
    "notes": "(In advance)."
  },
  {
    "id": "task_radio-ads-and-interviews_24",
    "title": "Radio Ads and interviews",
    "category": "Operations",
    "owner": "",
    "status": "Not Started",
    "priority": "Medium",
    "deadline": "",
    "notes": "(In advance)."
  },
  {
    "id": "task_print-shit-out-in-advance-of-m_25",
    "title": "print shit out in advance of May Day (map, zines, signs, meal plan stuff)",
    "category": "Operations",
    "owner": "",
    "status": "Not Started",
    "priority": "Medium",
    "deadline": "",
    "notes": "(In advance)."
  },
  {
    "id": "task_graphics-and-flyers-distro-out_26",
    "title": "Graphics and flyers, Distro, Outreach",
    "category": "Operations",
    "owner": "",
    "status": "Not Started",
    "priority": "Medium",
    "deadline": "",
    "notes": "(In advance)."
  },
  {
    "id": "task_press-buttons-order-merch_27",
    "title": "Press buttons, order merch",
    "category": "Operations",
    "owner": "",
    "status": "Not Started",
    "priority": "Medium",
    "deadline": "",
    "notes": "(In advance)."
  },
  {
    "id": "task_make-playlist-and-slideshow-ge_28",
    "title": "Make playlist and slideshow, get to radio",
    "category": "Operations",
    "owner": "",
    "status": "Not Started",
    "priority": "Medium",
    "deadline": "",
    "notes": "(In advance)."
  },
  {
    "id": "task_final-shopping-more-budgeting_30",
    "title": "final shopping, more budgeting",
    "category": "Operations",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": "Day -4."
  },
  {
    "id": "task_dollar-store-trip_31",
    "title": "dollar store trip",
    "category": "Operations",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": "Day -4."
  },
  {
    "id": "task_gather-supplies-inventory-fini_32",
    "title": "gather supplies, inventory finished",
    "category": "Operations",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": "Day -4."
  },
  {
    "id": "task_printing-press-buttons-count-j_33",
    "title": "Printing, Press Buttons, count jelly beans",
    "category": "Operations",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": "Day -3."
  },
  {
    "id": "task_last-minute-printing-buying-fo_34",
    "title": "Last minute printing Buying food and ice, double check all materials organize and arrange for tomorrow payment app and cash box with cash activities / art supplies secured equipment and bands check in",
    "category": "Operations",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": "Day -3."
  },
  {
    "id": "task_printing-buttons_35",
    "title": "printing, buttons",
    "category": "Operations",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": "Day -2."
  },
  {
    "id": "task_final-check_36",
    "title": "final check",
    "category": "Operations",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": "Day -2."
  },
  {
    "id": "task_set-up-at-10am-tables-walls-ba_38",
    "title": "Set up at 10AM - tables, walls, balloons, baskets, flags, flower baskets, banners, signage, table set ups, posters, memorial, history set up, zines, snow cone, popcorn, breakfast, greeting area",
    "category": "Operations",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": "Day -1."
  },
  {
    "id": "task_pre-event-crew-meeting_39",
    "title": "Pre Event Crew Meeting",
    "category": "Operations",
    "owner": "",
    "status": "Not Started",
    "priority": "Medium",
    "deadline": "",
    "notes": "Wednesday 5-1."
  },
  {
    "id": "task_make-sure-everyone-has-orienta_40",
    "title": "Make sure everyone has orientation zine, radios, snack, water, sunscreen, etc",
    "category": "Operations",
    "owner": "",
    "status": "Not Started",
    "priority": "Medium",
    "deadline": "",
    "notes": "Wednesday 5-1."
  },
  {
    "id": "task_double-check-everything-is-set_41",
    "title": "Double Check everything is set out and set up",
    "category": "Operations",
    "owner": "",
    "status": "Not Started",
    "priority": "Medium",
    "deadline": "",
    "notes": "Wednesday 5-1."
  },
  {
    "id": "task_prep-mc-for-opening-rituals_42",
    "title": "Prep MC for opening rituals",
    "category": "Operations",
    "owner": "",
    "status": "Not Started",
    "priority": "Medium",
    "deadline": "",
    "notes": "Wednesday 5-1."
  },
  {
    "id": "task_start-playlist-and-slideshow_43",
    "title": "Start Playlist and slideshow",
    "category": "Operations",
    "owner": "",
    "status": "Not Started",
    "priority": "Medium",
    "deadline": "",
    "notes": "Wednesday 5-1."
  },
  {
    "id": "task_set-out-breakfast-snacks_44",
    "title": "Set out breakfast snacks",
    "category": "Operations",
    "owner": "",
    "status": "Not Started",
    "priority": "Medium",
    "deadline": "",
    "notes": "Wednesday 5-1."
  },
  {
    "id": "task_call-first-artist_45",
    "title": "Call First Artist",
    "category": "Operations",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": "Opening."
  },
  {
    "id": "task_staff-positions_46",
    "title": "Staff positions",
    "category": "Operations",
    "owner": "",
    "status": "Not Started",
    "priority": "Medium",
    "deadline": "",
    "notes": "10:00:00."
  },
  {
    "id": "task_floaters-float_47",
    "title": "Floaters float",
    "category": "Operations",
    "owner": "",
    "status": "Not Started",
    "priority": "Medium",
    "deadline": "",
    "notes": "10:00:00."
  },
  {
    "id": "task_security-check_48",
    "title": "security check",
    "category": "Operations",
    "owner": "",
    "status": "Not Started",
    "priority": "Medium",
    "deadline": "",
    "notes": "10:00:00."
  },
  {
    "id": "task_set-out-lunch-buffet-around-no_49",
    "title": "Set out lunch buffet around Noon",
    "category": "Operations",
    "owner": "",
    "status": "Not Started",
    "priority": "Medium",
    "deadline": "",
    "notes": "10:00:00."
  },
  {
    "id": "task_film-then-poetry_50",
    "title": "Film then Poetry",
    "category": "Operations",
    "owner": "",
    "status": "Not Started",
    "priority": "Medium",
    "deadline": "",
    "notes": "10:00:00."
  },
  {
    "id": "task_introduce-film_51",
    "title": "Introduce film",
    "category": "Operations",
    "owner": "",
    "status": "Not Started",
    "priority": "Medium",
    "deadline": "",
    "notes": "10:00:00."
  },
  {
    "id": "task_food-served-from-12-to-4_52",
    "title": "Food served from 12 to 4",
    "category": "Operations",
    "owner": "",
    "status": "Not Started",
    "priority": "Medium",
    "deadline": "",
    "notes": "Festivities."
  },
  {
    "id": "task_distribute-contact-sharing-lis_53",
    "title": "Distribute contact sharing list",
    "category": "Operations",
    "owner": "",
    "status": "Not Started",
    "priority": "Medium",
    "deadline": "",
    "notes": "Festivities."
  },
  {
    "id": "task_prep-mc-for-closing-rituals_54",
    "title": "Prep MC for closing rituals",
    "category": "Operations",
    "owner": "",
    "status": "Not Started",
    "priority": "Medium",
    "deadline": "",
    "notes": "Festivities."
  },
  {
    "id": "task_say-good-bye-and-thank-everyon_55",
    "title": "Say good bye and thank everyone",
    "category": "Operations",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": "Closing."
  },
  {
    "id": "task_plug-ins-for-next-year-s-organ_56",
    "title": "Plug ins for next year's organizing committee",
    "category": "Operations",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": "Closing."
  },
  {
    "id": "task_clean-cotton-candy-and-popcorn_57",
    "title": "Clean cotton candy and popcorn machines",
    "category": "Operations",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": "Closing."
  },
  {
    "id": "task_break-down-everything-put-away_58",
    "title": "break down everything, put away properly",
    "category": "Operations",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": "Closing."
  },
  {
    "id": "task_load-into-vehicles_59",
    "title": "load into vehicles",
    "category": "Operations",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": "Closing."
  },
  {
    "id": "task_sweep-trash-to-dumpster_60",
    "title": "sweep, trash to dumpster",
    "category": "Operations",
    "owner": "",
    "status": "Not Started",
    "priority": "Medium",
    "deadline": "",
    "notes": "Clean Up."
  },
  {
    "id": "task_out-before-1am_61",
    "title": "Out before 1AM",
    "category": "Operations",
    "owner": "",
    "status": "Not Started",
    "priority": "Medium",
    "deadline": "",
    "notes": "Clean Up."
  },
  {
    "id": "task_iww-printing-merch-screenprint_62",
    "title": "IWW Printing: Merch - Screenprinted Shirts, patches, make buttons",
    "category": "Printing",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": ""
  },
  {
    "id": "task_iww-printing-biz-cards-cardsto_63",
    "title": "IWW Printing: biz cards - cardstock",
    "category": "Printing",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": ""
  },
  {
    "id": "task_iww-printing-organizing-the-un_64",
    "title": "IWW Printing: Organizing the Unhoused zine",
    "category": "Printing",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": ""
  },
  {
    "id": "task_iww-printing-sign-up-sheets_65",
    "title": "IWW Printing: Sign up sheets",
    "category": "Printing",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": ""
  },
  {
    "id": "task_iww-printing-history-articles-_66",
    "title": "IWW Printing: History articles into zines",
    "category": "Printing",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": ""
  },
  {
    "id": "task_iww-printing-one-big-union-zin_67",
    "title": "IWW Printing: One big Union zine",
    "category": "Printing",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": ""
  },
  {
    "id": "task_iww-printing-organize-zine_68",
    "title": "IWW Printing: ORGANIZE zine",
    "category": "Printing",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": ""
  },
  {
    "id": "task_iww-printing-homeless-union-fl_69",
    "title": "IWW Printing: homeless union flyer",
    "category": "Printing",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": ""
  },
  {
    "id": "task_iww-printing-branch-guidelines_70",
    "title": "IWW Printing: Branch Guidelines zine x 1",
    "category": "Printing",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": ""
  },
  {
    "id": "task_iww-printing-merch-signs_71",
    "title": "IWW Printing: merch signs",
    "category": "Printing",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": ""
  },
  {
    "id": "task_blackflower-printing-merch-but_72",
    "title": "Blackflower Printing: Merch - buttons, online store",
    "category": "Printing",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": ""
  },
  {
    "id": "task_blackflower-printing-bfc-zine_73",
    "title": "Blackflower Printing: BFC Zine",
    "category": "Printing",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": ""
  },
  {
    "id": "task_blackflower-printing-biz-cards_74",
    "title": "Blackflower Printing: biz cards - inventory or buy",
    "category": "Printing",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": ""
  },
  {
    "id": "task_blackflower-printing-brochures_75",
    "title": "Blackflower Printing: brochures",
    "category": "Printing",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": ""
  },
  {
    "id": "task_blackflower-printing-merch-sig_76",
    "title": "Blackflower Printing: merch signs",
    "category": "Printing",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": ""
  },
  {
    "id": "task_blackflower-printing-mutual-ai_77",
    "title": "Blackflower Printing: Mutual Aid Book",
    "category": "Printing",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": ""
  },
  {
    "id": "task_crman-printing-merch-free-logo_78",
    "title": "CRMAN Printing: Merch - free logo buttons",
    "category": "Printing",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": ""
  },
  {
    "id": "task_crman-printing-refresh-crman-i_79",
    "title": "CRMAN Printing: Refresh CRMAN Info booth Zine",
    "category": "Printing",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": ""
  },
  {
    "id": "task_crman-printing-volunteer-sign-_80",
    "title": "CRMAN Printing: Volunteer sign up sheets",
    "category": "Printing",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": ""
  },
  {
    "id": "task_crman-printing-kyr-flyer_81",
    "title": "CRMAN Printing: KYR flyer",
    "category": "Printing",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": ""
  },
  {
    "id": "task_crman-printing-lets-talk-ma_82",
    "title": "CRMAN Printing: lets talk MA",
    "category": "Printing",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": ""
  },
  {
    "id": "task_crman-printing-intro-to-ma_83",
    "title": "CRMAN Printing: Intro to MA",
    "category": "Printing",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": ""
  },
  {
    "id": "task_crman-printing-madr_84",
    "title": "CRMAN Printing: MADR",
    "category": "Printing",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": ""
  },
  {
    "id": "task_crman-printing-sub-media-on-ma_85",
    "title": "CRMAN Printing: Sub.media on MA",
    "category": "Printing",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": ""
  },
  {
    "id": "task_sabot-media-merch-buttons-free_86",
    "title": "Sabot Media: Merch - buttons (free), online store",
    "category": "Printing",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": ""
  },
  {
    "id": "task_sabot-media-glaring-examples_87",
    "title": "Sabot Media: Glaring Examples",
    "category": "Printing",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": ""
  },
  {
    "id": "task_sabot-media-7-steps-to-startin_88",
    "title": "Sabot Media: 7 Steps to Starting Your Own Jail Support Network Where You Live",
    "category": "Printing",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": ""
  },
  {
    "id": "task_sabot-media-who-is-terry-emmer_89",
    "title": "Sabot Media: Who is Terry Emmert?",
    "category": "Printing",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": ""
  },
  {
    "id": "task_sabot-media-awakening-the-flam_90",
    "title": "Sabot Media: Awakening the Flame: Joining the Anarchist Cause",
    "category": "Printing",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": ""
  },
  {
    "id": "task_sabot-media-meet-them-where-th_91",
    "title": "Sabot Media: Meet Them Where They’re At: A Strategy For Mass Radicalization",
    "category": "Printing",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": ""
  },
  {
    "id": "task_sabot-media-kill-the-poor-a-ji_92",
    "title": "Sabot Media: Kill The Poor: A Jim Walsh Primer",
    "category": "Printing",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": ""
  },
  {
    "id": "task_sabot-media-how-to-spot-when-y_93",
    "title": "Sabot Media: How to Spot When You’re in a Cult",
    "category": "Printing",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": ""
  },
  {
    "id": "task_sabot-media-merch-signs_94",
    "title": "Sabot Media: merch signs",
    "category": "Printing",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": ""
  },
  {
    "id": "task_crimethinc-every-poster_95",
    "title": "Crimethinc : Every Poster",
    "category": "Printing",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": ""
  },
  {
    "id": "task_crimethinc-every-book_96",
    "title": "Crimethinc : Every Book",
    "category": "Printing",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": ""
  },
  {
    "id": "task_crimethinc-every-sticker_97",
    "title": "Crimethinc : Every Sticker",
    "category": "Printing",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": ""
  },
  {
    "id": "task_crimethinc-zines-most_98",
    "title": "Crimethinc : zines, most",
    "category": "Printing",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": ""
  },
  {
    "id": "task_crimethinc-signage-stencil_99",
    "title": "Crimethinc : signage - stencil",
    "category": "Printing",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": ""
  },
  {
    "id": "task_welcome-table-printing-merch-s_100",
    "title": "Welcome Table Printing: Merch - shirts, hoodies, posters, buttons",
    "category": "Printing",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": ""
  },
  {
    "id": "task_welcome-table-printing-jelly-b_101",
    "title": "Welcome Table Printing: Jelly bean guess sign and paper",
    "category": "Printing",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": ""
  },
  {
    "id": "task_welcome-table-printing-orienta_102",
    "title": "Welcome Table Printing: orientation zine",
    "category": "Printing",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": ""
  },
  {
    "id": "task_welcome-table-printing-contact_103",
    "title": "Welcome Table Printing: Contact sharing - Guest book",
    "category": "Printing",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": ""
  },
  {
    "id": "task_welcome-table-printing-memoria_104",
    "title": "Welcome Table Printing: Memorial photos 11x17",
    "category": "Printing",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": ""
  },
  {
    "id": "task_welcome-table-printing-merch-s_105",
    "title": "Welcome Table Printing: merch signs",
    "category": "Printing",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": ""
  },
  {
    "id": "task_art-center-word-search_106",
    "title": "Art Center: Word search",
    "category": "Printing",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": ""
  },
  {
    "id": "task_art-center-crossword_107",
    "title": "Art Center: Crossword",
    "category": "Printing",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": ""
  },
  {
    "id": "task_art-center-coloring-pages_108",
    "title": "Art Center: Coloring pages",
    "category": "Printing",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": ""
  },
  {
    "id": "task_art-center-prompts-for-project_109",
    "title": "Art Center: prompts for projects",
    "category": "Printing",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": ""
  },
  {
    "id": "task_art-center-make-your-own-zine_110",
    "title": "Art Center: make your own zine",
    "category": "Printing",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": ""
  },
  {
    "id": "task_signage-entrance-banners-100_111",
    "title": "Signage: Entrance Banners $100",
    "category": "Printing",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": ""
  },
  {
    "id": "task_signage-parking-x-2_112",
    "title": "Signage: Parking x 2",
    "category": "Printing",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": ""
  },
  {
    "id": "task_signage-volunteers-only-path-s_113",
    "title": "Signage: volunteers only path sign",
    "category": "Printing",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": ""
  },
  {
    "id": "task_signage-indoor-venue-path-sign_114",
    "title": "Signage: indoor venue path sign",
    "category": "Printing",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": ""
  },
  {
    "id": "task_signage-art-center_115",
    "title": "Signage: Art center",
    "category": "Printing",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": ""
  },
  {
    "id": "task_signage-greeting-banner-35_116",
    "title": "Signage: Greeting Banner $35",
    "category": "Printing",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": ""
  },
  {
    "id": "task_signage-itinerary-giant-flyer-_117",
    "title": "Signage: Itinerary/ Giant Flyer Signage",
    "category": "Printing",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": ""
  },
  {
    "id": "task_signage-free-food-sign_118",
    "title": "Signage: Free Food Sign",
    "category": "Printing",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": ""
  },
  {
    "id": "task_signage-raffle-here-sign_119",
    "title": "Signage: Raffle here sign",
    "category": "Printing",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": ""
  },
  {
    "id": "task_signage-mckay-banner-50_120",
    "title": "Signage: McKay Banner $50",
    "category": "Printing",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": ""
  },
  {
    "id": "task_signage-med-tent-sign_121",
    "title": "Signage: Med Tent sign",
    "category": "Printing",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": ""
  },
  {
    "id": "task_signage-flags_122",
    "title": "Signage: Flags:",
    "category": "Printing",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": ""
  },
  {
    "id": "task_signage-red-and-black-make_123",
    "title": "Signage: Red and black - make",
    "category": "Printing",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": ""
  },
  {
    "id": "task_signage-palestine_124",
    "title": "Signage: palestine",
    "category": "Printing",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": ""
  },
  {
    "id": "task_signage-pride_125",
    "title": "Signage: pride",
    "category": "Printing",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": ""
  },
  {
    "id": "task_signage-sabot_126",
    "title": "Signage: sabot",
    "category": "Printing",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": ""
  },
  {
    "id": "task_signage-iww_127",
    "title": "Signage: IWW",
    "category": "Printing",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": ""
  },
  {
    "id": "task_signage-ukrainian-anarchists_128",
    "title": "Signage: ukrainian anarchists?",
    "category": "Printing",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": ""
  },
  {
    "id": "task_decor-printing-11x17-posters_129",
    "title": "Decor Printing 11x17: Posters",
    "category": "Printing",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": ""
  },
  {
    "id": "task_decor-printing-11x17-flyers_130",
    "title": "Decor Printing 11x17: Flyers",
    "category": "Printing",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": ""
  },
  {
    "id": "task_podcast-announcement-for-molot_131",
    "title": "Podcast announcement for Molotov Now!",
    "category": "Publicity",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "2026-04-01",
    "notes": "Imported from 2025 publicity sheet, rolled forward to 2026. Verify."
  },
  {
    "id": "task_article-write-up-for-sabot-med_132",
    "title": "Article write up for Sabot Media",
    "category": "Publicity",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "2026-04-01",
    "notes": "Imported from 2025 publicity sheet, rolled forward to 2026. Verify."
  },
  {
    "id": "task_publicity-outreach-for-its-goi_133",
    "title": "Publicity outreach for Its Going Down",
    "category": "Publicity",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "2026-04-05",
    "notes": "Imported from 2025 publicity sheet, rolled forward to 2026. Verify."
  },
  {
    "id": "task_publicity-outreach-for-puget-s_134",
    "title": "Publicity outreach for Puget Sound Anarchists",
    "category": "Publicity",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "2026-04-05",
    "notes": "Imported from 2025 publicity sheet, rolled forward to 2026. Verify."
  },
  {
    "id": "task_publicity-outreach-for-live-li_135",
    "title": "Publicity outreach for Live Like The World Is Dying",
    "category": "Publicity",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "2026-04-05",
    "notes": "Imported from 2025 publicity sheet, rolled forward to 2026. Verify."
  },
  {
    "id": "task_publicity-outreach-for-indybay_136",
    "title": "Publicity outreach for Indybay",
    "category": "Publicity",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "2026-04-05",
    "notes": "Imported from 2025 publicity sheet, rolled forward to 2026. Verify."
  },
  {
    "id": "task_publicity-outreach-for-the-fin_137",
    "title": "Publicity outreach for The Final Straw",
    "category": "Publicity",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "2026-04-05",
    "notes": "Imported from 2025 publicity sheet, rolled forward to 2026. Verify."
  },
  {
    "id": "task_radio-interview-for-jodesha-br_138",
    "title": "Radio interview for Jodesha Broadcasting",
    "category": "Publicity",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "2026-04-07",
    "notes": "Imported from 2025 publicity sheet, rolled forward to 2026. Verify."
  },
  {
    "id": "task_radio-ad-time-for-jodesha-broa_139",
    "title": "Radio Ad time for Jodesha Broadcasting",
    "category": "Publicity",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "",
    "notes": "Imported from 2025 publicity sheet, rolled forward to 2026. Verify. will trade for sponsorship too"
  },
  {
    "id": "task_radio-interview-for-alpha-medi_140",
    "title": "Radio interview for Alpha Media",
    "category": "Publicity",
    "owner": "",
    "status": "Not Started",
    "priority": "High",
    "deadline": "2026-04-20",
    "notes": "Imported from 2025 publicity sheet, rolled forward to 2026. Verify."
  }
],
    timeline: [
  {
    "id": "time_article-write-up-sabot-m_2",
    "date": "2026-04-01",
    "time": "",
    "activity": "Article write up - Sabot Media",
    "location": "Remote",
    "lead": "",
    "dependencies": "",
    "notes": "Imported from 2025 publicity sheet and rolled to 2026. Verify."
  },
  {
    "id": "time_podcast-announcement-mol_1",
    "date": "2026-04-01",
    "time": "",
    "activity": "Podcast announcement - Molotov Now!",
    "location": "Remote",
    "lead": "",
    "dependencies": "",
    "notes": "Imported from 2025 publicity sheet and rolled to 2026. Verify."
  },
  {
    "id": "time_article-write-up-indybay_6",
    "date": "2026-04-05",
    "time": "",
    "activity": "Article write up - Indybay",
    "location": "Remote",
    "lead": "",
    "dependencies": "",
    "notes": "Imported from 2025 publicity sheet and rolled to 2026. Verify."
  },
  {
    "id": "time_article-write-up-puget-s_4",
    "date": "2026-04-05",
    "time": "",
    "activity": "Article write up - Puget Sound Anarchists",
    "location": "Remote",
    "lead": "",
    "dependencies": "",
    "notes": "Imported from 2025 publicity sheet and rolled to 2026. Verify."
  },
  {
    "id": "time_article-write-up-podcast_3",
    "date": "2026-04-05",
    "time": "",
    "activity": "Article write up /podcast announcement - Its Going Down",
    "location": "Remote",
    "lead": "",
    "dependencies": "",
    "notes": "Imported from 2025 publicity sheet and rolled to 2026. Verify."
  },
  {
    "id": "time_podcast-announcement-liv_5",
    "date": "2026-04-05",
    "time": "",
    "activity": "Podcast announcement - Live Like The World Is Dying",
    "location": "Remote",
    "lead": "",
    "dependencies": "",
    "notes": "Imported from 2025 publicity sheet and rolled to 2026. Verify."
  },
  {
    "id": "time_podcast-announcement-the_7",
    "date": "2026-04-05",
    "time": "",
    "activity": "Podcast announcement - The Final Straw",
    "location": "Remote",
    "lead": "",
    "dependencies": "",
    "notes": "Imported from 2025 publicity sheet and rolled to 2026. Verify."
  },
  {
    "id": "time_radio-interview-jodesha-_8",
    "date": "2026-04-07",
    "time": "",
    "activity": "Radio interview - Jodesha Broadcasting",
    "location": "Remote",
    "lead": "",
    "dependencies": "",
    "notes": "Imported from 2025 publicity sheet and rolled to 2026. Verify."
  },
  {
    "id": "time_radio-interview-alpha-me_9",
    "date": "2026-04-20",
    "time": "",
    "activity": "Radio interview - Alpha Media",
    "location": "Remote",
    "lead": "",
    "dependencies": "",
    "notes": "Imported from 2025 publicity sheet and rolled to 2026. Verify."
  },
  {
    "id": "time_call-first-artist_18",
    "date": "2026-05-01",
    "time": "",
    "activity": "Call First Artist",
    "location": "On-site",
    "lead": "",
    "dependencies": "",
    "notes": ""
  },
  {
    "id": "time_distribute-contact-shari_26",
    "date": "2026-05-01",
    "time": "",
    "activity": "Distribute contact sharing list",
    "location": "On-site",
    "lead": "",
    "dependencies": "",
    "notes": ""
  },
  {
    "id": "time_double-check-everything-_14",
    "date": "2026-05-01",
    "time": "",
    "activity": "Double Check everything is set out and set up",
    "location": "On-site",
    "lead": "",
    "dependencies": "",
    "notes": ""
  },
  {
    "id": "time_film-then-poetry_23",
    "date": "2026-05-01",
    "time": "",
    "activity": "Film then Poetry",
    "location": "On-site",
    "lead": "",
    "dependencies": "",
    "notes": ""
  },
  {
    "id": "time_floaters-float_20",
    "date": "2026-05-01",
    "time": "",
    "activity": "Floaters float",
    "location": "On-site",
    "lead": "",
    "dependencies": "",
    "notes": ""
  },
  {
    "id": "time_food-served-from-12-to-4_25",
    "date": "2026-05-01",
    "time": "",
    "activity": "Food served from 12 to 4",
    "location": "On-site",
    "lead": "",
    "dependencies": "",
    "notes": ""
  },
  {
    "id": "time_introduce-film_24",
    "date": "2026-05-01",
    "time": "",
    "activity": "Introduce film",
    "location": "On-site",
    "lead": "",
    "dependencies": "",
    "notes": ""
  },
  {
    "id": "time_make-sure-everyone-has-o_13",
    "date": "2026-05-01",
    "time": "",
    "activity": "Make sure everyone has orientation zine, radios, snack, water, sunscreen, etc",
    "location": "On-site",
    "lead": "",
    "dependencies": "",
    "notes": ""
  },
  {
    "id": "time_pre-event-crew-meeting_12",
    "date": "2026-05-01",
    "time": "",
    "activity": "Pre Event Crew Meeting",
    "location": "On-site",
    "lead": "",
    "dependencies": "",
    "notes": ""
  },
  {
    "id": "time_prep-mc-for-closing-ritu_27",
    "date": "2026-05-01",
    "time": "",
    "activity": "Prep MC for closing rituals",
    "location": "On-site",
    "lead": "",
    "dependencies": "",
    "notes": ""
  },
  {
    "id": "time_prep-mc-for-opening-ritu_15",
    "date": "2026-05-01",
    "time": "",
    "activity": "Prep MC for opening rituals",
    "location": "On-site",
    "lead": "",
    "dependencies": "",
    "notes": ""
  },
  {
    "id": "time_say-good-bye-and-thank-e_28",
    "date": "2026-05-01",
    "time": "",
    "activity": "Say good bye and thank everyone",
    "location": "On-site",
    "lead": "",
    "dependencies": "",
    "notes": ""
  },
  {
    "id": "time_set-out-breakfast-snacks_17",
    "date": "2026-05-01",
    "time": "",
    "activity": "Set out breakfast snacks",
    "location": "On-site",
    "lead": "",
    "dependencies": "",
    "notes": ""
  },
  {
    "id": "time_set-out-lunch-buffet-aro_22",
    "date": "2026-05-01",
    "time": "",
    "activity": "Set out lunch buffet around Noon",
    "location": "On-site",
    "lead": "",
    "dependencies": "",
    "notes": ""
  },
  {
    "id": "time_set-up-at-10am-tables-wa_11",
    "date": "2026-05-01",
    "time": "",
    "activity": "Set up at 10AM - tables, walls, balloons, baskets, flags, flower baskets, banners, signage, table set ups,  posters, memorial, history set up, zines, snow cone, popcorn, breakfast, greeting area",
    "location": "On-site",
    "lead": "",
    "dependencies": "",
    "notes": ""
  },
  {
    "id": "time_staff-positions_19",
    "date": "2026-05-01",
    "time": "",
    "activity": "Staff positions",
    "location": "On-site",
    "lead": "",
    "dependencies": "",
    "notes": ""
  },
  {
    "id": "time_start-playlist-and-slide_16",
    "date": "2026-05-01",
    "time": "",
    "activity": "Start Playlist and slideshow",
    "location": "On-site",
    "lead": "",
    "dependencies": "",
    "notes": ""
  },
  {
    "id": "time_printing-buttons_10",
    "date": "2026-05-01",
    "time": "",
    "activity": "printing, buttons",
    "location": "On-site",
    "lead": "",
    "dependencies": "",
    "notes": ""
  },
  {
    "id": "time_security-check_21",
    "date": "2026-05-01",
    "time": "",
    "activity": "security check",
    "location": "On-site",
    "lead": "",
    "dependencies": "",
    "notes": ""
  }
],
    programming: [
  {
    "id": "prog_popcorn",
    "activity": "Popcorn",
    "location": "",
    "time": "",
    "lead": "HS",
    "needs": "popcorn, oil",
    "status": "Confirmed",
    "notes": "clean after use"
  },
  {
    "id": "prog_cotton-candy",
    "activity": "Cotton Candy",
    "location": "",
    "time": "",
    "lead": "HS",
    "needs": "sugar",
    "status": "Confirmed",
    "notes": "clean after use"
  },
  {
    "id": "prog_art-supplies",
    "activity": "Art supplies",
    "location": "",
    "time": "",
    "lead": "Gne has some",
    "needs": "paint, brushes, gloves",
    "status": "Planned",
    "notes": "return to Art HQx, will offset with donations"
  },
  {
    "id": "prog_live-music",
    "activity": "live music",
    "location": "",
    "time": "",
    "lead": "IG",
    "needs": "",
    "status": "Planned",
    "notes": "for gas money x 7"
  },
  {
    "id": "prog_merch",
    "activity": "merch",
    "location": "",
    "time": "",
    "lead": "MOC",
    "needs": "may day shirts and pins",
    "status": "Planned",
    "notes": ""
  },
  {
    "id": "prog_banners",
    "activity": "Banners",
    "location": "",
    "time": "",
    "lead": "MOC",
    "needs": "signage and decorative",
    "status": "Needs Supplies",
    "notes": ""
  },
  {
    "id": "prog_flags",
    "activity": "Flags",
    "location": "",
    "time": "",
    "lead": "",
    "needs": "",
    "status": "Planned",
    "notes": ""
  },
  {
    "id": "prog_seating-and-tables",
    "activity": "seating and tables",
    "location": "",
    "time": "",
    "lead": "",
    "needs": "6 tables, 50 seats",
    "status": "Planned",
    "notes": ""
  },
  {
    "id": "prog_art-board-x-3",
    "activity": "art board x 3",
    "location": "",
    "time": "",
    "lead": "MOC",
    "needs": "cheapest 4x8 board at HD",
    "status": "Planned",
    "notes": ""
  },
  {
    "id": "prog_jaw-bone-puppets",
    "activity": "Jaw Bone Puppets",
    "location": "",
    "time": "",
    "lead": "Adam on Signal",
    "needs": "",
    "status": "Planned",
    "notes": ""
  },
  {
    "id": "prog_film-screening",
    "activity": "film screening",
    "location": "",
    "time": "",
    "lead": "",
    "needs": "",
    "status": "Planned",
    "notes": ""
  },
  {
    "id": "prog_info-booths",
    "activity": "info booths",
    "location": "",
    "time": "",
    "lead": "",
    "needs": "",
    "status": "Planned",
    "notes": "CRMAN, IWW, Sabot, Blackflower"
  },
  {
    "id": "prog_speakers",
    "activity": "speakers",
    "location": "",
    "time": "",
    "lead": "N/A",
    "needs": "N/A",
    "status": "Planned",
    "notes": "N/A"
  },
  {
    "id": "prog_potluck",
    "activity": "potluck",
    "location": "",
    "time": "",
    "lead": "",
    "needs": "check food budget, propane, chaffing dishes",
    "status": "Planned",
    "notes": "food handlers cards for workers"
  },
  {
    "id": "prog_zine-distro",
    "activity": "zine distro",
    "location": "",
    "time": "",
    "lead": "G",
    "needs": "staples",
    "status": "Planned",
    "notes": "printing with G"
  },
  {
    "id": "prog_buttons",
    "activity": "buttons",
    "location": "",
    "time": "",
    "lead": "Dj and Pat are pressing",
    "needs": "",
    "status": "Planned",
    "notes": ""
  },
  {
    "id": "prog_bounce-houses",
    "activity": "bounce houses",
    "location": "",
    "time": "",
    "lead": "bounce about NW",
    "needs": "",
    "status": "Planned",
    "notes": ""
  },
  {
    "id": "prog_slideshow-playlist",
    "activity": "slideshow / playlist",
    "location": "",
    "time": "",
    "lead": "",
    "needs": "",
    "status": "Planned",
    "notes": "day time and night and dance party"
  },
  {
    "id": "prog_poetry-reading",
    "activity": "poetry reading",
    "location": "",
    "time": "",
    "lead": "MK",
    "needs": "",
    "status": "Planned",
    "notes": ""
  },
  {
    "id": "prog_cornhole",
    "activity": "cornhole",
    "location": "",
    "time": "",
    "lead": "MOC",
    "needs": "",
    "status": "Planned",
    "notes": ""
  },
  {
    "id": "prog_porta-pottys",
    "activity": "porta pottys",
    "location": "",
    "time": "",
    "lead": "Honey Bucket",
    "needs": "",
    "status": "Planned",
    "notes": ""
  },
  {
    "id": "prog_parking-chalk",
    "activity": "parking chalk",
    "location": "",
    "time": "",
    "lead": "MOC",
    "needs": "",
    "status": "Planned",
    "notes": ""
  },
  {
    "id": "prog_med-supplies",
    "activity": "med supplies",
    "location": "",
    "time": "",
    "lead": "Corbin and MOC",
    "needs": "",
    "status": "Planned",
    "notes": ""
  },
  {
    "id": "prog_dry-erase-boards-x-25-ch",
    "activity": "dry erase boards x 25\nChalkboard x 3",
    "location": "",
    "time": "",
    "lead": "MOC",
    "needs": "",
    "status": "Planned",
    "notes": "for noting things throughout the event"
  },
  {
    "id": "prog_bowling",
    "activity": "bowling",
    "location": "",
    "time": "",
    "lead": "MOC",
    "needs": "",
    "status": "Planned",
    "notes": "stick cardboard cutouts of bad guys to the pins"
  },
  {
    "id": "prog_photo-booth",
    "activity": "photo booth",
    "location": "",
    "time": "",
    "lead": "MOC",
    "needs": "",
    "status": "Planned",
    "notes": ""
  },
  {
    "id": "prog_pinatas",
    "activity": "pinatas",
    "location": "",
    "time": "",
    "lead": "",
    "needs": "",
    "status": "Planned",
    "notes": "bad guy effegies"
  },
  {
    "id": "prog_pin-the-tail",
    "activity": "pin the tail",
    "location": "",
    "time": "",
    "lead": "MOC",
    "needs": "",
    "status": "Planned",
    "notes": "bad guy piggy"
  },
  {
    "id": "prog_seed-swap",
    "activity": "Seed swap",
    "location": "",
    "time": "",
    "lead": "",
    "needs": "",
    "status": "Planned",
    "notes": ""
  },
  {
    "id": "prog_chalk",
    "activity": "chalk",
    "location": "",
    "time": "",
    "lead": "MOC",
    "needs": "",
    "status": "Planned",
    "notes": ""
  },
  {
    "id": "prog_weaving-station",
    "activity": "weaving station",
    "location": "",
    "time": "",
    "lead": "MOC",
    "needs": "",
    "status": "Planned",
    "notes": "one thread per person on a communal loom"
  },
  {
    "id": "prog_jam-session",
    "activity": "jam session",
    "location": "",
    "time": "",
    "lead": "rebbie, Gne",
    "needs": "",
    "status": "Planned",
    "notes": "rebbie mc for outdoor stage"
  },
  {
    "id": "prog_open-mic",
    "activity": "open mic",
    "location": "",
    "time": "",
    "lead": "MOC",
    "needs": "",
    "status": "Planned",
    "notes": "karakoe machine"
  },
  {
    "id": "prog_dance-party",
    "activity": "dance party",
    "location": "",
    "time": "",
    "lead": "MOC",
    "needs": "",
    "status": "Planned",
    "notes": "blacklights, floor mat, glow items, lighting"
  },
  {
    "id": "prog_pop-up-tents-x-2",
    "activity": "pop up tents x 2",
    "location": "",
    "time": "",
    "lead": "MOC",
    "needs": "",
    "status": "Planned",
    "notes": "one for art tent, one for backup"
  },
  {
    "id": "prog_maypole-x-6",
    "activity": "maypole x 6",
    "location": "",
    "time": "",
    "lead": "MOC",
    "needs": "",
    "status": "Planned",
    "notes": "5 gal bucket with PVC and ribbons"
  },
  {
    "id": "prog_face-painting",
    "activity": "face painting",
    "location": "",
    "time": "",
    "lead": "",
    "needs": "",
    "status": "Planned",
    "notes": "painter rate 3 hr"
  },
  {
    "id": "prog_scavenger-hunt-prizes",
    "activity": "Scavenger hunt prizes",
    "location": "",
    "time": "",
    "lead": "MOC",
    "needs": "",
    "status": "Planned",
    "notes": "small cheap prizes and candy"
  },
  {
    "id": "prog_jelly-bean-prize",
    "activity": "jelly bean prize",
    "location": "",
    "time": "",
    "lead": "",
    "needs": "for prize",
    "status": "Planned",
    "notes": "nintendo switch"
  },
  {
    "id": "prog_raffle-prizes",
    "activity": "Raffle Prizes",
    "location": "",
    "time": "",
    "lead": "",
    "needs": "",
    "status": "Planned",
    "notes": "gift certs, donations, gift box, books, art kit, board games, movie tickets"
  },
  {
    "id": "prog_total-min",
    "activity": "TOTAL MIN",
    "location": "",
    "time": "",
    "lead": "",
    "needs": "",
    "status": "Planned",
    "notes": ""
  },
  {
    "id": "prog_total-max",
    "activity": "TOTAL MAX",
    "location": "",
    "time": "",
    "lead": "",
    "needs": "",
    "status": "Planned",
    "notes": ""
  }
],
    inventory: [
  {
    "id": "inv_iww-flag",
    "item": "IWW flag",
    "quantity": "8",
    "location": "",
    "owner": "",
    "condition": "",
    "notes": ""
  },
  {
    "id": "inv_sabot-flag",
    "item": "Sabot flag",
    "quantity": "6",
    "location": "",
    "owner": "",
    "condition": "",
    "notes": ""
  },
  {
    "id": "inv_red-and-black-flags",
    "item": "Red and black flags",
    "quantity": "3 ea",
    "location": "",
    "owner": "",
    "condition": "",
    "notes": ""
  },
  {
    "id": "inv_may-day-banner",
    "item": "May Day Banner",
    "quantity": "1",
    "location": "",
    "owner": "",
    "condition": "",
    "notes": ""
  },
  {
    "id": "inv_haymarket-martyrs-banner",
    "item": "Haymarket Martyrs banner",
    "quantity": "1",
    "location": "",
    "owner": "",
    "condition": "Needs review",
    "notes": "replace"
  },
  {
    "id": "inv_blackflower-presents-ban",
    "item": "Blackflower Presents banner",
    "quantity": "1",
    "location": "",
    "owner": "",
    "condition": "",
    "notes": ""
  },
  {
    "id": "inv_may-day-on-the-harbor-ba",
    "item": "May Day on the Harbor Banner",
    "quantity": "1",
    "location": "",
    "owner": "",
    "condition": "",
    "notes": ""
  },
  {
    "id": "inv_history-display-boards",
    "item": "History display boards",
    "quantity": "3",
    "location": "",
    "owner": "",
    "condition": "",
    "notes": ""
  },
  {
    "id": "inv_a-frames-and-boards",
    "item": "A frames and boards",
    "quantity": "3",
    "location": "",
    "owner": "",
    "condition": "",
    "notes": ""
  },
  {
    "id": "inv_memorial-display-frames",
    "item": "Memorial display frames",
    "quantity": "1",
    "location": "",
    "owner": "",
    "condition": "Needs review",
    "notes": "replace"
  },
  {
    "id": "inv_posters",
    "item": "Posters",
    "quantity": "1",
    "location": "",
    "owner": "",
    "condition": "",
    "notes": "one of each, laminated"
  },
  {
    "id": "inv_tables",
    "item": "Tables",
    "quantity": "3",
    "location": "",
    "owner": "",
    "condition": "",
    "notes": ""
  },
  {
    "id": "inv_tablecloths",
    "item": "Tablecloths",
    "quantity": "5",
    "location": "",
    "owner": "",
    "condition": "",
    "notes": "2 red, 1 black, 2 BFC"
  },
  {
    "id": "inv_history-binders",
    "item": "History binders",
    "quantity": "5",
    "location": "",
    "owner": "",
    "condition": "",
    "notes": ""
  },
  {
    "id": "inv_snow-cone-machine",
    "item": "snow cone machine",
    "quantity": "1",
    "location": "",
    "owner": "",
    "condition": "",
    "notes": "Faye's"
  },
  {
    "id": "inv_pop-up-tent-10x10",
    "item": "Pop up tent 10x10",
    "quantity": "2",
    "location": "",
    "owner": "",
    "condition": "",
    "notes": ""
  },
  {
    "id": "inv_wall-coverings",
    "item": "wall coverings",
    "quantity": "12",
    "location": "",
    "owner": "",
    "condition": "",
    "notes": "plastic tablecloths"
  },
  {
    "id": "inv_flower-baskets",
    "item": "flower baskets",
    "quantity": "10",
    "location": "",
    "owner": "",
    "condition": "",
    "notes": ""
  },
  {
    "id": "inv_wedding-tent",
    "item": "Wedding Tent",
    "quantity": "1",
    "location": "",
    "owner": "",
    "condition": "",
    "notes": ""
  },
  {
    "id": "inv_easels-and-pads",
    "item": "Easels and pads",
    "quantity": "",
    "location": "",
    "owner": "",
    "condition": "",
    "notes": ""
  },
  {
    "id": "inv_button-supplies",
    "item": "button supplies",
    "quantity": "",
    "location": "",
    "owner": "",
    "condition": "",
    "notes": ""
  },
  {
    "id": "inv_pens-scissors-sharpies",
    "item": "pens scissors sharpies",
    "quantity": "",
    "location": "",
    "owner": "",
    "condition": "",
    "notes": ""
  },
  {
    "id": "inv_lanyards",
    "item": "lanyards",
    "quantity": "",
    "location": "",
    "owner": "",
    "condition": "",
    "notes": ""
  },
  {
    "id": "inv_clipboards-and-pads",
    "item": "clipboards and pads",
    "quantity": "",
    "location": "",
    "owner": "",
    "condition": "",
    "notes": ""
  },
  {
    "id": "inv_first-aid-kits",
    "item": "first aid kits",
    "quantity": "",
    "location": "",
    "owner": "",
    "condition": "",
    "notes": ""
  },
  {
    "id": "inv_bread-and-roses",
    "item": "bread and roses",
    "quantity": "",
    "location": "",
    "owner": "",
    "condition": "",
    "notes": ""
  },
  {
    "id": "inv_red-thread",
    "item": "red thread",
    "quantity": "",
    "location": "",
    "owner": "",
    "condition": "",
    "notes": ""
  },
  {
    "id": "inv_stamp",
    "item": "stamp",
    "quantity": "",
    "location": "",
    "owner": "",
    "condition": "",
    "notes": ""
  },
  {
    "id": "inv_tickets",
    "item": "tickets",
    "quantity": "",
    "location": "",
    "owner": "",
    "condition": "",
    "notes": ""
  },
  {
    "id": "inv_flagpoles",
    "item": "flagpoles",
    "quantity": "",
    "location": "",
    "owner": "",
    "condition": "",
    "notes": ""
  },
  {
    "id": "inv_maypoles",
    "item": "maypoles",
    "quantity": "",
    "location": "",
    "owner": "",
    "condition": "",
    "notes": ""
  },
  {
    "id": "inv_gloves-and-masks",
    "item": "gloves and masks",
    "quantity": "",
    "location": "",
    "owner": "",
    "condition": "",
    "notes": ""
  },
  {
    "id": "inv_zip-ties",
    "item": "zip ties",
    "quantity": "",
    "location": "",
    "owner": "",
    "condition": "",
    "notes": ""
  },
  {
    "id": "inv_dry-erase-boards",
    "item": "dry erase boards",
    "quantity": "25",
    "location": "",
    "owner": "",
    "condition": "",
    "notes": ""
  },
  {
    "id": "inv_cotton-candy-supplies",
    "item": "cotton candy supplies",
    "quantity": "",
    "location": "",
    "owner": "",
    "condition": "",
    "notes": ""
  },
  {
    "id": "inv_popcorn-supplies",
    "item": "popcorn supplies",
    "quantity": "",
    "location": "",
    "owner": "",
    "condition": "",
    "notes": ""
  },
  {
    "id": "inv_dance-floor",
    "item": "dance floor",
    "quantity": "1",
    "location": "",
    "owner": "",
    "condition": "",
    "notes": ""
  },
  {
    "id": "inv_liquid-chalk-markers",
    "item": "liquid chalk markers",
    "quantity": "",
    "location": "",
    "owner": "",
    "condition": "",
    "notes": ""
  },
  {
    "id": "inv_chalkboard",
    "item": "chalkboard",
    "quantity": "3",
    "location": "",
    "owner": "",
    "condition": "",
    "notes": ""
  },
  {
    "id": "inv_bowling-set",
    "item": "bowling set",
    "quantity": "1",
    "location": "",
    "owner": "",
    "condition": "",
    "notes": ""
  },
  {
    "id": "inv_pin-the-tail-decal",
    "item": "pin the tail decal",
    "quantity": "1",
    "location": "",
    "owner": "",
    "condition": "",
    "notes": ""
  },
  {
    "id": "inv_prizes",
    "item": "Prizes:",
    "quantity": "",
    "location": "",
    "owner": "",
    "condition": "",
    "notes": ""
  },
  {
    "id": "inv_electronics",
    "item": "Electronics:",
    "quantity": "",
    "location": "",
    "owner": "",
    "condition": "",
    "notes": ""
  },
  {
    "id": "inv_100-ft-heavy-duty-extens",
    "item": "100 ft heavy duty extension cord",
    "quantity": "1",
    "location": "",
    "owner": "",
    "condition": "",
    "notes": ""
  },
  {
    "id": "inv_5-ft-cord-with-splitter-",
    "item": "5 ft cord with splitter outlets",
    "quantity": "1",
    "location": "",
    "owner": "",
    "condition": "",
    "notes": ""
  },
  {
    "id": "inv_6-ft-ext-cords",
    "item": "6 ft ext. cords",
    "quantity": "6",
    "location": "",
    "owner": "",
    "condition": "",
    "notes": ""
  },
  {
    "id": "inv_cassette-player",
    "item": "cassette player",
    "quantity": "1",
    "location": "",
    "owner": "",
    "condition": "",
    "notes": ""
  },
  {
    "id": "inv_fm-transmitter",
    "item": "FM transmitter",
    "quantity": "1",
    "location": "",
    "owner": "",
    "condition": "",
    "notes": ""
  },
  {
    "id": "inv_radio",
    "item": "radio",
    "quantity": "12",
    "location": "",
    "owner": "",
    "condition": "",
    "notes": ""
  },
  {
    "id": "inv_photo-booth",
    "item": "photo booth",
    "quantity": "1",
    "location": "",
    "owner": "",
    "condition": "",
    "notes": ""
  },
  {
    "id": "inv_black-lights",
    "item": "black lights",
    "quantity": "4",
    "location": "",
    "owner": "",
    "condition": "",
    "notes": ""
  },
  {
    "id": "inv_party-lights",
    "item": "party lights",
    "quantity": "2",
    "location": "",
    "owner": "",
    "condition": "",
    "notes": ""
  },
  {
    "id": "inv_karaoke-machine",
    "item": "karaoke machine",
    "quantity": "1",
    "location": "",
    "owner": "",
    "condition": "",
    "notes": ""
  },
  {
    "id": "inv_on-loan",
    "item": "ON LOAN",
    "quantity": "",
    "location": "",
    "owner": "",
    "condition": "",
    "notes": ""
  },
  {
    "id": "inv_lg-tv",
    "item": "Lg TV",
    "quantity": "2",
    "location": "",
    "owner": "",
    "condition": "",
    "notes": "3"
  },
  {
    "id": "inv_monitors",
    "item": "Monitors",
    "quantity": "0",
    "location": "",
    "owner": "",
    "condition": "",
    "notes": "2"
  },
  {
    "id": "inv_device-mouse",
    "item": "Device / Mouse",
    "quantity": "4",
    "location": "",
    "owner": "",
    "condition": "",
    "notes": "1"
  },
  {
    "id": "inv_hdmi-cord",
    "item": "HDMI cord",
    "quantity": "3",
    "location": "",
    "owner": "",
    "condition": "",
    "notes": "2"
  },
  {
    "id": "inv_lg-power-strip",
    "item": "Lg Power strip",
    "quantity": "0",
    "location": "",
    "owner": "",
    "condition": "",
    "notes": "1"
  },
  {
    "id": "inv_sm-power-strip",
    "item": "sm Power strip",
    "quantity": "1",
    "location": "",
    "owner": "",
    "condition": "",
    "notes": "1"
  }
],
    sponsors: [
  {
    "id": "sponsor_firelands",
    "name": "Firelands",
    "type": "Priority Sponsor",
    "contact": "Edit Baltazar | edith@firelandswa.org",
    "status": "Pending",
    "notes": ""
  },
  {
    "id": "sponsor_historical-seaport",
    "name": "Historical Seaport",
    "type": "Priority Sponsor",
    "contact": "Brandi Bednarik | bbednarik@historicalseaport.org",
    "status": "Confirmed",
    "notes": "500 Dollar discount on space"
  },
  {
    "id": "sponsor_jodesha-broadcasting",
    "name": "Jodesha Broadcasting",
    "type": "Priority Sponsor",
    "contact": "Jon Connors | john.conner@jodesha.com",
    "status": "Confirmed",
    "notes": "1000 Dollar trade for ads"
  },
  {
    "id": "sponsor_timberland-regional-libr",
    "name": "Timberland Regional Library",
    "type": "Priority Sponsor",
    "contact": "Ariana Scott-Zechlin | ascottzechlin@trl.org",
    "status": "Pending",
    "notes": ""
  },
  {
    "id": "sponsor_chaplains-on-the-harbor",
    "name": "Chaplains On The Harbor",
    "type": "Priority Sponsor",
    "contact": "Barb Weza | bweza@chaplainsontheharbor.com",
    "status": "Pending",
    "notes": ""
  },
  {
    "id": "sponsor_quinault-indian-nation-q",
    "name": "Quinault Indian Nation QIN TANF/ New Opp",
    "type": "Priority Sponsor",
    "contact": "Trisha Kautz | 360-537-1324",
    "status": "Pending",
    "notes": ""
  },
  {
    "id": "sponsor_tectonic-comics",
    "name": "Tectonic Comics",
    "type": "Priority Sponsor",
    "contact": "Michelle",
    "status": "Pending",
    "notes": ""
  },
  {
    "id": "sponsor_shirt-house",
    "name": "Shirt House",
    "type": "Priority Sponsor",
    "contact": "",
    "status": "Pending",
    "notes": ""
  },
  {
    "id": "sponsor_polson-museum",
    "name": "Polson Museum",
    "type": "Priority Sponsor",
    "contact": "John Larson | jbl@polsonmuseum.org",
    "status": "Pending",
    "notes": ""
  },
  {
    "id": "sponsor_westport-winery",
    "name": "Westport Winery",
    "type": "Priority Sponsor",
    "contact": "",
    "status": "Pending",
    "notes": ""
  },
  {
    "id": "sponsor_boomtown-records",
    "name": "boomtown records",
    "type": "Priority Sponsor",
    "contact": "",
    "status": "Pending",
    "notes": ""
  },
  {
    "id": "sponsor_cannabis-21",
    "name": "Cannabis 21",
    "type": "Priority Sponsor",
    "contact": "",
    "status": "Pending",
    "notes": ""
  },
  {
    "id": "sponsor_guitar-galactica",
    "name": "Guitar Galactica",
    "type": "Priority Sponsor",
    "contact": "",
    "status": "Pending",
    "notes": ""
  },
  {
    "id": "sponsor_game-freaks",
    "name": "Game Freaks",
    "type": "Priority Sponsor",
    "contact": "",
    "status": "Pending",
    "notes": ""
  },
  {
    "id": "sponsor_dutch-bro-s",
    "name": "Dutch Bro's",
    "type": "Vendor/Sponsor",
    "contact": "Jason Nunnemaker | 360-907-6365 | jason.nunnemaker@dutchbros.com",
    "status": "Pending",
    "notes": ""
  },
  {
    "id": "sponsor_finch-bull-food-truck",
    "name": "Finch & Bull Food Truck",
    "type": "Vendor/Sponsor",
    "contact": "(360) 637-9431 | ghfoodtruck@gmail.com",
    "status": "Pending",
    "notes": ""
  },
  {
    "id": "sponsor_buddy-moos",
    "name": "Buddy Moos",
    "type": "Vendor/Sponsor",
    "contact": "360-660-7442",
    "status": "Pending",
    "notes": ""
  },
  {
    "id": "sponsor_smitty-s-dogs-donuts",
    "name": "Smitty's Dogs & Donuts",
    "type": "Vendor/Sponsor",
    "contact": "206-999-5344 | smittysdogcompany@gmail.com",
    "status": "Pending",
    "notes": ""
  },
  {
    "id": "sponsor_two-broke-chics-deli",
    "name": "Two Broke Chics Deli",
    "type": "Vendor/Sponsor",
    "contact": "Diane or Shelly | (360) 532-9908",
    "status": "Pending",
    "notes": "Morning Call Best Time"
  },
  {
    "id": "sponsor_tea-nancy-s-smoke-fish",
    "name": "Tea & Nancy's Smoke Fish",
    "type": "Vendor/Sponsor",
    "contact": "Nancy Underwood | 360-590-0698 | naunderwood@quinault.org",
    "status": "Pending",
    "notes": ""
  },
  {
    "id": "sponsor_kookamunga-s-doughnuts-e",
    "name": "Kookamunga's Doughnuts&Espresso",
    "type": "Vendor/Sponsor",
    "contact": "360-712-6711",
    "status": "Pending",
    "notes": "Can't vendor not mobile - thank you for considering"
  },
  {
    "id": "sponsor_deen-dogs",
    "name": "Deen Dogs",
    "type": "Vendor/Sponsor",
    "contact": "360-533-8804",
    "status": "Pending",
    "notes": ""
  },
  {
    "id": "sponsor_dj-s",
    "name": "DJ's",
    "type": "Vendor/Sponsor",
    "contact": "(360) 549-7383 | dennajeanscoffee@gmail.com",
    "status": "Pending",
    "notes": "Phone number no good"
  },
  {
    "id": "sponsor_oh-my-donuts",
    "name": "Oh My Donuts",
    "type": "Vendor/Sponsor",
    "contact": "360-637-8713",
    "status": "Pending",
    "notes": "Phone number no good"
  },
  {
    "id": "sponsor_mr-taco",
    "name": "Mr. Taco",
    "type": "Vendor/Sponsor",
    "contact": "Janet's Cell 3609328250 | (360) 637-9992",
    "status": "Pending",
    "notes": ""
  },
  {
    "id": "sponsor_tacos-la-morena",
    "name": "Tacos La Morena",
    "type": "Vendor/Sponsor",
    "contact": "3608095969",
    "status": "Pending",
    "notes": "Phone number no good"
  },
  {
    "id": "sponsor_solid-coffee",
    "name": "Solid Coffee",
    "type": "Vendor/Sponsor",
    "contact": "(206) 591-6718 | solidcoffeehoquiam@gmail.com",
    "status": "Pending",
    "notes": ""
  },
  {
    "id": "sponsor_rediviva",
    "name": "Rediviva",
    "type": "Vendor/Sponsor",
    "contact": "",
    "status": "Pending",
    "notes": ""
  },
  {
    "id": "sponsor_tokeland-hotel",
    "name": "Tokeland Hotel",
    "type": "Vendor/Sponsor",
    "contact": "",
    "status": "Pending",
    "notes": ""
  },
  {
    "id": "sponsor_lumberjack-popcorn-truck",
    "name": "Lumberjack Popcorn Truck",
    "type": "Vendor/Sponsor",
    "contact": "IG",
    "status": "Pending",
    "notes": ""
  },
  {
    "id": "sponsor_hot-mamas-egg-rolls",
    "name": "HOt Mamas Egg rolls",
    "type": "Vendor/Sponsor",
    "contact": "",
    "status": "Pending",
    "notes": ""
  },
  {
    "id": "sponsor_grays-harbor-food-trucks",
    "name": "Grays Harbor Food Trucks",
    "type": "Vendor/Sponsor",
    "contact": "",
    "status": "Pending",
    "notes": "Form: https://wafoodtrucks.org/requestfoodtrucks"
  },
  {
    "id": "sponsor_chaotic-eats",
    "name": "Chaotic Eats",
    "type": "Vendor/Sponsor",
    "contact": "IG / Facebook",
    "status": "Pending",
    "notes": ""
  },
  {
    "id": "sponsor_grays-harbor-ymca",
    "name": "Grays Harbor YMCA",
    "type": "Vendor/Sponsor",
    "contact": "Ryan Catron | 360-537-9622 | rcatron@ghymca.net",
    "status": "Pending",
    "notes": ""
  },
  {
    "id": "sponsor_bimart",
    "name": "BiMart",
    "type": "Vendor/Sponsor",
    "contact": "Don Leber | 541.344.0681 | don.leber@bimart.com",
    "status": "Pending",
    "notes": "Phone number no good"
  },
  {
    "id": "sponsor_jodesha-broadcast",
    "name": "Jodesha Broadcast",
    "type": "Vendor/Sponsor",
    "contact": "Jon Connors | john.conner@jodesha.com",
    "status": "Pending",
    "notes": ""
  },
  {
    "id": "sponsor_chavez-beauty-school",
    "name": "Chavez Beauty School",
    "type": "Vendor/Sponsor",
    "contact": "Maria Chavez | 360-591-4349 | chavezbeauty109@gmail.com",
    "status": "Pending",
    "notes": ""
  },
  {
    "id": "sponsor_anytime-fitness",
    "name": "Anytime Fitness",
    "type": "Vendor/Sponsor",
    "contact": "Rob Gillis | 360-637-9111 | robtgillis@gmail.com",
    "status": "Pending",
    "notes": ""
  },
  {
    "id": "sponsor_northwest-justice-projec",
    "name": "Northwest Justice Project",
    "type": "Vendor/Sponsor",
    "contact": "Jason Vilaysanh | 360-533-2282 | jason.vilaysanh@nwjustice.org",
    "status": "Pending",
    "notes": ""
  },
  {
    "id": "sponsor_columbia-wellness",
    "name": "Columbia Wellness",
    "type": "Vendor/Sponsor",
    "contact": "Karroll Berger | 360-612-0012 ext. 1990 | karroll.berger@columbiawell.org",
    "status": "Pending",
    "notes": ""
  },
  {
    "id": "sponsor_veterans-relief",
    "name": "Veterans Relief",
    "type": "Vendor/Sponsor",
    "contact": "Gwyn Tarrence | 360-660-2640 | veteranrelief@graysharbor.us",
    "status": "Pending",
    "notes": ""
  },
  {
    "id": "sponsor_mytown-coalition",
    "name": "MyTown Coalition",
    "type": "Vendor/Sponsor",
    "contact": "Priya Lindeen | priya.lindeen@graysharbor.us",
    "status": "Pending",
    "notes": ""
  },
  {
    "id": "sponsor_community-integrated-hea",
    "name": "Community Integrated Health Services",
    "type": "Vendor/Sponsor",
    "contact": "Christine Semanko | 360-827-2019 | csemanko@cihealthservices.com",
    "status": "Pending",
    "notes": ""
  },
  {
    "id": "sponsor_harbor-strong-coalition",
    "name": "Harbor Strong Coalition",
    "type": "Vendor/Sponsor",
    "contact": "Sharalyn Steenson | sharalyn.steenson@graysharbor.us",
    "status": "Pending",
    "notes": ""
  },
  {
    "id": "sponsor_nine-line-veteran-servic",
    "name": "Nine Line Veteran Services",
    "type": "Vendor/Sponsor",
    "contact": "Josh Lopez | 253-922-7225 | jlopez@ninelineveterans.onmicrosoft.com",
    "status": "Pending",
    "notes": ""
  },
  {
    "id": "sponsor_south-sound-parent-to-pa",
    "name": "South Sound Parent to Parent",
    "type": "Vendor/Sponsor",
    "contact": "Shawn Thurman | 360-485-2985 | sthurman@ssp2p.org",
    "status": "Pending",
    "notes": ""
  },
  {
    "id": "sponsor_jacknut-apparel",
    "name": "Jacknut Apparel",
    "type": "Vendor/Sponsor",
    "contact": "Christian Burgess | (800) 930-8505 | christian@jacknutapparel.com",
    "status": "Pending",
    "notes": ""
  },
  {
    "id": "sponsor_dshs-mobile-van",
    "name": "DSHS Mobile Van",
    "type": "Vendor/Sponsor",
    "contact": "CSDMobileCSOW@dshs.wa.gov",
    "status": "Pending",
    "notes": ""
  },
  {
    "id": "sponsor_queets-customs",
    "name": "Queets Customs",
    "type": "Vendor/Sponsor",
    "contact": "Buck Carr | buck.carr@quinault.org",
    "status": "Pending",
    "notes": ""
  },
  {
    "id": "sponsor_sacred-healing-journey",
    "name": "Sacred Healing Journey",
    "type": "Vendor/Sponsor",
    "contact": "Stephanie Terrell | stephanie.terrell@quinault.org",
    "status": "Pending",
    "notes": ""
  },
  {
    "id": "sponsor_moore-wright-group",
    "name": "Moore Wright Group",
    "type": "Vendor/Sponsor",
    "contact": "info@tmwg.org",
    "status": "Pending",
    "notes": ""
  },
  {
    "id": "sponsor_beading-hearts",
    "name": "Beading Hearts",
    "type": "Vendor/Sponsor",
    "contact": "Madison Judkins | contactbeadinghearts@yahoo.com",
    "status": "Pending",
    "notes": ""
  },
  {
    "id": "sponsor_qin-tanf-new-opp",
    "name": "QIN TANF/ New Opp",
    "type": "Vendor/Sponsor",
    "contact": "Trisha Kautz | 360-537-1324",
    "status": "Pending",
    "notes": ""
  },
  {
    "id": "sponsor_sea-mar",
    "name": "Sea Mar",
    "type": "Vendor/Sponsor",
    "contact": "Susan Drake | 360-538-1461 | susandrake@seamarchc.org",
    "status": "Pending",
    "notes": ""
  },
  {
    "id": "sponsor_gh-treatment-solutions",
    "name": "GH Treatment Solutions",
    "type": "Vendor/Sponsor",
    "contact": "Tina Andrews | 360-712-3591 | tina.andrews@ctcprograms.com",
    "status": "Pending",
    "notes": ""
  },
  {
    "id": "sponsor_sound-to-harbor",
    "name": "Sound to Harbor",
    "type": "Vendor/Sponsor",
    "contact": "Vickie Jensen | 360-533-5420 | vjensen@esd113.org",
    "status": "Pending",
    "notes": ""
  },
  {
    "id": "sponsor_arc-of-grays-harbor",
    "name": "ARC of Grays Harbor",
    "type": "Vendor/Sponsor",
    "contact": "info@arcgh.org",
    "status": "Pending",
    "notes": ""
  },
  {
    "id": "sponsor_beyond-survival",
    "name": "Beyond Survival",
    "type": "Vendor/Sponsor",
    "contact": "Andrea Pinnell | andreaw@ghbeyondsurvival.com",
    "status": "Pending",
    "notes": ""
  },
  {
    "id": "sponsor_dv-center-of-gh",
    "name": "DV Center of GH",
    "type": "Vendor/Sponsor",
    "contact": "Gloria Callaghan | 360-538-0733 | dvcentergh@yahoo.com",
    "status": "Pending",
    "notes": ""
  },
  {
    "id": "sponsor_zia-s",
    "name": "Zia's",
    "type": "Vendor/Sponsor",
    "contact": "360-637-8365",
    "status": "Pending",
    "notes": ""
  },
  {
    "id": "sponsor_ajs-gardening",
    "name": "AJs gardening",
    "type": "Vendor/Sponsor",
    "contact": "",
    "status": "Pending",
    "notes": ""
  },
  {
    "id": "sponsor_harbor-blooms",
    "name": "Harbor blooms",
    "type": "Vendor/Sponsor",
    "contact": "+1-360-532-0300",
    "status": "Pending",
    "notes": ""
  }
],
    budget: [
  {
    "id": "budget_rental-space",
    "item": "Rental Space",
    "category": "Finance",
    "cost": 650.0,
    "paid": true,
    "notes": ""
  },
  {
    "id": "budget_av-tv-and-surround",
    "item": "AV/TV and surround",
    "category": "Finance",
    "cost": "",
    "paid": true,
    "notes": ""
  },
  {
    "id": "budget_sound-system-and-mics",
    "item": "sound system and mics",
    "category": "Finance",
    "cost": "",
    "paid": true,
    "notes": ""
  },
  {
    "id": "budget_popcorn-machine",
    "item": "popcorn machine",
    "category": "Finance",
    "cost": "",
    "paid": true,
    "notes": "clean when done"
  },
  {
    "id": "budget_cotton-candy-machine",
    "item": "cotton candy machine",
    "category": "Finance",
    "cost": "",
    "paid": true,
    "notes": "clean when done"
  },
  {
    "id": "budget_set-up-night-before",
    "item": "set up night before",
    "category": "Finance",
    "cost": "",
    "paid": true,
    "notes": ""
  },
  {
    "id": "budget_emergency-fund",
    "item": "Emergency Fund",
    "category": "Finance",
    "cost": 500.0,
    "paid": false,
    "notes": "cash box"
  },
  {
    "id": "budget_programming",
    "item": "Programming",
    "category": "Finance",
    "cost": 6505.0,
    "paid": false,
    "notes": "(check programming tab)"
  },
  {
    "id": "budget_additional-decorations",
    "item": "Additional Decorations",
    "category": "Finance",
    "cost": 300.0,
    "paid": false,
    "notes": "stuff other than banner, flags, and signs"
  },
  {
    "id": "budget_food-and-bev",
    "item": "Food and Bev",
    "category": "Finance",
    "cost": 835.0,
    "paid": false,
    "notes": "(check food budget)"
  },
  {
    "id": "budget_publicity",
    "item": "Publicity",
    "category": "Finance",
    "cost": 1000.0,
    "paid": true,
    "notes": "radio ads, tape for flyers"
  },
  {
    "id": "budget_radios-x-12",
    "item": "Radios x 12",
    "category": "Finance",
    "cost": 131.0,
    "paid": true,
    "notes": ""
  },
  {
    "id": "budget_synscreen-snack-water-fo",
    "item": "Synscreen, snack, water for vounteers",
    "category": "Finance",
    "cost": 100.0,
    "paid": false,
    "notes": ""
  },
  {
    "id": "budget_food_oatmeal-hot-water-brow",
    "item": "Oatmeal, Hot water, Brown Sugar, Maple Syrup, trail mixes",
    "category": "Food",
    "cost": 40.0,
    "paid": true,
    "notes": ""
  },
  {
    "id": "budget_food_coffee-tea-and-creamer",
    "item": "coffee / tea and creamers",
    "category": "Food",
    "cost": 60.0,
    "paid": true,
    "notes": ""
  },
  {
    "id": "budget_food_cereal-and-milk-vegan",
    "item": "Cereal and milk (vegan)",
    "category": "Food",
    "cost": 90.0,
    "paid": true,
    "notes": ""
  },
  {
    "id": "budget_food_fruit",
    "item": "Fruit",
    "category": "Food",
    "cost": 40.0,
    "paid": false,
    "notes": ""
  },
  {
    "id": "budget_food_trail-mix",
    "item": "trail mix",
    "category": "Food",
    "cost": 15.0,
    "paid": true,
    "notes": ""
  },
  {
    "id": "budget_food_sandwich-stuff",
    "item": "Sandwich Stuff",
    "category": "Food",
    "cost": 100.0,
    "paid": false,
    "notes": ""
  },
  {
    "id": "budget_food_hot-dogs-and-burgers",
    "item": "Hot Dogs and burgers",
    "category": "Food",
    "cost": 250.0,
    "paid": false,
    "notes": ""
  },
  {
    "id": "budget_food_crackers-and-chips",
    "item": "crackers and chips",
    "category": "Food",
    "cost": 70.0,
    "paid": true,
    "notes": ""
  },
  {
    "id": "budget_food_trail-mix",
    "item": "trail mix",
    "category": "Food",
    "cost": 15.0,
    "paid": true,
    "notes": ""
  },
  {
    "id": "budget_food_cheddar-potato-and-chi",
    "item": "Cheddar Potato and Chicken Noodle",
    "category": "Food",
    "cost": 65.0,
    "paid": true,
    "notes": ""
  },
  {
    "id": "budget_food_bread",
    "item": "Bread",
    "category": "Food",
    "cost": 50.0,
    "paid": false,
    "notes": ""
  },
  {
    "id": "budget_food_jelly-beans",
    "item": "Jelly Beans",
    "category": "Food",
    "cost": 25.0,
    "paid": true,
    "notes": ""
  },
  {
    "id": "budget_food_total-cost",
    "item": "TOTAL COST",
    "category": "Food",
    "cost": 380.0,
    "paid": true,
    "notes": ""
  }
],
    volunteers: buildVolunteerSeed(),
    runOfShow: deriveRunOfShowChecklist([], []),
  };
}

export function normalizeOpsState(input) {
  const base = createInitialOpsState();
  return finalizeState({
    meta: typeof input?.meta === "object" && input?.meta ? { ...base.meta, ...input.meta } : base.meta,
    tasks: Array.isArray(input?.tasks) ? input.tasks : base.tasks,
    timeline: Array.isArray(input?.timeline) ? input.timeline : base.timeline,
    programming: Array.isArray(input?.programming) ? input.programming : base.programming,
    inventory: Array.isArray(input?.inventory) ? input.inventory : base.inventory,
    sponsors: Array.isArray(input?.sponsors) ? input.sponsors : base.sponsors,
    budget: Array.isArray(input?.budget) ? input.budget : base.budget,
    volunteers: Array.isArray(input?.volunteers) ? input.volunteers : base.volunteers,
    runOfShow: Array.isArray(input?.runOfShow) && input.runOfShow.length
      ? input.runOfShow
      : deriveRunOfShowChecklist(
          Array.isArray(input?.tasks) ? input.tasks : base.tasks,
          Array.isArray(input?.timeline) ? input.timeline : base.timeline
        ),
  });
}

export function withOpsProvider(element) {
  return React.createElement(OpsStoreProvider, null, element);
}
