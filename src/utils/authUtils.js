const USERS_KEY = 'envpro_users';
const SESSION_KEY = 'envpro_session';

export function hashPassword(password) {
  let h = 0;
  for (let i = 0; i < password.length; i++) {
    h = (Math.imul(31, h) + password.charCodeAt(i)) | 0;
  }
  return `ep_${Math.abs(h).toString(36)}_${password.length}`;
}

export function loadUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveSession(session) {
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else localStorage.removeItem(SESSION_KEY);
}
