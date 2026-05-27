import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/** Redirect authenticated users away from landing/login/register */
export default function PublicRoute({ children }) {
  const { isAuthenticated, ready } = useAuth();

  if (!ready) {
    return (
      <div className="auth-page">
        <div className="mono" style={{ color: 'var(--text-muted)' }}>Loading…</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
