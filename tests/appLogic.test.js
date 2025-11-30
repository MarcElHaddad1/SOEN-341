
const {
  filterEvents,
  passesFilter,
  parseDate,
  isWithinDateRange,
  SAMPLE_EVENTS
} = require('../src/js/appLogic.js' );

const SAMPLE_EVENTS = [
  {
    id: "e1",
    title: "Robotics Club Kickoff",
    description: "Intro meeting, demos, and sub-team signups.",
    location: "Hall A",
    category: "Club",
    organization: "Robotics Club",
    date: "2025-10-15T18:00:00",
  },
  {
    id: "e2",
    title: "Campus Music Night",
    description: "Live performances by student bands.",
    location: "Student Center",
    category: "Social",
    organization: "Music Society",
    date: "2025-10-18T20:00:00",
  },
  {
    id: "e3",
    title: "Career Fair",
    description: "Meet employers and practice networking.",
    location: "Main Hall",
    category: "Career",
    organization: "Career Services",
    date: "2025-11-01T10:00:00",
  },
];

describe("passesFilter / filterEvents (Sprint 3 event browsing)", () => {
  test("no filters returns all events", () => {
    const state = { q: "", category: "", org: "", from: "", to: "" };
    const result = filterEvents(SAMPLE_EVENTS, state);
    expect(result).toHaveLength(SAMPLE_EVENTS.length);
  });

  test("text search matches title/description/location", () => {
    const state = { q: "robotics", category: "", org: "", from: "", to: "" };
    const result = filterEvents(SAMPLE_EVENTS, state);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("e1");
  });

  test("filters by category", () => {
    const state = { q: "", category: "Social", org: "", from: "", to: "" };
    const result = filterEvents(SAMPLE_EVENTS, state);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("e2");
  });

  test("filters by organization", () => {
    const state = {
      q: "",
      category: "",
      org: "Career Services",
      from: "",
      to: "",
    };
    const result = filterEvents(SAMPLE_EVENTS, state);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("e3");
  });

  test("filters by from date", () => {
    const state = { q: "", category: "", org: "", from: "2025-10-18", to: "" };
    const result = filterEvents(SAMPLE_EVENTS, state);
    // Should exclude e1 (2025-10-15)
    expect(result.map((e) => e.id)).toEqual(["e2", "e3"]);
  });

  test("filters by to date", () => {
    const state = { q: "", category: "", org: "", from: "", to: "2025-10-18" };
    const result = filterEvents(SAMPLE_EVENTS, state);
    // Should exclude e3 (2025-11-01)
    expect(result.map((e) => e.id)).toEqual(["e1", "e2"]);
  });
});

describe("toggleSaved / getSavedEvents (Sprint 3 saving/removing events)", () => {
  test("toggleSaved adds an event when not saved", () => {
    const saved = new Set();
    const next = toggleSaved(saved, "e1");
    expect(next.has("e1")).toBe(true);
    // original set should not be mutated
    expect(saved.has("e1")).toBe(false);
  });

  test("toggleSaved removes an event when already saved", () => {
    const saved = new Set(["e1"]);
    const next = toggleSaved(saved, "e1");
    expect(next.has("e1")).toBe(false);
  });

  test("getSavedEvents returns only saved events", () => {
    const saved = new Set(["e1", "e3"]);
    const result = getSavedEvents(SAMPLE_EVENTS, saved);
    expect(result.map((e) => e.id).sort()).toEqual(["e1", "e3"]);
  });
});
