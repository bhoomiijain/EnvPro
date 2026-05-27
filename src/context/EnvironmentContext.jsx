import React, { createContext, useContext, useMemo, useReducer, useEffect, useState } from 'react';
import {
  initialEnvironments,
  generateEnvironment,
  generateLogLine,
  pipelineRuns as seedPipelineRuns,
  createPipelineRun,
  createPipelineStages,
} from '../data/mockData';

const EnvironmentContext = createContext();

const TTL_PRESETS = {
  quick: 15 * 60,
  standard: 60 * 60,
  post_test: 30 * 60,
};

const randomFailureCause = () => {
  const causes = ['db_unreachable', 'timeout', 'port_conflict', 'image_pull_error'];
  return causes[Math.floor(Math.random() * causes.length)];
};

function pushEvent(env, type, message, meta = {}) {
  const evt = {
    id: `${env.id}-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
    type,
    message,
    at: new Date().toISOString(),
    ...meta,
  };
  return [evt, ...(env.events || [])].slice(0, 60);
}

function syncPipelineStages(env) {
  const base = {
    'GitHub Push': 'pending',
    'Maven Build': 'pending',
    'Unit Tests': 'pending',
    'Docker Build': 'pending',
    'Deploy Env': 'pending',
    'Preview': 'pending',
    Cleanup: 'pending',
  };

  if (env.status === 'building') {
    return createPipelineStages({ 'GitHub Push': 'success', 'Maven Build': 'running' });
  }
  if (env.status === 'testing') {
    return createPipelineStages({
      'GitHub Push': 'success',
      'Maven Build': 'success',
      'Unit Tests': 'running',
      'Docker Build': 'running',
    });
  }
  if (env.status === 'running' || env.status === 'rollback_in_progress') {
    return createPipelineStages({
      'GitHub Push': 'success',
      'Maven Build': 'success',
      'Unit Tests': 'success',
      'Docker Build': 'success',
      'Deploy Env': 'success',
      'Preview': env.status === 'running' ? 'success' : 'running',
      Cleanup: 'pending',
    });
  }
  if (env.status === 'failed') {
    const failStage = env.latest_failure_cause === 'image_pull_error' ? 'Docker Build' : 'Unit Tests';
    const map = { 'GitHub Push': 'success', 'Maven Build': 'success' };
    map[failStage] = 'failed';
    return createPipelineStages(map);
  }
  if (env.status === 'destroyed') {
    return createPipelineStages({
      'GitHub Push': 'success',
      'Maven Build': 'success',
      'Unit Tests': 'success',
      'Docker Build': 'success',
      'Deploy Env': 'success',
      'Preview': 'success',
      Cleanup: 'success',
    });
  }
  return createPipelineStages(base);
}

function updatePipelinesForEnvironments(runs, environments) {
  return runs.map((run) => {
    const env = environments.find((e) => e.id === run.envId);
    if (!env) return run;
    return { ...run, stages: syncPipelineStages(env), branch: env.branch, commitId: env.commitId };
  });
}

function pushNotification(notifications, { title, message, kind = 'info' }) {
  return [
    {
      id: `notif-${Date.now()}`,
      title,
      message,
      kind,
      at: new Date().toISOString(),
      read: false,
    },
    ...notifications,
  ].slice(0, 30);
}

function reducer(state, action) {
  switch (action.type) {
    case 'CREATE_ENV': {
      const environments = [action.payload, ...state.environments];
      const pipelineRuns = [action.pipelineRun, ...state.pipelineRuns];
      const notifications = pushNotification(state.notifications, {
        title: 'Environment provisioned',
        message: `${action.payload.name} (${action.payload.id}) is building`,
        kind: 'success',
      });
      return {
        ...state,
        environments,
        pipelineRuns,
        notifications,
        toasts: [action.toast, ...state.toasts].slice(0, 6),
      };
    }
    case 'DISMISS_TOAST':
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) };
    case 'MARK_NOTIFICATIONS_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
      };
    case 'DESTROY_ENV': {
      const environments = state.environments.map((e) => {
        if (e.id !== action.id || e.status === 'destroyed') return e;
        return {
          ...e,
          status: 'destroyed',
          health: 'offline',
          countdown_seconds: 0,
          auto_destroy_at: null,
          destroyedAt: new Date().toISOString(),
          events: pushEvent(e, 'cleanup', 'Environment cleaned up and destroyed'),
        };
      });
      return {
        ...state,
        environments,
        pipelineRuns: updatePipelinesForEnvironments(state.pipelineRuns, environments),
        notifications: pushNotification(state.notifications, {
          title: 'Cleanup completed',
          message: `${action.id} destroyed and resources released`,
          kind: 'info',
        }),
        toasts: [action.toast, ...state.toasts].slice(0, 6),
      };
    }
    case 'TICK_TIMERS': {
      const now = Date.now();
      const nextToasts = [...state.toasts];
      const environments = state.environments.map((e) => {
        if (e.status !== 'running' || !e.auto_destroy_at) return e;
        const remaining = Math.max(0, Math.floor((new Date(e.auto_destroy_at).getTime() - now) / 1000));
        if (remaining > 0) return { ...e, countdown_seconds: remaining };
        nextToasts.unshift({ id: `toast-${Date.now()}-${e.id}`, kind: 'info', message: `${e.name || e.id} cleanup completed after TTL expiry` });
        return {
          ...e,
          status: 'destroyed',
          health: 'offline',
          countdown_seconds: 0,
          auto_destroy_at: null,
          destroyedAt: new Date().toISOString(),
          events: pushEvent(e, 'ttl_expired', 'TTL expired, environment auto-destroyed'),
        };
      });
      return {
        ...state,
        environments,
        pipelineRuns: updatePipelinesForEnvironments(state.pipelineRuns, environments),
        toasts: nextToasts.slice(0, 6),
      };
    }
    case 'FLUCTUATE_RESOURCES':
      return {
        ...state,
        environments: state.environments.map((e) =>
          e.status === 'running'
            ? {
                ...e,
                cpuUsage: Math.max(5, Math.min(95, e.cpuUsage + (Math.random() - 0.5) * 9)),
                ramUsage: Math.max(10, Math.min(95, e.ramUsage + (Math.random() - 0.5) * 6)),
              }
            : e,
        ),
      };
    case 'ADVANCE_LIFECYCLE': {
      const toasts = [...state.toasts];
      const environments = state.environments.map((e) => {
        if (e.status === 'building') {
          return {
            ...e,
            status: 'testing',
            health: 'degraded',
            events: pushEvent(e, 'testing', 'Build complete, running tests'),
          };
        }
        if (e.status === 'testing') {
          const success = Math.random() > 0.2;
          if (success) {
            const healthyAt = new Date().toISOString();
            const countdown = e.ttl_seconds || TTL_PRESETS.standard;
            const autoDestroyAt = new Date(Date.now() + countdown * 1000).toISOString();
            toasts.unshift({ id: `toast-${Date.now()}-${e.id}`, kind: 'success', message: `${e.name || e.id} is now running` });
            return {
              ...e,
              status: 'running',
              health: 'healthy',
              healthyAt,
              countdown_seconds: countdown,
              auto_destroy_at: autoDestroyAt,
              preview_url: `http://localhost:${e.port}`,
              revisions: e.revisions?.length
                ? e.revisions
                : [
                    { sha: e.commitId, at: healthyAt, status: 'active' },
                    { sha: `${e.commitId.slice(0, 4)}PREV`, at: e.createdAt, status: 'stable' },
                  ],
              events: pushEvent(e, 'running', 'Environment is healthy and serving traffic'),
            };
          }
          const cause = randomFailureCause();
          toasts.unshift({ id: `toast-${Date.now()}-${e.id}`, kind: 'error', message: `${e.name || e.id} deployment failed` });
          return {
            ...e,
            status: 'failed',
            health: 'unhealthy',
            latest_failure_cause: cause,
            events: pushEvent(e, 'failed', 'Deployment failed during verification', { cause }),
          };
        }
        if (e.status === 'rollback_in_progress') {
          const previousRevision = e.revisions?.[1];
          if (!previousRevision) return { ...e, status: 'failed' };
          const restored = {
            sha: previousRevision.sha,
            at: new Date().toISOString(),
            status: 'active',
            source: 'rollback',
          };
          toasts.unshift({ id: `toast-${Date.now()}-${e.id}`, kind: 'success', message: `${e.name || e.id} rollback completed` });
          return {
            ...e,
            status: 'running',
            health: 'healthy',
            commitId: previousRevision.sha,
            commitMsg: `rollback to ${previousRevision.sha}`,
            revisions: [restored, ...(e.revisions || [])],
            preview_url: `http://localhost:${e.port}`,
            events: pushEvent(e, 'rollback', `Rollback completed to ${previousRevision.sha}`),
          };
        }
        return e;
      });
      return {
        ...state,
        toasts: toasts.slice(0, 6),
        environments,
        pipelineRuns: updatePipelinesForEnvironments(state.pipelineRuns, environments),
      };
    }
    case 'ROLLBACK_ENV': {
      const environments = state.environments.map((e) => {
        if (e.id !== action.id || (e.revisions || []).length < 2) return e;
        return {
          ...e,
          status: 'rollback_in_progress',
          health: 'degraded',
          events: pushEvent(e, 'rollback_start', 'Rollback initiated to previous revision'),
        };
      });
      return {
        ...state,
        environments,
        pipelineRuns: updatePipelinesForEnvironments(state.pipelineRuns, environments),
        notifications: pushNotification(state.notifications, {
          title: 'Rollback started',
          message: `Restoring previous revision for ${action.id}`,
          kind: 'warn',
        }),
      };
    }
    default:
      return state;
  }
}

function makeToast(kind, message) {
  return { id: `toast-${Date.now()}-${Math.random().toString(16).slice(2, 5)}`, kind, message };
}

export function EnvironmentProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, {
    environments: initialEnvironments,
    pipelineRuns: seedPipelineRuns,
    notifications: [
      {
        id: 'notif-welcome',
        title: 'Welcome to EnvPro',
        message: 'Connect a repository and provision your first preview environment.',
        kind: 'info',
        at: new Date().toISOString(),
        read: false,
      },
    ],
    toasts: [],
  });
  const [logStream, setLogStream] = useState([]);
  const [userRole, setUserRole] = useState('developer');

  useEffect(() => {
    const t = setInterval(() => dispatch({ type: 'TICK_TIMERS' }), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => dispatch({ type: 'FLUCTUATE_RESOURCES' }), 3500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => dispatch({ type: 'ADVANCE_LIFECYCLE' }), 7000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!state.toasts.length) return;
    const t = setTimeout(() => dispatch({ type: 'DISMISS_TOAST', id: state.toasts[state.toasts.length - 1].id }), 3000);
    return () => clearTimeout(t);
  }, [state.toasts]);

  useEffect(() => {
    const t = setInterval(() => {
      const candidates = state.environments.filter((e) => e.status !== 'destroyed');
      if (!candidates.length) return;
      const env = candidates[Math.floor(Math.random() * candidates.length)];
      setLogStream((prev) => [...prev.slice(-300), generateLogLine(env)]);
    }, 2200);
    return () => clearInterval(t);
  }, [state.environments]);

  const createEnvironment = ({
    name,
    branch,
    repository = 'bhoomiijain/EnvPro',
    ttlPreset = 'standard',
    deployConfig = { replicas: 1, memory: '512Mi', profile: 'standard' },
  }) => {
    const ttl_seconds = TTL_PRESETS[ttlPreset] || TTL_PRESETS.post_test;
    const env = generateEnvironment({
      name: name || `preview-${branch}`,
      branch,
      repository,
      deployConfig,
      status: 'building',
      health: 'starting',
      ttl_seconds,
      countdown_seconds: 0,
      auto_destroy_at: null,
      preview_url: null,
      destroyedAt: null,
      healthyAt: null,
      revisions: [],
      events: [],
    });
    env.events = pushEvent(env, 'created', `Provision requested for ${branch} on ${repository}`);
    const pipelineRun = createPipelineRun({
      envId: env.id,
      commitId: env.commitId,
      branch: env.branch,
      repository: env.repository,
      stages: syncPipelineStages(env),
    });
    dispatch({
      type: 'CREATE_ENV',
      payload: env,
      pipelineRun,
      toast: makeToast('success', `Environment ${env.name} created`),
    });
    return env;
  };

  const destroyEnvironment = (id) =>
    dispatch({ type: 'DESTROY_ENV', id, toast: makeToast('info', `${id} cleanup completed`) });
  const rollbackEnvironment = (id) => dispatch({ type: 'ROLLBACK_ENV', id });
  const dismissToast = (id) => dispatch({ type: 'DISMISS_TOAST', id });
  const markNotificationsRead = () => dispatch({ type: 'MARK_NOTIFICATIONS_READ' });

  const baseLogs = useMemo(() => {
    const live = [];
    state.environments.forEach((e) => {
      live.push(generateLogLine(e));
      if (e.status === 'failed') {
        live.push({
          level: 'ERROR',
          env: e.id,
          time: new Date().toLocaleTimeString('en-US', { hour12: false }),
          msg: `[Deploy] Failure in ${e.id} (${e.latest_failure_cause || 'unknown'})`,
        });
      }
    });
    return live;
  }, [state.environments]);
  const logs = useMemo(() => [...baseLogs, ...logStream].slice(-350), [baseLogs, logStream]);

  const deploymentHistory = useMemo(
    () =>
      state.environments
        .flatMap((env) =>
          (env.revisions || []).map((rev, idx) => ({
            id: `${env.id}-${idx}-${rev.sha}`,
            envId: env.id,
            envName: env.name || env.id,
            repository: env.repository,
            branch: env.branch,
            commit: rev.sha,
            action: rev.source === 'rollback' ? 'Rollback applied' : idx === 0 ? 'Deployed revision' : 'Previous revision',
            status: env.status,
            time: new Date(rev.at).toLocaleTimeString('en-US', { hour12: false }),
            canRollback: idx > 0 && env.status !== 'destroyed' && env.status !== 'rollback_in_progress',
          })),
        )
        .slice(0, 80),
    [state.environments],
  );

  const stats = {
    active: state.environments.filter((e) => ['building', 'testing', 'running', 'rollback_in_progress'].includes(e.status)).length,
    running: state.environments.filter((e) => e.status === 'running').length,
    failed: state.environments.filter((e) => e.status === 'failed').length,
    destroyed: state.environments.filter((e) => e.status === 'destroyed').length,
  };

  const systemMetrics = useMemo(() => {
    const running = state.environments.filter((e) => e.status === 'running');
    const avgCpu = running.length ? running.reduce((s, e) => s + e.cpuUsage, 0) / running.length : 0;
    const avgRam = running.length ? running.reduce((s, e) => s + e.ramUsage, 0) / running.length : 0;
    const activeContainers = running.length + state.environments.filter((e) => ['building', 'testing'].includes(e.status)).length;
    const successRate =
      state.environments.length > 0
        ? Math.round(
            (state.environments.filter((e) => e.status === 'running' || e.status === 'destroyed').length /
              state.environments.length) *
              100,
          )
        : 0;
    return {
      cpu: Math.round(avgCpu || 12),
      memory: Math.round(avgRam || 18),
      disk: Math.round(30 + running.length * 4),
      network: Math.round(15 + running.length * 3),
      activeContainers,
      successRate,
    };
  }, [state.environments]);

  const value = {
    ...state,
    stats,
    logs,
    systemMetrics,
    createEnvironment,
    destroyEnvironment,
    rollbackEnvironment,
    dismissToast,
    markNotificationsRead,
    ttlPresets: TTL_PRESETS,
    deploymentHistory,
    userRole,
    setUserRole,
  };

  return <EnvironmentContext.Provider value={value}>{children}</EnvironmentContext.Provider>;
}

export const useEnvironments = () => useContext(EnvironmentContext);
