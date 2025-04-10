import React, { useId } from 'react';
import { useFlipCard } from '../hooks/useFlipCard';
import type { FlipCardProps } from '../types';

/**
 * Functional React component for a standard flip card
 * 
 * @example
 * ```tsx
 * <FlipCard 
 *   frontContent={<div>Front content</div>}
 *   backContent={<div>Back content</div>}
 *   frontTriggerText="View Details"
 *   backTriggerText="Back"
 *   variant="standard"
 *   onFlip={(isFlipped) => console.log('Card flipped:', isFlipped)}
 * />
 * ```
 */
export const FlipCard: React.FC<FlipCardProps> = ({
  id,
  className = '',
  variant = 'standard',
  initialFlipped = false,
  frontTriggerText = 'View Details',
  backTriggerText = 'Back',
  frontTriggerAriaLabel = 'View more details',
  backTriggerAriaLabel = 'Return to front',
  announceToScreenReader = true,
  frontToBackAnnouncement,
  backToFrontAnnouncement,
  frontContent,
  backContent,
  onFlip
}) => {
  // Generate unique IDs if not provided
  const uniqueId = useId();
  const cardId = id || `flip-card-${uniqueId}`;
  const frontId = `${cardId}-front`;
  const backId = `${cardId}-back`;
  
  // Use the flip card hook for state management
  const {
    isFlipped,
    containerProps,
    frontTriggerProps,
    backTriggerProps
  } = useFlipCard(
    initialFlipped,
    onFlip,
    announceToScreenReader,
    frontToBackAnnouncement,
    backToFrontAnnouncement
  );
  
  return (
    <div
      id={cardId}
      {...containerProps}
      className={`${containerProps.className} card-${variant} ${className}`}
      aria-label="Interactive flip card. Press Enter to flip."
    >
      <div className="flip-card-inner">
        {/* Front side */}
        <div 
          id={frontId}
          className="flip-card-front" 
          role="region" 
          aria-label="Card front"
          aria-hidden={isFlipped ? 'true' : 'false'}
        >
          {/* Front content */}
          {frontContent}
          
          {/* Front trigger button */}
          <button
            className="flip-trigger"
            {...frontTriggerProps}
            aria-controls={backId}
            aria-label={frontTriggerAriaLabel}
          >
            {frontTriggerText}
          </button>
        </div>
        
        {/* Back side */}
        <div 
          id={backId}
          className="flip-card-back" 
          role="region" 
          aria-label="Card back"
          aria-hidden={isFlipped ? 'false' : 'true'}
        >
          {/* Back content */}
          {backContent}
          
          {/* Back trigger button */}
          <button
            className="flip-trigger"
            {...backTriggerProps}
            aria-controls={frontId}
            aria-label={backTriggerAriaLabel}
          >
            {backTriggerText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlipCard;