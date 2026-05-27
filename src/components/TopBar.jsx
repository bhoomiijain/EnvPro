import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, RefreshCw, LogOut } from 'lucide-react';
import { recentCommits } from '../data/mockData';
import { useEnvironments } from '../context/EnvironmentContext';
import { useAuth } from '../context/AuthContext';
import { useRepo } from '../context/RepoContext';

const PAGE_NAMES = {
  '/dashboard': 'Dashboard',
  '/repositories': 'Repositories',
  '/environments': 'Environments',
  '/pipeline': 'CI/CD Pipeline',
  '/architecture': 'Architecture',
  '/logs': 'Logs & Monitor',
  '/history': 'Deployment History',
  '/insights': 'Insights',
  '/settings': 'Settings',
};

export default function TopBar() {
  const { userRole, setUserRole, notifications, markNotificationsRead } = useEnvironments();
  const { user, logout } = useAuth();
  const { selectedRepo, selectedBranch } = useRepo();
  const location = useLocation();
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef(null);
  const pageName = PAGE_NAMES[location.pathname] || 'EnvPro';
  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const onDoc = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const tickerItems = [...recentCommits, ...recentCommits];
  const initials = (user?.username || 'U').slice(0, 2).toUpperCase();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="topbar">
      <div className="topbar-breadcrumb">
        EnvPro <span style={{ color: 'var(--text-muted)' }}>/</span> <span>{pageName}</span>
        {selectedRepo && (
          <button
            type="button"
            onClick={() => navigate('/repositories')}
            style={{
              marginLeft: 8,
              fontSize: 11,
              color: 'var(--accent-blue)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              textDecoration: 'underline',
              textUnderlineOffset: 3,
            }}
            title="Change repository"
          >
            · {selectedRepo.fullName}:{selectedBranch}
          </button>
        )}
      </div>

      <div className="commit-ticker" style={{ maxWidth: 360 }}>
        <div className="commit-ticker-inner">
          {tickerItems.map((c, i) => (
            <span key={i} className="ticker-item">
              <span className="ticker-dot" style={{ background: '#4f9eff' }} />
              <span className="mono" style={{ fontSize: 10, color: 'var(--accent-blue)' }}>{c.id}</span>
              <span style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', display: 'inline-block' }}>{c.message}</span>
              <span className="ticker-separator">·</span>
              <span style={{ color: '#4f9eff', opacity: 0.7 }}>{c.branch}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="topbar-spacer" />
      <div className="topbar-clock">{time.toLocaleTimeString('en-US', { hour12: false })}</div>

      <div className="topbar-actions">
        <div className="role-switcher" style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: 2, marginRight: 8 }}>
          <button
            type="button"
            style={{
              padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, border: 'none', cursor: 'pointer',
              background: userRole === 'developer' ? 'rgba(79,158,255,0.15)' : 'transparent',
              color: userRole === 'developer' ? 'var(--accent-blue)' : 'var(--text-secondary)',
            }}
            onClick={() => setUserRole('developer')}
          >
            Developer
          </button>
          <button
            type="button"
            style={{
              padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, border: 'none', cursor: 'pointer',
              background: userRole === 'admin' ? 'rgba(0,255,136,0.12)' : 'transparent',
              color: userRole === 'admin' ? 'var(--accent-green)' : 'var(--text-secondary)',
            }}
            onClick={() => setUserRole('admin')}
          >
            Admin
          </button>
        </div>

        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            type="button"
            className="topbar-btn"
            onClick={() => {
              setShowNotif((v) => !v);
              markNotificationsRead();
            }}
            aria-label="Notifications"
          >
            <Bell size={15} />
            {unread > 0 && <div className="notif-dot" />}
          </button>
          {showNotif && (
            <div className="glass-card" style={{
              position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 320, maxHeight: 360,
              overflowY: 'auto', padding: 12, zIndex: 100, boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10 }}>Notifications</div>
              {notifications.slice(0, 8).map((n) => (
                <div key={n.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border-subtle)', fontSize: 11 }}>
                  <div style={{ fontWeight: 600 }}>{n.title}</div>
                  <div style={{ color: 'var(--text-muted)', marginTop: 2 }}>{n.message}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="button" className="topbar-btn" onClick={() => window.location.reload()} aria-label="Refresh">
          <RefreshCw size={15} />
        </button>
      </div>

      <div className="topbar-user">
        <div className="user-avatar" style={{ border: userRole === 'admin' ? '1px solid var(--accent-green)' : '1px solid var(--accent-blue)' }}>{initials}</div>
        <span className="user-name">{user?.username}</span>
        <button type="button" className="icon-btn" onClick={handleLogout} title="Sign out" style={{ marginLeft: 6 }}>
          <LogOut size={14} />
        </button>
      </div>
    </header>
  );
}
