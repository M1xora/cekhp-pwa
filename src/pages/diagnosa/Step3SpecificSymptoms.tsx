import { useState, useEffect, useMemo, useCallback } from 'react';
import ClayCard from '../../components/ui/ClayCard';
import { fetchSymptoms } from '../../services/symptomService';
import { useDiagnosaStore } from '../../store/useDiagnosaStore';
import type { Symptom } from '../../types/knowledge-base';

interface Step3Props {
  onDiagnose: () => void;
  onBack: () => void;
}

/**
 * Step3SpecificSymptoms — third step of the Diagnostic Wizard.
 *
 * Fase 2: Data gejala sekarang diambil dari Supabase via symptomService.
 * Jika Supabase tidak tersedia, service akan fallback ke mockData secara otomatis
 * sehingga wizard tetap bisa dijalankan dalam kondisi development.
 *
 * States yang ditangani:
 *   - loading: skeleton card saat data dimuat
 *   - error:   pesan error jika fetch benar-benar gagal (tidak seharusnya terjadi
 *              karena service sudah fallback ke mock)
 *   - empty:   pesan jika tidak ada gejala untuk kategori yang dipilih
 *   - ready:   daftar gejala bisa dipilih
 *
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7
 */
export default function Step3SpecificSymptoms({ onDiagnose, onBack }: Step3Props) {
  const selectedSymptomCategory = useDiagnosaStore(
    (state) => state.selectedSymptomCategory,
  );
  const activeFacts = useDiagnosaStore((state) => state.activeFacts);
  const toggleFact = useDiagnosaStore((state) => state.toggleFact);

  // ── Data state ─────────────────────────────────────────────────────────────
  const [allSymptoms, setAllSymptoms] = useState<Symptom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Ambil semua gejala dari service saat komponen mount.
  // Service menangani fallback ke mockData jika Supabase tidak tersedia.
  useEffect(() => {
    let cancelled = false;

    async function loadSymptoms() {
      setIsLoading(true);
      setFetchError(null);

      const result = await fetchSymptoms();

      if (cancelled) return;

      if (result.error) {
        setFetchError(result.error);
      } else {
        setAllSymptoms(result.data);
      }
      setIsLoading(false);
    }

    loadSymptoms();
    return () => {
      cancelled = true;
    };
  }, []); // Hanya fetch sekali saat mount; data gejala tidak berubah selama sesi wizard

  // Filter berdasarkan kategori yang dipilih — di-memo agar hanya recompute
  // saat kategori atau data berubah, BUKAN saat activeFacts toggle (Req 4.1)
  const filteredSymptoms = useMemo(
    () => allSymptoms.filter((s) => s.category === selectedSymptomCategory),
    [allSymptoms, selectedSymptomCategory],
  );

  // Req 4.5 — Diagnosa button disabled saat tidak ada gejala terpilih
  const isDiagnoseDisabled = activeFacts.length === 0;

  // Req 4.7 — Back button guard
  const handleBack = useCallback(() => {
    if (selectedSymptomCategory === '') return;
    onBack();
  }, [selectedSymptomCategory, onBack]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">
      {/* Heading */}
      <div>
        <h2 className="text-2xl font-display font-bold text-gray-900">
          Pilih Gejala yang Dialami
        </h2>
        <p className="mt-1 text-gray-600 text-sm">
          Pilih semua gejala yang sesuai dengan kondisi perangkat Anda
          {selectedSymptomCategory && (
            <> — Kategori: <strong>{selectedSymptomCategory}</strong></>
          )}
          .
        </p>
      </div>

      {/* ── Loading state ──────────────────────────────────────────────── */}
      {isLoading && (
        <div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          aria-busy="true"
          aria-label="Memuat daftar gejala"
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-clay border border-gray-200 bg-gray-100 p-5 animate-pulse"
              aria-hidden="true"
            >
              <div className="h-4 w-3/4 rounded bg-gray-300 mb-2" />
              <div className="h-3 w-full rounded bg-gray-200" />
              <div className="h-3 w-5/6 rounded bg-gray-200 mt-1" />
            </div>
          ))}
        </div>
      )}

      {/* ── Error state ────────────────────────────────────────────────── */}
      {!isLoading && fetchError && (
        <div
          role="alert"
          className="rounded-clay border border-red-200 bg-red-50 p-6 text-center"
        >
          <p className="text-red-700 font-medium mb-1">Gagal memuat daftar gejala.</p>
          <p className="text-red-600 text-sm">{fetchError}</p>
        </div>
      )}

      {/* ── Data ready ─────────────────────────────────────────────────── */}
      {!isLoading && !fetchError && (
        <>
          {/* Req 4.6 — Empty state */}
          {filteredSymptoms.length === 0 ? (
            <div className="rounded-clay border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
              <p className="text-gray-600" role="status">
                Tidak ada gejala tersedia untuk kategori ini.
              </p>
            </div>
          ) : (
            /* Req 4.1, 4.2, 4.3 — Symptom cards dengan toggle selection */
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredSymptoms.map((symptom) => {
                const isSelected = activeFacts.includes(symptom.id);
                return (
                  <ClayCard
                    key={symptom.id}
                    selected={isSelected}
                    onClick={() => toggleFact(symptom.id)}
                    aria-pressed={isSelected}
                    aria-label={`${symptom.name}${isSelected ? ' — dipilih' : ''}`}
                    className="relative flex flex-col gap-2 p-5"
                  >
                    {/* Req 4.4 — Check icon saat dipilih */}
                    {isSelected && (
                      <span
                        className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-success-500"
                        aria-label="Terpilih"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="white"
                          className="h-3 w-3"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                    )}

                    {/* Nama gejala */}
                    <span className="pr-6 text-sm font-semibold text-gray-900 leading-snug">
                      {symptom.name}
                    </span>

                    {/* Deskripsi gejala */}
                    <span className="text-xs text-gray-600 leading-relaxed">
                      {symptom.description}
                    </span>
                  </ClayCard>
                );
              })}
            </div>
          )}

          {/* Jumlah gejala terpilih */}
          {activeFacts.length > 0 && (
            <p className="text-sm text-primary-600 font-medium" role="status" aria-live="polite">
              {activeFacts.length} gejala dipilih
            </p>
          )}
        </>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="clay-btn-outline min-h-[44px]"
          onClick={handleBack}
          aria-label="Kembali ke langkah sebelumnya"
        >
          Kembali
        </button>

        {/* Req 4.5 — Diagnosa button disabled saat activeFacts kosong */}
        <button
          type="button"
          className="clay-btn min-h-[44px]"
          onClick={onDiagnose}
          disabled={isDiagnoseDisabled}
          aria-disabled={isDiagnoseDisabled}
        >
          Diagnosa
        </button>
      </div>
    </div>
  );
}
