/* ===== script.js ===== */
/* global currentUser, QRCode, downloadBtn */
const LS = { EVENTS: 'events:v2' };

function loadEvents(){ try{ return JSON.parse(localStorage.getItem(LS.EVENTS))||[]}catch{ return [] } }
function saveEvents(arr){ localStorage.setItem(LS.EVENTS, JSON.stringify(arr)); }

// Seed demo events once
(function seedEvents(){
  const have = loadEvents();
  if (have.length) return;
  const s = currentUser() || {email:'seed@sys', name:'System', role:'admin'};
  const now = Date.now();
  const days = d => new Date(now + d*86400000).toISOString().slice(0,16);
  const demo = [
    { id:crypto.randomUUID(), title:'Career Fair',  datetime:days(2), location:'Hall A', category:'Career', org:'SCS',     desc:'Meet recruiters from tech companies.', cap:80, attendees:[], createdBy:{email:s.email,name:s.name,role:s.role} },
    { id:crypto.randomUUID(), title:'Hack Night',    datetime:days(5), location:'Lab 3',  category:'Coding', org:'CS Club', desc:'Bring your laptop; pizza provided.',    cap:40, attendees:[], createdBy:{email:s.email,name:s.name,role:s.role} },
    { id:crypto.randomUUID(), title:'Wellness Yoga', datetime:days(7), location:'Gym',    category:'Health', org:'Wellness', desc:'Relax and stretch with peers.',          cap:30, attendees:[], createdBy:{email:s.email,name:s.name,role:s.role} },
  ];
  saveEvents(demo);
})();

const q  = sel => document.querySelector(sel);
const qa = sel => [...document.querySelectorAll(sel)];

const listEl   = q('#events');
const toastEl  = q('#toast');
const modal    = q('#modal');
const calModal = q('#cal-modal');
const newModal = q('#new-modal');

function isAdmin(){ return currentUser()?.role==='admin'; }
function isTeacher(){ return currentUser()?.role==='teacher'; }
function isStudent(){ return currentUser()?.role==='student'; }

// Toast
function toast(msg){
  if (!toastEl) return;
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  setTimeout(()=>toastEl.classList.remove('show'), 1800);
}

// Helpers
function unique(arr, key){ return [...new Set(arr.map(e=>e[key]))]; }
function seatsLeft(e){ return Math.max(0, e.cap - e.attendees.length); }
function hasTicket(e, email){ return e.attendees.some(a=>a.email===email); }
function getMyTicket(e, email){ return e.attendees.find(a=>a.email===email); }

// QR helpers
function showQRAt(wrapId, canvasId, payload){
  const wrap = document.getElementById(wrapId);
  const el = document.getElementById(canvasId);
  if (!wrap || !el) return;

  const ensureLib = () => new Promise(res=>{
    if (window.QRCode) return res();
    const iv = setInterval(()=>{ if(window.QRCode){ clearInterval(iv); res(); } }, 50);
    setTimeout(()=>{ clearInterval(iv); res(); }, 3000);
  });

  ensureLib().then(()=>{
    wrap.style.display = 'block';
    el.replaceChildren();
    try {
      // eslint-disable-next-line no-new
      new QRCode(el, { text: JSON.stringify(payload), width: 160, height: 160 });
    } catch (_) {
      // eslint-disable-next-line no-new
      new QRCode(el, JSON.stringify(payload));
    }
  });
}
function showQR(payload){ showQRAt('qr-wrap','qrcode', payload); }

// Filters
function renderFilters(evts){
  const catSel = q('#category'); const orgSel = q('#org');
  if (!catSel || !orgSel) return;
  const cats = [''].concat(unique(evts,'category'));
  const orgs = [''].concat(unique(evts,'org'));
  catSel.innerHTML = cats.map(v=>`<option value="${v}">${v||'All categories'}</option>`).join('');
  orgSel.innerHTML = orgs.map(v=>`<option value="${v}">${v||'All organizations'}</option>`).join('');
}

// Cards
function cardFor(e){
  const s = currentUser();
  const left = seatsLeft(e);
  const createdTag = `<span class="tag" title="Creator">By ${e.createdBy.name} (${e.createdBy.role})</span>`;
  return `
  <article class="card" data-id="${e.id}">
    <h3>${e.title}</h3>
    <p class="muted">${new Date(e.datetime).toLocaleString()}</p>
    <p class="muted">${e.location}</p>
    <p>${e.desc}</p>
    <div class="tags">
      <span class="tag">${e.category}</span>
      <span class="tag">${e.org}</span>
      ${(isAdmin()||isTeacher()) ? createdTag : ''}
      ${hasTicket(e, s?.email||'') ? '<span class="tag claimed">Ticket claimed</span>' : ''}
    </div>
    <div class="row">
      <span class="muted">${left} seat(s) left / ${e.cap}</span>
      <div class="actions">
        <button class="icon-btn" data-act="open">Details</button>
        ${isAdmin() ? '<button class="icon-btn" data-act="delete">Delete</button>' : ''}
      </div>
    </div>
  </article>`;
}

function renderList(){
  if (!listEl) return;
  let evts = loadEvents();
  const term = q('#q')?.value.trim().toLowerCase()||'';
  const cat = q('#category')?.value||'';
  const org = q('#org')?.value||'';
  const from = q('#from')?.value||'';
  const to   = q('#to')?.value||'';
  evts = evts.filter(e=>
    (!term || e.title.toLowerCase().includes(term) || e.desc.toLowerCase().includes(term)) &&
    (!cat  || e.category===cat) &&
    (!org  || e.org===org) &&
    (!from || e.datetime>=from) &&
    (!to   || e.datetime<=to)
  );
  renderFilters(loadEvents());
  listEl.innerHTML = evts.map(cardFor).join('');
}

// Modals
function openModal(){ modal?.setAttribute('aria-hidden','false'); }
function closeModal(){ modal?.setAttribute('aria-hidden','true'); q('#qrcode')?.replaceChildren(); }
function openCal(){ calModal?.setAttribute('aria-hidden','false'); renderCalendar(); }
function closeCal(){ calModal?.setAttribute('aria-hidden','true'); }
function openNew(){ newModal?.setAttribute('aria-hidden','false'); }
function closeNew(){ newModal?.setAttribute('aria-hidden','true'); q('#new-form')?.reset(); }

function showDetails(id){
  const e = loadEvents().find(x=>x.id===id);
  if (!e) return;
  q('#m-title').textContent = e.title;
  q('#m-when').textContent  = new Date(e.datetime).toLocaleString();
  q('#m-where').textContent = e.location;
  q('#m-desc').textContent  = e.desc;
  q('#m-tags').innerHTML    = `<span class="tag">${e.category}</span><span class="tag">${e.org}</span>`;
  q('#m-seats').textContent = `${seatsLeft(e)} seat(s) left / ${e.cap}`;

  const claimBtn = q('#claim-btn');
  const me = currentUser();
  const alreadyClaimed = hasTicket(e, me.email);
  const canClaim = isStudent() && seatsLeft(e)>0 && !alreadyClaimed;
  claimBtn.disabled = !canClaim;
  claimBtn.dataset.id = e.id;

  // If the current student already has a ticket, automatically (re)show their QR
  const qrWrap = document.getElementById('qr-wrap');
  const qrCanvas = document.getElementById('qrcode');
  if (alreadyClaimed){
    const t = getMyTicket(e, me.email);
    qrWrap.style.display = 'block';
    qrCanvas.replaceChildren();
    showQR({ eventId:e.id, title:e.title, when:e.datetime, email:me.email, ticketId: t.ticketId });
  } else {
    // Hide QR until claim
    qrWrap.style.display = 'none';
    qrCanvas.replaceChildren();
  }

  // Add download button for teachers/admins above the attendees list
  const downloadBtn = `<button id="download-btn" class="btn secondary" style="margin:8px 0;">Download Attendee List (CSV)</button>`;
  
  // Build Attendees panel for Teacher/Admin
  let adminPanel = q('#attend-panel');
  if (!adminPanel){
    adminPanel = document.createElement('div');
    adminPanel.id = 'attend-panel';
    adminPanel.style.marginTop = '12px';
    q('.modal-card').appendChild(adminPanel);
  }
  
  if (isAdmin() || isTeacher()){
    const rows = e.attendees.map(a=>`
      <li class="cal-item">
        <span>${a.name} &lt;${a.email}&gt;</span>
        ${isAdmin() ? `<button class="icon-btn" data-act="kick" data-id="${e.id}" data-email="${a.email}">Remove</button>` : ''}
      </li>`).join('');

    // Updated download button - only show tooltip when disabled
    const downloadBtn = `<button id="download-btn" class="btn secondary" 
      style="margin:8px 0; opacity:${e.attendees.length ? '1' : '0.5'}; cursor:${e.attendees.length ? 'pointer' : 'not-allowed'}" 
      ${!e.attendees.length ? 'title="Cannot download - there are no attendees yet"' : ''}
      ${!e.attendees.length ? 'disabled' : ''}>
      Download Attendee List (CSV)
    </button>`;

    adminPanel.innerHTML = `
      ${downloadBtn}
      <h3>Attendees (${e.attendees.length})</h3>
      <ul class="cal-list">${rows || '<li class="muted">No attendees yet.</li>'}</ul>`;
  } else {
    adminPanel.innerHTML = '';
  }

  openModal();
}

// Calendar (my tickets)
function myTickets(){
  const me = currentUser();
  return loadEvents().filter(e=>hasTicket(e, me.email));
}
function renderCalendar(){
  const list = q('#cal-list'); if (!list) return;
  const mine = myTickets();
  list.innerHTML = mine.map(e=>`
    <li class="cal-item">
      <span>${e.title} — ${new Date(e.datetime).toLocaleString()}</span>
      <span class="muted">${e.location}</span>
      <button class="icon-btn" data-act="qr" data-id="${e.id}">Show QR</button>
    </li>`).join('') || '<li class="cal-item">No tickets yet.</li>';

  q('#calendar-count').textContent = String(mine.length);

  // Hide any previous calendar QR on refresh
  const cwrap = document.getElementById('cal-qr-wrap');
  const cel = document.getElementById('cal-qrcode');
  cwrap.style.display = 'none';
  cel.replaceChildren();
}

// Wire everything
function wireGlobal(){
  q('#clear')?.addEventListener('click', ()=>{ qa('.filters .input').forEach(i=>i.value=''); renderList(); });
  q('#q')?.addEventListener('input', renderList);
  q('#category')?.addEventListener('change', renderList);
  q('#org')?.addEventListener('change', renderList);
  q('#from')?.addEventListener('change', renderList);
  q('#to')?.addEventListener('change', renderList);

  q('#modal-close')?.addEventListener('click', closeModal);
  q('#cal-close')?.addEventListener('click', closeCal);
  q('#new-close')?.addEventListener('click', closeNew);
  q('#new-cancel')?.addEventListener('click', closeNew);
  q('#my-calendar-btn')?.addEventListener('click', openCal);

  // Claim ticket (Students)
  q('#claim-btn')?.addEventListener('click', ()=>{
    const id = q('#claim-btn').dataset.id;
    const me = currentUser();
    const events = loadEvents();
    const e = events.find(x=>x.id===id);
    if (!e) return;
    if (!isStudent()) return toast('Only students can claim tickets.');
    if (hasTicket(e, me.email)) return toast('You already claimed a ticket.');
    if (seatsLeft(e)<=0) return toast('No seats left.');

    const ticketId = (crypto?.randomUUID && crypto.randomUUID()) || String(Date.now());
    e.attendees.push({ email:me.email, name:me.name, role:me.role, ticketId });
    saveEvents(events);

    // Re-open details FIRST (hides old QR), then show QR again (persists on revisit)
    showDetails(id);
    showQR({ eventId:e.id, title:e.title, when:e.datetime, email:me.email, ticketId });
    toast('Ticket claimed!');
  });

  // Card clicks (details/delete)
  listEl?.addEventListener('click', (ev)=>{
    const card = ev.target.closest('article.card');
    if (!card) return;
    const id = card.dataset.id;
    if (ev.target.matches('[data-act="open"]')) return showDetails(id);
    if (ev.target.matches('[data-act="delete"]')){
      if (!isAdmin()) return;
      const events = loadEvents().filter(e=>e.id!==id);
      saveEvents(events);
      renderList();
      toast('Event deleted.');
    }
  });

  // Admin remove attendee
  modal?.addEventListener('click', (ev)=>{
    if (ev.target.matches('[data-act="kick"]')){
      if (!isAdmin()) return;
      const id = ev.target.getAttribute('data-id');
      const email = ev.target.getAttribute('data-email');
      const events = loadEvents();
      const e = events.find(x=>x.id===id);
      if (!e) return;
      e.attendees = e.attendees.filter(a=>a.email!==email);
      saveEvents(events);
      showDetails(id);
      renderList();
      toast('Attendee removed.');
    }
  });

  // Calendar modal: show QR for a selected ticket
  calModal?.addEventListener('click', (ev)=>{
    if (ev.target.matches('[data-act="qr"]')){
      const id = ev.target.getAttribute('data-id');
      const e = loadEvents().find(x=>x.id===id);
      if (!e) return;
      const me = currentUser();
      const t = getMyTicket(e, me.email);
      if (!t) return;
      const payload = { eventId:e.id, title:e.title, when:e.datetime, email:me.email, ticketId:t.ticketId };
      showQRAt('cal-qr-wrap','cal-qrcode', payload);
    }
  });

  // Create event (Admin + Teacher)
  const form = q('#new-form');
  form?.addEventListener('submit', (ev)=>{
    ev.preventDefault();
    if (!isAdmin() && !isTeacher()) return toast('Only teachers/admins can create events.');
    const me = currentUser();
    const e = {
      id: crypto.randomUUID(),
      title: q('#n-title').value.trim(),
      datetime: q('#n-datetime').value,
      location: q('#n-location').value.trim(),
      category: q('#n-category').value.trim(),
      org: q('#n-org').value.trim(),
      desc: q('#n-desc').value.trim(),
      cap: Math.max(1, parseInt(q('#n-cap').value, 10)||1),
      attendees: [],
      createdBy: { email:me.email, name:me.name, role:me.role },
    };
    const events = loadEvents();
    events.unshift(e);
    saveEvents(events);
    closeNew();
    renderList();
    toast('Event created.');
  });

  // Show Create Event button for Admin + Teacher
  const newBtn = q('#new-event-btn');
  if (newBtn){
    if (isAdmin() || isTeacher()){
      newBtn.style.display='inline-block';
      newBtn.addEventListener('click', openNew);
    } else {
      newBtn.style.display='none';
    }
  }

  // Add CSV download handler
  modal?.addEventListener('click', ev => {
    if (ev.target.matches('#download-btn')) {
      const id = q('#claim-btn').dataset.id;
      const e = loadEvents().find(x => x.id === id);
      if (!e || !e.attendees.length) return;

      // Create CSV content
      const headers = ['Name', 'Email', 'Role', 'Ticket ID'];
      const rows = e.attendees.map(a => [a.name, a.email, a.role, a.ticketId]);
      const csv = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      // Trigger download
      const blob = new Blob([csv], {type: 'text/csv'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${e.title}-attendees.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  });

  renderList();
  renderCalendar();
}

if (document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded', wireGlobal);
}else{
  wireGlobal();
}
