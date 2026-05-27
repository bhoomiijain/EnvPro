import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Circle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRepo } from '../context/RepoContext';
import { useEnvironments } from '../context/EnvironmentContext';

const STEPS = [
  { key: 'auth', label: 'Sign in', path: '/login' },
  { key: 'repo', label: 'Select repository', path: '/repositories' },
  { key: 'env', label: 'Create environment', path: '/environments' },
  { key: 'pipeline', label: 'Watch CI/CD pipeline', path: '/pipeline' },
  { key: 'insights', label: 'Review insights', path: '/insights' },
];

export default function WorkflowGuide() {
  const { isAuthenticated } = useAuth();
  const { selectedRepo } = useRepo();
  const { environments, pipelineRuns } = useEnvironments();

  const done = {
    auth: isAuthenticated,
    repo: !!selectedRepo,
    env: environments.some((e) => e.status !== 'destroyed'),
    pipeline: pipelineRuns.length > 0,
    insights: environments.length > 0,
  };

  const completedCount = Object.values(done).filter(Boolean).length;
  if (completedCount >= STEPS.length) return null;

  return (
    <div className="glass-card workflow-guide" style={{ marginBottom: 16, padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <div className="section-title" style={{ fontSize: 14 }}>Getting started</div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
            {completedCount}/{STEPS.length} steps complete — follow the full EnvPro workflow
          </p>
        </div>
      </div>
      <div className="workflow-steps">
        {STEPS.map((step) => {
          const isDone = done[step.key];
          return (
            <Link key={step.key} to={step.path} className={`workflow-step${isDone ? ' done' : ''}`}>
              {isDone ? <CheckCircle2 size={14} style={{ color: 'var(--accent-green)' }} /> : <Circle size={14} style={{ color: 'var(--text-muted)' }} />}
              <span>{step.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
