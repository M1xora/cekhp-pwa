import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import ProtectedRoute from './components/ProtectedRoute';
import PwaUpdatePrompt from './components/PwaUpdatePrompt';

// ---------------------------------------------------------------------------
// Route-level lazy imports — pages are created in later tasks
// ---------------------------------------------------------------------------
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const DiagnosaPage = React.lazy(() => import('./pages/diagnosa/DiagnosaPage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const AdminLayout = React.lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = React.lazy(() => import('./components/admin/AdminDashboard'));
const SymptomsAdmin = React.lazy(() => import('./pages/admin/SymptomsAdmin'));
const ConditionsAdmin = React.lazy(() => import('./pages/admin/ConditionsAdmin'));
const RulesAdmin = React.lazy(() => import('./pages/admin/RulesAdmin'));

// ---------------------------------------------------------------------------
// Global loading fallback spinner
// ---------------------------------------------------------------------------
function LoadingSpinner() {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-clay-light"
      aria-label="Loading"
      role="status"
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className="h-12 w-12 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin"
          aria-hidden="true"
        />
        <p className="text-sm text-gray-600 font-medium">Loading…</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// AppProviders — wraps the entire app with global context providers
// ---------------------------------------------------------------------------
function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <HelmetProvider>
      <BrowserRouter>
        {children}
        <PwaUpdatePrompt />
      </BrowserRouter>
    </HelmetProvider>
  );
}

// ---------------------------------------------------------------------------
// App — root component with routing
// ---------------------------------------------------------------------------
function App() {
  return (
    <AppProviders>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/diagnosa" element={<DiagnosaPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected admin routes */}
          <Route path="/admin" element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="symptoms" element={<SymptomsAdmin />} />
              <Route path="conditions" element={<ConditionsAdmin />} />
              <Route path="rules" element={<RulesAdmin />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </AppProviders>
  );
}

export default App;
