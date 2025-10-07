// Events
const EVENTS = [
  { id: "e1", title: "Robotics Club Kickoff", date: "2025-10-15T18:00:00", location: "Engineering Hall A", category: "Technology", organization: "Robotics Club", description: "Meet the team, see demos, and learn sub-teams (mechanical, electrical, software)." },
  { id: "e2", title: "Campus Music Night",     date: "2025-10-18T19:30:00", location: "Student Center Auditorium", category: "Arts", organization: "Music Society", description: "Live performances by student bands and solo artists." },
  { id: "e3", title: "Startup Pitch Workshop", date: "2025-10-21T16:00:00", location: "Innovation Lab", category: "Business", organization: "Entrepreneurship Club", description: "Hands-on pitching practice with mentors." },
  { id: "e4", title: "Intramural Finals: 5v5", date: "2025-10-25T14:00:00", location: "Main Gym", category: "Sports", organization: "Athletics", description: "Cheer at the intramural basketball finals." },
  { id: "e5", title: "AI Study Jam",           date: "2025-10-28T17:00:00", location: "CS Building 3.120", category: "Technology", organization: "CS Society", description: "Peer-led study session on ML basics. Snacks provided." },
  { id: "e6", title: "Career Fair Prep",       date: "2025-11-02T12:00:00", location: "Career Center", category: "Careers", organization: "Student Union", description: "Resume clinic, elevator pitch practice, recruiter Q&A." }
];

// Elements 
const $events   = document.getElementById("events");
const $q        = document.getElementById("q");
const $category = document.getElementById("category");
const $org      = document.getElementById("org");
const $from     = document.getElementById("from");
const $to       = document.getElementById("to");
const $clear    = document.getElementById("clear");

const $modal       = document.getElementById("modal");
const $modalClose  = document.getElementById("modal-close");
const $mTitle      = document.getElementById("m-title");
const $mWhen       = document.getElementById("m-when");
const $mWhere      = document.getElementById("m-where");
const $mDesc       = document.getElementById("m-desc");
const $mTags       = document.getElementById("m-tags");

// State 
const state = { q: "", category: "", org: "", from: "", to: "" };

//  dropdowns
(function initFilters() {
  const categories = [...new Set(EVENTS.map(e => e.category))].sort();
  const orgs = [...new Set(EVENTS.map(e => e.organization))].sort();

  for (const c of categories) {
    const opt = document.createElement("option");
    opt.value = c; opt.textContent = c;
    $category.appendChild(opt);
  }
  for (const o of orgs) {
    const opt = document.createElement("option");
    opt.value = o; opt.textContent = o;
    $org.appendChild(opt);
  }
})();


const fmtDate = iso =>
  new Date(iso).toLocaleString([], { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

function matchesFilters(ev) {
  const q = state.q.trim().toLowerCase();
  if (q) {
    const hay = (ev.title + " " + ev.description + " " + ev.location).toLowerCase();
    if (!hay.includes(q)) return false;
  }
  if (state.category && ev.category !== state.category) return false;
  if (state.org && ev.organization !== state.org) return false;

  const d = new Date(ev.date);
  if (state.from && d < new Date(state.from)) return false;
  if (state.to && d > new Date(state.to + "T23:59:59")) return false;

  return true;
}


function render() {
  const filtered = EVENTS.filter(matchesFilters).sort((a,b) => new Date(a.date) - new Date(b.date));
  $events.innerHTML = "";

  if (!filtered.length) {
    $events.innerHTML = `<article class="card"><p class="muted">No events match your filters.</p></article>`;
    return;
  }

  for (const ev of filtered) {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <div>
        <h3>${ev.title}</h3>
        <p class="muted">${fmtDate(ev.date)} • ${ev.location}</p>
      </div>
      <div class="tags">
        <span class="tag">${ev.category}</span>
        <span class="tag">${ev.organization}</span>
      </div>
      <div class="actions">
        <button class="btn" data-id="${ev.id}" data-action="details">View details</button>
      </div>`;
    $events.appendChild(card);
  }
}

// Modal controls 
function openDetails(id) {
  const ev = EVENTS.find(e => e.id === id);
  if (!ev) return;
  $mTitle.textContent = ev.title;
  $mWhen.textContent  = fmtDate(ev.date);
  $mWhere.textContent = ev.location;
  $mDesc.textContent  = ev.description;
  $mTags.innerHTML    = `<span class="tag">${ev.category}</span><span class="tag">${ev.organization}</span>`;
  $modal.setAttribute("aria-hidden", "false");
}
function closeDetails(){ $modal.setAttribute("aria-hidden", "true"); }

// Listeners
$q.addEventListener("input",  e => { state.q = e.target.value; render(); });
$category.addEventListener("change", e => { state.category = e.target.value; render(); });
$org.addEventListener("change",      e => { state.org      = e.target.value; render(); });
$from.addEventListener("change",     e => { state.from     = e.target.value; render(); });
$to.addEventListener("change",       e => { state.to       = e.target.value; render(); });

$clear.addEventListener("click", () => {
  state.q = state.category = state.org = state.from = state.to = "";
  $q.value = $category.value = $org.value = $from.value = $to.value = "";
  render();
});

$events.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action='details']");
  if (btn) openDetails(btn.dataset.id);
});
$modalClose.addEventListener("click", closeDetails);
$modal.addEventListener("click", (e) => { if (e.target === $modal) closeDetails(); });

render();
