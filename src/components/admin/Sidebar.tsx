import { NavLink, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

interface NavItem {
  label: string;
  to: string;
  end?: boolean;
  icon: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard',        to: '/admin',            end: true, icon: '📊' },
  { label: 'Gejala',           to: '/admin/symptoms',             icon: '🩺' },
  { label: 'Jenis Kerusakan',  to: '/admin/conditions',            icon: '📋' },
  { label: 'Rule Diagnosa',    to: '/admin/rules',                 icon: '⚡' },
];

/**
 * Sidebar — Admin navigation sidebar.
 * FLAT DESIGN: no clay-card, no shadows, no bouncy hovers.
 * Brand colors applied via CSS variables.
 * Phase 2 — Admin Panel Color & Typography Sync
 */
export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login', { replace: true });
  };

  return (
    <aside
      className="hidden md:flex flex-col w-64 min-h-screen flex-shrink-0"
      style={{ background: 'var(--text-dark)', color: '#fff' }}
    >
      {/* ── Brand header ─────────────────────────────────────────────── */}
      <div
        className="px-6 py-5 flex items-center gap-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}
      >
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--clay-red)', lineHeight: 1 }}>
          Cek<span style={{ color: '#fff' }}>HP</span>
        </span>
        <span
          className="text-xs font-bold px-2 py-0.5 rounded"
          style={{ background: 'var(--clay-red)', color: '#fff', fontFamily: 'var(--font-body)' }}
        >
          ADMIN
        </span>
      </div>

      {/* ── Navigation links ─────────────────────────────────────────── */}
      <nav className="flex-1 px-3 py-4 space-y-0.5" aria-label="Admin navigation">
        {navItems.map(({ label, to, end, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 px-4 py-2.5 min-h-[44px] rounded-lg text-sm transition-colors duration-150',
                isActive
                  ? 'font-bold'
                  : 'font-medium opacity-70 hover:opacity-100',
              ].join(' ')
            }
            style={({ isActive }) =>
              isActive
                ? { background: 'var(--clay-purple)', color: '#fff', fontFamily: 'var(--font-body)' }
                : { color: '#fff', fontFamily: 'var(--font-body)' }
            }
          >
            <span aria-hidden="true">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* ── Logout ───────────────────────────────────────────────────── */}
      <div
        className="px-3 py-4"
        style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}
      >
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 min-h-[44px] rounded-lg text-sm font-medium transition-colors duration-150"
          style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-body)', background: 'transparent', border: 'none' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#fff'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.7)'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
          aria-label="Keluar"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
          </svg>
          Keluar
        </button>
      </div>
    </aside>
  );
}
