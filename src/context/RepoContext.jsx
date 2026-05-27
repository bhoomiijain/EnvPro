import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { REPOSITORIES } from '../data/mockData';
import {
  createRepositoryRecord,
  loadCustomRepos,
  saveCustomRepos,
} from '../utils/repoUtils';

const RepoContext = createContext(null);

export function RepoProvider({ children }) {
  const [customRepos, setCustomRepos] = useState(() => loadCustomRepos());
  const [selectedRepoId, setSelectedRepoId] = useState(
    () => localStorage.getItem('envpro_selected_repo') || REPOSITORIES[0]?.id || null,
  );
  const [selectedBranch, setSelectedBranch] = useState(
    () => localStorage.getItem('envpro_selected_branch') || REPOSITORIES[0]?.defaultBranch || 'main',
  );

  const repositories = useMemo(() => {
    const byId = new Map();
    [...REPOSITORIES, ...customRepos].forEach((r) => byId.set(r.id, r));
    return [...byId.values()];
  }, [customRepos]);

  const selectedRepo = useMemo(
    () => repositories.find((r) => r.id === selectedRepoId) || repositories[0],
    [repositories, selectedRepoId],
  );

  const persistCustom = useCallback((next) => {
    setCustomRepos(next);
    saveCustomRepos(next);
  }, []);

  const selectRepo = useCallback(
    (repoId) => {
      const repo = repositories.find((r) => r.id === repoId);
      if (!repo) return;
      setSelectedRepoId(repoId);
      setSelectedBranch(repo.defaultBranch);
      localStorage.setItem('envpro_selected_repo', repoId);
      localStorage.setItem('envpro_selected_branch', repo.defaultBranch);
    },
    [repositories],
  );

  const selectBranch = useCallback((branch) => {
    setSelectedBranch(branch);
    localStorage.setItem('envpro_selected_branch', branch);
  }, []);

  const addRepository = useCallback(
    (input) => {
      const result = createRepositoryRecord(input);
      if (!result.ok) return result;

      if (repositories.some((r) => r.fullName.toLowerCase() === result.repo.fullName.toLowerCase())) {
        return { ok: false, error: 'This repository is already connected.' };
      }

      const next = [...customRepos, result.repo];
      persistCustom(next);
      selectRepo(result.repo.id);
      return { ok: true, repo: result.repo };
    },
    [customRepos, repositories, persistCustom, selectRepo],
  );

  const removeRepository = useCallback(
    (repoId) => {
      const repo = repositories.find((r) => r.id === repoId);
      if (!repo?.userAdded) {
        return { ok: false, error: 'Built-in demo repositories cannot be removed.' };
      }
      const next = customRepos.filter((r) => r.id !== repoId);
      persistCustom(next);
      if (selectedRepoId === repoId) {
        const fallback = REPOSITORIES[0] || next[0];
        if (fallback) selectRepo(fallback.id);
      }
      return { ok: true };
    },
    [customRepos, repositories, selectedRepoId, persistCustom, selectRepo],
  );

  const addBranchToRepo = useCallback(
    (repoId, branchName) => {
      const branch = (branchName || '').trim();
      if (!branch) return { ok: false, error: 'Branch name is required.' };

      const update = (r) => {
        if (r.id !== repoId) return r;
        if (r.branches.includes(branch)) return r;
        return { ...r, branches: [...r.branches, branch] };
      };

      if (customRepos.some((r) => r.id === repoId)) {
        persistCustom(customRepos.map(update));
      }
      return { ok: true };
    },
    [customRepos, persistCustom],
  );

  const value = useMemo(
    () => ({
      repositories,
      selectedRepo,
      selectedBranch,
      selectRepo,
      selectBranch,
      addRepository,
      removeRepository,
      addBranchToRepo,
      recentCommitsForSelection:
        selectedRepo?.commits?.filter((c) => c.branch === selectedBranch).slice(0, 8) || [],
    }),
    [
      repositories,
      selectedRepo,
      selectedBranch,
      selectRepo,
      selectBranch,
      addRepository,
      removeRepository,
      addBranchToRepo,
    ],
  );

  return <RepoContext.Provider value={value}>{children}</RepoContext.Provider>;
}

export const useRepo = () => {
  const ctx = useContext(RepoContext);
  if (!ctx) throw new Error('useRepo must be used within RepoProvider');
  return ctx;
};
