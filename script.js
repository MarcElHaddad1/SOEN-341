// ---------------------- Events setup ----------------------
const BASE_EVENTS = [
  { id: "e1", title: "Robotics Club Kickoff", date: "2025-10-15T18:00:00", location: "Engineering Hall A", category: "Technology", organization: "Robotics Club", description: "Meet the team, see demos, and learn sub-teams (mechanical, electrical, software).", capacity:50, ticketsClaimed:12 },
  { id: "e2", title: "Campus Music Night",     date: "2025-10-18T19:30:00", location: "Student Center Auditorium", category: "Arts", organization: "Music Society", description: "Live performances by student bands and solo artists.", capacity:80, ticketsClaimed:30},
  { id: "e3", title: "Startup Pitch Workshop", date: "2025-10-21T16:00:00", location: "Innovation Lab", category: "Business", organization: "Entrepreneurship Club", description: "Hands-on pitching practice with mentors.", capacity:60, ticketsClaimed:22},
  { id: "e4", title: "Intramural Finals: 5v5", date: "2025-10-25T14:00:00", location: "Main Gym", category: "Sports", organization: "Athletics", description: "Cheer at the intramural basketball finals.", capacity:120, ticketsClaimed:95},
  { id: "e5", title: "AI Study Jam",           date: "2025-10-28T17:00:00", location: "CS Building 3.120", category: "Technology", organization: "CS Society", description: "Peer-led study session on ML basics. Snacks provided.", capacity:40, ticketsClaimed:10},
  { id: "e6", title: "Career Fair Prep",       date: "2025-11-02T12:00:00", location: "Career Center", category: "Careers", organization: "Student Union", description: "Resume clinic, elevator pitch practice, recruiter Q&A.", capacity:100, ticketsClaimed:25}
];

// User events persistence
function loadUserEvents() {
  try { return JSON.parse(localStorage.getItem("userEvents") || "[]"); }
  catch { return []; }
}
function saveUserEvents(list) {
  localStorage.setItem("userEvents", JSON.stringify(list));
}
let EVENTS = [...BASE_EVENTS, ...loadUserEvents()];

// ---------------------- Attendees store (PERSISTENT) ----------------------
// Map: { [eventId]: [ { id, email, name, claimedAtISO } ] }
const LS_ATTENDEES = "attendees:v1";

function loadAttendeesMap() {
  try { return JSON.parse(localStorage.getItem(LS_ATTENDEES) || "{}"); }
  catch { return {}; }
}
function saveAttendeesMap(map) {
  localStorage.setItem(LS_ATTENDEES, JSON.stringify(map));
}
function getAttendees(eventId) {
  const map = loadAttendeesMap();
  return map[eventId] || [];
}
function setAttendees(eventId, list) {
  const map = loadAttendeesMap();
  map[eventId] = list;
  saveAttendeesMap(map);
}
function seatsLeft(ev) {
  return (ev.capacity ?? 0) - getAttendees(ev.id).length;
}

// Identity helper: prefer auth session email; fallback to a per-browser id
const LOCAL_ID_KEY = "student:id";
function getLocalId() {
  let id = localStorage.getItem(LOCAL_ID_KEY);
  if (!id) {
    id = 'stu_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(LOCAL_ID_KEY, id);
  }
  return id;
}
function currentIdentity() {
  const s = typeof getSession === "function" ? getSession() : null;
  if (s && s.email) return { id: s.email, email: s.email, name: s.name || s.email, role: s.role };
  const id = getLocalId();
  return { id, email: id + "@local", name: "Local User", role: "student" };
}
function hasClaimed(eventId) {
  const me = currentIdentity();
  return getAttendees(eventId).some(a => a.id === me.id);
}

// ---------------------- Elements ----------------------
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

const $myCalBtn  = document.getElementById("my-calendar-btn");
const $calModal  = document.getElementById("cal-modal");
const $calClose  = document.getElementById("cal-close");
const $calList   = document.getElementById("cal-list");
const $calCount  = document.getElementById("calendar-count");
const $toast     = document.getElementById("toast");

const $newBtn    = document.getElementById("new-event-btn");
const $newModal  = document.getElementById("new-modal");
const $newClose  = document.getElementById("new-close");
const $newCancel = document.getElementById("new-cancel");
const $newForm   = document.getElementById("new-form");

const $nTitle    = document.getElementById("n-title");
const $nDateTime = document.getElementById("n-datetime");
const $nLoc      = document.getElementById("n-location");
const $nCat      = document.getElementById("n-category");
const $nOrg      = document.getElementById("n-org");
const $nDesc     = document.getElementById("n-desc");
const $nCap      = document.getElementById("n-cap");

// ---------------------- State & storage ----------------------
const state = { q: "", category: "", org: "", from: "", to: "" };

const saved = loadSaved();
updateCalendarCount();

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

const fmtDate = iso =>
  new Date(iso).toLocaleString([], { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

// ---------------------- Filters ----------------------
function buildFilterOptions() {
  const categories = [...new Set(EVENTS.map(e => e.category))].sort();
  const orgs       = [...new Set(EVENTS.map(e => e.organization))].sort();
  return { categories, orgs };
}
function refreshFilters(keepSelection = true) {
  const prevCat = keepSelection ? $category.value : "";
  const prevOrg = keepSelection ? $org.value : "";

  const { categories, orgs } = buildFilterOptions();

  $category.innerHTML = '<option value="">All categories</option>';
  categories.forEach(c => {
    const o = document.createElement("option"); o.value=c; o.textContent=c; $category.appendChild(o);
  });

  $org.innerHTML = '<option value="">All organizations</option>';
  orgs.forEach(o => {
    const x = document.createElement("option"); x.value=o; x.textContent=o; $org.appendChild(x);
  });

  if (keepSelection) {
    if ([...$category.options].some(o => o.value === prevCat)) $category.value = prevCat;
    if ([...$org.options].some(o => o.value === prevOrg)) $org.value = prevOrg;
  }
}
refreshFilters(false);

// Filter predicate
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

// ---------------------- Render ----------------------
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
        <span class="tag" title="Seats left">${seatsLeft(ev)} left</span>
      </div>
      <div class="actions">
        <button class="btn" data-id="${ev.id}" data-action="details">View details</button>
        <button class="btn secondary" data-id="${ev.id}" data-action="save" ${isSaved ? "disabled" : ""}>
          ${isSaved ? "Added ✓" : "Add to calendar"}
        </button>
      </div>`;

    // If already claimed by current user, show tag
    if (hasClaimed(ev.id)) {
      const tags = card.querySelector('.tags');
      const t = document.createElement('span');
      t.className = 'tag claimed';
      t.textContent = 'Claimed';
      tags && tags.appendChild(t);
    }

    $events.appendChild(card);
  }
}
render();

// ---------------------- Details modal ----------------------
function openDetails(id) {
  const ev = EVENTS.find(e => e.id === id);
  if (!ev) return;

  $mTitle.textContent = ev.title;
  $mWhen.textContent  = fmtDate(ev.date);
  $mWhere.textContent = ev.location;
  $mDesc.textContent  = ev.description;
  $mTags.innerHTML    = `<span class="tag">${ev.category}</span><span class="tag">${ev.organization}</span>`;

  const btn = document.getElementById("claim-btn");
  window.__currentEvent = ev;
  if (btn) btn.onclick = () => claimTicket(ev);

  renderModalSeatsAndAdmin(ev);

  $modal.setAttribute("aria-hidden", "false");
}
function closeDetails(){ $modal.setAttribute("aria-hidden", "true"); }

// ---------------------- Calendar ----------------------
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

// ---------------------- Tickets & QR ----------------------
function loadTickets() {
  try { return JSON.parse(localStorage.getItem("tickets") || "[]"); }
  catch { return []; }
}
function saveTicket(ticket) {
  const list = loadTickets();
  list.push(ticket);
  localStorage.setItem("tickets", JSON.stringify(list));
}
function buildQrPayload(eventId) {
  const me = currentIdentity();
  return JSON.stringify({
    type: "EVENT_TICKET",
    eventId,
    userId: me.id,
    email: me.email,
    ts: Date.now(),
    nonce: Math.random().toString(36).slice(2, 10)
  });
}
async function loadQrLib() { return; } // already loaded via script tag

// Render seats + role-specific UI (admin sees attendee list)
function renderModalSeatsAndAdmin(ev) {
  const el   = document.getElementById("m-seats");
  const btn  = document.getElementById("claim-btn");
  const wrap = document.getElementById("qr-wrap");
  const box  = document.getElementById("qrcode");

  if (!el || !btn || !wrap || !box) return;

  // Seats (PERSISTENT)
  const left = seatsLeft(ev);
  el.textContent = `Seats left: ${left}`;

  const me = currentIdentity();

  // Admin cannot claim; show admin attendee management
  if (me.role === "admin") {
    btn.disabled = true;
    btn.textContent = "Admin view — cannot claim";
    wrap.style.display = "none";
    renderAdminAttendees(ev);
    return;
  }

  // Student: if already claimed, show QR; otherwise normal state
  if (hasClaimed(ev.id)) {
    btn.disabled = true;
    btn.textContent = "Already claimed";
    wrap.style.display = "block";
    box.innerHTML = "";
    new QRCode(box, { text: buildQrPayload(ev.id), width: 160, height: 160 });
  } else {
    btn.disabled = left <= 0;
    btn.textContent = left <= 0 ? "Sold out" : "Claim ticket";
    wrap.style.display = "none";
    // Remove admin panel if present
    const panel = document.getElementById("admin-att-panel");
    if (panel) panel.remove();
  }
}

// ADMIN: render attendee list with remove buttons
function renderAdminAttendees(ev) {
  // Ensure a container exists under the modal content
  let panel = document.getElementById("admin-att-panel");
  if (!panel) {
    panel = document.createElement("div");
    panel.id = "admin-att-panel";
    panel.className = "card";
    panel.style.marginTop = "12px";
    const modalCard = document.querySelector("#modal .modal-card");
    modalCard.appendChild(panel);
  }

  const list = getAttendees(ev.id);
  if (!list.length) {
    panel.innerHTML = `<h3>Attendees</h3><p class="muted">No attendees yet.</p>`;
    return;
  }

  panel.innerHTML = `
    <h3>Attendees (${list.length})</h3>
    <ul class="cal-list" id="att-list">
      ${list.map(a => `
        <li class="cal-item" data-att-id="${a.id}">
          <div>
            <strong>${a.name || a.email}</strong><br>
            <span class="muted">${a.email}</span>
          </div>
          <button class="icon-btn" data-remove-att="${a.id}">Remove</button>
        </li>
      `).join("")}
    </ul>
  `;

  // Hook remove
  panel.querySelectorAll("[data-remove-att]").forEach(btn => {
    btn.addEventListener("click", () => {
      const attId = btn.getAttribute("data-remove-att");
      const newList = getAttendees(ev.id).filter(a => a.id !== attId);
      setAttendees(ev.id, newList);
      showToast("Removed from event");
      renderModalSeatsAndAdmin(ev);
      render(); // refresh cards (seats left)
    });
  });
}

// Claim logic (STUDENT ONLY, 1 per user, persistent)
async function claimTicket(ev) {
  const me = currentIdentity();
  if (me.role === "admin") {
    showToast("Admins cannot claim tickets.");
    return;
  }
  if (hasClaimed(ev.id)) {
    showToast("You already claimed a ticket for this event.");
    renderModalSeatsAndAdmin(ev);
    return;
  }

  const left = seatsLeft(ev);
  if (left <= 0) { showToast("Sorry, sold out"); return; }

  const payload = buildQrPayload(ev.id);
  await loadQrLib();

  const wrap = document.getElementById("qr-wrap");
  const box  = document.getElementById("qrcode");
  wrap.style.display = "block";
  box.innerHTML = "";
  new QRCode(box, { text: payload, width: 160, height: 160 });

  // Persist attendee
  const list = getAttendees(ev.id);
  list.push({ id: me.id, email: me.email, name: me.name, claimedAtISO: new Date().toISOString() });
  setAttendees(ev.id, list);

  // Optional: keep your existing tickets log
  saveTicket({ eventId: ev.id, payload, at: new Date().toISOString() });

  showToast("Ticket claimed!");
  renderModalSeatsAndAdmin(ev);
  render(); // refresh cards (seats left + claimed tag)
}

// ---------------------- Create Event modal ----------------------
function makeEventId() { return "ue-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2,6); }

function openNewModal(){ 
  $newModal.setAttribute("aria-hidden","false"); 
  $nTitle && $nTitle.focus();
}
function closeNewModal(){ 
  $newModal.setAttribute("aria-hidden","true"); 
  $newForm && $newForm.reset();
}

if ($newBtn)    $newBtn.addEventListener("click", openNewModal);
if ($newClose)  $newClose.addEventListener("click", closeNewModal);
if ($newCancel) $newCancel.addEventListener("click", closeNewModal);
if ($newModal)  $newModal.addEventListener("click", (e)=>{ if (e.target === $newModal) closeNewModal(); });

if ($newForm) {
  $newForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const title = $nTitle.value.trim();
    const dt    = $nDateTime.value;  // yyyy-mm-ddThh:mm
    const loc   = $nLoc.value.trim();
    const cat   = $nCat.value.trim();
    const org   = $nOrg.value.trim();
    const desc  = $nDesc.value.trim();
    const cap   = Math.max(1, Number($nCap.value) || 1);

    if (!title || !dt || !loc || !cat || !org || !desc) {
      showToast("Please fill all fields.");
      return;
    }

    const ev = {
      id: makeEventId(),
      title,
      date: new Date(dt).toISOString(),
      location: loc,
      category: cat,
      organization: org,
      description: desc,
      capacity: cap
    };

    const userEvents = loadUserEvents();
    userEvents.push(ev);
    saveUserEvents(userEvents);

    EVENTS.push(ev);
    refreshFilters(true);
    render();
    closeNewModal();
    showToast("Event created!");
  });
}

// ---------------------- Listeners ----------------------
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

// details + save 
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

// Esc to close any open modal
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if ($modal && $modal.getAttribute("aria-hidden") === "false") closeDetails();
    if ($calModal && $calModal.getAttribute("aria-hidden") === "false") closeCal();
    if ($newModal && $newModal.getAttribute("aria-hidden") === "false") closeNewModal();
  }
});

// --- ADD BELOW (script.js) ---
(function () {
  // Safe session read
  const sess = (window.getSession && getSession()) || null;

  // 2A) Let teachers create events too (index.html currently hides for non-admin)
  document.addEventListener('DOMContentLoaded', () => {
    try {
      const btn = document.getElementById('new-event-btn');
      if (btn && (isAdmin?.() || isTeacher?.())) {
        // remove any "display:none" style that earlier code may have set
        btn.style.removeProperty('display');
      }
    } catch {}
  });

  // 2B) Lightweight attendance store in localStorage (keyed by event key)
  const ATT_KEY = 'attendeesByEvent';
  function readMap() {
    try { return JSON.parse(localStorage.getItem(ATT_KEY) || '{}'); } catch { return {}; }
  }
  function writeMap(m) {
    localStorage.setItem(ATT_KEY, JSON.stringify(m));
  }
  function eventKeyFromModal() {
    // Build a stable-ish key from visible modal fields (no HTML edits)
    const t = document.getElementById('m-title')?.textContent?.trim() || '';
    const w = document.getElementById('m-when')?.textContent?.trim() || '';
    return `${t}@@${w}`; // title + when
  }
  function getAttendees(key) {
    const m = readMap(); return Array.isArray(m[key]) ? m[key] : [];
  }
  function addAttendee(key, user) {
    const m = readMap(); m[key] = getAttendees(key);
    if (!m[key].some(a => a.id === user.id)) { m[key].push(user); writeMap(m); }
  }
  function removeAttendee(key, userId) {
    const m = readMap(); m[key] = getAttendees(key).filter(a => a.id !== userId); writeMap(m);
  }

  // 2C) Hook "Claim ticket" to record attendance too (no changes to your existing handler)
  // We attach an extra listener; your original logic still runs.
  document.addEventListener('click', (e) => {
    const target = e.target;
    if (target && target.id === 'claim-btn') {
      const u = getCurrentUserSafe?.();
      if (!u) return;
      const k = eventKeyFromModal();
      addAttendee(k, u);
      // Optionally refresh the attendees panel if visible
      renderAttendeesPanel(k);
    }
  }, true); // capture to ensure we run regardless of order

  // 2D) Inject a "Who's going" panel for teacher/admin when modal opens
  const modal = document.getElementById('modal');
  if (modal) {
    const obs = new MutationObserver(() => {
      const open = modal.getAttribute('aria-hidden') === 'false';
      if (!open) return;
      if (!(isAdmin?.() || isTeacher?.())) return;

      // create container if missing
      let wrap = modal.querySelector('#attendees-wrap');
      if (!wrap) {
        wrap = document.createElement('div');
        wrap.id = 'attendees-wrap';
        wrap.style.marginTop = '16px';
        wrap.innerHTML = `
          <h3 style="margin:12px 0 6px 0;">Who’s going</h3>
          <ul id="attendees-list" style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:8px;"></ul>
          <p id="attendees-empty" class="muted">No one yet.</p>
        `;
        modal.querySelector('.modal-card')?.appendChild(wrap);
      }
      // render for current event
      renderAttendeesPanel(eventKeyFromModal());
    });
    obs.observe(modal, { attributes: true, attributeFilter: ['aria-hidden'] });
  }

  // 2E) Render function (admin gets remove buttons)
  function renderAttendeesPanel(key) {
    const list = document.getElementById('attendees-list');
    const empty = document.getElementById('attendees-empty');
    if (!list || !empty) return;

    const people = getAttendees(key);
    list.innerHTML = '';
    empty.style.display = people.length ? 'none' : '';

    people.forEach(p => {
      const li = document.createElement('li');
      li.className = 'cal-item'; // reuse existing style
      li.innerHTML = `
        <div style="display:flex;gap:8px;align-items:center;">
          <strong>${escapeHtml(p.name || 'User')}</strong>
          <span class="muted">${escapeHtml(p.id || '')}</span>
        </div>
        ${isAdmin?.() ? `<button class="icon-btn" data-remove="${encodeURIComponent(p.id)}" title="Remove">✕</button>` : ''}
      `;
      list.appendChild(li);
    });

    if (isAdmin?.()) {
      list.querySelectorAll('button[data-remove]').forEach(btn => {
        btn.addEventListener('click', () => {
          const uid = decodeURIComponent(btn.getAttribute('data-remove'));
          removeAttendee(key, uid);
          renderAttendeesPanel(key);
          showToast?.('Removed from event'); // uses your existing toast if present
        });
      });
    }
  }

  // 2F) Small utility
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
})();
