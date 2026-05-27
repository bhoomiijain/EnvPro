import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEnvironments } from '../context/EnvironmentContext';
import { useRepo } from '../context/RepoContext';

export default function Settings() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { userRole, setUserRole } = useEnvironments();
  const { selectedRepo, selectedBranch } = useRepo();

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <h1 className="section-title"><span className="gradient-text">Settings</span></h1>
      <p className="env-subtitle">Account, roles, and deployment preferences</p>

      <div className="glass-card" style={{ marginTop: 20, padding: 20 }}>
        <div className="section-title" style={{ marginBottom: 14 }}>Profile</div>
        <div className="env-metrics">
          <div className="env-metric"><span>Username</span><strong>{user?.username}</strong></div>
          <div className="env-metric"><span>Email</span><strong>{user?.email}</strong></div>
        </div>
        <button
          type="button"
          className="btn btn-danger"
          style={{ marginTop: 16 }}
          onClick={() => {
            logout();
            navigate('/login');
          }}
        >
          Sign out
        </button>
      </div>

      <div className="glass-card" style={{ marginTop: 16, padding: 20 }}>
        <div className="section-title" style={{ marginBottom: 14 }}>Platform role</div>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>
          Admin can run bulk cleanup; developer has standard provisioning access.
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className={`filter-pill ${userRole === 'developer' ? 'active' : ''}`} onClick={() => setUserRole('developer')}>Developer</button>
          <button type="button" className={`filter-pill ${userRole === 'admin' ? 'active' : ''}`} onClick={() => setUserRole('admin')}>Admin</button>
        </div>
      </div>

      <div className="glass-card" style={{ marginTop: 16, padding: 20 }}>
        <div className="section-title" style={{ marginBottom: 14 }}>Connected repository</div>
        <div className="env-metrics">
          <div className="env-metric"><span>Repository</span><strong className="mono">{selectedRepo?.fullName || '—'}</strong></div>
          <div className="env-metric"><span>Active branch</span><strong>{selectedBranch}</strong></div>
        </div>
        <button type="button" className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/repositories')}>
          Manage repositories
        </button>
      </div>
    </div>
  );
}
