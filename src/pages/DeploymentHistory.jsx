import React from 'react';
import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { useEnvironments } from '../context/EnvironmentContext';

export default function DeploymentHistory() {
  const { deploymentHistory, rollbackEnvironment, environments } = useEnvironments();

  const techStack = [
    { name: 'React', icon: '⚛', category: 'Frontend' },
    { name: 'Spring Boot', icon: '🍃', category: 'Backend' },
    { name: 'PostgreSQL', icon: '🐘', category: 'Database' },
    { name: 'Docker', icon: '🐳', category: 'Container' },
    { name: 'Maven', icon: '⚒', category: 'Build' },
    { name: 'GitHub Actions', icon: '⎇', category: 'CI/CD' },
  ];

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      <h1 className="section-title"><span className="gradient-text">Deployment History</span></h1>
      <p className="env-subtitle">Recent revisions, rollbacks, and cleanup outcomes</p>

      <div style={{ marginTop: 16 }}>
        <motion.div className="glass-card" style={{ padding: 18 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="section-title" style={{ marginBottom: 16 }}>Tech Stack</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12 }}>
            {techStack.map((tech) => (
              <div
                key={tech.name}
                style={{
                  padding: 12,
                  borderRadius: 12,
                  border: '1px solid var(--border-subtle)',
                  background: 'rgba(255,255,255,0.03)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 6 }}>{tech.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{tech.name}</div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 4 }}>{tech.category}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div className="glass-card" style={{ marginTop: 16, padding: 16 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="section-title" style={{ marginBottom: 12 }}>Recent Deployments</div>
        {deploymentHistory.length === 0 && (
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>No deployment history yet. Create environments to track revisions.</p>
        )}
        {deploymentHistory.map((item) => {
          const env = environments.find((e) => e.id === item.envId);
          return (
            <div key={item.id} className="history-row" style={{ alignItems: 'center' }}>
              <div>
                <div className="mono" style={{ fontSize: 11 }}>{item.envName}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{item.envId}</div>
              </div>
              <div>{item.branch}</div>
              <div className="mono">{item.commit}</div>
              <div>{item.action}</div>
              <div style={{ textTransform: 'capitalize' }}>{item.status}</div>
              <div className="mono">{item.time}</div>
              <div>
                {item.canRollback && env && (
                  <button
                    type="button"
                    className="btn btn-ghost"
                    style={{ padding: '4px 10px', fontSize: 11 }}
                    onClick={() => rollbackEnvironment(item.envId)}
                  >
                    <RotateCcw size={12} /> Rollback
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
