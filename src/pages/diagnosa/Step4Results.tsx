import React, { useEffect, useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { runDiagnosis } from '../../services/diagnosisService';
import { useDiagnosaStore } from '../../store/useDiagnosaStore';
import { ClayCard } from '../../components/ui/ClayCard';
import type { DiagnosisResult } from '../../types/knowledge-base';

interface Step4Props {
  onReset: () => void;
}

type LoadState = 'loading' | 'ready' | 'error';

/**
 * Step4Results — Halaman Hasil Diagnosa.
 *
 * Fase 5: Engine diubah ke full-match Forward Chaining.
 * Hanya rule yang SEMUA gejalanya terpenuhi yang ditampilkan.
 * Partial match tidak ditampilkan.
 * Setiap kartu hasil menampilkan: jenis kerusakan, rule yang terpenuhi,
 * gejala IF, penjelasan, solusi awal, log inferensi, dan disclaimer.
 */
const Step4Results: React.FC<Step4Props> = ({ onReset }) => {
  const activeFacts = useDiagnosaStore((state) => state.activeFacts);
  const setResults = useDiagnosaStore((state) => state.setResults);
  const resetStore = useDiagnosaStore((state) => state.resetStore);
  const selectedDeviceCategory = useDiagnosaStore((state) => state.selectedDeviceCategory);

  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [results, setLocalResults] = useState<DiagnosisResult[]>([]);
  const [diagnosisError, setDiagnosisError] = useState<string | null>(null);
  // symptomMap untuk menampilkan "G01 — Nama Gejala" di ringkasan input
  const [symptomMap, setSymptomMap] = useState<Map<string, import('../../types/knowledge-base').Symptom>>(new Map());

  useEffect(() => {
    let cancelled = false;

    async function diagnose() {
      setLoadState('loading');
      setDiagnosisError(null);

      const { results: enriched, error, symptomMap: sMap } = await runDiagnosis(activeFacts);

      if (cancelled) return;

      if (error) {
        setDiagnosisError(error);
        setLoadState('error');
        return;
      }

      setLocalResults(enriched);
      setResults(enriched);
      setSymptomMap(sMap);
      setLoadState('ready');
    }

    diagnose();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasResults = useMemo(() => results.length > 0, [results]);

  const pageTitle = useMemo(() => {
    if (loadState === 'loading') return 'Menganalisis — CekHP';
    if (loadState === 'error') return 'Diagnosis Gagal — CekHP';
    return hasResults
      ? `${results[0].conditionName} — CekHP`
      : 'Diagnosis Selesai — CekHP';
  }, [loadState, hasResults, results]);

  const [resetError, setResetError] = useState<string | null>(null);

  const handleDiagnoseAgain = () => {
    setResetError(null);
    try {
      resetStore();
      onReset();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Terjadi kesalahan. Silakan coba lagi.';
      setResetError(message);
    }
  };

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>

      <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-gray-800">Hasil Diagnosis</h1>
          <p className="text-gray-600 text-sm">
            Berikut hasil analisis berdasarkan gejala yang Anda pilih.
          </p>
        </div>

        {/* Error toast reset */}
        {resetError && (
          <div role="alert" className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">
            <strong className="font-semibold">Gagal mereset: </strong>{resetError}
          </div>
        )}

        {/* ── Loading ────────────────────────────────────────────────────── */}
        {loadState === 'loading' && (
          <div className="space-y-4" aria-busy="true" aria-label="Sedang menganalisis gejala">
            {[1, 2].map((i) => (
              <div key={i} className="rounded-xl border border-gray-200 bg-gray-50 p-5 animate-pulse" aria-hidden="true">
                <div className="flex justify-between mb-3">
                  <div className="h-5 w-1/3 rounded bg-gray-300" />
                  <div className="h-5 w-16 rounded-full bg-gray-200" />
                </div>
                <div className="h-3 w-full rounded bg-gray-200 mb-2" />
                <div className="h-3 w-4/5 rounded bg-gray-200" />
              </div>
            ))}
            <p className="text-center text-sm text-gray-500">Menganalisis gejala…</p>
          </div>
        )}

        {/* ── Error ─────────────────────────────────────────────────────── */}
        {loadState === 'error' && (
          <ClayCard>
            <div className="p-8 text-center space-y-3">
              <p className="text-4xl" aria-hidden="true">⚠️</p>
              <h2 className="text-lg font-semibold text-gray-700">Gagal menjalankan diagnosis</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                {diagnosisError ?? 'Terjadi kesalahan saat menganalisis gejala. Silakan coba lagi.'}
              </p>
            </div>
          </ClayCard>
        )}

        {/* ── Results ───────────────────────────────────────────────────── */}
        {loadState === 'ready' && (
          <>
            {/* Ringkasan input pengguna */}
            <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-sm text-gray-600 space-y-1">
              {selectedDeviceCategory && (
                <p><span className="font-medium text-gray-700">Perangkat:</span> {selectedDeviceCategory}</p>
              )}
              <div>
                <span className="font-medium text-gray-700">Gejala dipilih ({activeFacts.length}):</span>
                {activeFacts.length === 0
                  ? <span className="italic text-gray-400 ml-1">Tidak ada</span>
                  : (
                    <ul className="mt-1 space-y-0.5 list-none p-0">
                      {activeFacts.map((sid) => {
                        const s = symptomMap.get(sid);
                        const label = s
                          ? `${s.code ?? sid} — ${s.name}`
                          : sid;
                        return (
                          <li key={sid} className="text-gray-600 text-xs ml-2">
                            • {label}
                          </li>
                        );
                      })}
                    </ul>
                  )
                }
              </div>
            </div>

            {hasResults ? (
              <ul className="space-y-6 list-none p-0">
                {results.map((result, index) => (
                  <li key={`${result.matchedRuleId}-${index}`}>
                    <ClayCard>
                      <div className="p-5 space-y-4">
                        {/* Header: kode kondisi + nama */}
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <span className="font-mono text-xs text-primary-600 font-semibold">
                              {result.conditionCode || result.conditionId}
                            </span>
                            <h2 className="text-lg font-semibold text-gray-800 mt-0.5">
                              {result.conditionName}
                            </h2>
                          </div>
                          {/* Badge: rule terpenuhi — bukan persentase */}
                          <span
                            className="shrink-0 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800"
                            aria-label="Rule terpenuhi"
                          >
                            ✓ Rule Terpenuhi
                          </span>
                        </div>

                        {/* Rule yang terpenuhi — format: R01: IF G01 AND G02 THEN K01 */}
                        <div className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 font-mono">
                          <span className="font-semibold text-gray-700">
                            {result.matchedRuleCode || result.matchedRuleId}
                          </span>
                          {': IF '}
                          {(result.matchedSymptomCodes.length > 0
                            ? result.matchedSymptomCodes
                            : result.matchedSymptomIds
                          ).join(' AND ')}
                          {' THEN '}
                          {result.conditionCode || result.conditionId}
                        </div>

                        {/* Deskripsi kondisi */}
                        {result.description && (
                          <p className="text-gray-600 text-sm leading-relaxed">
                            {result.description}
                          </p>
                        )}

                        {/* Solusi awal */}
                        {result.recommendedAction && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <p className="text-sm font-medium text-green-800 mb-1">
                              Solusi Awal
                            </p>
                            <p className="text-sm text-green-700 leading-relaxed">
                              {result.recommendedAction}
                            </p>
                          </div>
                        )}

                        {/* Accordion: Detail Teknis & Log Inferensi */}
                        <details className="group">
                          <summary className="cursor-pointer select-none text-sm font-medium text-primary-700 hover:text-primary-800 list-none flex items-center gap-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2">
                            <span className="inline-block transition-transform group-open:rotate-90" aria-hidden="true">▶</span>
                            Detail Teknis &amp; Log Inferensi
                          </summary>
                          <div className="mt-3 pl-4 border-l-2 border-blue-100 space-y-2">
                            {result.inferenceLog.length > 0 ? (
                              <ul className="space-y-1 list-none p-0">
                                {result.inferenceLog.map((entry, logIndex) => (
                                  <li key={logIndex}>
                                    <p className="text-xs font-mono text-gray-600 whitespace-pre-wrap break-words">
                                      {entry}
                                    </p>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-xs text-gray-600 italic">Tidak ada log tersedia.</p>
                            )}
                          </div>
                        </details>
                      </div>
                    </ClayCard>
                  </li>
                ))}
              </ul>
            ) : (
              /* Tidak ada rule yang terpenuhi */
              <ClayCard>
                <div className="p-8 text-center space-y-3">
                  <p className="text-4xl" aria-hidden="true">🔍</p>
                  <h2 className="text-lg font-semibold text-gray-700">
                    Belum ada diagnosa yang sesuai
                  </h2>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Gejala yang dipilih belum cukup untuk menghasilkan diagnosa.
                    Silakan pilih gejala lain atau lakukan pemeriksaan langsung ke teknisi.
                  </p>
                </div>
              </ClayCard>
            )}

            {/* Disclaimer */}
            <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
              <p className="text-xs text-amber-800 leading-relaxed">
                <span className="font-semibold">⚠ Catatan Penting:</span>{' '}
                Hasil ini merupakan diagnosa awal dan tidak menggantikan pemeriksaan teknisi.
                Konsultasikan dengan teknisi berpengalaman untuk penanganan lebih lanjut.
              </p>
            </div>
          </>
        )}

        {/* Tombol Diagnosa Lagi */}
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={handleDiagnoseAgain}
            className="clay-btn px-6 py-3 min-h-[44px]"
          >
            Diagnosa Lagi
          </button>
        </div>
      </div>
    </>
  );
};

export default Step4Results;
