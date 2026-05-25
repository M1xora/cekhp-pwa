import React from 'react';
import Navbar from './landing/Navbar';
import Footer from './landing/Footer';

/**
 * PublicLayout — shell wrapper for all public-facing routes (/, /diagnosa, /login).
 *
 * Guarantees the footer is always pushed to the bottom of the viewport by using
 * a min-h-screen / flex-col / flex-grow structure:
 *
 *   ┌────────────────────────────────────┐  ← min-h-screen flex flex-col
 *   │  <Navbar variant={navVariant} />   │
 *   │  <main class="flex-1 flex-grow">   │  ← grows to fill remaining space
 *   │    {children}                      │
 *   │  </main>                           │
 *   │  <Footer />                        │  ← always at bottom
 *   └────────────────────────────────────┘
 */
interface PublicLayoutProps {
  children: React.ReactNode;
  /** Controls which Navbar CTA variant is rendered */
  navVariant?: 'default' | 'diagnosa' | 'login';
  /** When true, the Navbar is not rendered */
  hideNav?: boolean;
}

export default function PublicLayout({
  children,
  navVariant = 'default',
  hideNav = false,
}: PublicLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {!hideNav && <Navbar variant={navVariant} />}
      <main className="flex-1 flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}
