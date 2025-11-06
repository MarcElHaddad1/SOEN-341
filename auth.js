/* ===== auth.js ===== */
const LS_KEYS = {
  USERS:   'users:v1',
  SESSION: 'session:v1',
  EVENTS:  'events:v2',
};

// Special signup/login codes
const ADMIN_CODE = 'ADMIN-2025';
const TEACH_CODE = 'TEACH-2025';

/* -------------------------------------------------------
   Seed OR PATCH demo users (doesn't wipe existing data)
------------------------------------------------------- */
(function seedOrPatchUsers(){
  let users = [];
  try {
    const raw = localStorage.getItem(LS_KEYS.USERS);
    users = raw ? JSON.parse(raw) : [];
  } catch { users = []; }

  const hasAdmin   = users.some(u => u.role === 'admin');
  const hasTeacher = users.some(u => u.role === 'teacher');
  const hasStudent = users.some(u => u.role === 'student');

  const adds = [];
  if (!hasAdmin)   adds.push({ email:'admin@school.edu',   password:'Admin123!',  role:'admin',   name:'Admin' });
  if (!hasTeacher) adds.push({ email:'teacher@school.edu', password:'Teach123!',  role:'teacher', name:'Ms. Teacher' });
  if (!hasStudent) adds.push({ email:'student@school.edu', password:'Student1!',  role:'student', name:'Student Demo' });

  if (!localStorage.getItem(LS_KEYS.USERS)) {
    // brand-new: write full set
    const demo = [
      { email:'admin@school.edu',   password:'Admin123!',  role:'admin',   name:'Admin' },
      { email:'teacher@school.edu', password:'Teach123!',  role:'teacher', name:'Ms. Teacher' },
      { email:'student@school.edu', password:'Student1!',  role:'student', name:'Student Demo' },
    ];
    localStorage.setItem(LS_KEYS.USERS, JSON.stringify(demo));
  } else if (adds.length) {
    // patch missing roles only
    localStorage.setItem(LS_KEYS.USERS, JSON.stringify(users.concat(adds)));
  }
})();

/* -------------------------------------------------------
   Storage helpers
------------------------------------------------------- */
function getUsers(){ try{ return JSON.parse(localStorage.getItem(LS_KEYS.USERS))||[] }catch{ return [] } }
function setUsers(arr){ localStorage.setItem(LS_KEYS.USERS, JSON.stringify(arr)); }

function getSession(){ try{ return JSON.parse(localStorage.getItem(LS_KEYS.SESSION))||null }catch{ return null } }
function setSession(user){ localStorage.setItem(LS_KEYS.SESSION, JSON.stringify({email:user.email, role:user.role, name:user.name})); }
function clearSession(){ localStorage.removeItem(LS_KEYS.SESSION); }

/* -------------------------------------------------------
   Routing / guards
------------------------------------------------------- */
function logoutAndRedirect(to='login.html'){ clearSession(); location.href = to; }

function requireLogin(redirect='login.html'){
  const s = getSession();
  if (!s) location.href = redirect;
}

function requireRole(allowed){
  const s = getSession();
  if (!s || !allowed.includes(s.role)){
    if (!s) return location.href='login.html';
    if (s.role==='admin')   return location.href='admin.html';
    if (s.role==='teacher') return location.href='teacher.html';
    return location.href='index.html'; // student
  }
}

function fillUserBadge(sel){
  const el = document.querySelector(sel);
  const s = getSession();
  if (el && s){ el.textContent = `${s.name} · ${s.role}`; }
}

/* -------------------------------------------------------
   Account creation (enforces unique email)
------------------------------------------------------- */
function assertUniqueEmail(email){
  const users = getUsers();
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())){
    throw new Error('An account with this email already exists.');
  }
}

function createStudent(email, password, name='Student'){
  if (!email || !password) throw new Error('Missing email or password');
  assertUniqueEmail(email);
  const users = getUsers();
  users.push({ email, password, role:'student', name });
  setUsers(users);
}

function createTeacher(email, password, name='Teacher', code=''){
  if (!email || !password) throw new Error('Missing email or password');
  if (code !== TEACH_CODE) throw new Error('Invalid teacher code.');
  assertUniqueEmail(email);
  const users = getUsers();
  users.push({ email, password, role:'teacher', name });
  setUsers(users);
}

function createAdmin(email, password, name='Admin', code=''){
  if (!email || !password) throw new Error('Missing email or password');
  if (code !== ADMIN_CODE) throw new Error('Invalid admin code.');
  assertUniqueEmail(email);
  const users = getUsers();
  users.push({ email, password, role:'admin', name });
  setUsers(users);
}

/* -------------------------------------------------------
   Login (code required for teacher/admin)
------------------------------------------------------- */
function login(email, password, role, code=''){
  const users = getUsers();
  const user = users.find(u =>
    u.email.toLowerCase() === (email||'').toLowerCase() &&
    u.password === password &&
    u.role === role
  );
  if (!user) throw new Error('Invalid credentials or role');

  if (role==='admin'   && code !== ADMIN_CODE) throw new Error('Admin code required.');
  if (role==='teacher' && code !== TEACH_CODE) throw new Error('Teacher code required.');

  setSession(user);
  return user;
}

/* -------------------------------------------------------
   Expose to window (no modules)
------------------------------------------------------- */
window.getSession = getSession;
window.requireLogin = requireLogin;
window.requireRole = requireRole;
window.login = login;
window.logoutAndRedirect = logoutAndRedirect;
window.fillUserBadge = fillUserBadge;
window.createStudent = createStudent;
window.createTeacher = createTeacher;
window.createAdmin = createAdmin;
window.currentUser = () => getSession();
