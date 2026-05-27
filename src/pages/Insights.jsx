import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useEnvironments } from '../context/EnvironmentContext';
import { generateDeploymentInsights, detectResourceAnomalies } from '../utils/envInsights';
import { analyticsData } from '../data/mockData';

export default function Insights() {
  const { environments, stats, systemMetrics } = useEnvironments();

  const insights = useMemo(() => generateDeploymentInsights(environments), [environments]);
  const anomalies = useMemo(() => detectResourceAnomalies(environments), [environments]);

  const cleanupEfficiency = useMemo(() => {
    const destroyed = environments.filter((e) => e.status === 'destroyed').length;
    const total = environments.length || 1;
    return Math.round((destroyed / total) * 100);
  }, [environments]);

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      <h1 className="section-title"><span className="gradient-text">Deployment Insights</span></h1>
      <p className="env-subtitle">AI-assisted analytics, trends, and infrastructure observability</p>

      <div className="stat-grid" style={{ marginTop: 16 }}>
        <div className="glass-card stat-card"><div className="stat-card-label">Success rate</div><div className="stat-card-value" style={{ color: 'var(--accent-green)' }}>{systemMetrics.successRate}%</div></div>
        <div className="glass-card stat-card"><div className="stat-card-label">Active</div><div className="stat-card-value" style={{ color: 'var(--accent-blue)' }}>{stats.active}</div></div>
        <div className="glass-card stat-card"><div className="stat-card-label">Failed</div><div className="stat-card-value" style={{ color: 'var(--accent-red)' }}>{stats.failed}</div></div>
        <div className="glass-card stat-card"><div className="stat-card-label">Cleanup efficiency</div><div className="stat-card-value">{cleanupEfficiency}%</div></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
        <motion.div className="glass-card" style={{ padding: 18 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="section-title" style={{ marginBottom: 12 }}>14-day deployment trend</div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={analyticsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="buildSuccess" stroke="var(--accent-green)" fill="rgba(0,255,136,0.15)" strokeWidth={2} />
              <Area type="monotone" dataKey="buildFail" stroke="var(--accent-red)" fill="rgba(255,77,109,0.12)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div className="glass-card" style={{ padding: 18 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="section-title" style={{ marginBottom: 12 }}>AI recommendations</div>
          {insights.length === 0 && (
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>No critical insights — infrastructure looks healthy.</p>
          )}
          {insights.map((item) => (
            <div
              key={item.type}
              style={{
                padding: 10,
                marginBottom: 8,
                borderRadius: 8,
                border: `1px solid ${item.color}40`,
                background: `${item.color}12`,
                fontSize: 12,
                display: 'flex',
                gap: 8,
              }}
            >
              <span>{item.icon}</span>
              <span style={{ color: item.color }}>{item.text}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {anomalies.length > 0 && (
        <motion.div className="glass-card" style={{ marginTop: 16, padding: 18 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="section-title" style={{ marginBottom: 12 }}>Resource anomalies</div>
          {anomalies.map((a) => (
            <div key={`${a.id}-${a.type}`} style={{ marginBottom: 10, fontSize: 12 }}>
              <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{a.message}</div>
              <div style={{ color: 'var(--text-muted)', marginTop: 4 }}>{a.suggestion}</div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
