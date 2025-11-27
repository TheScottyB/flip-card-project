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
 * - Voice control using Web Speech API
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
      customBackTriggerLabel: null,
      enableVoiceControl: false,
      voiceCommands: {
        flip: ['flip', 'turn', 'rotate'],
        flipBack: ['back', 'return', 'front']
      }
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

    // Initialize card state
    this.isFlipped = this.card.classList.contains('flipped');

    // Set up ARIA attributes
    this.setupAria();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Set up screen reader announcer
    this.setupScreenReaderAnnouncer();
    
    // Initialize voice control if enabled
    if (this.options.enableVoiceControl) {
      this.setupVoiceControl();
    }
    
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
   * @param {string} method - The input method ('touch', 'mouse', 'keyboard', 'voice')
   */
  setInputMethod(method) {
    if (['touch', 'mouse', 'keyboard', 'voice'].includes(method)) {
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
   * Set up voice control
   */
  setupVoiceControl() {
    // Check if Web Speech API is supported
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Universal Flip Card: Web Speech API is not supported in this browser');
      return;
    }

    // Create speech recognition instance
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    
    // Configure speech recognition
    this.recognition.continuous = true;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-US';
    
    // Set up result handler
    this.recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript.trim().toLowerCase();
      
      // Process voice commands
      this.processVoiceCommand(transcript);
    };
    
    // Handle errors
    this.recognition.onerror = (event) => {
      console.warn('Universal Flip Card: Speech recognition error', event.error);
    };
    
    // Restart if it stops
    this.recognition.onend = () => {
      if (this.options.enableVoiceControl) {
        this.recognition.start();
      }
    };
    
    // Start recognition
    try {
      this.recognition.start();
      
      // Set input method to voice
      this.setInputMethod('voice');
      
      // Add visual indicator for voice control
      this.addVoiceControlIndicator();
    } catch (err) {
      console.error('Universal Flip Card: Failed to start speech recognition', err);
    }
  }
  
  /**
   * Process voice commands
   * @param {string} transcript - The recognized speech transcript
   */
  processVoiceCommand(transcript) {
    // Check if the transcript contains any flip commands
    const hasFlipCommand = this.options.voiceCommands.flip.some(cmd => 
      transcript.includes(cmd));
    
    // Check if the transcript contains any flip back commands
    const hasFlipBackCommand = this.options.voiceCommands.flipBack.some(cmd => 
      transcript.includes(cmd));
    
    // Execute the command
    if (!this.isFlipped && hasFlipCommand) {
      this.flip(true);
      this.announceToScreenReader('Card flipped by voice command');
    } else if (this.isFlipped && hasFlipBackCommand) {
      this.flip(false);
      this.announceToScreenReader('Card flipped back by voice command');
    }
  }
  
  /**
   * Add a visual indicator for voice control
   */
  addVoiceControlIndicator() {
    // Create indicator if it doesn't exist
    if (!document.getElementById('voice-control-indicator')) {
      const indicator = document.createElement('div');
      indicator.id = 'voice-control-indicator';
      indicator.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: rgba(59, 130, 246, 0.9);
        color: white;
        padding: 8px 12px;
        border-radius: 20px;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 8px;
        z-index: 1000;
      `;
      
      indicator.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 15.5C14.21 15.5 16 13.71 16 11.5V6C16 3.79 14.21 2 12 2C9.79 2 8 3.79 8 6V11.5C8 13.71 9.79 15.5 12 15.5Z" fill="white"/>
          <path d="M4.03 12.03C3.87 12.03 3.7 12 3.54 11.92C3.15 11.73 2.97 11.3 3.16 10.91C3.5 10.07 4 9.32 4.63 8.69C5.28 8.04 6.05 7.52 6.9 7.13C7.29 6.95 7.72 7.13 7.9 7.52C8.08 7.91 7.91 8.34 7.52 8.52C6.86 8.83 6.24 9.26 5.73 9.77C5.23 10.27 4.81 10.88 4.5 11.54C4.37 11.85 4.2 12.03 4.03 12.03Z" fill="white"/>
          <path d="M19.97 12.03C19.8 12.03 19.63 11.96 19.5 11.82C19.31 11.67 19.2 11.43 19.2 11.19C19.19 10.94 19.28 10.7 19.45 10.53C19.95 10.03 20.36 9.42 20.65 8.76C20.83 8.37 21.26 8.19 21.65 8.37C22.04 8.55 22.22 8.98 22.04 9.37C21.66 10.22 21.13 10.98 20.48 11.63C20.34 11.77 20.2 11.88 20.02 11.95C20.02 11.96 20 11.96 19.99 11.97C19.98 11.97 19.97 11.97 19.96 11.97C19.96 11.97 19.97 11.97 19.96 11.97C19.96 11.97 19.97 12.03 19.97 12.03Z" fill="white"/>
          <path d="M12 19.75C9.48 19.75 7.12 18.8 5.36 17.04C4.98 16.66 4.98 16.03 5.36 15.65C5.74 15.27 6.37 15.27 6.75 15.65C10.3 19.2 16.32 18.5 19.05 15.77C19.43 15.39 20.06 15.39 20.44 15.77C20.82 16.15 20.82 16.78 20.44 17.16C18.81 18.79 16.54 19.75 14.12 19.75C13.38 19.75 12.68 19.67 12 19.52" fill="white"/>
          <path d="M12 22C11.59 22 11.25 21.66 11.25 21.25V19.5C11.25 19.09 11.59 18.75 12 18.75C12.41 18.75 12.75 19.09 12.75 19.5V21.25C12.75 21.66 12.41 22 12 22Z" fill="white"/>
        </svg>
        Voice Control Active
      `;
      
      document.body.appendChild(indicator);
    }
  }
  
  /**
   * Enable or disable voice control
   * @param {boolean} enable - Whether to enable voice control
   */
  setVoiceControlEnabled(enable) {
    this.options.enableVoiceControl = enable;
    
    if (enable && !this.recognition) {
      this.setupVoiceControl();
    } else if (!enable && this.recognition) {
      this.recognition.stop();
      
      // Remove voice control indicator
      const indicator = document.getElementById('voice-control-indicator');
      if (indicator) {
        indicator.remove();
      }
    }
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