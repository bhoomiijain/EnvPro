import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { EnvironmentProvider } from './context/EnvironmentContext';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import ToastContainer from './components/ToastContainer';
import Dashboard from './pages/Dashboard';
import Environments from './pages/Environments';
import Pipeline from './pages/Pipeline';
import Architecture from './pages/Architecture';
import Logs from './pages/Logs';
import DeploymentHistory from './pages/DeploymentHistory';
import './index.css';
import './app.css';

export default function App() {
  return (
    <EnvironmentProvider>
      <BrowserRouter>
        <div className="app-shell">
          <Sidebar />
          <div className="main-area">
            <TopBar />
            <div className="page-content">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/environments" element={<Environments />} />
                <Route path="/pipeline" element={<Pipeline />} />
                <Route path="/architecture" element={<Architecture />} />
                <Route path="/logs" element={<Logs />} />
                <Route path="/history" element={<DeploymentHistory />} />
              </Routes>
            </div>
          </div>
          <ToastContainer />
        </div>
      </BrowserRouter>
    </EnvironmentProvider>
  );
}
