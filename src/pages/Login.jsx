import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const registered = location.state?.registered;

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = login({ email, password });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    const redirectTo = location.state?.from || '/dashboard';
    navigate(redirectTo, { replace: true });
  };

  return (
    <div className="auth-page">
      <div className="glass-card auth-card">
        <Link to="/" style={{ textDecoration: 'none' }}>
          <div className="logo-mark" style={{ marginBottom: 20 }}>
            <div className="logo-icon">⚡</div>
            <div className="logo-text">
              EnvPro
              <span>Sign in</span>
            </div>
          </div>
        </Link>
        <h1>Welcome back</h1>
        <p>Sign in to access your DevOps orchestration dashboard.</p>
        {registered && (
          <div style={{ padding: 10, marginBottom: 16, borderRadius: 8, background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)', fontSize: 12, color: 'var(--accent-green)' }}>
            Account created. Sign in with your email and password.
          </div>
        )}
        {error && <div className="auth-error">{error}</div>}
        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required />
          <label htmlFor="password">Password</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Sign in</button>
        </form>
        <div className="auth-footer">
          No account? <Link to="/register">Register</Link>
        </div>
      </div>
    </div>
  );
}
