import React, { useState, useRef, useEffect } from 'react';

/**
 * Props for the FlipCard component
 */
interface FlipCardProps {
  /** Front side content */
  frontContent: React.ReactNode;
  /** Back side content */
  backContent: React.ReactNode;
  /** Optional card size variant */
  cardSize?: 'standard' | 'mini' | 'tall';
  /** Card title for screen reader announcements */
  cardTitle: string;
  /** Optional CSS class to apply to the card */
  className?: string;
}

/**
 * Accessible, responsive flip card component
 */
const FlipCard: React.FC<FlipCardProps> = ({
  frontContent,
  backContent,
  cardSize = 'standard',
  cardTitle,
  className = '',
}) => {
  // State for the flipped state
  const [isFlipped, setIsFlipped] = useState(false);
  
  // Refs for focus management
  const cardRef = useRef<HTMLDivElement>(null);
  const frontSideRef = useRef<HTMLDivElement>(null);
  const backSideRef = useRef<HTMLDivElement>(null);
  
  // Generate unique IDs for ARIA relationships
  const frontId = `${cardTitle.replace(/\s+/g, '-').toLowerCase()}-front`;
  const backId = `${cardTitle.replace(/\s+/g, '-').toLowerCase()}-back`;
  
  /**
   * Toggle the flipped state
   */
  const toggleFlip = () => {
    setIsFlipped(!isFlipped);
  };
  
  /**
   * Handle keyboard interactions
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleFlip();
    }
    
    if (e.key === 'Escape' && isFlipped) {
      e.preventDefault();
      setIsFlipped(false);
    }
  };
  
  /**
   * Announce the flip state change to screen readers
   */
  useEffect(() => {
    // Create or get the live region
    let announcer = document.getElementById('flip-card-announcer');
    
    if (!announcer) {
      announcer = document.createElement('div');
      announcer.id = 'flip-card-announcer';
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.className = 'sr-only';
      document.body.appendChild(announcer);
    }
    
    // Announce the state change
    announcer.textContent = isFlipped
      ? `${cardTitle} card flipped to back side`
      : `${cardTitle} card flipped to front side`;
      
    return () => {
      // Clean up only if component is unmounted
      if (announcer && !document.getElementById('flip-card-announcer')) {
        document.body.removeChild(announcer);
      }
    };
  }, [isFlipped, cardTitle]);
  
  /**
   * Manage focus when card flips
   */
  useEffect(() => {
    if (isFlipped && backSideRef.current) {
      // Find the first focusable element in the back side
      const focusableElements = backSideRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }
    } else if (!isFlipped && frontSideRef.current) {
      // Find the first focusable element in the front side
      const focusableElements = frontSideRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }
    }
  }, [isFlipped]);
  
  return (
    <div 
      className={`flip-card card-${cardSize} ${className} ${isFlipped ? 'flipped' : ''}`}
      ref={cardRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label={`${cardTitle} flip card. Press Enter to flip`}
    >
      <div className="flip-card-inner">
        {/* Front Side */}
        <div 
          className="flip-card-front"
          ref={frontSideRef}
          id={frontId}
          role="region"
          aria-label={`${cardTitle} front side`}
        >
          {frontContent}
          <button
            onClick={toggleFlip}
            className="flip-trigger"
            aria-pressed={isFlipped}
            aria-expanded={isFlipped}
            aria-controls={backId}
          >
            View More Information
          </button>
        </div>
        
        {/* Back Side */}
        <div 
          className="flip-card-back"
          ref={backSideRef}
          id={backId}
          role="region"
          aria-label={`${cardTitle} back side`}
        >
          {backContent}
          <button
            onClick={toggleFlip}
            className="flip-trigger"
            aria-pressed={!isFlipped}
            aria-expanded={!isFlipped}
            aria-controls={frontId}
          >
            Return to Front
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlipCard;