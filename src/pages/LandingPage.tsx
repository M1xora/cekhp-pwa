import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';
import PublicLayout from '../components/PublicLayout';
import HeroSection from '../components/landing/HeroSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import { HowItWorksSection } from '../components/landing/HowItWorksSection';
import TestimonialsSection from '../components/landing/TestimonialsSection';

/**
 * LandingPage — top-level public-facing page rendered at "/".
 * Uses PublicLayout to guarantee Navbar at top, Footer pinned at bottom.
 * Runs a global IntersectionObserver for all .fade-up elements on the page.
 * Requirements: 1.4
 */
function LandingPage() {
  // Global observer for any .fade-up elements not covered by individual components
  useEffect(() => {
    const targets = document.querySelectorAll('.fade-up');
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.05 }
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Helmet>
        <title>CekHP — Diagnosa Kerusakan Smartphone Anda</title>
        <meta
          name="description"
          content="CekHP membantu Anda mendiagnosa kerusakan hardware dan software smartphone dengan sistem pakar berbasis Forward Chaining. Gratis dan mudah digunakan."
        />
      </Helmet>

      <ErrorBoundary>
        <PublicLayout>
          <HeroSection />
          <FeaturesSection />
          <HowItWorksSection />
          <TestimonialsSection />
        </PublicLayout>
      </ErrorBoundary>
    </>
  );
}

export default LandingPage;
