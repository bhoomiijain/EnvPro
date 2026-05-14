export const BRANCHES = [
  'main',
  'feature/auth-v2',
  'feature/dashboard-ui',
  'fix/memory-leak',
  'release/v2.1',
  'hotfix/sql-injection',
  'feature/ai-insights',
  'dev/docker-orchestration',
];

export const STATUSES = ['building', 'testing', 'running', 'failed', 'rollback_in_progress', 'destroyed'];

const COMMIT_MESSAGES = [
  'feat: add JWT authentication middleware',
  'fix: resolve memory leak in container pool',
  'feat: implement dynamic port allocation',
  'refactor: optimize Docker build pipeline',
  'fix: PostgreSQL connection pooling',
  'feat: add AI-based failure prediction',
  'chore: bump Spring Boot to 3.2.0',
  'feat: environment comparison dashboard',
  'fix: race condition in cleanup scheduler',
  'feat: one-click rollback mechanism',
  'style: update dashboard UI components',
  'test: add integration tests for CI pipeline',
];

const AUTHORS = ['bhoomi.jain', 'dev.sharma', 'priya.k', 'ankit.m', 'sonia.r'];

let idCounter = 1;
const genId = () => `env-${(idCounter++).toString().padStart(4, '0')}`;
const genCommit = () => Math.random().toString(16).slice(2, 9).toUpperCase();
const randBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const now = Date.now();

function buildRevisions(commitId) {
  const prev = genCommit();
  return [
    { sha: commitId, at: new Date(now - randBetween(60_000, 2_500_000)).toISOString(), status: 'active' },
    { sha: prev, at: new Date(now - randBetween(2_600_000, 4_500_000)).toISOString(), status: 'stable' },
  ];
}

export function generateEnvironment(overrides = {}) {
  const status = overrides.status || randFrom(['building', 'testing', 'running', 'running', 'running', 'failed']);
  const branch = overrides.branch || randFrom(BRANCHES);
  const port = randBetween(3001, 9999);
  const createdMsAgo = randBetween(120_000, 8_000_000);
  const commitId = genCommit();
  const createdAt = new Date(now - createdMsAgo).toISOString();
  const healthyAt = status === 'running' ? new Date(now - randBetween(60_000, createdMsAgo - 30_000)).toISOString() : null;
  const ttl_seconds = overrides.ttl_seconds || randFrom([15 * 60, 30 * 60, 60 * 60]);
  const countdown_seconds = status === 'running' ? randBetween(60, ttl_seconds) : 0;
  const auto_destroy_at = status === 'running' ? new Date(Date.now() + countdown_seconds * 1000).toISOString() : null;

  const env = {
    id: genId(),
    commitId,
    commitMsg: randFrom(COMMIT_MESSAGES),
    branch,
    status,
    port,
    createdAt,
    healthyAt,
    destroyedAt: status === 'destroyed' ? new Date(now - randBetween(10_000, 100_000)).toISOString() : null,
    author: randFrom(AUTHORS),
    cpuUsage: status === 'running' ? randBetween(8, 78) : randBetween(0, 15),
    ramUsage: status === 'running' ? randBetween(20, 85) : randBetween(5, 30),
    ramMB: randBetween(128, 1024),
    ttl_seconds,
    countdown_seconds,
    auto_destroy_at,
    buildDuration: randBetween(45, 180),
    testsPassed: status !== 'failed' ? randBetween(12, 48) : randBetween(0, 12),
    testsFailed: status === 'failed' ? randBetween(1, 8) : 0,
    imageSize: `${(randBetween(120, 480) / 10).toFixed(1)}MB`,
    dockerImage: `envpro/${branch.replace(/[^a-z0-9]/gi, '-').toLowerCase()}:${commitId.toLowerCase()}`,
    buildStage: status === 'building' ? randFrom(['maven-compile', 'maven-test', 'docker-build']) : 'complete',
    preview_url: status === 'running' ? `http://localhost:${port}` : null,
    health: status === 'running' ? 'healthy' : status === 'failed' ? 'unhealthy' : 'starting',
    latest_failure_cause: status === 'failed' ? randFrom(['db_unreachable', 'timeout', 'port_conflict', 'image_pull_error']) : null,
    revisions: buildRevisions(commitId),
    events: [],
    ...overrides,
  };

  env.events = [
    { id: `${env.id}-1`, type: 'created', message: `Environment created from ${env.branch}`, at: env.createdAt },
    ...(env.healthyAt ? [{ id: `${env.id}-2`, type: 'healthy', message: 'Environment passed health checks', at: env.healthyAt }] : []),
  ];

  return env;
}

export const initialEnvironments = [
  generateEnvironment({ status: 'running', branch: 'main' }),
  generateEnvironment({ status: 'running', branch: 'feature/auth-v2' }),
  generateEnvironment({ status: 'building', branch: 'feature/dashboard-ui' }),
  generateEnvironment({ status: 'testing', branch: 'fix/memory-leak' }),
  generateEnvironment({ status: 'running', branch: 'release/v2.1' }),
  generateEnvironment({ status: 'failed', branch: 'hotfix/sql-injection' }),
  generateEnvironment({ status: 'running', branch: 'feature/ai-insights' }),
  generateEnvironment({ status: 'destroyed', branch: 'dev/docker-orchestration' }),
];

export const recentCommits = Array.from({ length: 18 }, (_, i) => ({
  id: genCommit(),
  message: COMMIT_MESSAGES[i % COMMIT_MESSAGES.length],
  author: randFrom(AUTHORS),
  branch: randFrom(BRANCHES),
  timestamp: new Date(now - i * 12 * 60_000).toISOString(),
  envCreated: i < 12,
}));

export const pipelineRuns = [
  {
    id: 'run-001',
    commitId: genCommit(),
    branch: 'main',
    triggeredAt: new Date(now - 5 * 60_000).toISOString(),
    stages: [
      { name: 'GitHub Push', status: 'success', duration: 0 },
      { name: 'Maven Build', status: 'success', duration: 64 },
      { name: 'Unit Tests', status: 'success', duration: 38 },
      { name: 'Docker Build', status: 'success', duration: 22 },
      { name: 'Deploy Env', status: 'running', duration: null },
      { name: 'Preview', status: 'pending', duration: null },
      { name: 'Cleanup', status: 'pending', duration: null },
    ],
  },
  {
    id: 'run-002',
    commitId: genCommit(),
    branch: 'feature/auth-v2',
    triggeredAt: new Date(now - 22 * 60_000).toISOString(),
    stages: [
      { name: 'GitHub Push', status: 'success', duration: 0 },
      { name: 'Maven Build', status: 'success', duration: 71 },
      { name: 'Unit Tests', status: 'failed', duration: 45 },
      { name: 'Docker Build', status: 'skipped', duration: null },
      { name: 'Deploy Env', status: 'skipped', duration: null },
      { name: 'Preview', status: 'skipped', duration: null },
      { name: 'Cleanup', status: 'skipped', duration: null },
    ],
  },
];

export const analyticsData = Array.from({ length: 14 }, (_, i) => ({
  date: new Date(now - (13 - i) * 86_400_000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  envCreated: randBetween(4, 18),
  envDestroyed: randBetween(3, 16),
  buildSuccess: randBetween(60, 95),
  buildFail: randBetween(5, 35),
}));

export function generateLogLine(env) {
  const templates = {
    running: `[HealthCheck] ${env.id} responding OK (${Math.floor(Math.random() * 200 + 90)}ms)`,
    building: `[Build] ${env.id} stage ${env.buildStage || 'docker-build'} in progress`,
    testing: `[Tests] ${env.id} executing suite (${Math.floor(Math.random() * 90)}% complete)`,
    failed: `[Deploy] ${env.id} failed due to ${env.latest_failure_cause || 'unknown error'}`,
    rollback_in_progress: `[Rollback] ${env.id} applying previous revision`,
    destroyed: `[Cleanup] ${env.id} resources already released`,
  };

  return {
    level: env.status === 'failed' ? 'ERROR' : env.status === 'running' ? 'SUCCESS' : 'INFO',
    time: new Date().toLocaleTimeString('en-US', { hour12: false }),
    env: env.id,
    msg: templates[env.status] || `[Env] ${env.id} status ${env.status}`,
  };
}
