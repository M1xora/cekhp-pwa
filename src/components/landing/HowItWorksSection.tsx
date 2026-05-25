/**
 * HowItWorksSection — landing page section illustrating the 4-step Diagnostic Wizard flow.
 *
 * Renders a visually attractive step-by-step guide showing:
 *   1. Pilih Perangkat  — select your smartphone brand
 *   2. Pilih Kategori   — select the problem category
 *   3. Pilih Gejala     — select specific symptoms
 *   4. Lihat Diagnosis  — get your diagnosis results
 *
 * Design:
 * - Light gradient background: primary-50 → white
 * - Claymorphism step cards (clay-card class, rounded-clay, shadow-clay)
 * - Number badge, icon, title, and description per step
 * - Horizontal dashed connector line between steps (desktop only)
 * - Animated chevron arrows on mobile/tablet between steps
 *
 * Requirements: 1.1
 */

import { Link } from 'react-router-dom';

// ── Step data ────────────────────────────────────────────────────────────────

interface Step {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  accentClass: string;       // badge background colour
  cardBgClass: string;       // card subtle tint
}

const STEPS: Step[] = [
  {
    number: 1,
    title: 'Pilih Perangkat',
    description:
      'Pilih merek smartphone Anda — Samsung, iPhone, Xiaomi, OPPO, atau Android umum lainnya.',
    icon: (
      /* Smartphone icon */
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-7 h-7"
        aria-hidden="true"
      >
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    ),
    accentClass: 'bg-primary-500 text-white',
    cardBgClass: 'bg-white',
  },
  {
    number: 2,
    title: 'Pilih Kategori',
    description:
      'Tentukan kategori masalah: Baterai, Layar, Performa, Kamera, Konektivitas, atau Audio.',
    icon: (
      /* Grid / category icon */
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-7 h-7"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
    accentClass: 'bg-accent-500 text-white',
    cardBgClass: 'bg-white',
  },
  {
    number: 3,
    title: 'Pilih Gejala',
    description:
      'Centang semua gejala spesifik yang dialami perangkat Anda. Semakin banyak gejala, semakin akurat diagnosa.',
    icon: (
      /* Checklist icon */
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-7 h-7"
        aria-hidden="true"
      >
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
    accentClass: 'bg-secondary-500 text-white',
    cardBgClass: 'bg-white',
  },
  {
    number: 4,
    title: 'Lihat Diagnosis',
    description:
      'Sistem pakar Forward Chaining menganalisis gejala dan menampilkan kondisi kerusakan beserta saran perbaikan.',
    icon: (
      /* Pulse / results icon */
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-7 h-7"
        aria-hidden="true"
      >
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    accentClass: 'bg-success-500 text-white',
    cardBgClass: 'bg-white',
  },
];

// ── Arrow connector (desktop) ────────────────────────────────────────────────

function ArrowConnector() {
  return (
    <div
      className="hidden lg:flex items-center flex-shrink-0 w-12 xl:w-16"
      aria-hidden="true"
    >
      {/* Dashed line */}
      <div className="flex-1 border-t-2 border-dashed border-primary-200" />
      {/* Arrowhead */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 12 12"
        fill="currentColor"
        className="w-3 h-3 text-primary-300 -ml-0.5 flex-shrink-0"
        aria-hidden="true"
      >
        <path d="M0 6l12-6v12z" />
      </svg>
    </div>
  );
}

// ── Down-arrow connector (mobile / tablet) ───────────────────────────────────

function DownArrow() {
  return (
    <div
      className="flex lg:hidden justify-center py-1"
      aria-hidden="true"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-6 h-6 text-primary-300"
        aria-hidden="true"
      >
        <line x1="12" y1="5" x2="12" y2="19" />
        <polyline points="19 12 12 19 5 12" />
      </svg>
    </div>
  );
}

// ── Step card ────────────────────────────────────────────────────────────────

function StepCard({ step }: { step: Step }) {
  return (
    <article
      className={`
        clay-card flex flex-col items-center text-center
        p-6 xl:p-8 flex-1 min-w-0 h-full
        ${step.cardBgClass}
        animate-fade-in
      `}
      aria-label={`Langkah ${step.number}: ${step.title}`}
    >
      {/* Number badge */}
      <div
        className={`
          flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
          text-base font-bold shadow-clay mb-4
          ${step.accentClass}
        `}
        aria-hidden="true"
      >
        {step.number}
      </div>

      {/* Icon container — fixed size ensures identical vertical alignment across all cards */}
      <div
        className="flex-shrink-0 w-16 h-16 rounded-clay flex items-center justify-center
                   bg-primary-50 text-primary-600 shadow-clay-inner mb-5"
        aria-hidden="true"
      >
        {step.icon}
      </div>

      {/* Title — fixed min-height so descriptions start at the same vertical position */}
      <h3 className="text-lg font-bold text-gray-900 font-display mb-2 min-h-[2rem] flex items-center justify-center">
        {step.title}
      </h3>

      {/* Description — flex-1 pushes it to fill remaining space consistently */}
      <p className="text-sm text-gray-600 leading-relaxed flex-1">
        {step.description}
      </p>
    </article>
  );
}

// ── Section ──────────────────────────────────────────────────────────────────

export function HowItWorksSection() {
  return (
    <section
      id="cara-kerja"
      aria-labelledby="how-it-works-heading"
      className="py-20 sm:py-24 bg-gradient-to-b from-primary-50 to-white overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <div className="text-center mb-14">
          {/* Eyebrow label */}
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary-100 text-primary-700 text-xs font-semibold tracking-widest uppercase mb-4 shadow-clay-inner">
            Cara Kerja
          </span>

          <h2
            id="how-it-works-heading"
            className="text-3xl sm:text-4xl font-extrabold text-gray-900 font-display leading-tight"
          >
            Diagnosa dalam{' '}
            <span className="text-primary-600">4 Langkah Mudah</span>
          </h2>

          <p className="mt-4 max-w-2xl mx-auto text-base sm:text-lg text-gray-600">
            Wizard interaktif kami memandu Anda dari pemilihan perangkat hingga
            mendapatkan diagnosa kerusakan yang akurat — hanya dalam beberapa klik.
          </p>
        </div>

        {/* ── Steps grid — mobile: vertical stack, desktop: horizontal row ── */}
        <div
          className="flex flex-col lg:flex-row lg:items-stretch gap-4 lg:gap-0"
          role="list"
          aria-label="Langkah-langkah wizard diagnosa"
        >
          {STEPS.map((step, index) => (
            <div
              key={step.number}
              className="flex flex-col lg:flex-row lg:items-stretch lg:flex-1 min-w-0"
              role="listitem"
            >
              {/* The card — h-full ensures it stretches to match tallest sibling */}
              <div className="lg:flex-1 min-w-0 h-full">
                <StepCard step={step} />
              </div>

              {/* Connector — only between steps (not after the last) */}
              {index < STEPS.length - 1 && (
                <>
                  <ArrowConnector />
                  <DownArrow />
                </>
              )}
            </div>
          ))}
        </div>

        {/* ── CTA ── */}
        <div className="mt-14 text-center">
          <Link
            to="/diagnosa"
            className="clay-btn text-base px-8 py-3.5"
            aria-label="Coba sekarang — buka wizard diagnosa smartphone"
          >
            {/* Play icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
              aria-hidden="true"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
            Coba Sekarang — Gratis
          </Link>

          <p className="mt-3 text-sm text-gray-600">
            Tidak perlu daftar. Langsung diagnosa.
          </p>
        </div>

      </div>
    </section>
  );
}

export default HowItWorksSection;
