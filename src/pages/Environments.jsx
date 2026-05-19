import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, GitBranch, AlertCircle } from 'lucide-react';
import { useEnvironments } from '../context/EnvironmentContext';
import EnvironmentCard from '../components/EnvironmentCard';
import EnvironmentDetailsModal from '../components/EnvironmentDetailsModal';
import { BRANCHES } from '../data/mockData';

const FILTERS = ['all', 'building', 'testing', 'running', 'failed', 'rollback_in_progress', 'destroyed'];

// Anomaly detection function
function detectAnomalies(environments) {
  const anomalies = [];
  const avgCpu = environments.reduce((sum, e) => sum + e.cpuUsage, 0) / environments.length || 0;
  const avgRam = environments.reduce((sum, e) => sum + e.ramUsage, 0) / environments.length || 0;

  environments.forEach(e => {
    if (e.status === 'running') {
      if (e.cpuUsage > avgCpu * 1.8) {
        anomalies.push({ id: e.id, type: 'high-cpu', msg: `${e.id} exceeding CPU average by ${Math.round((e.cpuUsage - avgCpu) / avgCpu * 100)}%`, severity: 'warn' });
      }
      if (e.ramUsage > avgRam * 1.8) {
        anomalies.push({ id: e.id, type: 'high-ram', msg: `${e.id} exceeding memory by ${Math.round((e.ramUsage - avgRam) / avgRam * 100)}%`, severity: 'warn' });
      }
    }
    if (e.countdown_seconds < 300 && e.status === 'running') {
      anomalies.push({ id: e.id, type: 'ttl-expiring', msg: `${e.id} TTL expiring soon - prepare for cleanup`, severity: 'info' });
    }
  });

  return anomalies;
}

export default function Environments() {
  const { environments, stats, logs, createEnvironment, userRole, destroyEnvironment } = useEnvironments();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(BRANCHES[0]);
  const [ttlPreset, setTtlPreset] = useState('standard');
  const [selectedEnv, setSelectedEnv] = useState(null);

  const anomalies = useMemo(() => detectAnomalies(environments), [environments]);

  const filtered = useMemo(
    () => environments.filter((e) => {
      const matchesFilter = filter === 'all' || e.status === filter;
      const q = search.toLowerCase();
      const matchesSearch = !q || e.branch.toLowerCase().includes(q) || e.commitId.toLowerCase().includes(q) || e.id.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    }),
    [environments, filter, search],
  );

  const handleCreate = () => {
    createEnvironment(selectedBranch, ttlPreset);
    setShowCreate(false);
  };

  const handleBulkCleanup = () => {
    const targets = environments.filter((e) => ['running', 'failed'].includes(e.status));
    targets.forEach((e) => destroyEnvironment(e.id));
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      <div className="section-header">
        <div>
          <h1 className="section-title"><span className="gradient-text">Parallel Environments</span></h1>
          <p className="env-subtitle">{stats.active} active, {stats.running} healthy, {stats.failed} failed</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {userRole === 'admin' && (
            <button className="btn btn-danger" onClick={handleBulkCleanup} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              🗑️ Bulk Cleanup
            </button>
          )}
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}><Plus size={15} /> New Environment</button>
        </div>
      </div>

      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass-card create-panel">
            <div className="create-grid">
              <label>
                Branch
                <select value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)}>
                  {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </label>
              <label>
                TTL preset
                <select value={ttlPreset} onChange={(e) => setTtlPreset(e.target.value)}>
                  <option value="quick">15 minutes</option>
                  <option value="standard">1 hour</option>
                  <option value="post_test">Post-test fallback</option>
                </select>
              </label>
              <div className="create-actions">
                <button className="btn btn-primary" onClick={handleCreate}><GitBranch size={14} /> Provision</button>
                <button className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="toolbar">
        <div className="filter-row">
          {FILTERS.map((f) => (
            <button key={f} className={`filter-pill ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f.replace('_', ' ')}</button>
          ))}
        </div>
        <div className="search-box">
          <Search size={13} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by env, branch, commit" />
        </div>
      </div>

      <AnimatePresence>
        {anomalies.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ marginBottom: 12 }}>
            <div className="glass-card" style={{ padding: 12, border: '1px solid rgba(255,193,7,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <AlertCircle size={16} style={{ color: '#ffd166', flexShrink: 0 }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>Resource Anomalies Detected</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 8 }}>
                {anomalies.map((a, i) => (
                  <div key={i} style={{ padding: 8, borderRadius: 8, background: 'rgba(255,193,7,0.08)', border: '1px solid rgba(255,193,7,0.15)', fontSize: 11, color: 'var(--text-muted)' }}>
                    <span style={{ color: a.severity === 'warn' ? '#ffd166' : 'var(--accent-blue)' }}>●</span> {a.msg}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div className="env-grid" layout>
        <AnimatePresence mode="popLayout">
          {filtered.map((env) => <EnvironmentCard key={env.id} env={env} onViewDetails={setSelectedEnv} />)}
        </AnimatePresence>
      </motion.div>
      <EnvironmentDetailsModal env={selectedEnv} logs={logs} onClose={() => setSelectedEnv(null)} />
    </div>
  );
}
