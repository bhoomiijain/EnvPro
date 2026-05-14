import React, { createContext, useContext, useMemo, useReducer, useEffect, useState } from 'react';
import { initialEnvironments, generateEnvironment, generateLogLine } from '../data/mockData';

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

function reducer(state, action) {
  switch (action.type) {
    case 'CREATE_ENV': {
      return { ...state, environments: [action.payload, ...state.environments], toasts: [action.toast, ...state.toasts].slice(0, 6) };
    }
    case 'ADD_TOAST':
      return { ...state, toasts: [action.toast, ...state.toasts].slice(0, 6) };
    case 'DISMISS_TOAST':
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) };
    case 'DESTROY_ENV':
      return {
        ...state,
        environments: state.environments.map((e) => {
          if (e.id !== action.id || e.status === 'destroyed') return e;
          const destroyedAt = new Date().toISOString();
          return {
            ...e,
            status: 'destroyed',
            health: 'offline',
            countdown_seconds: 0,
            auto_destroy_at: null,
            destroyedAt,
            events: pushEvent(e, 'cleanup', 'Environment cleaned up and destroyed'),
          };
        }),
        toasts: [action.toast, ...state.toasts].slice(0, 6),
      };
    case 'TICK_TIMERS': {
      const now = Date.now();
      const nextToasts = [...state.toasts];
      const environments = state.environments.map((e) => {
        if (e.status !== 'running' || !e.auto_destroy_at) return e;
        const remaining = Math.max(0, Math.floor((new Date(e.auto_destroy_at).getTime() - now) / 1000));
        if (remaining > 0) return { ...e, countdown_seconds: remaining };
        nextToasts.unshift({ id: `toast-${Date.now()}-${e.id}`, kind: 'info', message: `${e.id} cleanup completed after TTL expiry` });
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
      return { ...state, environments, toasts: nextToasts.slice(0, 6) };
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
      return {
        ...state,
        toasts: toasts.slice(0, 6),
        environments: state.environments.map((e) => {
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
              return {
                ...e,
                status: 'running',
                health: 'healthy',
                healthyAt,
                countdown_seconds: countdown,
                auto_destroy_at: autoDestroyAt,
                preview_url: `http://localhost:${e.port}`,
                events: pushEvent(e, 'running', 'Environment is healthy and serving traffic'),
              };
            }
            const cause = randomFailureCause();
            toasts.unshift({ id: `toast-${Date.now()}-${e.id}`, kind: 'error', message: `${e.id} deployment failed` });
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
            toasts.unshift({ id: `toast-${Date.now()}-${e.id}`, kind: 'success', message: `${e.id} rollback completed` });
            return {
              ...e,
              status: 'running',
              health: 'healthy',
              commitId: previousRevision.sha,
              commitMsg: `rollback to ${previousRevision.sha}`,
              revisions: [restored, ...(e.revisions || [])],
              events: pushEvent(e, 'rollback', `Rollback completed to ${previousRevision.sha}`),
            };
          }
          return e;
        }),
      };
    }
    case 'ROLLBACK_ENV': {
      return {
        ...state,
        environments: state.environments.map((e) => {
          if (e.id !== action.id || (e.revisions || []).length < 2) return e;
          return {
            ...e,
            status: 'rollback_in_progress',
            health: 'degraded',
            events: pushEvent(e, 'rollback_start', 'Rollback initiated to previous revision'),
          };
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
  const [state, dispatch] = useReducer(reducer, { environments: initialEnvironments, toasts: [] });
  const [logStream, setLogStream] = useState([]);

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

  const createEnvironment = (branch, ttlPreset = 'standard') => {
    const ttl_seconds = TTL_PRESETS[ttlPreset] || TTL_PRESETS.post_test;
    const env = generateEnvironment({
      branch,
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
    env.events = pushEvent(env, 'created', `Provision requested for ${branch}`);
    dispatch({ type: 'CREATE_ENV', payload: env, toast: makeToast('success', `Environment ${env.id} created`) });
    return env;
  };

  const destroyEnvironment = (id) => dispatch({ type: 'DESTROY_ENV', id, toast: makeToast('info', `${id} cleanup completed`) });
  const rollbackEnvironment = (id) => dispatch({ type: 'ROLLBACK_ENV', id });
  const dismissToast = (id) => dispatch({ type: 'DISMISS_TOAST', id });

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
            branch: env.branch,
            commit: rev.sha,
            action: rev.source === 'rollback' ? 'Rollback applied' : idx === 0 ? 'Deployed revision' : 'Previous revision',
            status: env.status,
            time: new Date(rev.at).toLocaleTimeString('en-US', { hour12: false }),
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

  const value = {
    ...state,
    stats,
    logs,
    createEnvironment,
    destroyEnvironment,
    rollbackEnvironment,
    dismissToast,
    ttlPresets: TTL_PRESETS,
    deploymentHistory,
  };

  return <EnvironmentContext.Provider value={value}>{children}</EnvironmentContext.Provider>;
}

export const useEnvironments = () => useContext(EnvironmentContext);
