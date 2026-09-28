// Work packages for the phd-progress-2026-09 decks. Dates are approximate,
// reconstructed from the thoughts store and the phd repo history; they place
// the bars, they are not a record.

export type RowKind = "done" | "ongoing" | "now" | "planned" | "partner";

export interface GanttRow {
  id: string;
  label: string;
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD
  kind: RowKind;
  /** Talk acts that light this row up in the strip. */
  acts: string[];
}

export const RANGE_START = "2026-07-01";
export const RANGE_END = "2027-01-01";
export const NOW = "2026-09-28";

export const MONTHS = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const MILESTONES = [
  { date: "2026-10-14", label: "Technical meeting" },
  { date: "2026-12-10", label: "Antonia's RQE (approx.)" },
];

export const ROWS: GanttRow[] = [
  { id: "onboarding", label: "Onboarding · COMPAS repo study", start: "2026-07-01", end: "2026-07-31", kind: "done", acts: ["field"] },
  { id: "compas", label: "COMPAS issues · compas_timber PRs", start: "2026-07-20", end: "2026-09-27", kind: "ongoing", acts: ["picture"] },
  { id: "framing", label: "Thesis framing · skills as deliverables", start: "2026-07-15", end: "2026-09-18", kind: "done", acts: ["field", "picture"] },
  { id: "plates", label: "Plates study · plates as a skill", start: "2026-08-12", end: "2026-09-21", kind: "ongoing", acts: ["plates"] },
  { id: "samples", label: "Hex samples · two STEP models to Abaqus", start: "2026-08-17", end: "2026-08-28", kind: "done", acts: ["plates", "antonia"] },
  { id: "epfl", label: "EPFL summer school", start: "2026-08-31", end: "2026-09-05", kind: "done", acts: [] },
  { id: "geometry", label: "Architectural geometry · flat plates, shells", start: "2026-08-25", end: "2026-09-26", kind: "ongoing", acts: ["plates"] },
  { id: "datamodels", label: "19 data models → data dictionary", start: "2026-09-10", end: "2026-09-20", kind: "done", acts: ["data"] },
  { id: "structure", label: "Structural evaluation · three tiers", start: "2026-09-10", end: "2026-09-22", kind: "ongoing", acts: ["structure"] },
  { id: "zotero", label: "Zotero plugin", start: "2026-09-14", end: "2026-09-21", kind: "done", acts: [] },
  { id: "demonstrator", label: "HIL demonstrator · plate roof", start: "2026-09-14", end: "2026-10-14", kind: "now", acts: ["fit", "demonstrator"] },
  { id: "beyond", label: "Acoustics · fabrication", start: "2026-10-14", end: "2026-12-15", kind: "planned", acts: ["beyond"] },
  { id: "coursework", label: "Coursework", start: "2026-09-27", end: "2026-12-20", kind: "planned", acts: ["coursework"] },
  { id: "antonia", label: "Antonia · tests, Abaqus, RQE", start: "2026-08-01", end: "2026-12-10", kind: "partner", acts: ["antonia"] },
];

/** Label shown under the strip for each talk act. */
export const ACT_LABELS: Record<string, string> = {
  field: "The field",
  data: "From data model to dictionary",
  picture: "The big picture",
  fit: "How it fits together",
  plates: "Plates",
  structure: "Structural evaluation",
  beyond: "Acoustics · fabrication",
  antonia: "With Antonia",
  demonstrator: "The demonstrator",
  coursework: "Coursework",
  next: "Next",
};

/**
 * The current deck's simplified Gantt: one row per section of the talk, in
 * talk order. ROWS and ACT_LABELS above stay as they are for the v1 deck.
 */
export const SECTION_ROWS: GanttRow[] = [
  { id: "onboarding", label: "Onboarding", start: "2026-07-01", end: "2026-07-09", kind: "done", acts: ["onboarding"] },
  { id: "compas", label: "COMPAS study · PRs", start: "2026-07-09", end: "2026-09-07", kind: "ongoing", acts: ["compas"] },
  { id: "picture", label: "Big picture", start: "2026-08-14", end: "2026-09-27", kind: "ongoing", acts: ["picture"] },
  { id: "plates", label: "Planar meshing algorithms", start: "2026-08-12", end: "2026-09-26", kind: "ongoing", acts: ["plates"] },
  { id: "structure", label: "Structural analysis", start: "2026-09-10", end: "2026-09-27", kind: "ongoing", acts: ["structure"] },
  { id: "acoustics", label: "Acoustics", start: "2026-10-14", end: "2026-12-15", kind: "planned", acts: ["acoustics"] },
  { id: "assembly", label: "Assembly", start: "2026-10-14", end: "2026-12-15", kind: "planned", acts: ["assembly"] },
  { id: "hil", label: "HIL case study", start: "2026-09-14", end: "2026-10-14", kind: "now", acts: ["hil"] },
  { id: "coursework", label: "Coursework", start: "2026-09-27", end: "2026-12-20", kind: "planned", acts: ["coursework"] },
];

export const SECTION_MILESTONES = [{ date: "2026-10-14", label: "Technical meeting" }];

export const SECTION_ACT_LABELS: Record<string, string> = {
  onboarding: "Onboarding",
  compas: "COMPAS study · PRs",
  picture: "The big picture",
  plates: "Planar meshing algorithms",
  structure: "Structural analysis",
  acoustics: "Acoustics",
  assembly: "Assembly",
  hil: "HIL case study",
  tandem: "Tandem",
  coursework: "Coursework",
};

/**
 * Antonia Schoch's doctoral plan, 2026 to 2029, one row per work package.
 * Read off a photo of her spreadsheet at quarter resolution, so the bars are
 * approximate.
 */
export const ANTONIA_RANGE = { start: "2026-01-01", end: "2030-01-01" };
export const ANTONIA_TICKS = ["2026", "2027", "2028", "2029"].map((y) => ({ date: `${y}-01-01`, label: y }));
export const ANTONIA_GRID = ["2026", "2027", "2028", "2029"].flatMap((y) => ["01", "04", "07", "10"].map((m) => `${y}-${m}-01`));
export const ANTONIA_ROWS: GanttRow[] = [
  { id: "a1", label: "1 · Connection systems review", start: "2026-01-01", end: "2026-07-01", kind: "done", acts: [] },
  { id: "a2", label: "2 · Reduction of the test matrix", start: "2026-04-01", end: "2027-01-01", kind: "partner", acts: [] },
  { id: "a3", label: "3 · Glued: α and β individually", start: "2026-07-01", end: "2027-10-01", kind: "partner", acts: [] },
  { id: "a4", label: "4 · Glued: α and β combined", start: "2027-10-01", end: "2028-10-01", kind: "planned", acts: [] },
  { id: "a5", label: "5 · Screw connections", start: "2028-01-01", end: "2028-10-01", kind: "planned", acts: [] },
  { id: "a6", label: "6 · Holistic evaluation with GKR", start: "2028-04-01", end: "2029-01-01", kind: "planned", acts: [] },
  { id: "a7", label: "7 · Dissertation", start: "2028-10-01", end: "2029-10-01", kind: "planned", acts: [] },
];
export const ANTONIA_MILESTONES = [{ date: "2026-12-10", label: "RQE (approx.)" }];

const DAY = 86_400_000;
const t0 = Date.parse(RANGE_START);
const span = (Date.parse(RANGE_END) - t0) / DAY;

/** Percentage position of a date along the range. */
export function pct(date: string): number {
  return (((Date.parse(date) - t0) / DAY) / span) * 100;
}
