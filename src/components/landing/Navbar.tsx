import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface NavbarProps {
  /** 'diagnosa' — shows "← Beranda" CTA, highlights Diagnosa nav link
   *  'login'    — shows "← Beranda" CTA, hides redundant login-related items */
  variant?: 'default' | 'diagnosa' | 'login';
}

/**
 * Navbar — landing page top navigation bar matching the hp-diagnostik reference design.
 * Accepts an optional `variant` prop to adapt the CTA for the diagnosa wizard page.
 */
export default function Navbar({ variant = 'default' }: NavbarProps) {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openDrawer = () => setDrawerOpen(true);
  const closeDrawer = () => setDrawerOpen(false);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) closeDrawer();
  };

  const isDiagnosa = variant === 'diagnosa';
  const isLogin = variant === 'login';

  return (
    <>
      <nav className="navbar" id="mainNav">
        <div className="navbar-logo">Cek<span>HP</span></div>

        <div className="nav-links">
          <Link to="/" className="nav-link">Beranda</Link>
          <Link
            to="/diagnosa"
            className="nav-link"
            style={isDiagnosa ? { color: 'var(--clay-red)', fontWeight: 800 } : undefined}
          >
            Diagnosa
          </Link>
          <Link to="/admin" className="nav-link">Admin</Link>
        </div>

        {/* CTA: context-aware per page */}
        {isDiagnosa ? (
          <button
            className="nav-cta"
            onClick={() => navigate('/')}
            style={{ background: 'var(--text-dark)' }}
          >
            ← Beranda
          </button>
        ) : isLogin ? (
          <button
            className="nav-cta"
            onClick={() => navigate('/')}
            style={{ background: 'var(--text-dark)' }}
          >
            ← Beranda
          </button>
        ) : (
          <button className="nav-cta" onClick={() => navigate('/diagnosa')}>
            Mulai Diagnosa →
          </button>
        )}

        <button
          className={`hamburger-btn${drawerOpen ? ' open' : ''}`}
          onClick={openDrawer}
          aria-label="Buka menu"
        >
          <span /><span /><span />
        </button>
      </nav>

      {/* Mobile Drawer */}
      <div
        className={`mobile-drawer-overlay${drawerOpen ? ' open' : ''}`}
        style={{ display: drawerOpen ? 'block' : 'none' }}
        onClick={handleBackdropClick}
      >
        <div className="mobile-drawer" role="dialog" aria-modal="true" aria-label="Menu navigasi">
          <div className="drawer-header">
            <div className="drawer-logo">Cek<span>HP</span></div>
            <button className="drawer-close" onClick={closeDrawer} aria-label="Tutup menu">✕</button>
          </div>
          <button className="drawer-link" onClick={() => { navigate('/'); closeDrawer(); }}>
            <span className="dl-icon dl-icon-home">🏠</span>Beranda
          </button>
          <div className="drawer-divider" />
          {!isDiagnosa && !isLogin && (
            <button className="drawer-link" onClick={() => { navigate('/diagnosa'); closeDrawer(); }}>
              <span className="dl-icon dl-icon-diag">🔍</span>Mulai Diagnosa
            </button>
          )}
          <button className="drawer-link" onClick={() => { navigate('/admin'); closeDrawer(); }}>
            <span className="dl-icon dl-icon-admin">⚙️</span>Admin Panel
          </button>
          <div className="drawer-divider" />
          {isDiagnosa || isLogin ? (
            <button
              className="clay-btn clay-btn-ghost drawer-cta"
              style={{ border: '2px solid var(--text-dark)', color: 'var(--text-dark)' }}
              onClick={() => { navigate('/'); closeDrawer(); }}
            >
              ← Kembali ke Beranda
            </button>
          ) : (
            <button
              className="clay-btn clay-btn-primary drawer-cta"
              onClick={() => { navigate('/diagnosa'); closeDrawer(); }}
            >
              🚀 Mulai Diagnosa Sekarang
            </button>
          )}
        </div>
      </div>
    </>
  );
}
