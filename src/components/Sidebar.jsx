import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Container, GitBranch, Network, ScrollText, History,
  Settings, Zap, Activity, ChevronRight
} from 'lucide-react';
import { useEnvironments } from '../context/EnvironmentContext';

const NAV = [
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard',      section: 'OVERVIEW' },
  { to: '/environments',  icon: Container,       label: 'Environments',   section: 'OVERVIEW' },
  { to: '/pipeline',      icon: GitBranch,       label: 'CI/CD Pipeline', section: 'DEVOPS' },
  { to: '/architecture',  icon: Network,         label: 'Architecture',   section: 'DEVOPS' },
  { to: '/logs',          icon: ScrollText,      label: 'Logs & Monitor', section: 'DEVOPS' },
  { to: '/history',       icon: History,         label: 'Deploy History', section: 'DEVOPS' },
];

export default function Sidebar() {
  const { stats } = useEnvironments();
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState('');

  useEffect(() => {
    const match = NAV.find(n => location.pathname.startsWith(n.to));
    setCurrentPage(match?.label || '');
  }, [location]);

  const sections = [...new Set(NAV.map(n => n.section))];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark">
          <div className="logo-icon">⚡</div>
          <div className="logo-text">
            EnvPro
            <span>Dynamic Env Provisioner</span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {sections.map(section => (
          <div key={section}>
            <div className="nav-section-label">{section}</div>
            {NAV.filter(n => n.section === section).map(({ to, icon: Icon, label }) => (
              <NavLink key={to} to={to} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                <Icon size={16} />
                {label}
                {label === 'Environments' && stats.active > 0 && (
                  <span className="nav-badge">{stats.active}</span>
                )}
                {label === 'Environments' && stats.failed > 0 && (
                  <span className="nav-badge danger">{stats.failed}</span>
                )}
              </NavLink>
            ))}
          </div>
        ))}

        <div style={{ marginTop: 'auto' }}>
          <div className="nav-section-label">SYSTEM</div>
          <div className="nav-item">
            <Settings size={16} />
            Settings
          </div>
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="system-status">
          <span className="pulse-dot green" />
          <span className="system-status-text">All Systems Operational</span>
        </div>
      </div>
    </aside>
  );
}
