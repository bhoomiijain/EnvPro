import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Container, GitBranch, Shield, Zap, BarChart3, RotateCcw } from 'lucide-react';

const FEATURES = [
  { icon: Container, title: 'Ephemeral environments', desc: 'Isolated preview deployments per branch with automatic TTL cleanup.' },
  { icon: GitBranch, title: 'CI/CD visualization', desc: 'Animated pipeline stages from GitHub push through deploy and preview.' },
  { icon: BarChart3, title: 'Live monitoring', desc: 'CPU, memory, logs, and deployment analytics in one dashboard.' },
  { icon: RotateCcw, title: 'Rollback simulation', desc: 'Restore stable revisions and track deployment history.' },
  { icon: Shield, title: 'Secure access', desc: 'Register, login, and role-based developer or admin controls.' },
  { icon: Zap, title: 'AI insights', desc: 'Failure hints, anomaly detection, and resource optimization suggestions.' },
];

export default function Landing() {
  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <div className="logo-mark">
          <div className="logo-icon">⚡</div>
          <div className="logo-text">
            EnvPro
            <span>Dynamic Env Provisioner</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/login" className="btn btn-ghost">Sign in</Link>
          <Link to="/register" className="btn btn-primary">Get started</Link>
        </div>
      </nav>

      <motion.section
        className="landing-hero"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>
          <span className="gradient-text">Cloud-native DevOps</span>
          <br />
          for ephemeral environments
        </h1>
        <p className="lead">
          Provision, monitor, and destroy preview environments from a single orchestration platform — inspired by modern CI/CD workflows.
        </p>
        <div className="landing-cta-row">
          <Link to="/register" className="btn btn-primary" style={{ padding: '12px 24px' }}>Create free account</Link>
          <Link to="/login" className="btn btn-ghost" style={{ padding: '12px 24px' }}>Sign in to dashboard</Link>
        </div>
      </motion.section>

      <section className="landing-features">
        {FEATURES.map(({ icon: Icon, title, desc }, i) => (
          <motion.div
            key={title}
            className="glass-card landing-feature"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Icon size={22} style={{ color: 'var(--accent-blue)', marginBottom: 12 }} />
            <h3>{title}</h3>
            <p>{desc}</p>
          </motion.div>
        ))}
      </section>
    </div>
  );
}
