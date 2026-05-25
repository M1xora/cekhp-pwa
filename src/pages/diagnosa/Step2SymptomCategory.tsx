import { useState } from 'react';
import ClayCard from '../../components/ui/ClayCard';
import { useDiagnosaStore } from '../../store/useDiagnosaStore';

// Symptom category options — 6 hardware/software areas (Req 3.1)
const SYMPTOM_CATEGORIES = [
  { id: 'Battery',      name: 'Baterai',      icon: '🔋' },
  { id: 'Screen',       name: 'Layar',        icon: '📺' },
  { id: 'Performance',  name: 'Performa',     icon: '⚡' },
  { id: 'Camera',       name: 'Kamera',       icon: '📷' },
  { id: 'Connectivity', name: 'Konektivitas', icon: '📶' },
  { id: 'Audio',        name: 'Audio',        icon: '🔊' },
] as const;

interface Step2Props {
  onNext: () => void;
  onBack: () => void;
}

/**
 * Step2SymptomCategory — second step of the Diagnostic Wizard.
 *
 * Renders 6 symptom-category ClayCard options. Selecting a card stores
 * the choice in the Zustand store via `setSymptomCategory`. The "Next"
 * button is disabled until the first selection is made; once enabled it
 * stays enabled even if the user subsequently deselects (Req 3.3).
 *
 * The "Back" button verifies that `selectedDeviceCategory` is non-empty
 * before navigating (Req 3.5).
 *
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
 */
export default function Step2SymptomCategory({ onNext, onBack }: Step2Props) {
  const selectedSymptomCategory = useDiagnosaStore(
    (state) => state.selectedSymptomCategory,
  );
  const selectedDeviceCategory = useDiagnosaStore(
    (state) => state.selectedDeviceCategory,
  );
  const setSymptomCategory = useDiagnosaStore(
    (state) => state.setSymptomCategory,
  );

  // Local boolean — starts false, set to true on first selection, never reverts (Req 3.3)
  const [nextEnabled, setNextEnabled] = useState(false);

  const handleCategoryClick = (id: string) => {
    setSymptomCategory(id);
    if (!nextEnabled) {
      setNextEnabled(true);
    }
  };

  // Back guard: only navigate if selectedDeviceCategory is non-empty (Req 3.5)
  const handleBack = () => {
    if (selectedDeviceCategory !== '') {
      onBack();
    }
    // If empty, stay on Step 2 — do nothing
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Heading */}
      <div>
        <h2 className="text-2xl font-display font-bold text-gray-900">
          Pilih Area Masalah
        </h2>
        <p className="mt-1 text-gray-600 text-sm">
          Pilih area smartphone yang mengalami masalah untuk mempersempit gejala.
        </p>
      </div>

      {/* Symptom category grid — 6 cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {SYMPTOM_CATEGORIES.map((category) => {
          const isSelected = selectedSymptomCategory === category.id;
          return (
            <ClayCard
              key={category.id}
              selected={isSelected}
              onClick={() => handleCategoryClick(category.id)}
              className="relative flex flex-col items-center gap-3 p-5"
            >
              {/* Check icon — visible only when selected (Req 3.3 visual indicator) */}
              {isSelected && (
                <span
                  className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-white text-xs font-bold leading-none"
                  aria-label="Terpilih"
                >
                  ✓
                </span>
              )}

              {/* Category icon */}
              <span className="text-4xl leading-none" role="img" aria-label={category.name}>
                {category.icon}
              </span>

              {/* Category name */}
              <span className="text-center text-sm font-semibold text-gray-800 leading-tight">
                {category.name}
              </span>
            </ClayCard>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          type="button"
          className="clay-btn-secondary min-h-[44px]"
          onClick={handleBack}
          aria-label="Kembali ke langkah sebelumnya"
        >
          Kembali
        </button>

        <button
          type="button"
          className="clay-btn min-h-[44px]"
          onClick={onNext}
          disabled={!nextEnabled}
          aria-disabled={!nextEnabled}
        >
          Selanjutnya
        </button>
      </div>
    </div>
  );
}
