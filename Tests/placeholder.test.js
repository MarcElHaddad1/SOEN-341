test('test', () => { expect(true).toBe(true); });

const {
  passesFilter,
  filterEvents,
  toggleSaved,
  getSavedEvents,
} = require("../src/js/appLogic");

const SAMPLE_EVENTS = [
  {
    id: "e1",
    title: "Robotics Club Kickoff",
    description: "Intro meeting",
    location: "Hall A",
    category: "Club",
    organization: "Robotics Club",
    date: "2025-10-15T18:00:00",
  },
  {
    id: "e2",
    title: "Campus Music Night",
    description: "Live band performances",
    location: "Student Center",
    category: "Social",
    organization: "Music Society",
    date: "2025-10-18T20:00:00",
  },
];

describe("passesFilter", () => {
  test("matches by search text", () => {
    const state = { q: "robotics", category: "", org: "", from: "", to: "" };
    const result = filterEvents(SAMPLE_EVENTS, state);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("e1");
  });

  test("filters by category", () => {
    const state = { q: "", category: "Social", org: "", from: "", to: "" };
    const result = filterEvents(SAMPLE_EVENTS, state);
    expect(result.map(e => e.id)).toEqual(["e2"]);
  });
});

describe("toggleSaved + getSavedEvents", () => {
  test("adds an event to saved set", () => {
    const saved = new Set();
    const next = toggleSaved(saved, "e1");
    expect(next.has("e1")).toBe(true);
  });

  test("removes an event if already saved", () => {
    const saved = new Set(["e1"]);
    const next = toggleSaved(saved, "e1");
    expect(next.has("e1")).toBe(false);
  });

  test("getSavedEvents returns only saved events", () => {
    const saved = new Set(["e2"]);
    const result = getSavedEvents(SAMPLE_EVENTS, saved);
    expect(result.map(e => e.id)).toEqual(["e2"]);
  });
});

