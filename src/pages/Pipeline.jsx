import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Clock, Loader, MinusCircle, ChevronRight } from 'lucide-react';
import { useEnvironments } from '../context/EnvironmentContext';
import { generateDeploymentInsights } from '../utils/envInsights';

const STAGE_CFG = {
  success: { color: '#00ff88', bg: 'rgba(0,255,136,0.12)', icon: CheckCircle2 },
  running: { color: '#4f9eff', bg: 'rgba(79,158,255,0.12)', icon: Loader },
  failed:  { color: '#ff4d6d', bg: 'rgba(255,77,109,0.12)', icon: XCircle },
  pending: { color: '#4a5568', bg: 'rgba(74,85,104,0.1)',   icon: Clock },
  skipped: { color: '#4a5568', bg: 'rgba(74,85,104,0.1)',   icon: MinusCircle },
};

const STAGE_ICONS = {
  'GitHub Push': '⎇', 'Maven Build': '⚒', 'Unit Tests': '🧪',
  'Docker Build': '🐳', 'Deploy Env': '🚀', 'Preview': '👁', 'Cleanup': '🗑',
};

function PipelineStage({ stage, index, isLast }) {
  const cfg = STAGE_CFG[stage.status] || STAGE_CFG.pending;
  const Icon = cfg.icon;
  const isRunning = stage.status === 'running';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', flex: 1 }}>
      {!isLast && (
        <div style={{
          position: 'absolute', top: 28, left: '50%', width: '100%', height: 2,
          background: '#1a2238', zIndex: 0,
        }}>
          <svg width="100%" height="4" style={{ position: 'absolute', top: -1 }}>
            <line
              x1="0" y1="2" x2="100%" y2="2"
              stroke={cfg.color}
              strokeWidth="2"
              strokeDasharray={stage.status === 'pending' || stage.status === 'skipped' ? '6 4' : 'none'}
              opacity={stage.status === 'pending' || stage.status === 'skipped' ? 0.25 : 0.6}
              className={stage.status === 'running' ? 'pipeline-line' : ''}
            />
          </svg>
        </div>
      )}

      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: index * 0.12 }}
        style={{
          width: 56, height: 56, borderRadius: '50%',
          background: cfg.bg,
          border: `2px solid ${cfg.color}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, zIndex: 1, position: 'relative',
          boxShadow: `0 0 ${isRunning ? 24 : 8}px ${cfg.color}${isRunning ? '60' : '30'}`,
        }}
      >
        <span>{STAGE_ICONS[stage.name]}</span>
        {isRunning && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
            style={{
              position: 'absolute', inset: -6, borderRadius: '50%',
              border: `2px solid ${cfg.color}`, borderTopColor: 'transparent',
            }}
          />
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.12 + 0.1 }}
        style={{ marginTop: 12, textAlign: 'center' }}
      >
        <div style={{ fontSize: 12, fontWeight: 600, color: cfg.color, marginBottom: 3 }}>{stage.name}</div>
        <div style={{
          fontSize: 10, color: 'var(--text-muted)',
          background: cfg.bg, border: `1px solid ${cfg.color}40`,
          padding: '2px 8px', borderRadius: 100, textTransform: 'capitalize',
        }}>
          {stage.status}
        </div>
        {stage.duration != null && (
          <div className="mono" style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 4 }}>
            {stage.duration > 0 ? `${stage.duration}s` : 'instant'}
          </div>
        )}
      </motion.div>
    </div>
  );
}

function PipelineRun({ run, isActive, onClick }) {
  const overallStatus = run.stages.some((s) => s.status === 'failed') ? 'failed'
    : run.stages.some((s) => s.status === 'running') ? 'running'
    : run.stages.every((s) => s.status === 'success') ? 'success'
    : 'pending';

  const colors = { success: '#00ff88', running: '#4f9eff', failed: '#ff4d6d', pending: '#4a5568' };
  const c = colors[overallStatus];

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%', textAlign: 'left', padding: '12px 16px', borderRadius: 10, cursor: 'pointer',
        background: isActive ? 'rgba(79,158,255,0.1)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${isActive ? 'var(--border-accent)' : 'var(--border-subtle)'}`,
        marginBottom: 8, transition: 'all 0.2s', color: 'inherit',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: c, boxShadow: `0 0 6px ${c}` }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{run.branch}</div>
          <div className="mono" style={{ fontSize: 10, color: 'var(--text-muted)' }}>
            {run.envId} · #{run.commitId}
          </div>
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
          {Math.round((Date.now() - new Date(run.triggeredAt)) / 60000)}m ago
        </div>
        <ChevronRight size={14} color="var(--text-muted)" />
      </div>
    </button>
  );
}

export default function Pipeline() {
  const { pipelineRuns, environments } = useEnvironments();
  const [activeRun, setActiveRun] = useState(0);
  const runs = pipelineRuns.length ? pipelineRuns : [];
  const safeIndex = Math.min(activeRun, Math.max(0, runs.length - 1));
  const run = runs[safeIndex];
  const insights = useMemo(() => generateDeploymentInsights(environments), [environments]);

  if (!run) {
    return (
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <h1 className="section-title"><span className="gradient-text">CI/CD Pipeline</span></h1>
        <p className="env-subtitle">Create an environment to start a pipeline run.</p>
        <div className="glass-card" style={{ marginTop: 20, padding: 24, textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No pipeline runs yet. Provision an environment from the Environments page.</p>
        </div>
      </div>
    );
  }

  const totalDuration = run.stages.reduce((s, st) => s + (st.duration || 0), 0);
  const successStages = run.stages.filter((s) => s.status === 'success').length;
  const linkedEnv = environments.find((e) => e.id === run.envId);

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>
          <span className="gradient-text">CI/CD Pipeline</span>
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          GitHub Push → Maven Build → Test → Docker Build → Deploy → Preview → Cleanup
          {linkedEnv && <span> · linked to <strong>{linkedEnv.name || linkedEnv.id}</strong></span>}
        </p>
      </motion.div>

      <div className="pipeline-page-grid">
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: 1, marginBottom: 12, textTransform: 'uppercase' }}>
            Pipeline runs ({runs.length})
          </div>
          {runs.map((r, i) => (
            <PipelineRun key={r.id} run={r} isActive={i === safeIndex} onClick={() => setActiveRun(i)} />
          ))}

          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="glass-card"
            style={{ padding: 16, marginTop: 16, border: '1px solid rgba(167,139,250,0.25)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 16 }}>🤖</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#a78bfa' }}>AI Insights</span>
            </div>
            {insights.length === 0 && (
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Pipelines healthy — no anomalies detected.</p>
            )}
            {insights.map((item) => (
              <div key={item.type} style={{ display: 'flex', gap: 8, marginBottom: 10, fontSize: 11.5 }}>
                <span>{item.icon}</span>
                <span style={{ color: item.color }}>{item.text}</span>
              </div>
            ))}
          </motion.div>
        </div>

        <div>
          <motion.div className="glass-card" style={{ padding: 28, marginBottom: 20 }}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span className="branch-pill">⎇ {run.branch}</span>
                  <span className="mono" style={{ fontSize: 12, color: 'var(--accent-blue)' }}>#{run.commitId}</span>
                  {run.repository && (
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{run.repository}</span>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent-blue)' }}>{totalDuration}s</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Total Duration</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent-green)' }}>{successStages}/{run.stages.length}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Stages OK</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, padding: '8px 0', overflowX: 'auto' }}>
              {run.stages.map((stage, i) => (
                <PipelineStage key={stage.name} stage={stage} index={i} isLast={i === run.stages.length - 1} />
              ))}
            </div>
          </motion.div>

          <motion.div className="glass-card" style={{ padding: 20 }}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14, color: 'var(--text-primary)' }}>Stage Details</div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Stage', 'Status', 'Duration', 'Output'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: 0.8, textTransform: 'uppercase', paddingBottom: 10, borderBottom: '1px solid var(--border-subtle)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {run.stages.map((s) => {
                  const cfg = STAGE_CFG[s.status] || STAGE_CFG.pending;
                  const previewUrl = linkedEnv?.preview_url || `http://localhost:${linkedEnv?.port || '----'}`;
                  const outputs = {
                    'GitHub Push': 'Workflow triggered',
                    'Maven Build': 'BUILD SUCCESS',
                    'Unit Tests': s.status === 'failed' ? 'Tests failed' : 'All tests passed',
                    'Docker Build': linkedEnv?.imageSize ? `Image: ${linkedEnv.imageSize}` : 'Image built',
                    'Deploy Env': linkedEnv ? `Port ${linkedEnv.port}` : 'Deploying',
                    Preview: previewUrl,
                    Cleanup: 'Scheduled after TTL',
                  };
                  return (
                    <tr key={s.name} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '10px 0', fontSize: 12, color: 'var(--text-primary)' }}>
                        {STAGE_ICONS[s.name]} {s.name}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ fontSize: 11, color: cfg.color, background: cfg.bg, padding: '2px 8px', borderRadius: 100, textTransform: 'capitalize' }}>
                          {s.status}
                        </span>
                      </td>
                      <td className="mono" style={{ padding: '10px 12px', fontSize: 12, color: 'var(--text-secondary)' }}>
                        {s.duration != null ? (s.duration === 0 ? 'instant' : `${s.duration}s`) : '—'}
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: 11, color: 'var(--text-muted)' }}>
                        {s.status !== 'pending' && s.status !== 'skipped' ? outputs[s.name] : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
