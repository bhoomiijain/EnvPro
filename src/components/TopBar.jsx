import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Search, RefreshCw, GitCommit, Terminal, Shield } from 'lucide-react';
import { recentCommits } from '../data/mockData';
import { useEnvironments } from '../context/EnvironmentContext';

const PAGE_NAMES = {
  '/dashboard': 'Dashboard',
  '/environments': 'Environments',
  '/pipeline': 'CI/CD Pipeline',
  '/architecture': 'Architecture',
  '/logs': 'Logs & Monitor',
  '/history': 'Deployment History',
};

const STATUS_COLORS = {
  building: '#ffd166', testing: '#a78bfa', running: '#00ff88', failed: '#ff4d6d',
};

export default function TopBar() {
  const { userRole, setUserRole } = useEnvironments();
  const location = useLocation();
  const [time, setTime] = useState(new Date());
  const pageName = PAGE_NAMES[location.pathname] || 'EnvPro';

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const tickerItems = [...recentCommits, ...recentCommits];

  return (
    <header className="topbar">
      <div className="topbar-breadcrumb">
        EnvPro <span style={{ color: 'var(--text-muted)' }}>/</span> <span>{pageName}</span>
      </div>

      {/* Commit Ticker */}
      <div className="commit-ticker" style={{ maxWidth: 400 }}>
        <div className="commit-ticker-inner">
          {tickerItems.map((c, i) => (
            <span key={i} className="ticker-item">
              <span
                className="ticker-dot"
                style={{ background: '#4f9eff' }}
              />
              <span className="mono" style={{ fontSize: 10, color: 'var(--accent-blue)' }}>
                {c.id}
              </span>
              <span style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', display: 'inline-block' }}>
                {c.message}
              </span>
              <span className="ticker-separator">·</span>
              <span style={{ color: '#4f9eff', opacity: 0.7 }}>{c.branch}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="topbar-spacer" />

      <div className="topbar-clock">
        {time.toLocaleTimeString('en-US', { hour12: false })}
      </div>

      <div className="topbar-actions">
        {/* Role Switcher */}
        <div className="role-switcher" style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: 2, marginRight: 12 }}>
          <button 
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s',
              background: userRole === 'developer' ? 'rgba(79,158,255,0.15)' : 'transparent',
              color: userRole === 'developer' ? 'var(--accent-blue)' : 'var(--text-secondary)'
            }}
            onClick={() => setUserRole('developer')}
          >
            <Terminal size={11} />
            <span>Developer</span>
          </button>
          <button 
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s',
              background: userRole === 'admin' ? 'rgba(0,255,136,0.12)' : 'transparent',
              color: userRole === 'admin' ? 'var(--accent-green)' : 'var(--text-secondary)'
            }}
            onClick={() => setUserRole('admin')}
          >
            <Shield size={11} />
            <span>Admin</span>
          </button>
        </div>

        <div className="topbar-btn tooltip-wrap">
          <RefreshCw size={15} />
          <div className="tooltip-box">Refresh</div>
        </div>
        <div className="topbar-btn tooltip-wrap">
          <Bell size={15} />
          <div className="notif-dot" />
          <div className="tooltip-box">Notifications</div>
        </div>
      </div>

      <div className="topbar-user">
        <div className="user-avatar" style={{ border: userRole === 'admin' ? '1px solid var(--accent-green)' : '1px solid var(--accent-blue)' }}>{userRole === 'admin' ? 'AD' : 'BJ'}</div>
        <span className="user-name">{userRole === 'admin' ? 'admin.jain' : 'bhoomi.jain'}</span>
      </div>
    </header>
  );
}
