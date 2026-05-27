import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  hashPassword,
  loadSession,
  loadUsers,
  saveSession,
  saveUsers,
} from '../utils/authUtils';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const session = loadSession();
    if (session?.userId) {
      const found = loadUsers().find((u) => u.id === session.userId);
      if (found) setUser({ id: found.id, username: found.username, email: found.email });
    }
    setReady(true);
  }, []);

  const register = ({ username, email, password }) => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedUser = username.trim();
    if (!trimmedUser || !trimmedEmail || password.length < 6) {
      return { ok: false, error: 'Username, email, and password (6+ chars) are required.' };
    }
    const users = loadUsers();
    if (users.some((u) => u.email === trimmedEmail)) {
      return { ok: false, error: 'An account with this email already exists.' };
    }
    if (users.some((u) => u.username.toLowerCase() === trimmedUser.toLowerCase())) {
      return { ok: false, error: 'Username is already taken.' };
    }
    const newUser = {
      id: `user-${Date.now()}`,
      username: trimmedUser,
      email: trimmedEmail,
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    saveUsers(users);
    return { ok: true };
  };

  const login = ({ email, password }) => {
    const trimmedEmail = email.trim().toLowerCase();
    const found = loadUsers().find((u) => u.email === trimmedEmail);
    if (!found || found.passwordHash !== hashPassword(password)) {
      return { ok: false, error: 'Invalid email or password.' };
    }
    const sessionUser = { id: found.id, username: found.username, email: found.email };
    setUser(sessionUser);
    saveSession({ userId: found.id, at: new Date().toISOString() });
    return { ok: true };
  };

  const logout = () => {
    setUser(null);
    saveSession(null);
  };

  const value = useMemo(
    () => ({ user, ready, register, login, logout, isAuthenticated: !!user }),
    [user, ready],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
