import { Link } from 'react-router-dom';
import { mockSymptoms, mockConditions, mockRules } from '../../data/mockData';

/**
 * AdminDashboard — index page rendered at the `/admin` route.
 * FLAT DESIGN: no clay-card, no clay shadows. Brand colors via CSS variables.
 * Phase 2 — Admin Panel Color & Typography Sync
 * Requirements: 10.1
 */
export default function AdminDashboard() {
  const summaryCards = [
    {
      label: 'Symptoms',
      count: mockSymptoms.length,
      href: '/admin/symptoms',
      description: 'Manage symptom entries in the knowledge base.',
      accentBg: 'var(--clay-teal)',
      icon: '🩺',
    },
    {
      label: 'Conditions',
      count: mockConditions.length,
      href: '/admin/conditions',
      description: 'Manage diagnostic conditions and recommended actions.',
      accentBg: 'var(--clay-orange)',
      icon: '📋',
    },
    {
      label: 'Rules',
      count: mockRules.length,
      href: '/admin/rules',
      description: 'Manage inference rules that link symptoms to conditions.',
      accentBg: 'var(--clay-purple)',
      icon: '⚡',
    },
  ] as const;

  return (
    <div className="p-8" style={{ background: 'var(--bg-page)', minHeight: '100%' }}>
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="mb-8">
        <h1
          className="text-3xl font-bold"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text-dark)' }}
        >
          Admin Dashboard
        </h1>
        <p
          className="mt-1 text-sm"
          style={{ fontFamily: 'var(--font-body)', color: 'var(--text-muted)' }}
        >
          Overview of the CekHP knowledge base. Select a section to manage its entries.
        </p>
      </div>

      {/* ── Summary Cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {summaryCards.map(({ label, count, href, description, accentBg, icon }) => (
          <Link
            key={label}
            to={href}
            className="block p-6 rounded-xl border transition-colors duration-150 focus-visible:outline focus-visible:outline-2"
            style={{
              background: 'var(--bg-surface)',
              border: '1.5px solid rgba(45,27,105,0.10)',
              outlineColor: 'var(--clay-purple)',
              fontFamily: 'var(--font-body)',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--clay-purple)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(45,27,105,0.10)'; }}
            aria-label={`Manage ${label} — ${count} entries`}
          >
            {/* Icon badge — flat solid color */}
            <div
              className="inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 text-2xl"
              style={{ background: accentBg }}
            >
              {icon}
            </div>

            {/* Count */}
            <p
              className="text-4xl font-bold leading-none"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text-dark)' }}
            >
              {count}
            </p>

            {/* Label */}
            <p
              className="mt-1 text-lg font-semibold"
              style={{ color: 'var(--text-dark)', fontFamily: 'var(--font-display)' }}
            >
              {label}
            </p>

            {/* Description */}
            <p
              className="mt-2 text-sm leading-relaxed"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
            >
              {description}
            </p>

            {/* CTA */}
            <span
              className="mt-4 inline-block text-sm font-bold"
              style={{ color: 'var(--clay-purple)', fontFamily: 'var(--font-body)' }}
            >
              Manage →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
