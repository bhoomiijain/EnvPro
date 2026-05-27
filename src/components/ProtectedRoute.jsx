import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, ready } = useAuth();
  const location = useLocation();

  if (!ready) {
    return (
      <div className="auth-page">
        <div className="mono" style={{ color: 'var(--text-muted)' }}>Loading EnvPro…</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
