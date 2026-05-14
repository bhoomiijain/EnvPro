export function getFailureHint(logs = []) {
  const text = logs.map((l) => `${l.msg}`.toLowerCase()).join(' | ');
  if (text.includes('connection refused') || text.includes('db_unreachable') || text.includes('postgres')) return 'Database unreachable: verify postgres container health, credentials, and network alias.';
  if (text.includes('timed out') || text.includes('timeout')) return 'Pipeline timeout likely: increase stage timeout or optimize Maven/Docker caching.';
  if (text.includes('address already in use') || text.includes('port_conflict') || text.includes('port')) return 'Port conflict detected: move to dynamic host ports and check stale processes.';
  if (text.includes('pull access denied') || text.includes('image_pull_error') || text.includes('manifest unknown')) return 'Image pull issue: confirm tag exists, auth to registry, and image naming convention.';
  return 'No deterministic signature found. Inspect latest stage logs and health checks for root cause.';
}

export function detectResourceAnomalies(environments = []) {
  const anomalies = [];
  if (!environments || environments.length === 0) return anomalies;

  const runningEnvs = environments.filter(e => e.status === 'running');
  if (runningEnvs.length === 0) return anomalies;

  const avgCpu = runningEnvs.reduce((sum, e) => sum + e.cpuUsage, 0) / runningEnvs.length;
  const avgRam = runningEnvs.reduce((sum, e) => sum + e.ramUsage, 0) / runningEnvs.length;
  const maxCpu = Math.max(...runningEnvs.map(e => e.cpuUsage));
  const maxRam = Math.max(...runningEnvs.map(e => e.ramUsage));

  // Detect spike anomalies
  runningEnvs.forEach(e => {
    if (e.cpuUsage > avgCpu * 2) {
      anomalies.push({
        id: e.id,
        type: 'cpu-spike',
        severity: 'high',
        message: `${e.id} CPU spike: ${e.cpuUsage.toFixed(0)}% (avg: ${avgCpu.toFixed(0)}%)`,
        suggestion: 'Check running processes, consider scaling or resource limits'
      });
    }
    if (e.ramUsage > avgRam * 2) {
      anomalies.push({
        id: e.id,
        type: 'memory-spike',
        severity: 'high',
        message: `${e.id} memory spike: ${e.ramUsage.toFixed(0)}% (avg: ${avgRam.toFixed(0)}%)`,
        suggestion: 'Possible memory leak detected. Monitor heap usage and GC logs.'
      });
    }
  });

  // TTL expiration warnings
  runningEnvs.forEach(e => {
    if (e.countdown_seconds < 300) {
      anomalies.push({
        id: e.id,
        type: 'ttl-warning',
        severity: 'info',
        message: `${e.id} TTL expiring in ${Math.floor(e.countdown_seconds / 60)}m`,
        suggestion: 'Environment will be auto-destroyed soon'
      });
    }
  });

  return anomalies;
}

export function generateDeploymentInsights(environments = []) {
  const insights = [];
  const runningCount = environments.filter(e => e.status === 'running').length;
  const failedCount = environments.filter(e => e.status === 'failed').length;
  const buildingCount = environments.filter(e => e.status === 'building').length;

  if (failedCount > 0 && failedCount / environments.length > 0.3) {
    insights.push({
      icon: '⚠️',
      type: 'failure-rate-high',
      text: `${failedCount} environments failed (${(failedCount / environments.length * 100).toFixed(0)}%) - review logs for common issues`,
      color: '#ffd166'
    });
  }

  if (buildingCount > 5) {
    insights.push({
      icon: '🔨',
      type: 'high-build-queue',
      text: `${buildingCount} environments building - consider cache optimization to reduce build times`,
      color: '#4f9eff'
    });
  }

  const avgCpuUsage = environments
    .filter(e => e.status === 'running')
    .reduce((sum, e) => sum + e.cpuUsage, 0) / (environments.filter(e => e.status === 'running').length || 1);

  if (avgCpuUsage > 70) {
    insights.push({
      icon: '💻',
      type: 'high-cpu-usage',
      text: `Average CPU usage ${avgCpuUsage.toFixed(0)}% - consider resource optimization`,
      color: '#ff4d6d'
    });
  }

  return insights;
}

export function buildTimeline(env) {
  const events = (env.events || []).slice().sort((a, b) => new Date(b.at) - new Date(a.at));
  if (!events.length) return [{ id: `${env.id}-default`, at: env.createdAt, message: 'Environment created', type: 'created' }];
  return events;
}

export function formatCountdown(seconds) {
  if (!seconds && seconds !== 0) return '--';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}
