import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

/**
 * LoginForm — Claymorphism-styled email/password login form.
 *
 * - Controlled fields: email, password
 * - Client-side validation: inline errors on empty fields before Supabase call
 * - On valid submit: calls supabase.auth.signInWithPassword
 *   - Success → navigate('/admin', { replace: true })
 *   - Error   → displays dismissable toast alert; stays on /login
 *
 * Requirements: 9.2, 9.6, 9.7
 */
export default function LoginForm() {
  const navigate = useNavigate();

  // ── Form state ─────────────────────────────────────────────────────────────
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ── Client-side validation ─────────────────────────────────────────────────
  function validate(): boolean {
    let valid = true;

    if (!email.trim()) {
      setEmailError('Email is required.');
      valid = false;
    } else {
      setEmailError('');
    }

    if (!password) {
      setPasswordError('Password is required.');
      valid = false;
    } else {
      setPasswordError('');
    }

    return valid;
  }

  // ── Submit handler ─────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAuthError('');

    // Block submission if validation fails (Req 9.6)
    if (!validate()) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        // Display toast; stay on /login (Req 9.7)
        setAuthError(error.message ?? 'Authentication failed. Please try again.');
      } else {
        // Success — redirect to admin (Req 9.2)
        navigate('/admin', { replace: true });
      }
    } catch {
      setAuthError('An unexpected error occurred. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  }

  // ── Dismiss toast ──────────────────────────────────────────────────────────
  function dismissAuthError() {
    setAuthError('');
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    /* Claymorphism card container */
    <div className="clay-card w-full max-w-md mx-auto p-8">
      <h1 className="text-2xl font-bold font-display text-gray-900 mb-1">
        Admin Login
      </h1>
      <p className="text-sm text-gray-600 mb-6">
        Sign in to manage the CekHP Knowledge Base.
      </p>

      {/* ── Auth error toast ────────────────────────────────────────────────── */}
      {authError && (
        <div
          role="alert"
          className="flex items-start gap-3 mb-5 rounded-clay-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <span className="flex-1">{authError}</span>
          <button
            type="button"
            aria-label="Dismiss error"
            onClick={dismissAuthError}
            className="shrink-0 text-red-400 hover:text-red-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1 rounded"
          >
            {/* ✕ icon */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden="true">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate aria-label="Login form">
        {/* ── Email field ─────────────────────────────────────────────────── */}
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError('');
            }}
            aria-describedby={emailError ? 'email-error' : undefined}
            aria-invalid={emailError ? 'true' : undefined}
            disabled={isLoading}
            placeholder="admin@example.com"
            className={`w-full rounded-lg border px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400
              bg-white transition-colors duration-150
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1
              disabled:opacity-60 disabled:cursor-not-allowed
              ${emailError
                ? 'border-red-400 focus:ring-red-400'
                : 'border-gray-300 hover:border-gray-400'
              }`}
          />
          {emailError && (
            <p id="email-error" role="alert" className="mt-1 text-xs text-red-600">
              {emailError}
            </p>
          )}
        </div>

        {/* ── Password field ──────────────────────────────────────────────── */}
        <div className="mb-6">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (passwordError) setPasswordError('');
            }}
            aria-describedby={passwordError ? 'password-error' : undefined}
            aria-invalid={passwordError ? 'true' : undefined}
            disabled={isLoading}
            placeholder="••••••••"
            className={`w-full rounded-lg border px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400
              bg-white transition-colors duration-150
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1
              disabled:opacity-60 disabled:cursor-not-allowed
              ${passwordError
                ? 'border-red-400 focus:ring-red-400'
                : 'border-gray-300 hover:border-gray-400'
              }`}
          />
          {passwordError && (
            <p id="password-error" role="alert" className="mt-1 text-xs text-red-600">
              {passwordError}
            </p>
          )}
        </div>

        {/* ── Submit button ───────────────────────────────────────────────── */}
        <button
          type="submit"
          disabled={isLoading}
          className="clay-btn w-full"
          aria-label={isLoading ? 'Signing in…' : 'Sign in'}
        >
          {isLoading ? (
            <>
              {/* Spinner */}
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Signing in…
            </>
          ) : (
            'Sign in'
          )}
        </button>
      </form>
    </div>
  );
}
