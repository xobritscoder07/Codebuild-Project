import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load pages for code splitting
const Home = lazy(() => import('./pages/Home'));
const Network = lazy(() => import('./pages/Network'));
const Overview = lazy(() => import('./pages/Overview'));
const SystemHealth = lazy(() => import('./pages/SystemHealth'));

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Layout>
          <Suspense fallback={
            <div className="flex h-screen items-center justify-center text-teal font-sans font-bold">
              Loading AEGIS AI...
            </div>
          }>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/overview" element={<Overview />} />
              <Route path="/network" element={<Network />} />
              <Route path="/system-health" element={<SystemHealth />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </Layout>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
