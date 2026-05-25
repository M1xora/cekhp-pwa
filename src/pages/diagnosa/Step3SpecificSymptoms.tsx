import { useMemo, useCallback } from 'react';
import ClayCard from '../../components/ui/ClayCard';
import { mockSymptoms } from '../../data/mockData';
import { useDiagnosaStore } from '../../store/useDiagnosaStore';

interface Step3Props {
  onDiagnose: () => void;
  onBack: () => void;
}

/**
 * Step3SpecificSymptoms — third step of the Diagnostic Wizard.
 *
 * Performance optimisations applied (Audit Issues 2.2, 3.2):
 *
 *   - `filteredSymptoms` is memoised on `selectedSymptomCategory` ONLY.
 *     Previously it was recalculated on every `activeFacts` toggle, even though
 *     the category hadn't changed. Now it only recomputes when the category changes.
 *
 *   - `handleBack` is wrapped in `useCallback` to keep the reference stable
 *     and avoid re-renders in any child that receives it as a prop.
 *
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7
 */
export default function Step3SpecificSymptoms({ onDiagnose, onBack }: Step3Props) {
  const selectedSymptomCategory = useDiagnosaStore(
    (state) => state.selectedSymptomCategory,
  );
  const activeFacts = useDiagnosaStore((state) => state.activeFacts);
  const toggleFact = useDiagnosaStore((state) => state.toggleFact);

  // FIX 2.2 / 3.2 — Memoised on selectedSymptomCategory only.
  // This filter runs O(symptoms) but only when the category changes,
  // NOT on every individual symptom toggle. Previously it ran on every toggle.
  const filteredSymptoms = useMemo(
    () => mockSymptoms.filter((s) => s.category === selectedSymptomCategory),
    [selectedSymptomCategory],
  );

  // Req 4.5 — Diagnose button is disabled when no symptoms are selected
  const isDiagnoseDisabled = activeFacts.length === 0;

  // Req 4.7 — Back button guard: only navigate back if selectedSymptomCategory
  // is non-empty; otherwise stay on this step.
  const handleBack = useCallback(() => {
    if (selectedSymptomCategory === '') return;
    onBack();
  }, [selectedSymptomCategory, onBack]);

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

      {/* Req 4.6 — Empty state when no symptoms match the selected category */}
      {filteredSymptoms.length === 0 ? (
        <div className="rounded-clay border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
          <p className="text-gray-600" role="status">
            Tidak ada gejala tersedia untuk kategori ini.
          </p>
        </div>
      ) : (
        /* Req 4.1, 4.2, 4.3 — Symptom cards with toggle selection */
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
                {/* Req 4.4 — Check icon visible when selected */}
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

                {/* Symptom name */}
                <span className="pr-6 text-sm font-semibold text-gray-900 leading-snug">
                  {symptom.name}
                </span>

                {/* Symptom description */}
                <span className="text-xs text-gray-600 leading-relaxed">
                  {symptom.description}
                </span>
              </ClayCard>
            );
          })}
        </div>
      )}

      {/* Selected count feedback */}
      {activeFacts.length > 0 && (
        <p className="text-sm text-primary-600 font-medium" role="status" aria-live="polite">
          {activeFacts.length} gejala dipilih
        </p>
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

        {/* Req 4.5 — Diagnose button disabled when activeFacts is empty */}
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
