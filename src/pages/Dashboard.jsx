import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useEnvironments } from '../context/EnvironmentContext';
import { useRepo } from '../context/RepoContext';
import { analyticsData, recentCommits } from '../data/mockData';
import { generateDeploymentInsights } from '../utils/envInsights';
import WorkflowGuide from '../components/WorkflowGuide';

const laneOrder = ['building', 'testing', 'running', 'failed', 'destroyed'];
const laneColor = {
  building: 'var(--status-building)',
  testing: 'var(--status-testing)',
  running: 'var(--status-running)',
  failed: 'var(--status-failed)',
  destroyed: 'var(--status-destroyed)',
};

export default function Dashboard() {
  const { stats, environments, systemMetrics, pipelineRuns } = useEnvironments();
  const { selectedRepo, selectedBranch } = useRepo();
  const [isNarrow, setIsNarrow] = useState(false);
  const dynamicInsights = React.useMemo(() => generateDeploymentInsights(environments), [environments]);
  const runningPipelines = pipelineRuns.filter((r) => r.stages.some((s) => s.status === 'running')).length;

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1100px)');
    const apply = () => setIsNarrow(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  const statusDistribution = laneOrder.map((lane) => {
    const value = environments.filter((e) => {
      if (lane === 'building') return e.status === 'building' || e.status === 'rollback_in_progress';
      return e.status === lane;
    }).length;

    return { name: lane, value, color: laneColor[lane] };
  });
  const hasAnyStatus = statusDistribution.some((d) => d.value > 0);

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      <h1 className="section-title"><span className="gradient-text">Orchestration Dashboard</span></h1>
      <p className="env-subtitle">
        Professional dark DevOps view — {selectedRepo?.fullName || 'No repo'} / {selectedBranch} · {runningPipelines} active pipeline(s)
      </p>

      <WorkflowGuide />

      <div className="stat-grid" style={{ marginTop: 16 }}>
        <div className="glass-card stat-card"><div className="stat-card-label">Active</div><div className="stat-card-value" style={{ color: 'var(--accent-blue)' }}>{stats.active}</div></div>
        <div className="glass-card stat-card"><div className="stat-card-label">Running</div><div className="stat-card-value" style={{ color: 'var(--accent-green)' }}>{stats.running}</div></div>
        <div className="glass-card stat-card"><div className="stat-card-label">Failed</div><div className="stat-card-value" style={{ color: 'var(--accent-red)' }}>{stats.failed}</div></div>
        <div className="glass-card stat-card"><div className="stat-card-label">Destroyed</div><div className="stat-card-value" style={{ color: 'var(--text-secondary)' }}>{stats.destroyed}</div></div>
      </div>

      <div className="dashboard-main-grid" style={{ marginTop: 16 }}>
        <motion.div className="glass-card" style={{ padding: 18 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="section-title" style={{ marginBottom: 12 }}>Parallel environment lanes</div>
          {laneOrder.map((lane) => {
            const envs = environments.filter((e) => {
              if (lane === 'building') return e.status === 'building' || e.status === 'rollback_in_progress';
              return e.status === lane;
            });
            return (
              <div key={lane} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                  <span style={{ color: laneColor[lane], textTransform: 'capitalize' }}>{lane}</span>
                  <span className="mono">{envs.length}</span>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {envs.slice(0, 8).map((e) => <span key={e.id} className="branch-pill mono">{e.id}</span>)}
                  {envs.length === 0 && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>None</span>}
                </div>
              </div>
            );
          })}
        </motion.div>

        <div className="dashboard-mini-grid">
          <motion.div className="glass-card" style={{ padding: 18 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="section-title" style={{ marginBottom: 12 }}>14-day environment trend</div>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={analyticsData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="envCreated" stroke="var(--accent-blue)" fill="rgba(79,158,255,0.2)" strokeWidth={2} />
                <Area type="monotone" dataKey="envDestroyed" stroke="var(--accent-green)" fill="rgba(0,255,136,0.2)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div className="glass-card" style={{ padding: 18 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="section-title" style={{ marginBottom: 10 }}>Environment status</div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isNarrow ? '1fr' : '140px 1fr',
                gap: 12,
                alignItems: 'center',
              }}
            >
              <div style={{ width: 140, height: 140, margin: '0 auto', position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={44}
                      outerRadius={64}
                      paddingAngle={2}
                      stroke="rgba(255,255,255,0.05)"
                      strokeWidth={1}
                      isAnimationActive={false}
                    >
                      {statusDistribution.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} opacity={entry.value ? 1 : 0.18} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: '#111827',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                      formatter={(value, name) => [value, String(name).toUpperCase()]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'none',
                  }}
                >
                  <div className="mono" style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
                    {environments.length}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: 0.8, textTransform: 'uppercase' }}>
                    total
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {statusDistribution.map((s) => (
                  <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 99, background: s.color, boxShadow: `0 0 10px ${s.color}55` }} />
                    <span style={{ color: 'var(--text-secondary)', textTransform: 'capitalize', flex: 1 }}>{s.name}</span>
                    <span className="mono" style={{ color: 'var(--text-primary)' }}>{s.value}</span>
                  </div>
                ))}
                {!hasAnyStatus && (
                  <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-muted)' }}>No environments yet.</div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="dashboard-bottom-grid" style={{ marginTop: 16 }}>
        <motion.div className="glass-card" style={{ padding: 18 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="section-title" style={{ marginBottom: 12 }}>Live System Health</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ padding: 12, borderRadius: 8, background: 'rgba(79,158,255,0.08)', border: '1px solid rgba(79,158,255,0.2)' }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>CPU Usage</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent-blue)' }}>{systemMetrics.cpu}%</div>
              <div style={{ marginTop: 4, height: 4, background: 'rgba(79,158,255,0.2)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${systemMetrics.cpu}%`, background: 'var(--accent-blue)' }} />
              </div>
            </div>
            <div style={{ padding: 12, borderRadius: 8, background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.2)' }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Memory Usage</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent-green)' }}>{systemMetrics.memory}%</div>
              <div style={{ marginTop: 4, height: 4, background: 'rgba(0,255,136,0.2)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${systemMetrics.memory}%`, background: 'var(--accent-green)' }} />
              </div>
            </div>
            <div style={{ padding: 12, borderRadius: 8, background: 'rgba(255,193,7,0.08)', border: '1px solid rgba(255,193,7,0.2)' }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Disk Usage</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#ffc107' }}>{systemMetrics.disk}%</div>
              <div style={{ marginTop: 4, height: 4, background: 'rgba(255,193,7,0.2)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${systemMetrics.disk}%`, background: '#ffc107' }} />
              </div>
            </div>
            <div style={{ padding: 12, borderRadius: 8, background: 'rgba(255,77,109,0.08)', border: '1px solid rgba(255,77,109,0.2)' }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Network I/O</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent-red)' }}>{systemMetrics.network}%</div>
              <div style={{ marginTop: 4, height: 4, background: 'rgba(255,77,109,0.2)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${systemMetrics.network}%`, background: 'var(--accent-red)' }} />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div className="glass-card" style={{ padding: 18 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="section-title" style={{ marginBottom: 12 }}>AI Insights</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {dynamicInsights.length === 0 && (
              <div style={{ padding: 10, fontSize: 11, color: 'var(--text-muted)' }}>
                {systemMetrics.activeContainers} containers · {systemMetrics.successRate}% deployment success rate
              </div>
            )}
            {dynamicInsights.map((item) => (
              <div
                key={item.type}
                style={{
                  padding: 10,
                  borderRadius: 8,
                  border: `1px solid ${item.color}40`,
                  background: `${item.color}14`,
                  display: 'flex',
                  gap: 10,
                }}
              >
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                <div style={{ fontSize: 11, fontWeight: 600, color: item.color }}>{item.text}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div style={{ marginTop: 16 }}>
        <motion.div className="glass-card" style={{ padding: 18 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="section-title" style={{ marginBottom: 12 }}>Recent Commits</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(recentCommits || []).slice(0, 5).map((c) => (
              <div
                key={c.id}
                style={{
                  padding: 10,
                  borderRadius: 12,
                  border: '1px solid var(--border-subtle)',
                  background: 'rgba(255,255,255,0.03)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--accent-blue)' }}>#{c.id}</span>
                  {c.envCreated && (
                    <span
                      style={{
                        marginLeft: 'auto',
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 999,
                        background: 'rgba(0,255,136,0.10)',
                        border: '1px solid rgba(0,255,136,0.25)',
                        color: 'var(--accent-green)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Env Created
                    </span>
                  )}
                </div>
                <div style={{ marginTop: 6, fontSize: 12, color: 'var(--text-primary)', fontWeight: 600 }}>
                  {c.message}
                </div>
                <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--text-muted)' }}>
                  <span>{c.author}</span>
                  <span style={{ opacity: 0.6 }}>·</span>
                  <span className="branch-pill" style={{ padding: '1px 8px' }}>⎇ {c.branch}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
