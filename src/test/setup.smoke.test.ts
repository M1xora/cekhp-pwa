// Smoke test — verifies that Vitest + jsdom + jest-dom are wired up correctly.
// This test has no application logic; it exists solely to validate the toolchain.

import { describe, it, expect } from 'vitest'

describe('Toolchain smoke test', () => {
  it('vitest globals are available', () => {
    expect(true).toBe(true)
  })

  it('jsdom environment is active', () => {
    expect(typeof document).toBe('object')
    expect(typeof window).toBe('object')
  })

  it('@testing-library/jest-dom matchers are registered', () => {
    // Create a DOM element and use a jest-dom matcher
    const el = document.createElement('div')
    el.textContent = 'CekHP'
    document.body.appendChild(el)
    expect(el).toBeInTheDocument()
    document.body.removeChild(el)
  })
})
