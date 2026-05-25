import { useEffect, useRef } from 'react';

/**
 * useFadeUp — attaches an IntersectionObserver to every element with
 * the `.fade-up` class inside `containerRef`, adding `.visible` when
 * they scroll into view.
 *
 * This replicates the vanilla JS scroll-animation logic from
 * hp-diagnostik (1).html in a React-safe, cleanup-aware way.
 */
export function useFadeUp() {
  const containerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const root = containerRef.current ?? document;
    const targets = (root as Element).querySelectorAll
      ? (root as Element).querySelectorAll('.fade-up')
      : document.querySelectorAll('.fade-up');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.12 }
    );

    targets.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return containerRef;
}
