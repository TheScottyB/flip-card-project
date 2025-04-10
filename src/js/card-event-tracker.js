/**
 * Card Event Tracker
 * 
 * Client-side event tracking system for Universal Flip Card components 
 * Part of the event-driven multi-agent architecture that runs on GitHub
 */

class CardEventTracker {
  /**
   * Initialize card event tracking
   * @param {HTMLElement|UniversalFlipCard} card - The card element or UniversalFlipCard instance
   * @param {Object} options - Configuration options
   */
  constructor(card, options = {}) {
    // Handle card being a UniversalFlipCard instance or HTMLElement
    this.card = card.card || card;
    this.cardInstance = card.flip ? card : null;
    
    // Default options
    this.options = Object.assign({
      endpointUrl: 'https://api.github.com/app/installations/{installation_id}/webhooks',
      trackFlips: true,
      trackHover: true,
      trackSession: true,
      anonymizeData: true,
      batchInterval: 60000, // 1 minute
      sessionTimeout: 1800000, // 30 minutes
      sendThreshold: 5 // Send after 5 interactions or on session end
    }, options);
    
    // Initialize session data
    this.sessionId = this.generateSessionId();
    this.sessionData = {
      sessionId: this.sessionId,
      interactions: [],
      deviceCapabilities: this.detectCapabilities(),
      sessionStart: Date.now()
    };
    
    // Set up internal state
    this.lastInteraction = Date.now();
    this.sessionEnded = false;
    this.setupListeners();
    
    // Set up timers
    if (this.options.trackSession) {
      this.sessionTimer = setInterval(() => this.checkSession(), 60000); // Check every minute
    }
    
    console.log('Card event tracking initialized', this.sessionId);
  }
  
  /**
   * Generate a unique session ID
   */
  generateSessionId() {
    return 'session-' + 
      Date.now().toString(36) + '-' + 
      Math.random().toString(36).substring(2, 15);
  }
  
  /**
   * Detect device capabilities for data segmentation
   */
  detectCapabilities() {
    return {
      touch: 'ontouchstart' in window,
      pointer: window.matchMedia('(pointer: fine)').matches,
      hover: window.matchMedia('(hover: hover)').matches,
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
      highContrast: window.matchMedia('(prefers-contrast: high)').matches,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      pixelRatio: window.devicePixelRatio || 1,
      connection: navigator.connection ? {
        type: navigator.connection.effectiveType,
        rtt: navigator.connection.rtt,
        downlink: navigator.connection.downlink
      } : null,
      language: navigator.language || navigator.userLanguage,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      userAgent: this.options.anonymizeData ? this.anonymizeUserAgent() : navigator.userAgent
    };
  }
  
  /**
   * Anonymize user agent to remove identifying information
   */
  anonymizeUserAgent() {
    const ua = navigator.userAgent;
    // Extract just the browser name and major version
    let browser = 'Unknown';
    
    if (ua.indexOf('Firefox/') !== -1) {
      browser = 'Firefox';
    } else if (ua.indexOf('Chrome/') !== -1 && ua.indexOf('Edg/') === -1) {
      browser = 'Chrome';
    } else if (ua.indexOf('Safari/') !== -1 && ua.indexOf('Chrome/') === -1) {
      browser = 'Safari';
    } else if (ua.indexOf('Edg/') !== -1) {
      browser = 'Edge';
    } else if (ua.indexOf('MSIE') !== -1 || ua.indexOf('Trident/') !== -1) {
      browser = 'IE';
    }
    
    // Extract just the OS name
    let os = 'Unknown';
    
    if (ua.indexOf('Windows') !== -1) {
      os = 'Windows';
    } else if (ua.indexOf('Mac OS X') !== -1) {
      os = 'macOS';
    } else if (ua.indexOf('Linux') !== -1) {
      os = 'Linux';
    } else if (ua.indexOf('Android') !== -1) {
      os = 'Android';
    } else if (ua.indexOf('iOS') !== -1 || ua.indexOf('iPhone') !== -1 || ua.indexOf('iPad') !== -1) {
      os = 'iOS';
    }
    
    return `${browser} - ${os}`;
  }
  
  /**
   * Set up event listeners for the card
   */
  setupListeners() {
    // Listen for flip events from the card
    if (this.options.trackFlips) {
      this.card.addEventListener('cardFlip', this.handleFlip.bind(this));
    }
    
    // Track hover events if enabled
    if (this.options.trackHover) {
      this.card.addEventListener('mouseenter', this.handleHoverStart.bind(this));
      this.card.addEventListener('mouseleave', this.handleHoverEnd.bind(this));
    }
    
    // Listen for touch events
    this.card.addEventListener('touchstart', this.handleTouch.bind(this));
    
    // Track session end
    window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
  }
  
  /**
   * Handle card flip events
   */
  handleFlip(event) {
    // Record the flip interaction
    this.recordInteraction({
      type: 'flip',
      isFlipped: event.detail.isFlipped,
      triggerMethod: this.cardInstance ? this.cardInstance.inputMethod : 'unknown'
    });
  }
  
  /**
   * Handle hover start event
   */
  handleHoverStart(event) {
    this.hoverStartTime = Date.now();
    
    // Record hover start
    this.recordInteraction({
      type: 'hoverStart'
    });
  }
  
  /**
   * Handle hover end event
   */
  handleHoverEnd(event) {
    // Only record if we have a start time
    if (this.hoverStartTime) {
      const hoverDuration = Date.now() - this.hoverStartTime;
      
      // Record hover end with duration
      this.recordInteraction({
        type: 'hoverEnd',
        duration: hoverDuration
      });
      
      this.hoverStartTime = null;
    }
  }
  
  /**
   * Handle touch events
   */
  handleTouch(event) {
    // Record touch interaction
    this.recordInteraction({
      type: 'touch',
      touchPoints: event.touches.length
    });
  }
  
  /**
   * Handle page unload event
   */
  handleBeforeUnload(event) {
    // Complete the session and send data
    this.endSession();
  }
  
  /**
   * Record an interaction
   */
  recordInteraction(data) {
    // Update last interaction time
    this.lastInteraction = Date.now();
    
    // Add timestamp to the data
    const interaction = {
      ...data,
      timestamp: Date.now()
    };
    
    // Add to session data
    this.sessionData.interactions.push(interaction);
    
    // Check if we should send a batch
    if (this.sessionData.interactions.length >= this.options.sendThreshold) {
      this.sendData();
    }
  }
  
  /**
   * Check if the session has timed out
   */
  checkSession() {
    const now = Date.now();
    const timeSinceLastInteraction = now - this.lastInteraction;
    
    // If no interaction for sessionTimeout, end the session
    if (timeSinceLastInteraction > this.options.sessionTimeout) {
      this.endSession();
      return;
    }
  }
  
  /**
   * End the current session
   */
  endSession() {
    // Only end once
    if (this.sessionEnded) return;
    
    // Mark session as ended
    this.sessionEnded = true;
    
    // Clear any timers
    if (this.sessionTimer) {
      clearInterval(this.sessionTimer);
    }
    
    // Calculate session duration
    this.sessionData.sessionDuration = Date.now() - this.sessionData.sessionStart;
    
    // Send the final data
    this.sendData(true);
    
    console.log('Card event tracking session ended', this.sessionId);
  }
  
  /**
   * Send collected data to the endpoint
   */
  sendData(isFinal = false) {
    // Clone the current data to avoid race conditions
    const dataToSend = JSON.parse(JSON.stringify(this.sessionData));
    
    // Add flag indicating if this is the final batch for this session
    dataToSend.isFinal = isFinal;
    
    // In a real implementation, we would use the GitHub App JWT token
    // For demo purposes, we'll just log the data
    if (window.debugCardEvents) {
      console.log('Card event data:', dataToSend);
    }
    
    // In a real implementation:
    /*
    fetch(this.options.endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getJWT()}`
      },
      body: JSON.stringify({
        event_type: 'card_interaction_event',
        client_payload: dataToSend
      })
    }).catch(err => console.error('Failed to send card event data:', err));
    */
    
    // Reset interactions array if this isn't the final send
    // to avoid sending duplicate data
    if (!isFinal) {
      this.sessionData.interactions = [];
    }
  }
  
  /**
   * Initialize tracking for all cards on the page
   * @param {Object} options - Configuration options
   */
  static trackAll(options = {}) {
    // Find all Universal Flip Cards
    const cards = document.querySelectorAll('.universal-card');
    
    // Create trackers for each card
    return Array.from(cards).map(card => new CardEventTracker(card, options));
  }
  
  /**
   * Clean up event listeners and timers
   */
  destroy() {
    // End the session
    this.endSession();
    
    // Remove event listeners
    if (this.options.trackFlips) {
      this.card.removeEventListener('cardFlip', this.handleFlip);
    }
    
    if (this.options.trackHover) {
      this.card.removeEventListener('mouseenter', this.handleHoverStart);
      this.card.removeEventListener('mouseleave', this.handleHoverEnd);
    }
    
    this.card.removeEventListener('touchstart', this.handleTouch);
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
    
    console.log('Card event tracking destroyed', this.sessionId);
  }
}

// Export the tracker
if (typeof module !== 'undefined') {
  module.exports = CardEventTracker;
} else if (typeof window !== 'undefined') {
  window.CardEventTracker = CardEventTracker;
  
  // Auto-initialize if debug mode is enabled
  if (window.debugCardEvents) {
    document.addEventListener('DOMContentLoaded', () => {
      window.cardTrackers = CardEventTracker.trackAll();
    });
  }
}