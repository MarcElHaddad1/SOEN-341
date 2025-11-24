function passesFilter(ev, state) {
  // Text search (title + description + location)
  if (state.q) {
    const q = state.q.toLowerCase().trim();
    const haystack = (
      (ev.title || "") +
      " " +
      (ev.description || "") +
      " " +
      (ev.location || "")
    ).toLowerCase();

    if (!haystack.includes(q)) return false;
  }

  // Category filter
  if (state.category && ev.category !== state.category) {
    return false;
  }

  // Organization filter
  if (state.org && ev.organization !== state.org) {
    return false;
  }

  // Date range filter
  const eventDate = new Date(ev.date);

  if (state.from) {
    const fromDate = new Date(state.from + "T00:00:00");
    if (eventDate < fromDate) return false;
  }

  if (state.to) {
    const toDate = new Date(state.to + "T23:59:59");
    if (eventDate > toDate) return false;
  }

  return true;
}

/**
 * Filters a list of events according to the filter state.
 */
function filterEvents(events, state) {
  return events.filter((ev) => passesFilter(ev, state));
}

/**
 * Toggles an event ID in the saved set.
 * Returns a NEW Set – does not mutate the original.
 */
function toggleSaved(savedIds, eventId) {
  const next = new Set(savedIds);
  if (next.has(eventId)) {
    next.delete(eventId);
  } else {
    next.add(eventId);
  }
  return next;
}

/**
 * Returns a list of saved events given all events and a Set of saved IDs.
 */
function getSavedEvents(allEvents, savedIds) {
  return allEvents.filter((ev) => savedIds.has(ev.id));
}

module.exports = {
  passesFilter,
  filterEvents,
  toggleSaved,
  getSavedEvents,
};
