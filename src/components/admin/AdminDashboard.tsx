import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

interface KbCounts {
  symptoms: number;
  conditions: number;
  rules: number;
}

type LoadState = 'loading' | 'error' | 'ready';

/**
 * AdminDashboard — index page rendered at the `/admin` route.
 *
 * Statistik jumlah gejala, jenis kerusakan, dan rule diambil dari Supabase
 * menggunakan COUNT query agar selalu mencerminkan data yang sebenarnya.
 *
 * Requirements: 10.1
 */
export default function AdminDashboard() {
  const [counts, setCounts] = useState<KbCounts>({ symptoms: 0, conditions: 0, rules: 0 });
  const [loadState, setLoadState] = useState<LoadState>('loading');

  useEffect(() => {
    let cancelled = false;

    async function fetchCounts() {
      setLoadState('loading');
      try {
        // Jalankan tiga COUNT query secara paralel
        const [symptomsRes, conditionsRes, rulesRes] = await Promise.all([
          supabase.from('symptoms').select('*', { count: 'exact', head: true }),
          supabase.from('conditions').select('*', { count: 'exact', head: true }),
          supabase.from('rules').select('*', { count: 'exact', head: true }),
        ]);

        if (cancelled) return;

        if (symptomsRes.error || conditionsRes.error || rulesRes.error) {
          setLoadState('error');
          return;
        }

        setCounts({
          symptoms:   symptomsRes.count   ?? 0,
          conditions: conditionsRes.count ?? 0,
          rules:      rulesRes.count      ?? 0,
        });
        setLoadState('ready');
      } catch {
        if (!cancelled) setLoadState('error');
      }
    }

    fetchCounts();
    return () => { cancelled = true; };
  }, []);

  const summaryCards = [
    {
      label: 'Gejala',
      count: counts.symptoms,
      href: '/admin/symptoms',
      description: 'Kelola daftar gejala dalam basis pengetahuan.',
      accentBg: 'var(--clay-teal)',
      icon: '🩺',
    },
    {
      label: 'Jenis Kerusakan',
      count: counts.conditions,
      href: '/admin/conditions',
      description: 'Kelola jenis kerusakan dan solusi awal yang direkomendasikan.',
      accentBg: 'var(--clay-orange)',
      icon: '📋',
    },
    {
      label: 'Rule Diagnosa',
      count: counts.rules,
      href: '/admin/rules',
      description: 'Kelola aturan inferensi yang menghubungkan gejala dengan jenis kerusakan.',
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
          Dashboard
        </h1>
        <p
          className="mt-1 text-sm"
          style={{ fontFamily: 'var(--font-body)', color: 'var(--text-muted)' }}
        >
          Ringkasan basis pengetahuan CekHP. Pilih bagian untuk mengelola datanya.
        </p>
      </div>

      {/* ── Error State ────────────────────────────────────────────── */}
      {loadState === 'error' && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          <strong className="font-semibold">Gagal memuat statistik.</strong>{' '}
          Periksa koneksi internet atau konfigurasi Supabase Anda.
        </div>
      )}

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
            aria-label={`Kelola ${label}${loadState === 'ready' ? ` — ${count} data` : ''}`}
          >
            {/* Icon badge */}
            <div
              className="inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 text-2xl"
              style={{ background: accentBg }}
            >
              {icon}
            </div>

            {/* Count — skeleton saat loading */}
            {loadState === 'loading' ? (
              <div
                className="h-10 w-16 rounded-lg mb-1 animate-pulse"
                style={{ background: 'rgba(45,27,105,0.10)' }}
                aria-label="Memuat..."
              />
            ) : (
              <p
                className="text-4xl font-bold leading-none"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--text-dark)' }}
              >
                {loadState === 'error' ? '—' : count}
              </p>
            )}

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
              Kelola →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
