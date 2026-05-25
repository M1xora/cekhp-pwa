import React, { KeyboardEvent } from 'react';

// Props interface for the ClayCard primitive (Claymorphism design language)
export interface ClayCardProps {
  children: React.ReactNode;
  className?: string;
  /** Adds highlighted border + scale transform when true */
  selected?: boolean;
  onClick?: () => void;
  /**
   * When the card acts as a toggle button (e.g. selectable symptom/device
   * cards), pass `aria-pressed` to convey the pressed/selected state to
   * assistive technologies. Only rendered when `onClick` is provided.
   *
   * Requirements: 12.3
   */
  'aria-pressed'?: boolean;
  /**
   * Optional ARIA label for cases where the card's visible text is absent or
   * insufficient to describe its action to assistive technologies.
   *
   * Requirements: 12.3
   */
  'aria-label'?: string;
}

/**
 * ClayCard — a Claymorphism-styled card primitive.
 *
 * - Applies `rounded-clay` (16px border-radius) and `shadow-clay` by default.
 * - When `selected` is true, switches to `clay-card-selected` styles
 *   (primary-coloured border, scale-[1.02] transform, shadow-clay-selected).
 * - When `onClick` is provided the card becomes keyboard-accessible:
 *   `tabIndex={0}`, `role="button"`, and responds to Enter / Space.
 * - When `aria-pressed` is supplied the rendered `role="button"` conveys toggle
 *   state to screen readers (WCAG 2.1 AA — Requirement 12.3).
 *
 * Requirements: 1.5, 2.2, 5.8, 12.3
 */
export function ClayCard({
  children,
  className = '',
  selected = false,
  onClick,
  'aria-pressed': ariaPressed,
  'aria-label': ariaLabel,
}: ClayCardProps) {
  // Handle keyboard activation (Enter / Space) for accessibility
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  };

  // Compose class names
  const baseClasses = selected ? 'clay-card-selected' : 'clay-card';

  // Focus-visible classes for interactive (clickable) cards — WCAG 2.1 AA (Req 12.5)
  // The global :focus-visible in index.css already provides outline: 2px solid #8b5cf6,
  // but we also add Tailwind focus-visible utilities so the rounded corners of the card
  // are respected via ring rather than outline on non-supporting browsers.
  const focusClasses = onClick
    ? 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2'
    : '';

  const composedClassName = [baseClasses, focusClasses, className].filter(Boolean).join(' ');

  // Interactive props are only added when onClick is provided
  const interactiveProps = onClick
    ? {
        tabIndex: 0,
        role: 'button' as const,
        onClick,
        onKeyDown: handleKeyDown,
        // Convey toggle state to assistive technologies (Req 12.3)
        ...(ariaPressed !== undefined && { 'aria-pressed': ariaPressed }),
        ...(ariaLabel !== undefined && { 'aria-label': ariaLabel }),
        // Enhance cursor feedback
        style: { cursor: 'pointer' } as React.CSSProperties,
      }
    : {};

  return (
    <div
      className={composedClassName}
      {...interactiveProps}
    >
      {children}
    </div>
  );
}

export default ClayCard;
