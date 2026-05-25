import React from 'react';

// ─── State ──────────────────────────────────────────────────────────────────

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * ErrorBoundary — wraps major routes to catch unhandled render errors.
 *
 * When a descendant component throws during rendering, this boundary catches
 * the error and displays a friendly fallback UI (Claymorphism-styled card)
 * with a "Reload" button that refreshes the page.
 *
 * Requirements: 5.5
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  /**
   * Update state so the next render shows the fallback UI.
   * Called during the render phase, so it must be a pure function.
   */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  /**
   * Log the caught error for debugging purposes.
   * Called during the commit phase, so side-effects are allowed.
   */
  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    // Log error details to the console for development/debugging
    console.error('[ErrorBoundary] Caught an unhandled error:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        // Full-viewport centred container
        <div
          className="min-h-screen flex items-center justify-center bg-clay-light px-4"
          role="alert"
          aria-live="assertive"
        >
          {/* Claymorphism card fallback */}
          <div className="clay-card max-w-md w-full p-8 flex flex-col items-center gap-6 text-center animate-fade-in">

            {/* Warning / error icon */}
            <div
              className="w-16 h-16 rounded-full bg-secondary-100 flex items-center justify-center shadow-clay-inner"
              aria-hidden="true"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-8 h-8 text-secondary-500"
                aria-hidden="true"
              >
                {/* Triangle warning icon */}
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>

            {/* Title */}
            <div className="flex flex-col gap-2">
              <h1 className="text-xl font-bold text-gray-900 font-display">
                Something went wrong
              </h1>

              {/* Description */}
              <p className="text-gray-600 text-sm leading-relaxed">
                An unexpected error occurred. Please try reloading the page.
              </p>
            </div>

            {/* Reload button */}
            <button
              type="button"
              className="clay-btn"
              onClick={() => window.location.reload()}
            >
              {/* Reload icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
                aria-hidden="true"
              >
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
