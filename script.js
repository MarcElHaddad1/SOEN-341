//  Events 
const EVENTS = [
  { id: "e1", title: "Robotics Club Kickoff", date: "2025-10-15T18:00:00", location: "Engineering Hall A", category: "Technology", organization: "Robotics Club", description: "Meet the team, see demos, and learn sub-teams (mechanical, electrical, software)." },
  { id: "e2", title: "Campus Music Night",     date: "2025-10-18T19:30:00", location: "Student Center Auditorium", category: "Arts", organization: "Music Society", description: "Live performances by student bands and solo artists." },
  { id: "e3", title: "Startup Pitch Workshop", date: "2025-10-21T16:00:00", location: "Innovation Lab", category: "Business", organization: "Entrepreneurship Club", description: "Hands-on pitching practice with mentors." },
  { id: "e4", title: "Intramural Finals: 5v5", date: "2025-10-25T14:00:00", location: "Main Gym", category: "Sports", organization: "Athletics", description: "Cheer at the intramural basketball finals." },
  { id: "e5", title: "AI Study Jam",           date: "2025-10-28T17:00:00", location: "CS Building 3.120", category: "Technology", organization: "CS Society", description: "Peer-led study session on ML basics. Snacks provided." },
  { id: "e6", title: "Career Fair Prep",       date: "2025-11-02T12:00:00", location: "Career Center", category: "Careers", organization: "Student Union", description: "Resume clinic, elevator pitch practice, recruiter Q&A." }
];

// Element refs 
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

// Personal calendar UI
const $myCalBtn  = document.getElementById("my-calendar-btn");
const $calModal  = document.getElementById("cal-modal");
const $calClose  = document.getElementById("cal-close");
const $calList   = document.getElementById("cal-list");
const $calCount  = document.getElementById("calendar-count");
const $toast     = document.getElementById("toast");

// State 
const state = { q: "", category: "", org: "", from: "", to: "" };

// Saved events (persist in localStorage)
const saved = loadSaved();
updateCalendarCount();

// Init dropdowns 
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

//  Helpers 
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

function loadSaved(){
  try { return new Set(JSON.parse(localStorage.getItem("myCalendar") || "[]")); }
  catch { return new Set(); }
}
function persistSaved(){
  localStorage.setItem("myCalendar", JSON.stringify([...saved]));
}
function updateCalendarCount(){
  if ($calCount) $calCount.textContent = String(saved.size);
}

let toastTimer;
function showToast(msg){
  if (!$toast) return;
  $toast.textContent = msg;
  $toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $toast.classList.remove("show"), 1600);
}

// Render cards 
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
    const isSaved = saved.has(ev.id);
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
        <button class="btn secondary" data-id="${ev.id}" data-action="save" ${isSaved ? "disabled" : ""}>
          ${isSaved ? "Added ✓" : "Add to calendar"}
        </button>
      </div>`;
    $events.appendChild(card);
  }
}

// Details modal 
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

//  Personal calendar (save/remove + modal) 
function saveEvent(id){
  if (saved.has(id)) return;
  saved.add(id);
  persistSaved();
  updateCalendarCount();
  showToast("Added to calendar");
  render();
}
function removeEvent(id){
  if (!saved.has(id)) return;
  saved.delete(id);
  persistSaved();
  updateCalendarCount();
  renderCalList();
  showToast("Removed from calendar");
  render();
}

function renderCalList(){
  const items = EVENTS.filter(e => saved.has(e.id))
                      .sort((a,b)=> new Date(a.date) - new Date(b.date));
  if (!items.length){
    $calList.innerHTML = `<li class="muted">No events saved yet.</li>`;
    return;
  }
  $calList.innerHTML = items.map(ev => `
    <li class="cal-item">
      <div>
        <strong>${ev.title}</strong><br>
        <span class="muted">${fmtDate(ev.date)} • ${ev.location}</span>
      </div>
      <button class="icon-btn" data-remove-id="${ev.id}">Remove</button>
    </li>
  `).join("");
}
function openCal(){ renderCalList(); $calModal.setAttribute("aria-hidden","false"); }
function closeCal(){ $calModal.setAttribute("aria-hidden","true"); }

// Listeners 

// Filters
$q.addEventListener("input",  e => { state.q = e.target.value; render(); });
$category.addEventListener("change", e => { state.category = e.target.value; render(); });
$org.addEventListener("change",      e => { state.org      = e.target.value; render(); });
$from.addEventListener("change",     e => { state.from     = e.target.value; render(); });
$to.addEventListener("change",       e => { state.to       = e.target.value; render(); });

$clear.addEventListener("click", () => {
  state.q = state.category = state.org = state.from = state.to = "";
  if ($q)        $q.value = "";
  if ($category) $category.value = "";
  if ($org)      $org.value = "";
  if ($from)     $from.value = "";
  if ($to)       $to.value = "";
  render();
});

//  details + save 
$events.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-id]");
  if (!btn) return;
  const id = btn.dataset.id;
  if (btn.dataset.action === "details") openDetails(id);
  if (btn.dataset.action === "save")    saveEvent(id);
});

// Details modal close
$modalClose.addEventListener("click", closeDetails);
$modal.addEventListener("click", (e) => { if (e.target === $modal) closeDetails(); });

// My Calendar 
if ($myCalBtn) $myCalBtn.addEventListener("click", openCal);
if ($calClose) $calClose.addEventListener("click", closeCal);
if ($calModal) $calModal.addEventListener("click", (e) => { if (e.target === $calModal) closeCal(); });
if ($calList)  $calList.addEventListener("click", (e) => {
  const rm = e.target.closest("button[data-remove-id]");
  if (rm) removeEvent(rm.dataset.removeId);
});

//  Esc to close any open modal
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if ($modal && $modal.getAttribute("aria-hidden") === "false") closeDetails();
    if ($calModal && $calModal.getAttribute("aria-hidden") === "false") closeCal();
  }
});

// First paint 
render();
