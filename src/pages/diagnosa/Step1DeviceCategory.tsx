import ClayCard from '../../components/ui/ClayCard';
import { useDiagnosaStore } from '../../store/useDiagnosaStore';

// Device category options — exactly 5 as specified
const DEVICE_CATEGORIES = [
  { id: 'samsung',        name: 'Samsung',        icon: '📱' },
  { id: 'iphone',         name: 'iPhone',         icon: '🍎' },
  { id: 'xiaomi',         name: 'Xiaomi',         icon: '📱' },
  { id: 'oppo',           name: 'OPPO',           icon: '📱' },
  { id: 'android-general', name: 'General Android', icon: '🤖' },
] as const;

interface Step1Props {
  onNext: () => void;
}

/**
 * Step1DeviceCategory — first step of the Diagnostic Wizard.
 *
 * Renders 5 device-category ClayCard options. Selecting a card stores
 * the choice in the Zustand store via `setDeviceCategory`. The "Selanjutnya"
 * (Next) button is disabled until a selection is made.
 *
 * Requirements: 2.1, 2.2, 2.4, 2.5, 2.6
 */
export default function Step1DeviceCategory({ onNext }: Step1Props) {
  const selectedDeviceCategory = useDiagnosaStore(
    (state) => state.selectedDeviceCategory,
  );
  const setDeviceCategory = useDiagnosaStore(
    (state) => state.setDeviceCategory,
  );

  const isNextDisabled = selectedDeviceCategory === '';

  return (
    <div className="flex flex-col gap-6">
      {/* Heading */}
      <div>
        <h2 className="text-2xl font-display font-bold text-gray-900">
          Pilih Kategori Perangkat
        </h2>
        <p className="mt-1 text-gray-600 text-sm">
          Pilih merek atau jenis smartphone Anda untuk memulai diagnosis.
        </p>
      </div>

      {/* Device category grid — exactly 5 cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {DEVICE_CATEGORIES.map((device) => {
          const isSelected = selectedDeviceCategory === device.id;
          return (
            <ClayCard
              key={device.id}
              selected={isSelected}
              onClick={() => setDeviceCategory(device.id)}
              aria-pressed={isSelected}
              aria-label={`Pilih ${device.name}`}
              className="relative flex flex-col items-center gap-3 p-5"
            >
              {/* Green checkmark SVG icon — visible only when selected */}
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

              {/* Device icon */}
              <span className="text-4xl leading-none" role="img" aria-label={device.name}>
                {device.icon}
              </span>

              {/* Device name */}
              <span className="text-center text-sm font-semibold text-gray-800 leading-tight">
                {device.name}
              </span>
            </ClayCard>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex justify-end">
        <button
          type="button"
          className="clay-btn min-h-[44px]"
          onClick={onNext}
          disabled={isNextDisabled}
          aria-disabled={isNextDisabled}
        >
          Selanjutnya
        </button>
      </div>
    </div>
  );
}
