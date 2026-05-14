import React from 'react';
import { buildTimeline, formatCountdown } from '../utils/envInsights';

export default function EnvironmentDetailsModal({ env, logs, onClose }) {
  if (!env) return null;
  const timeline = buildTimeline(env).slice(0, 8);
  const envLogs = logs.filter((line) => line.env === env.id).slice(-8).reverse();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card glass-card" onClick={(e) => e.stopPropagation()}>
        <div className="section-header">
          <h3 className="section-title">Environment Details - {env.id}</h3>
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
        <div className="env-metrics">
          <div className="env-metric"><span>Branch</span><strong>{env.branch}</strong></div>
          <div className="env-metric"><span>Commit</span><strong className="mono">{env.commitId}</strong></div>
          <div className="env-metric"><span>Container</span><strong className="mono">{env.dockerImage}</strong></div>
          <div className="env-metric"><span>Cleanup schedule</span><strong className="mono">{formatCountdown(env.countdown_seconds)}</strong></div>
        </div>
        <div className="modal-columns">
          <div>
            <div className="timeline-title">Activity timeline</div>
            {timeline.map((item) => (
              <div className="timeline-item" key={item.id}>
                <span className="timeline-dot" />
                <span>{item.message}</span>
              </div>
            ))}
          </div>
          <div>
            <div className="timeline-title">Recent logs</div>
            {envLogs.map((line, idx) => (
              <div key={`${line.time}-${idx}`} className="log-line">
                <span className="mono log-time">{line.time}</span>
                <span>[{line.level}]</span>
                <span>{line.msg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
