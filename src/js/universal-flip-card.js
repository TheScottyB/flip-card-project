/**
 * Universal Flip Card Component
 * 
 * A device-agnostic flip card implementation that adapts to any input method
 * while maintaining feature parity across devices.
 * 
 * Features:
 * - Works across touch, mouse, keyboard, and voice inputs
 * - Adapts to device capabilities without reducing features
 * - Maintains accessibility across all platforms
 * - Uses modern CSS features like container queries
 * - Supports user preferences (reduced motion, color scheme, etc.)
 */

class UniversalFlipCard {
  /**
   * Initialize a universal flip card
   * @param {HTMLElement|string} element - The card element or selector
   * @param {Object} options - Configuration options
   */
  constructor(element, options = {}) {
    // Get the element if a selector was passed
    this.card = typeof element === 'string' ? document.querySelector(element) : element;
    
    if (!this.card) {
      console.error('Universal Flip Card: Element not found');
      return;
    }
    
    // Default options
    this.options = Object.assign({
      enableHover: true,
      announceToScreenReader: true,
      disableAutoFocus: false,
      customFrontTriggerLabel: null,
      customBackTriggerLabel: null
    }, options);
    
    // Store references to card parts
    this.inner = this.card.querySelector('.universal-card-inner');
    this.frontSide = this.card.querySelector('.universal-card-front');
    this.backSide = this.card.querySelector('.universal-card-back');
    this.frontTrigger = this.frontSide?.querySelector('.flip-trigger');
    this.backTrigger = this.backSide?.querySelector('.flip-trigger');
    
    // Skip if the card structure is invalid
    if (!this.inner || !this.frontSide || !this.backSide) {
      console.error('Universal Flip Card: Invalid card structure');
      return;
    }
    
    // Generate IDs for accessibility
    this.setupIds();
    
    // Detect device capabilities
    this.detectCapabilities();
    
    // Set up ARIA attributes
    this.setupAria();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Set up screen reader announcer
    this.setupScreenReaderAnnouncer();
    
    // Initialize card state
    this.isFlipped = this.card.classList.contains('flipped');
    
    // Apply hover setting
    this.card.setAttribute('data-disable-hover', !this.options.enableHover);
  }
  
  /**
   * Generate unique IDs for ARIA relationships
   */
  setupIds() {
    // Generate a unique ID for the card if it doesn't have one
    if (!this.card.id) {
      this.card.id = 'universal-card-' + Math.floor(Math.random() * 10000);
    }
    
    // Set IDs for front and back sides
    this.frontSide.id = this.frontSide.id || `${this.card.id}-front`;
    this.backSide.id = this.backSide.id || `${this.card.id}-back`;
    
    // Store for reference
    this.frontId = this.frontSide.id;
    this.backId = this.backSide.id;
  }
  
  /**
   * Detect device capabilities
   */
  detectCapabilities() {
    this.capabilities = {
      touch: 'ontouchstart' in window,
      pointer: window.matchMedia('(pointer: fine)').matches,
      hover: window.matchMedia('(hover: hover)').matches,
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches
    };
    
    // Set primary input method
    if (this.capabilities.touch && !this.capabilities.pointer) {
      this.inputMethod = 'touch';
    } else if (this.capabilities.pointer) {
      this.inputMethod = 'mouse';
    } else {
      this.inputMethod = 'keyboard';
    }
    
    // Apply input method as data attribute
    this.card.setAttribute('data-input-method', this.inputMethod);
    
    // Apply reduced motion preference
    if (this.capabilities.reducedMotion) {
      document.body.classList.add('reduced-motion');
    }
  }
  
  /**
   * Set up ARIA attributes
   */
  setupAria() {
    // Make the card focusable
    if (!this.card.hasAttribute('tabindex')) {
      this.card.setAttribute('tabindex', '0');
    }
    
    // Set up front trigger
    if (this.frontTrigger) {
      this.frontTrigger.setAttribute('aria-controls', this.backId);
      this.frontTrigger.setAttribute('aria-expanded', this.isFlipped ? 'true' : 'false');
      this.frontTrigger.setAttribute('aria-pressed', this.isFlipped ? 'true' : 'false');
      
      if (!this.frontTrigger.hasAttribute('aria-label') && this.options.customFrontTriggerLabel) {
        this.frontTrigger.setAttribute('aria-label', this.options.customFrontTriggerLabel);
      }
    }
    
    // Set up back trigger
    if (this.backTrigger) {
      this.backTrigger.setAttribute('aria-controls', this.frontId);
      this.backTrigger.setAttribute('aria-expanded', !this.isFlipped ? 'true' : 'false');
      this.backTrigger.setAttribute('aria-pressed', !this.isFlipped ? 'true' : 'false');
      
      if (!this.backTrigger.hasAttribute('aria-label') && this.options.customBackTriggerLabel) {
        this.backTrigger.setAttribute('aria-label', this.options.customBackTriggerLabel);
      }
    }
    
    // Set aria-hidden based on flip state
    this.updateAriaHidden();
  }
  
  /**
   * Update aria-hidden states based on flip state
   */
  updateAriaHidden() {
    if (this.isFlipped) {
      this.frontSide.setAttribute('aria-hidden', 'true');
      this.backSide.setAttribute('aria-hidden', 'false');
    } else {
      this.frontSide.setAttribute('aria-hidden', 'false');
      this.backSide.setAttribute('aria-hidden', 'true');
    }
  }
  
  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Card click handler for touch devices
    if (this.inputMethod === 'touch') {
      this.card.addEventListener('click', this.handleCardClick.bind(this));
    }
    
    // Button click handlers
    if (this.frontTrigger) {
      this.frontTrigger.addEventListener('click', (e) => {
        e.preventDefault();
        this.flip(true);
      });
    }
    
    if (this.backTrigger) {
      this.backTrigger.addEventListener('click', (e) => {
        e.preventDefault();
        this.flip(false);
      });
    }
    
    // Keyboard navigation
    this.card.addEventListener('keydown', this.handleKeydown.bind(this));
    
    // Listen for preference changes
    this.setupPreferenceListeners();
  }
  
  /**
   * Handle card clicks (primarily for touch devices)
   */
  handleCardClick(e) {
    // Only flip if we're not clicking a button/link
    if (!e.target.closest('button, a, input, select, textarea')) {
      this.flip(!this.isFlipped);
    }
  }
  
  /**
   * Handle keyboard navigation
   */
  handleKeydown(e) {
    // Skip if we're on an interactive element that handles its own keys
    if (e.target.closest('button, a, input, select, textarea')) {
      return;
    }
    
    // Enter or Space to flip
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.flip(!this.isFlipped);
    }
    
    // Escape to flip back
    if (e.key === 'Escape' && this.isFlipped) {
      e.preventDefault();
      this.flip(false);
    }
  }
  
  /**
   * Set up listeners for user preference changes
   */
  setupPreferenceListeners() {
    // Reduced motion preference
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      document.body.classList.toggle('reduced-motion', e.matches);
    });
    
    // Color scheme preference
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      // Handle color scheme change if needed
    });
  }
  
  /**
   * Set up screen reader announcer
   */
  setupScreenReaderAnnouncer() {
    // Check if announcer already exists
    this.announcer = document.getElementById('sr-announcer');
    
    if (!this.announcer) {
      this.announcer = document.createElement('div');
      this.announcer.id = 'sr-announcer';
      this.announcer.className = 'sr-only';
      this.announcer.setAttribute('aria-live', 'polite');
      this.announcer.setAttribute('aria-atomic', 'true');
      document.body.appendChild(this.announcer);
    }
  }
  
  /**
   * Announce a message to screen readers
   */
  announceToScreenReader(message) {
    if (!this.options.announceToScreenReader) return;
    
    this.announcer.textContent = message;
  }
  
  /**
   * Flip the card
   * @param {boolean} shouldFlip - Whether to flip to back (true) or front (false)
   */
  flip(shouldFlip) {
    // Only proceed if we're changing state
    if (shouldFlip === this.isFlipped) return;
    
    // Update state
    this.isFlipped = shouldFlip;
    
    // Update class
    this.card.classList.toggle('flipped', shouldFlip);
    
    // Update ARIA states
    if (this.frontTrigger) {
      this.frontTrigger.setAttribute('aria-expanded', shouldFlip ? 'true' : 'false');
      this.frontTrigger.setAttribute('aria-pressed', shouldFlip ? 'true' : 'false');
    }
    
    if (this.backTrigger) {
      this.backTrigger.setAttribute('aria-expanded', !shouldFlip ? 'true' : 'false');
      this.backTrigger.setAttribute('aria-pressed', !shouldFlip ? 'true' : 'false');
    }
    
    // Update aria-hidden
    this.updateAriaHidden();
    
    // Announce to screen readers
    const cardTitle = this.getCardTitle();
    const message = shouldFlip
      ? `${cardTitle} card flipped to back side`
      : `${cardTitle} card flipped to front side`;
    
    this.announceToScreenReader(message);
    
    // Manage focus
    if (!this.options.disableAutoFocus) {
      this.manageFocus(shouldFlip);
    }
    
    // Dispatch event
    this.card.dispatchEvent(new CustomEvent('cardFlip', {
      bubbles: true,
      detail: { isFlipped: shouldFlip }
    }));
  }
  
  /**
   * Get the card title for announcements
   */
  getCardTitle() {
    // Try to find a heading
    const heading = this.card.querySelector('h2, h3, h4');
    if (heading) return heading.textContent.trim();
    
    // Use aria-label if available
    if (this.card.hasAttribute('aria-label')) {
      return this.card.getAttribute('aria-label');
    }
    
    // Fallback
    return 'Flip';
  }
  
  /**
   * Manage focus when the card flips
   */
  manageFocus(isFlipped) {
    // Wait for the animation to complete
    setTimeout(() => {
      if (isFlipped) {
        // Focus on the first focusable element in the back side
        const backFocusable = this.getFirstFocusableElement(this.backSide);
        if (backFocusable) {
          backFocusable.focus();
        } else {
          this.backSide.setAttribute('tabindex', '-1');
          this.backSide.focus();
        }
      } else {
        // Focus on the first focusable element in the front side
        const frontFocusable = this.getFirstFocusableElement(this.frontSide);
        if (frontFocusable) {
          frontFocusable.focus();
        } else {
          this.frontSide.setAttribute('tabindex', '-1');
          this.frontSide.focus();
        }
      }
    }, 100);
  }
  
  /**
   * Get the first focusable element within a container
   */
  getFirstFocusableElement(container) {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    return focusableElements.length ? focusableElements[0] : null;
  }
  
  /**
   * Set the input method
   * @param {string} method - The input method ('touch', 'mouse', 'keyboard')
   */
  setInputMethod(method) {
    if (['touch', 'mouse', 'keyboard'].includes(method)) {
      this.inputMethod = method;
      this.card.setAttribute('data-input-method', method);
    }
  }
  
  /**
   * Toggle hover behavior
   * @param {boolean} enable - Whether to enable hover
   */
  setHoverEnabled(enable) {
    this.options.enableHover = enable;
    this.card.setAttribute('data-disable-hover', !enable);
  }
  
  /**
   * Initialize all universal cards on the page
   * @param {Object} options - Default options for all cards
   */
  static initAll(options = {}) {
    const cards = document.querySelectorAll('.universal-card');
    return Array.from(cards).map(card => new UniversalFlipCard(card, options));
  }
}

// Auto-initialize if script is loaded in browser
if (typeof window !== 'undefined') {
  window.UniversalFlipCard = UniversalFlipCard;
  
  document.addEventListener('DOMContentLoaded', () => {
    window.universalCards = UniversalFlipCard.initAll();
  });
}