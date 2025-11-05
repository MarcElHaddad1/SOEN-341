/* ===== auth.js ===== */
const LS_KEYS = {
    USERS: 'users:v1',
    SESSION: 'session:v1',
  };
  
  // ---- Seed demo accounts (client-side demo ONLY) ----
  (function seedUsers() {
    if (!localStorage.getItem(LS_KEYS.USERS)) {
      const demo = [
        { email: 'admin@school.edu',   password: 'Admin123!', role: 'admin',  name: 'Admin' },
        { email: 'student@school.edu', password: 'Student1!', role: 'student', name: 'Student Demo' },
      ];
      localStorage.setItem(LS_KEYS.USERS, JSON.stringify(demo));
    }
  })();
  
  function getUsers() {
    try { return JSON.parse(localStorage.getItem(LS_KEYS.USERS)) || []; }
    catch { return []; }
  }
  function setUsers(arr) {
    localStorage.setItem(LS_KEYS.USERS, JSON.stringify(arr));
  }
  
  function createStudent(email, password, name='Student') {
    const users = getUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('Email already exists');
    }
    users.push({ email, password, role: 'student', name });
    setUsers(users);
  }
  
  function login(email, password) {
    const user = getUsers().find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!user) throw new Error('Invalid email or password');
    localStorage.setItem(LS_KEYS.SESSION, JSON.stringify({
      email: user.email, role: user.role, name: user.name,
      loginAt: new Date().toISOString(),
    }));
    return user;
  }
  
  function logout() {
    localStorage.removeItem(LS_KEYS.SESSION);
  }
  
  function getSession() {
    try { return JSON.parse(localStorage.getItem(LS_KEYS.SESSION)) || null; }
    catch { return null; }
  }
  
  // ---- Guards ----
  function requireLogin(redirect = 'login.html') {
    const s = getSession();
    if (!s) window.location.href = redirect;
  }
  function requireRole(roles = ['student'], redirect = 'login.html') {
    const s = getSession();
    if (!s || !roles.includes(s.role)) window.location.href = redirect;
  }
  
  // ---- UI helpers ----
  function fillUserBadge(selector = '#user-badge') {
    const s = getSession();
    const el = document.querySelector(selector);
    if (el && s) el.textContent = `${s.name || s.email} (${s.role})`;
  }
  
  // ---- Logout helpers/fallbacks ----
  function logoutAndRedirect(to = 'login.html') {
    logout();
    window.location.href = to;
  }
  
  // Process ?logout=1 on any page (nice fallback even if JS bindings fail)
  function maybeProcessLogoutParam() {
    const p = new URLSearchParams(location.search);
    if (p.get('logout') === '1') {
      logout();
      // Strip query to avoid loops
      const url = location.origin + location.pathname;
      history.replaceState({}, '', url);
    }
  }
  
  // Auto-run the logout param processor
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', maybeProcessLogoutParam);
  } else {
    maybeProcessLogoutParam();
  }
  
  

  // --- ADD BELOW (auth.js) ---
window.isAdmin   = () => { try { return getSession()?.role === 'admin'; } catch { return false; } };
window.isTeacher = () => { try { return getSession()?.role === 'teacher'; } catch { return false; } };

// Allow pages to gate by role without changing existing guards
window.requireRoleAny = function (roles = []) {
  const s = getSession?.();
  if (!s || !roles.includes(s.role)) {
    // fall back to your existing redirect behavior
    if (typeof logoutAndRedirect === 'function') logoutAndRedirect('login.html');
    else location.href = 'login.html';
  }
};

// Optional: expose current user id/name safely for other scripts
window.getCurrentUserSafe = () => {
  const s = getSession?.();
  return s ? { id: s.id || s.email || s.name || s.userId || s.username || String(s.user || ''), 
               name: s.name || s.email || 'User' } : null;
};
