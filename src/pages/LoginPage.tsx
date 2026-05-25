import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';
import PublicLayout from '../components/PublicLayout';
import LoginForm from '../components/auth/LoginForm';
import { supabase } from '../lib/supabaseClient';

// ─── Session State ────────────────────────────────────────────────────────────

type SessionStatus = 'loading' | 'authenticated' | 'unauthenticated';

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * LoginPage — rendered at "/login".
 *
 * Responsibilities:
 * - Sets the document <title> via react-helmet-async.
 * - On mount, calls supabase.auth.getSession() to check for an existing
 *   session. If one exists, redirects immediately to "/admin".
 * - Renders a centered <LoginForm /> over a branded gradient background when
 *   the user is not yet authenticated.
 * - Wraps content in an <ErrorBoundary> for graceful error fallback.
 *
 * Requirements: 9.6
 */
function LoginPage() {
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>('loading');

  useEffect(() => {
    // Check for an existing session on mount
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setSessionStatus('authenticated');
      } else {
        setSessionStatus('unauthenticated');
      }
    });
  }, []);

  // Already authenticated — redirect to admin panel
  if (sessionStatus === 'authenticated') {
    return <Navigate to="/admin" replace />;
  }

  // While checking the session, show a subtle loading state
  if (sessionStatus === 'loading') {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-clay-light"
        role="status"
        aria-label="Checking authentication…"
      >
        <div
          className="h-10 w-10 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin"
          aria-hidden="true"
        />
      </div>
    );
  }

  // Unauthenticated — render the login form
  return (
    <>
      <Helmet>
        <title>Login — CekHP</title>
      </Helmet>

      <ErrorBoundary>
        <PublicLayout navVariant="login">
          <div
            className="flex-1 flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden min-h-[calc(100vh-64px)]"
            style={{
              background:
                'radial-gradient(ellipse 80% 60% at 20% 10%, rgba(167,139,250,0.22) 0%, transparent 60%), ' +
                'radial-gradient(ellipse 70% 50% at 80% 90%, rgba(196,181,253,0.18) 0%, transparent 55%), ' +
                'linear-gradient(135deg, #f8f7ff 0%, #f0edff 50%, #fdf6ff 100%)',
            }}
          >
            {/* Decorative blobs */}
            <div
              className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-primary-200 opacity-20 blur-3xl pointer-events-none"
              aria-hidden="true"
            />
            <div
              className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-accent-200 opacity-15 blur-3xl pointer-events-none"
              aria-hidden="true"
            />

            {/* Site branding above the form */}
            <div className="mb-8 flex flex-col items-center gap-1 z-10">
              <span className="text-3xl font-bold text-[var(--clay-red)] tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                CekHP
              </span>
              <span className="text-sm text-[var(--text-muted)]" style={{ fontFamily: 'var(--font-body)' }}>
                Sistem Pakar Diagnosa Smartphone
              </span>
            </div>

            {/* Login form card */}
            <div className="w-full max-w-md z-10">
              <LoginForm />
            </div>
          </div>
        </PublicLayout>
      </ErrorBoundary>
    </>
  );
}

export default LoginPage;
