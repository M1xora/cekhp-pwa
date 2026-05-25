import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import ErrorBoundary from '../../components/ui/ErrorBoundary';
import Sidebar from '../../components/admin/Sidebar';
import { supabase } from '../../lib/supabaseClient';

/**
 * AdminLayout — persistent shell for all /admin/* pages.
 *
 * Structure (desktop md+):
 *   ┌──────────────────────────────────┐
 *   │  Sidebar (256px)   │  Main area  │
 *   │  always visible    │  flex-1     │
 *   │                    │  <Outlet /> │
 *   └──────────────────────────────────┘
 *
 * Structure (mobile <md):
 *   ┌──────────────────────────────────┐
 *   │  Top mobile nav bar (full width) │
 *   ├──────────────────────────────────┤
 *   │  Main area (full width)          │
 *   │  <Outlet />                      │
 *   └──────────────────────────────────┘
 *
 * Wrapped with ProtectedRoute in the route tree (App.tsx Task 7.1).
 * Wrapped with ErrorBoundary to catch unhandled render errors in admin views.
 *
 * Requirements: 10.1, 12.1, 12.2
 */
export default function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login', { replace: true });
  };

  return (
    <ErrorBoundary>
      <div
        className="flex flex-col min-h-screen overflow-x-hidden md:flex-row"
        style={{ background: 'var(--bg-page)' }}
      >
        {/* ── Mobile top nav bar (visible only on <md) ─────────────────── */}
        <header
          className="md:hidden flex items-center justify-between px-4 py-3 sticky top-0 z-40 shrink-0"
          style={{ background: 'var(--text-dark)', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        >
          <span
            className="text-base font-bold tracking-tight"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--clay-red)' }}
          >
            Cek<span style={{ color: '#fff' }}>HP</span>{' '}
            <span className="text-xs font-bold px-2 py-0.5 rounded ml-1" style={{ background: 'var(--clay-red)', color: '#fff', fontFamily: 'var(--font-body)' }}>ADMIN</span>
          </span>
          {/* Compact nav links */}
          <nav className="flex items-center gap-1" aria-label="Mobile admin navigation">
            <NavLink
              to="/admin"
              end
              className="px-3 py-2 min-h-[44px] flex items-center rounded-lg text-xs font-medium transition-colors"
              style={({ isActive }) =>
                isActive
                  ? { background: 'var(--clay-purple)', color: '#fff', fontFamily: 'var(--font-body)' }
                  : { color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-body)' }
              }
            >
              Dasbor
            </NavLink>
            <NavLink
              to="/admin/symptoms"
              className="px-3 py-2 min-h-[44px] flex items-center rounded-lg text-xs font-medium"
              style={({ isActive }) =>
                isActive
                  ? { background: 'var(--clay-purple)', color: '#fff', fontFamily: 'var(--font-body)' }
                  : { color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-body)' }
              }
            >
              Gejala
            </NavLink>
            <NavLink
              to="/admin/conditions"
              className="px-3 py-2 min-h-[44px] flex items-center rounded-lg text-xs font-medium"
              style={({ isActive }) =>
                isActive
                  ? { background: 'var(--clay-purple)', color: '#fff', fontFamily: 'var(--font-body)' }
                  : { color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-body)' }
              }
            >
              Kerusakan
            </NavLink>
            <button
              onClick={handleLogout}
              className="px-3 py-2 min-h-[44px] rounded-lg text-xs font-medium transition-colors"
              style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-body)', background: 'transparent', border: 'none', cursor: 'pointer' }}
              aria-label="Keluar"
            >
              Keluar
            </button>
          </nav>
        </header>

        {/* ── Sidebar (hidden on mobile, visible on md+) ────────────────── */}
        <Sidebar />

        {/* ── Main content ─────────────────────────────────────────────── */}
        <main
          className="flex-1 overflow-auto min-w-0"
          id="admin-main-content"
          aria-label="Admin main content"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          <Outlet />
        </main>
      </div>
    </ErrorBoundary>
  );
}
