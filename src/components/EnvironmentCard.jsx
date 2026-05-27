import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Trash2, Copy, Check, RotateCcw } from 'lucide-react';
import { useEnvironments } from '../context/EnvironmentContext';
import { buildTimeline, formatCountdown } from '../utils/envInsights';

const STATUS_CONFIG = {
  building: { label: 'Building', cls: 'badge-building', dot: 'yellow', pulse: true },
  testing: { label: 'Testing', cls: 'badge-testing', dot: 'purple', pulse: true },
  running: { label: 'Running', cls: 'badge-running', dot: 'green', pulse: true },
  failed: { label: 'Failed', cls: 'badge-failed', dot: 'red', pulse: false },
  rollback_in_progress: { label: 'Rollback', cls: 'badge-testing', dot: 'purple', pulse: true },
  destroyed: { label: 'Destroyed', cls: 'badge-destroyed', dot: null, pulse: false },
};

function formatRuntime(start) {
  const diff = Math.floor((Date.now() - new Date(start).getTime()) / 1000);
  return formatCountdown(diff);
}

export default function EnvironmentCard({ env, onViewDetails }) {
  const { destroyEnvironment, rollbackEnvironment } = useEnvironments();
  const [copied, setCopied] = useState(false);
  const cfg = STATUS_CONFIG[env.status] || STATUS_CONFIG.destroyed;
  const timeline = buildTimeline(env).slice(0, 4);
  const canRollback = env.status !== 'destroyed' && (env.revisions || []).length > 1 && env.status !== 'rollback_in_progress';

  // Calculate TTL progress for countdown ring
  const ttlProgress = env.ttl_seconds > 0 ? (1 - env.countdown_seconds / env.ttl_seconds) * 100 : 0;
  const circumference = 2 * Math.PI * 28;
  const strokeDashoffset = circumference - (ttlProgress / 100) * circumference;

  const copyCommit = () => {
    navigator.clipboard.writeText(env.commitId).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <motion.div layout className={`glass-card env-card ${env.status === 'destroyed' ? 'env-card-dim' : ''}`}>
      <div className="env-card-header">
        <span className={`badge ${cfg.cls}`}>
          {cfg.pulse && <span className={`pulse-dot ${cfg.dot}`} />}
          {cfg.label}
        </span>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{env.name || env.id}</span>
      </div>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 6 }} className="mono branch-pill">{env.branch} · {env.repository}</div>

      <div className="env-row">
        <span className="mono env-commit">#{env.commitId}</span>
        <button className="icon-btn" onClick={copyCommit}>{copied ? <Check size={12} /> : <Copy size={12} />}</button>
        <span className="env-status-text">{env.health}</span>
      </div>

      <p className="env-message">{env.commitMsg}</p>

      <div className="env-metrics">
        <div className="env-metric"><span>Port</span><strong className="mono">{env.port}</strong></div>
        <div className="env-metric"><span>Runtime</span><strong className="mono">{formatRuntime(env.createdAt)}</strong></div>
        <div className="env-metric"><span>CPU</span><strong>{env.cpuUsage.toFixed(0)}%</strong></div>
        <div className="env-metric"><span>RAM</span><strong>{env.ramUsage.toFixed(0)}%</strong></div>
      </div>

      <div className="env-metrics" style={{ position: 'relative' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 80, height: 80, margin: '0 auto' }}>
          <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)', position: 'absolute' }} viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="28" stroke="rgba(255,255,255,0.1)" strokeWidth="3" fill="none" />
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke={env.countdown_seconds < 300 ? '#ff4d6d' : env.countdown_seconds < 600 ? '#ffd166' : '#00ff88'}
              strokeWidth="3"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <div style={{ textAlign: 'center', zIndex: 1 }}>
            <div className="mono" style={{ fontSize: 14, fontWeight: 800, color: env.countdown_seconds < 300 ? '#ff4d6d' : env.countdown_seconds < 600 ? '#ffd166' : '#00ff88' }}>
              {formatCountdown(env.countdown_seconds)}
            </div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>TTL</div>
          </div>
        </div>
        <div className="env-metric"><span>Image</span><strong className="mono">{env.imageSize}</strong></div>
        <div className="env-metric"><span>Tests</span><strong>{env.testsPassed}/{env.testsPassed + env.testsFailed}</strong></div>
        <div className="env-metric"><span>Revisions</span><strong>{env.revisions?.length || 0}</strong></div>
      </div>

      <div className="timeline-block">
        <div className="timeline-title">Activity timeline</div>
        {timeline.map((event) => (
          <div key={event.id} className="timeline-item">
            <span className="timeline-dot" />
            <span className="timeline-text">{event.message}</span>
          </div>
        ))}
      </div>

      <div className="env-actions">
        <button className="btn btn-ghost" onClick={() => onViewDetails?.(env)}>Details</button>
        {env.preview_url && env.status === 'running' && (
          <button className="btn btn-primary" onClick={() => window.open(env.preview_url, '_blank')}>
            <ExternalLink size={14} /> Preview
          </button>
        )}
        {canRollback && (
          <button className="btn btn-ghost" onClick={() => rollbackEnvironment(env.id)}>
            <RotateCcw size={14} /> Rollback
          </button>
        )}
        {env.status !== 'destroyed' && (
          <button className="btn btn-danger" onClick={() => destroyEnvironment(env.id)}>
            <Trash2 size={14} /> Destroy
          </button>
        )}
      </div>
    </motion.div>
  );
}
