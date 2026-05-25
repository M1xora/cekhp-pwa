import React, { useEffect, useState } from 'react';
import { ErrorBoundary } from '../../components/ui/ErrorBoundary';
import WizardProgress from '../../components/ui/WizardProgress';
import Navbar from '../../components/landing/Navbar';
import { useDiagnosaStore } from '../../store/useDiagnosaStore';
import Step1DeviceCategory from './Step1DeviceCategory';
import Step2SymptomCategory from './Step2SymptomCategory';
import Step3SpecificSymptoms from './Step3SpecificSymptoms';
import Step4Results from './Step4Results';

/**
 * DiagnosaPage — Diagnostic Wizard container.
 *
 * - Resets the Zustand store on mount so every visit starts fresh.
 * - Manages `currentStep` (1–4) locally and renders the matching step component.
 * - Checks network connectivity on mount; if offline, displays an unavailable
 *   message instead of the Wizard so no network call is attempted.
 * - Wraps everything in an ErrorBoundary so uncaught render errors show a
 *   graceful fallback instead of a blank screen.
 *
 * Requirements: 2.1, 2.3, 11.3
 */
const DiagnosaPageInner: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const resetStore = useDiagnosaStore((state) => state.resetStore);

  /**
   * `isOfflineUnavailable` — true when the device is offline on mount and the
   * mock Knowledge Base may not be in the service worker cache.
   *
   * Per Requirement 11.3: if the mock KB is not in the service worker cache
   * while offline, the System SHALL display a visible message without making
   * any network call. We default to showing the message whenever the device is
   * offline; the wizard becomes available again once the `online` event fires.
   */
  const [isOfflineUnavailable, setIsOfflineUnavailable] = useState(false);

  // On mount: check connectivity and set up the online/offline listeners.
  useEffect(() => {
    if (!navigator.onLine) {
      setIsOfflineUnavailable(true);
    }

    const handleOnline = () => setIsOfflineUnavailable(false);
    const handleOffline = () => setIsOfflineUnavailable(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Clear any leftover state from a previous session on mount
  useEffect(() => {
    resetStore();
  }, [resetStore]);

  // --- Offline unavailable fallback ---
  if (isOfflineUnavailable) {
    return (
      <div className="min-h-screen bg-clay-light flex items-center justify-center px-4">
        <div
          className="clay-card max-w-md w-full p-8 text-center"
          role="alert"
          aria-live="polite"
        >
          {/* Offline icon */}
          <div className="flex justify-center mb-4">
            <span className="text-5xl" aria-hidden="true">📡</span>
          </div>

          <h1 className="text-xl font-bold text-gray-800 mb-2">
            Diagnostic Wizard Unavailable Offline
          </h1>

          <p className="text-gray-600 text-sm leading-relaxed">
            Please reconnect to the internet to use the Diagnostic Wizard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-page)] overflow-x-hidden flex flex-col">
      {/* Navbar — diagnosa variant: shows "← Beranda" CTA instead of "Mulai Diagnosa" */}
      <Navbar variant="diagnosa" />

      {/* Step progress indicator */}
      <WizardProgress currentStep={currentStep} totalSteps={4} />

      {/* Active step — pt-4 accounts for the fixed navbar height */}
      <div className="max-w-4xl mx-auto w-full px-4 pb-12 flex-1">
        {currentStep === 1 && (
          <Step1DeviceCategory
            onNext={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 2 && (
          <Step2SymptomCategory
            onNext={() => setCurrentStep(3)}
            onBack={() => setCurrentStep(1)}
          />
        )}

        {currentStep === 3 && (
          <Step3SpecificSymptoms
            onDiagnose={() => setCurrentStep(4)}
            onBack={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 4 && (
          <Step4Results
            onReset={() => setCurrentStep(1)}
          />
        )}
      </div>
    </div>
  );
};

const DiagnosaPage: React.FC = () => (
  <ErrorBoundary>
    <DiagnosaPageInner />
  </ErrorBoundary>
);

export default DiagnosaPage;
