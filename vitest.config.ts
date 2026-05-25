import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  test: {
    // ── Test environment ───────────────────────────────────────────────────
    environment: 'jsdom',

    // ── Global setup files ────────────────────────────────────────────────
    setupFiles: ['./src/test/setup.ts'],

    // ── Make vitest globals available (describe, it, expect, etc.)
    globals: true,

    // ── Coverage configuration ────────────────────────────────────────────
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      // Coverage thresholds
      thresholds: {
        lines:      80,
        functions:  80,
        branches:   75,
        statements: 80,
      },
      // Exclude non-source files from coverage
      exclude: [
        'node_modules/**',
        'src/test/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData.ts',
        'dist/**',
      ],
    },

    // ── Include patterns ──────────────────────────────────────────────────
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules/**', 'dist/**'],
  },
})
