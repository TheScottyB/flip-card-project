/**
 * Flip Card Component - Core JavaScript
 * Version: 1.0.0
 * Features: Accessibility, Keyboard Navigation, Focus Management, Screen Reader Support
 */

/**
 * Initialize all flip cards with proper ARIA attributes and event listeners
 */
function initFlipCards() {
  // Find all flip cards on the page
  const flipCards = document.querySelectorAll('.flip-card');
  
  // Setup each card
  flipCards.forEach((card, index) => {
    // Generate unique IDs for ARIA relationships
    const cardId = `flip-card-${index}`;
    const frontId = `${cardId}-front`;
    const backId = `${cardId}-back`;
    
    // Get front and back sides
    const frontSide = card.querySelector('.flip-card-front');
    const backSide = card.querySelector('.flip-card-back');
    
    // Set IDs for ARIA relationships
    frontSide.id = frontId;
    backSide.id = backId;
    
    // Find all flip triggers
    const frontTrigger = frontSide.querySelector('.flip-trigger');
    const backTrigger = backSide.querySelector('.flip-trigger');
    
    // Setup front side trigger
    if (frontTrigger) {
      frontTrigger.setAttribute('aria-controls', backId);
      frontTrigger.setAttribute('aria-expanded', 'false');
      frontTrigger.setAttribute('aria-pressed', 'false');
      
      // Add click handler
      frontTrigger.addEventListener('click', (e) => {
        e.preventDefault();
        flipCard(card, true);
      });
    }
    
    // Setup back side trigger
    if (backTrigger) {
      backTrigger.setAttribute('aria-controls', frontId);
      backTrigger.setAttribute('aria-expanded', 'true');
      backTrigger.setAttribute('aria-pressed', 'true');
      
      // Add click handler
      backTrigger.addEventListener('click', (e) => {
        e.preventDefault();
        flipCard(card, false);
      });
    }
    
    // Add keyboard navigation to the card itself
    card.setAttribute('tabindex', '0');
    card.addEventListener('keydown', (e) => {
      // Flip on Enter or Space
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const isFlipped = card.classList.contains('flipped');
        flipCard(card, !isFlipped);
      }
      
      // Flip back on Escape
      if (e.key === 'Escape' && card.classList.contains('flipped')) {
        e.preventDefault();
        flipCard(card, false);
      }
    });
    
    // For touch devices without hover support
    if (window.matchMedia('(hover: none)').matches) {
      // Add click handler to flip on touch
      card.addEventListener('click', (e) => {
        // Only flip if not clicked on a button or link
        if (!e.target.closest('button, a')) {
          const isFlipped = card.classList.contains('flipped');
          flipCard(card, !isFlipped);
        }
      });
    }
    
    // Focus management within flipped cards
    setupFocusTrap(card, backSide);
  });
}

/**
 * Flip a card and update all associated ARIA states
 * @param {HTMLElement} card - The flip card element
 * @param {boolean} shouldFlip - Whether the card should be flipped
 */
function flipCard(card, shouldFlip) {
  // Get the card title for announcements
  const cardTitle = card.querySelector('h2')?.textContent.trim() || 'Card';
  
  // Toggle flipped state
  if (shouldFlip) {
    card.classList.add('flipped');
  } else {
    card.classList.remove('flipped');
  }
  
  // Update ARIA states
  const frontTrigger = card.querySelector('.flip-card-front .flip-trigger');
  const backTrigger = card.querySelector('.flip-card-back .flip-trigger');
  
  if (frontTrigger) {
    frontTrigger.setAttribute('aria-expanded', shouldFlip.toString());
    frontTrigger.setAttribute('aria-pressed', shouldFlip.toString());
  }
  
  if (backTrigger) {
    backTrigger.setAttribute('aria-expanded', (!shouldFlip).toString());
    backTrigger.setAttribute('aria-pressed', (!shouldFlip).toString());
  }
  
  // Manage focus
  setTimeout(() => {
    if (shouldFlip) {
      const firstFocusable = getFirstFocusableElement(card.querySelector('.flip-card-back'));
      if (firstFocusable) firstFocusable.focus();
    } else {
      const firstFocusable = getFirstFocusableElement(card.querySelector('.flip-card-front'));
      if (firstFocusable) firstFocusable.focus();
    }
  }, 100);
  
  // Announce change to screen readers
  announceToScreenReader(
    shouldFlip 
      ? `${cardTitle} card flipped to back side` 
      : `${cardTitle} card flipped to front side`
  );
}

/**
 * Get the first focusable element within a container
 * @param {HTMLElement} container - The container to search within
 * @return {HTMLElement|null} - The first focusable element or null
 */
function getFirstFocusableElement(container) {
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  return focusableElements.length > 0 ? focusableElements[0] : null;
}

/**
 * Setup focus trap within a container to improve accessibility
 * @param {HTMLElement} card - The flip card element
 * @param {HTMLElement} container - The container to trap focus within
 */
function setupFocusTrap(card, container) {
  container.addEventListener('keydown', function(e) {
    // Only process when card is flipped
    if (!card.classList.contains('flipped')) return;
    
    // Find all focusable elements
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    // If tab key is pressed
    if (e.key === 'Tab') {
      // If shift+tab on first element, move to last
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } 
      // If tab on last element, move to first
      else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  });
}

/**
 * Announce a message to screen readers
 * @param {string} message - The message to announce
 */
function announceToScreenReader(message) {
  // Create or get live region
  let liveRegion = document.getElementById('screen-reader-announcer');
  
  // If no live region exists, create one
  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = 'screen-reader-announcer';
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    document.body.appendChild(liveRegion);
  }
  
  // Set the message
  liveRegion.textContent = message;
}

// Initialize flip cards when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initFlipCards);

// Re-initialize on dynamic content changes
if (window.MutationObserver) {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length) {
        initFlipCards();
      }
    });
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
}