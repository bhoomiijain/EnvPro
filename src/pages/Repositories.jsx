import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitBranch, Star, CheckCircle2, Link2, Plus, Trash2, X } from 'lucide-react';
import { useRepo } from '../context/RepoContext';
import { useNavigate } from 'react-router-dom';

export default function Repositories() {
  const {
    repositories,
    selectedRepo,
    selectedBranch,
    selectRepo,
    selectBranch,
    addRepository,
    removeRepository,
    addBranchToRepo,
    recentCommitsForSelection,
  } = useRepo();
  const navigate = useNavigate();

  const [showConnect, setShowConnect] = useState(false);
  const [repoInput, setRepoInput] = useState('');
  const [description, setDescription] = useState('');
  const [defaultBranch, setDefaultBranch] = useState('main');
  const [language, setLanguage] = useState('Java');
  const [connectError, setConnectError] = useState('');
  const [newBranch, setNewBranch] = useState('');

  const handleConnect = (e) => {
    e.preventDefault();
    setConnectError('');
    const result = addRepository({
      fullNameOrUrl: repoInput,
      description,
      defaultBranch,
      language,
    });
    if (!result.ok) {
      setConnectError(result.error);
      return;
    }
    setShowConnect(false);
    setRepoInput('');
    setDescription('');
    setDefaultBranch('main');
  };

  const handleAddBranch = () => {
    if (!selectedRepo) return;
    const result = addBranchToRepo(selectedRepo.id, newBranch);
    if (!result.ok) {
      setConnectError(result.error);
      return;
    }
    setNewBranch('');
    setConnectError('');
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      <div className="section-header">
        <div>
          <h1 className="section-title"><span className="gradient-text">Repositories</span></h1>
          <p className="env-subtitle">
            Connect GitHub repositories and pick a branch — each environment deploys from your active selection.
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setShowConnect(true)}>
          <Plus size={15} /> Connect repository
        </button>
      </div>

      <AnimatePresence>
        {showConnect && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowConnect(false)}
          >
            <motion.div
              className="glass-card modal-card"
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: 520 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div className="section-title" style={{ margin: 0 }}>Connect a GitHub repository</div>
                <button type="button" className="icon-btn" onClick={() => setShowConnect(false)} aria-label="Close">
                  <X size={18} />
                </button>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
                Paste a GitHub URL or <span className="mono">owner/repo</span> (e.g. <span className="mono">you/my-service</span>).
                Your team can switch repos anytime from this page or when creating an environment.
              </p>
              <form className="auth-form" onSubmit={handleConnect}>
                <label>
                  Repository URL or owner/repo
                  <input
                    value={repoInput}
                    onChange={(e) => setRepoInput(e.target.value)}
                    placeholder="github.com/you/my-app or you/my-app"
                    required
                  />
                </label>
                <label>
                  Description (optional)
                  <input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What this repo is for"
                  />
                </label>
                <label>
                  Default branch
                  <input
                    value={defaultBranch}
                    onChange={(e) => setDefaultBranch(e.target.value)}
                    placeholder="main"
                  />
                </label>
                <label>
                  Primary language
                  <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                    <option value="Java">Java</option>
                    <option value="TypeScript">TypeScript</option>
                    <option value="JavaScript">JavaScript</option>
                    <option value="Python">Python</option>
                    <option value="Go">Go</option>
                    <option value="Other">Other</option>
                  </select>
                </label>
                {connectError && (
                  <p style={{ color: 'var(--accent-red)', fontSize: 12, margin: 0 }}>{connectError}</p>
                )}
                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                  <button type="submit" className="btn btn-primary">Connect & select</button>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowConnect(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginTop: 20 }}>
        {repositories.map((repo) => {
          const active = selectedRepo?.id === repo.id;
          return (
            <motion.div
              key={repo.id}
              className="glass-card"
              style={{
                padding: 18,
                border: active ? '1px solid var(--border-accent)' : '1px solid var(--border-subtle)',
                background: active ? 'rgba(79,158,255,0.08)' : undefined,
              }}
              whileHover={{ scale: 1.01 }}
            >
              <button
                type="button"
                onClick={() => selectRepo(repo.id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  color: 'inherit',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Link2 size={16} style={{ color: 'var(--accent-blue)' }} />
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{repo.name}</span>
                  {repo.userAdded && (
                    <span className="badge badge-testing" style={{ fontSize: 10, padding: '2px 6px' }}>Yours</span>
                  )}
                  {active && <CheckCircle2 size={16} style={{ marginLeft: 'auto', color: 'var(--accent-green)' }} />}
                </div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>{repo.fullName}</div>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>{repo.description}</p>
                <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--text-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Star size={12} /> {repo.stars}</span>
                  <span>{repo.language}</span>
                </div>
              </button>
              {repo.userAdded && (
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ marginTop: 12, fontSize: 11, display: 'flex', alignItems: 'center', gap: 6 }}
                  onClick={() => {
                    if (window.confirm(`Disconnect ${repo.fullName}?`)) removeRepository(repo.id);
                  }}
                >
                  <Trash2 size={12} /> Disconnect
                </button>
              )}
            </motion.div>
          );
        })}
      </div>

      {selectedRepo && (
        <motion.div className="glass-card" style={{ marginTop: 20, padding: 20 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="section-title" style={{ marginBottom: 14 }}>Branch for {selectedRepo.name}</div>
          <div className="filter-row" style={{ marginBottom: 20 }}>
            {selectedRepo.branches.map((b) => (
              <button
                key={b}
                type="button"
                className={`filter-pill ${selectedBranch === b ? 'active' : ''}`}
                onClick={() => selectBranch(b)}
              >
                <GitBranch size={12} style={{ marginRight: 4 }} />
                {b}
              </button>
            ))}
          </div>

          {selectedRepo.userAdded && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                value={newBranch}
                onChange={(e) => setNewBranch(e.target.value)}
                placeholder="feature/my-branch"
                style={{ flex: '1 1 200px', minWidth: 160 }}
              />
              <button type="button" className="btn btn-ghost" onClick={handleAddBranch}>
                Add branch
              </button>
            </div>
          )}

          <div className="section-title" style={{ marginBottom: 12, fontSize: 13 }}>Recent commits on {selectedBranch}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(recentCommitsForSelection.length ? recentCommitsForSelection : selectedRepo.commits.slice(0, 5)).map((c) => (
              <div
                key={c.id}
                style={{
                  padding: 12,
                  borderRadius: 10,
                  border: '1px solid var(--border-subtle)',
                  background: 'rgba(255,255,255,0.02)',
                }}
              >
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--accent-blue)' }}>#{c.id}</span>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{c.message}</span>
                </div>
                <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-muted)' }}>
                  {c.author} · {new Date(c.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-primary" onClick={() => navigate('/environments?create=1')}>
              Create environment from selection
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/pipeline')}>
              View pipeline for {selectedRepo.fullName}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
