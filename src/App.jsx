import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { RepoProvider } from './context/RepoContext';
import { EnvironmentProvider } from './context/EnvironmentContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import AppLayout from './components/AppLayout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Repositories from './pages/Repositories';
import Environments from './pages/Environments';
import Pipeline from './pages/Pipeline';
import Architecture from './pages/Architecture';
import Logs from './pages/Logs';
import DeploymentHistory from './pages/DeploymentHistory';
import Insights from './pages/Insights';
import Settings from './pages/Settings';
import './index.css';
import './app.css';
import './auth.css';

export default function App() {
  return (
    <AuthProvider>
      <RepoProvider>
        <EnvironmentProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/repositories" element={<Repositories />} />
                <Route path="/environments" element={<Environments />} />
                <Route path="/pipeline" element={<Pipeline />} />
                <Route path="/architecture" element={<Architecture />} />
                <Route path="/logs" element={<Logs />} />
                <Route path="/history" element={<DeploymentHistory />} />
                <Route path="/insights" element={<Insights />} />
                <Route path="/settings" element={<Settings />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </EnvironmentProvider>
      </RepoProvider>
    </AuthProvider>
  );
}
