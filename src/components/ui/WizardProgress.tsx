import React from 'react';

interface WizardProgressProps {
  currentStep: 1 | 2 | 3 | 4;
  totalSteps: 4;
}

const STEP_LABELS: Record<number, string> = {
  1: 'Perangkat',
  2: 'Kategori',
  3: 'Gejala',
  4: 'Hasil',
};

const CheckIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={3}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-4 h-4"
    aria-hidden="true"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const WizardProgress: React.FC<WizardProgressProps> = ({ currentStep }) => {
  const steps = [1, 2, 3, 4] as const;

  return (
    <nav
      aria-label="Langkah diagnosis"
      className="w-full px-4 py-6 overflow-x-hidden pt-[72px]"
    >
      <ol className="flex items-center w-full max-w-4xl mx-auto">
        {steps.map((step, index) => {
          const isCompleted = step < currentStep;
          const isCurrent   = step === currentStep;
          const isLast      = index === steps.length - 1;

          return (
            <React.Fragment key={step}>
              {/* Step item */}
              <li className="flex flex-col items-center flex-shrink-0">
                {/* Circle */}
                <div
                  aria-current={isCurrent ? 'step' : undefined}
                  className={[
                    'flex items-center justify-center rounded-full font-bold transition-all duration-300 select-none',
                    isCompleted
                      ? 'w-9 h-9 bg-primary-600 text-white shadow-clay-selected'
                      : isCurrent
                        ? 'w-11 h-11 bg-primary-600 text-white shadow-clay-selected ring-4 ring-primary-200 scale-110'
                        : 'w-9 h-9 bg-white text-gray-600 border-2 border-gray-300 shadow-sm',
                  ].join(' ')}
                >
                  {isCompleted ? (
                    <CheckIcon />
                  ) : (
                    <span className={isCurrent ? 'text-sm' : 'text-xs'}>
                      {step}
                    </span>
                  )}
                </div>

                {/* Label */}
                <span
                  className={[
                    'mt-2 text-xs font-medium text-center leading-tight',
                    isCompleted
                      ? 'text-primary-600'
                      : isCurrent
                        ? 'text-primary-700 font-semibold'
                        : 'text-gray-600',
                  ].join(' ')}
                >
                  {STEP_LABELS[step]}
                </span>
              </li>

              {/* Connector line between steps */}
              {!isLast && (
                <li
                  aria-hidden="true"
                  className="flex-1 mx-2 mb-5"
                >
                  <div
                    className={[
                      'h-1 rounded-full transition-all duration-500',
                      step < currentStep
                        ? 'bg-primary-500'
                        : 'bg-gray-200',
                    ].join(' ')}
                  />
                </li>
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};

export default WizardProgress;
