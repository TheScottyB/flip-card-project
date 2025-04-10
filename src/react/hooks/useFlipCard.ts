import { useState, useCallback, useMemo, useEffect } from 'react';
import type { UseFlipCardReturn } from '../types';

/**
 * Custom hook for managing flip card state and actions
 * 
 * @param initialFlipped - Whether the card should start in flipped state
 * @param onFlip - Optional callback when card is flipped
 * @param announceToScreenReader - Whether to announce state changes to screen readers
 * @param frontToBackAnnouncement - Custom message when flipping to back
 * @param backToFrontAnnouncement - Custom message when flipping to front
 */
export const useFlipCard = (
  initialFlipped = false,
  onFlip?: (isFlipped: boolean) => void,
  announceToScreenReader = true,
  frontToBackAnnouncement = 'Card flipped to back side',
  backToFrontAnnouncement = 'Card flipped to front side'
): UseFlipCardReturn => {
  // Track flip state
  const [isFlipped, setIsFlipped] = useState(initialFlipped);

  // Function to flip card to a specific state
  const flipCard = useCallback((shouldFlip: boolean) => {
    // Only update if state is changing
    if (shouldFlip === isFlipped) return;

    setIsFlipped(shouldFlip);
    
    // Call onFlip callback if provided
    if (onFlip) {
      onFlip(shouldFlip);
    }
    
    // Announce to screen readers if enabled
    if (announceToScreenReader) {
      const message = shouldFlip ? frontToBackAnnouncement : backToFrontAnnouncement;
      
      // Find or create announcer element
      let announcer = document.getElementById('flip-card-announcer');
      if (!announcer) {
        announcer = document.createElement('div');
        announcer.id = 'flip-card-announcer';
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.className = 'sr-only';
        document.body.appendChild(announcer);
      }
      
      // Set announcement text
      announcer.textContent = message;
    }
  }, [isFlipped, onFlip, announceToScreenReader, frontToBackAnnouncement, backToFrontAnnouncement]);

  // Function to toggle current flip state
  const toggleFlip = useCallback(() => {
    flipCard(!isFlipped);
  }, [isFlipped, flipCard]);

  // Process keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Skip if focus is on a button
    if ((e.target as HTMLElement).tagName === 'BUTTON') {
      return;
    }
    
    // Enter or Space to toggle
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleFlip();
    }
    
    // Escape to flip back to front
    if (e.key === 'Escape' && isFlipped) {
      e.preventDefault();
      flipCard(false);
    }
  }, [isFlipped, toggleFlip, flipCard]);

  // Memoized container props
  const containerProps = useMemo(() => ({
    className: `flip-card ${isFlipped ? 'flipped' : ''}`,
    tabIndex: 0 as const,
    onKeyDown: handleKeyDown
  }), [isFlipped, handleKeyDown]);

  // Memoized trigger props
  const frontTriggerProps = useMemo(() => ({
    onClick: () => flipCard(true),
    'aria-pressed': isFlipped,
    'aria-expanded': isFlipped
  }), [isFlipped, flipCard]);

  const backTriggerProps = useMemo(() => ({
    onClick: () => flipCard(false),
    'aria-pressed': !isFlipped,
    'aria-expanded': !isFlipped
  }), [isFlipped, flipCard]);

  // Return the hook API
  return {
    isFlipped,
    flipCard,
    toggleFlip,
    containerProps,
    frontTriggerProps,
    backTriggerProps
  };
};