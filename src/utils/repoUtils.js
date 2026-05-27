import { buildCommitsForRepo } from '../data/mockData';

const CUSTOM_REPOS_KEY = 'envpro_custom_repos';

export function loadCustomRepos() {
  try {
    const raw = localStorage.getItem(CUSTOM_REPOS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomRepos(repos) {
  localStorage.setItem(CUSTOM_REPOS_KEY, JSON.stringify(repos));
}

/**
 * Parse GitHub repo input: owner/repo, github.com/owner/repo, or full HTTPS URL.
 */
export function parseGitHubRepoInput(input) {
  const trimmed = (input || '').trim();
  if (!trimmed) return null;

  let path = trimmed
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/\.git$/i, '')
    .replace(/\/+$/, '');

  if (path.startsWith('github.com/')) {
    path = path.slice('github.com/'.length);
  }

  const parts = path.split('/').filter(Boolean);
  if (parts.length < 2) return null;

  const owner = parts[0];
  const name = parts[1].replace(/\.git$/i, '');
  if (!owner || !name) return null;

  return {
    owner,
    name,
    fullName: `${owner}/${name}`,
  };
}

export function createRepositoryRecord({
  fullNameOrUrl,
  description = '',
  defaultBranch = 'main',
  language = 'Other',
}) {
  const parsed = parseGitHubRepoInput(fullNameOrUrl);
  if (!parsed) return { ok: false, error: 'Use owner/repo or a GitHub URL (e.g. github.com/you/my-app).' };

  const branches = [defaultBranch.trim() || 'main'];
  if (defaultBranch !== 'main' && !branches.includes('main')) {
    branches.push('main');
  }
  if (!branches.includes('develop')) {
    branches.push('develop');
  }

  const repo = {
    id: `repo-custom-${Date.now()}`,
    name: parsed.name,
    fullName: parsed.fullName,
    description: description.trim() || `Connected repository ${parsed.fullName}`,
    defaultBranch: branches[0],
    branches: [...new Set(branches)],
    stars: 0,
    language: language.trim() || 'Other',
    commits: buildCommitsForRepo(branches),
    userAdded: true,
    connectedAt: new Date().toISOString(),
  };

  return { ok: true, repo };
}
