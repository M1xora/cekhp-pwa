import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

/**
 * PwaUpdatePrompt
 *
 * Detects when a new service worker is waiting and shows a persistent
 * update banner. If dismissed, the banner is hidden for the current
 * browser session (sessionStorage). On the next visit (new session),
 * sessionStorage is cleared by the browser, so the banner re-appears.
 *
 * Requirement 11.4
 */
const SESSION_KEY = 'pwa-update-dismissed';

export default function PwaUpdatePrompt() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(registration) {
      // Silently ignore registration events — app degrades gracefully if SW
      // registration fails (see design error-handling for PWA).
      if (registration) {
        console.info('[PWA] Service worker registered.');
      }
    },
    onRegisterError(error) {
      console.warn('[PWA] Service worker registration failed:', error);
    },
  });

  // Track whether the user has dismissed the banner in this session.
  const [dismissed, setDismissed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(SESSION_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // Reset dismissed state when a fresh update arrives in the same session.
  useEffect(() => {
    if (needRefresh) {
      // A new SW is waiting — clear any previous dismissal so the banner shows.
      try {
        sessionStorage.removeItem(SESSION_KEY);
      } catch {
        // sessionStorage unavailable (e.g., private mode restrictions) — ignore.
      }
      setDismissed(false);
    }
  }, [needRefresh]);

  const handleDismiss = () => {
    try {
      sessionStorage.setItem(SESSION_KEY, 'true');
    } catch {
      // sessionStorage unavailable — dismissal won't persist but UX still works.
    }
    setDismissed(true);
  };

  const handleReload = () => {
    updateServiceWorker(true);
  };

  // Only render when there is a new SW waiting AND the user hasn't dismissed.
  if (!needRefresh || dismissed) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Application update available"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md"
    >
      <div
        className="
          flex items-center justify-between gap-3
          rounded-2xl bg-white px-4 py-3
          shadow-[0_8px_24px_rgba(0,0,0,0.15),0_2px_6px_rgba(0,0,0,0.10)]
          border border-primary-200
        "
      >
        {/* Message */}
        <p className="text-sm font-medium text-gray-800 leading-snug">
          🎉 A new version of CekHP is available.
        </p>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleReload}
            className="
              rounded-xl bg-primary-600 px-3 py-1.5
              text-xs font-semibold text-white
              hover:bg-primary-700 active:scale-95
              focus-visible:outline focus-visible:outline-2
              focus-visible:outline-offset-2 focus-visible:outline-primary-600
              transition-all duration-150
            "
            aria-label="Reload to apply the update"
          >
            Reload
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            className="
              rounded-xl bg-gray-100 px-3 py-1.5
              text-xs font-semibold text-gray-600
              hover:bg-gray-200 active:scale-95
              focus-visible:outline focus-visible:outline-2
              focus-visible:outline-offset-2 focus-visible:outline-gray-400
              transition-all duration-150
            "
            aria-label="Dismiss update notification"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
