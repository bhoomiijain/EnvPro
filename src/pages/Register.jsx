import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = register({ username, email, password });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    navigate('/login', { state: { registered: true, email: email.trim().toLowerCase() } });
  };

  return (
    <div className="auth-page">
      <div className="glass-card auth-card">
        <Link to="/" style={{ textDecoration: 'none' }}>
          <div className="logo-mark" style={{ marginBottom: 20 }}>
            <div className="logo-icon">⚡</div>
            <div className="logo-text">
              EnvPro
              <span>Create account</span>
            </div>
          </div>
        </Link>
        <h1>Create your account</h1>
        <p>Register to provision environments and monitor CI/CD pipelines.</p>
        {error && <div className="auth-error">{error}</div>}
        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="username">Username</label>
          <input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="bhoomi.jain" required />
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required />
          <label htmlFor="password">Password</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 characters" minLength={6} required />
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Create account</button>
        </form>
        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
