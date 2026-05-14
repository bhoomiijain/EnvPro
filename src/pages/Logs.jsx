import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, AlertCircle } from 'lucide-react';
import { useEnvironments } from '../context/EnvironmentContext';
import { getFailureHint } from '../utils/envInsights';

const LEVEL_STYLES = {
  INFO: { color: '#8b9ab8' },
  SUCCESS: { color: '#00ff88' },
  WARN: { color: '#ffd166' },
  ERROR: { color: '#ff4d6d' },
};

export default function Logs() {
  const { logs, environments } = useEnvironments();
  const [search, setSearch] = useState('');
  const [envFilter, setEnvFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');

  const filtered = useMemo(() => logs.filter((l) => {
    const q = search.toLowerCase();
    const bySearch = !q || l.msg.toLowerCase().includes(q) || l.env.toLowerCase().includes(q);
    const byEnv = envFilter === 'all' || l.env === envFilter;
    const byLevel = levelFilter === 'all' || l.level === levelFilter;
    return bySearch && byEnv && byLevel;
  }), [logs, search, envFilter, levelFilter]);

  const failedEnv = environments.find((e) => e.status === 'failed' && (envFilter === 'all' || e.id === envFilter));
  const hint = failedEnv ? getFailureHint(filtered.filter((l) => l.env === failedEnv.id)) : null;

  const logStats = {
    totalLogs: filtered.length,
    errors: filtered.filter(l => l.level === 'ERROR').length,
    warnings: filtered.filter(l => l.level === 'WARN').length,
    success: filtered.filter(l => l.level === 'SUCCESS').length,
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      <h1 className="section-title"><span className="gradient-text">Logs & Monitoring</span></h1>
      <p className="env-subtitle">Live runtime logs from current environment context</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginTop: 16 }}>
        <motion.div className="glass-card" style={{ padding: 16 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Total Logs</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent-blue)' }}>{logStats.totalLogs}</div>
        </motion.div>
        <motion.div className="glass-card" style={{ padding: 16 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Errors</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent-red)' }}>{logStats.errors}</div>
        </motion.div>
        <motion.div className="glass-card" style={{ padding: 16 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Warnings</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#ffd166' }}>{logStats.warnings}</div>
        </motion.div>
        <motion.div className="glass-card" style={{ padding: 16 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Success</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent-green)' }}>{logStats.success}</div>
        </motion.div>
      </div>

      <div className="toolbar" style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['all', 'INFO', 'SUCCESS', 'WARN', 'ERROR'].map((level) => (
            <button
              key={level}
              onClick={() => setLevelFilter(level)}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                border: levelFilter === level ? `2px solid ${LEVEL_STYLES[level]?.color || '#4f9eff'}` : '1px solid rgba(255,255,255,0.15)',
                background: levelFilter === level ? `${LEVEL_STYLES[level]?.color || '#4f9eff'}20` : 'rgba(255,255,255,0.03)',
                color: levelFilter === level ? LEVEL_STYLES[level]?.color || '#4f9eff' : 'var(--text-muted)',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.2s'
              }}
            >
              {level === 'all' ? 'All Levels' : level}
            </button>
          ))}
        </div>
        <select value={envFilter} onChange={(e) => setEnvFilter(e.target.value)}>
          <option value="all">All environments</option>
          {environments.map((e) => <option key={e.id} value={e.id}>{e.id}</option>)}
        </select>
        <div className="search-box">
          <Search size={13} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search logs" />
        </div>
      </div>

      {hint && (
        <motion.div style={{ marginTop: 12, padding: 14, borderRadius: 12, border: '1px solid rgba(255,193,7,0.3)', background: 'rgba(255,193,7,0.08)', display: 'flex', gap: 10 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <AlertCircle size={16} style={{ color: '#ffd166', marginTop: 2, flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>Probable root cause detected</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{hint}</div>
          </div>
        </motion.div>
      )}

      <motion.div className="glass-card log-console" style={{ marginTop: 16 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ padding: '0 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 12, marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>Latest Entries</div>
        </div>
        {filtered.slice(-180).map((line, i) => (
          <div key={`${line.env}-${i}`} className="log-line">
            <span className="mono log-time">{line.time}</span>
            <span className="mono log-env">{line.env}</span>
            <span style={{ color: LEVEL_STYLES[line.level]?.color || '#8b9ab8', fontWeight: 600 }}>[{line.level}]</span>
            <span>{line.msg}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
