import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

/**
 * ProtectedRoute guards /admin/** routes using Supabase auth state.
 *
 * Behaviour:
 * - While the initial session is loading: render a centred spinner (no content flash).
 * - Unauthenticated user visiting /admin/** → redirect to /login.
 * - Authenticated user visiting /login → redirect to /admin.
 *   (The /login redirect is handled in LoginPage; this component only wraps /admin routes.)
 *
 * Requirements: 9.1, 9.3, 9.4, 9.8
 */
export default function ProtectedRoute() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // 1. Fetch the current session immediately on mount.
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    // 2. Subscribe to auth state changes (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, …).
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      // Once a change fires, loading is definitely resolved.
      setLoading(false);
    });

    // 3. Unsubscribe when the component unmounts to avoid memory leaks.
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Show a centred spinner while the session state is being resolved.
  // This prevents a flash of the protected content or a premature redirect.
  if (loading) {
    return (
      <div
        role="status"
        aria-label="Loading"
        className="min-h-screen flex items-center justify-center bg-clay-light"
      >
        <svg
          className="animate-spin h-10 w-10 text-primary-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      </div>
    );
  }

  // No active session → redirect to /login, preserving the intended destination.
  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Authenticated → render the protected child routes.
  return <Outlet />;
}
