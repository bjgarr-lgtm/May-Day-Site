import { scheduleItems, timeline as siteTimeline, siteMeta } from "../../../data/maydayContent";

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseEventDate() {
  const label = siteMeta?.dateLabel || "May 2 2026";
  const parsed = new Date(label);
  if (Number.isNaN(parsed.getTime())) return "2026-05-02";
  return parsed.toISOString().slice(0, 10);
}

function normalizeArea(value) {
  const text = String(value || "").trim().toLowerCase();
  if (!text) return "";
  if (text === "site wide") return "site wide";
  if (text === "indoors") return "indoors";
  if (text === "art center") return "art center";
  return value;
}

function inferCategory(item) {
  const text = `${item.category || ""} ${item.title || ""} ${item.blurb || ""}`.toLowerCase();
  if (/music|band|lineup|jam|mc|roustabout/.test(text)) return "Performance";
  if (/film|screening/.test(text)) return "Performance";
  if (/food|potluck|coffee|tea|popcorn|cotton candy/.test(text)) return "Food";
  if (/art|zine|activity|family|hunt|face paint|craft/.test(text)) return "Activity";
  return "General";
}

function inferNeeds(item) {
  const text = `${item.title || ""} ${item.blurb || ""}`.toLowerCase();
  const needs = [];
  if (/film|screening/.test(text)) needs.push("projector", "screen", "seating");
  if (/music|band|lineup|jam|mc|roustabout/.test(text)) needs.push("pa", "mics");
  if (/potluck|food|coffee|tea/.test(text)) needs.push("tables");
  if (/art|zine|craft|face paint/.test(text)) needs.push("tables", "art supplies");
  return Array.from(new Set(needs)).join(", ");
}

function parseTimeRange(text) {
  const raw = String(text || "").trim().toLowerCase();
  if (!raw || raw === "all day" || raw === "night lineup") {
    return { time: text || "", start: "", end: "" };
  }

  const m = raw.match(/^(\d{1,2}:\d{2}\s*(?:am|pm))(?:\s*to\s*(\d{1,2}:\d{2}\s*(?:am|pm)))?$/i);
  if (!m) return { time: text || "", start: "", end: "" };

  const start = m[1].trim();
  const end = m[2] ? m[2].trim() : "";
  return {
    time: end ? `${start} to ${end}` : start,
    start,
    end,
  };
}

function makeProgrammingId(item) {
  return `site_prog_${slugify(item.title)}_${slugify(item.time)}_${slugify(item.area)}`;
}

function makeTimelineId(item) {
  return `site_timeline_${slugify(item.title)}_${slugify(item.time)}_${slugify(item.area)}`;
}

export function buildWebsiteProgrammingRows() {
  const eventDate = parseEventDate();

  return scheduleItems.map((item) => {
    const range = parseTimeRange(item.time);
    return {
      id: makeProgrammingId(item),
      activity: item.title,
      category: inferCategory(item),
      location: normalizeArea(item.area),
      date: eventDate,
      time: range.time,
      timeStart: range.start,
      timeEnd: range.end,
      lead: "",
      needs: inferNeeds(item),
      cost: "",
      status: "Planned",
      notes: item.blurb || "",
      sourceType: "website_schedule",
      sourceId: makeProgrammingId(item),
      linkedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: "synced",
    };
  });
}

export function buildWebsiteTimelineRows() {
  const eventDate = parseEventDate();
  const rows = [];

  scheduleItems.forEach((item) => {
    const range = parseTimeRange(item.time);
    rows.push({
      id: makeTimelineId(item),
      date: eventDate,
      time: range.time,
      activity: item.title,
      location: normalizeArea(item.area),
      lead: "",
      dependencies: "",
      notes: item.blurb || "",
      sourceType: "website_schedule",
      sourceId: makeTimelineId(item),
      linkedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: "synced",
    });
  });

  siteTimeline.forEach((item) => {
    rows.push({
      id: `site_timeline_card_${slugify(item.title)}_${slugify(item.time)}`,
      date: eventDate,
      time: item.time,
      activity: item.title,
      location: "",
      lead: "",
      dependencies: "",
      notes: item.detail || "",
      sourceType: "website_timeline",
      sourceId: `site_timeline_card_${slugify(item.title)}_${slugify(item.time)}`,
      linkedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: "synced",
    });
  });

  const seen = new Set();
  return rows.filter((item) => {
    const key = item.sourceId;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
