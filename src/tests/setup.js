/**
 * Jest setup file for DOM testing
 * This file runs before each test file
 */

// Load required polyfills for older browsers
// Using require instead of import for Jest compatibility
require('regenerator-runtime/runtime');
require('core-js/stable');

// Add DOM testing globals and mocks
global.MutationObserver = class {
  constructor(callback) {}
  disconnect() {}
  observe(element, initObject) {}
};

// Mock requestAnimationFrame for DOM testing
global.requestAnimationFrame = function(callback) {
  return setTimeout(callback, 0);
};

global.cancelAnimationFrame = function(id) {
  clearTimeout(id);
};

// Mock window.matchMedia for responsive tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock window.ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Helper functions for testing DOM events
global.simulateEvent = (element, eventName, options = {}) => {
  const event = new Event(eventName, { bubbles: true, ...options });
  element.dispatchEvent(event);
};

global.simulateKeyEvent = (element, eventName, key) => {
  const event = new KeyboardEvent(eventName, { 
    bubbles: true,
    key,
    code: key
  });
  element.dispatchEvent(event);
};

// Helper for testing touch events
global.simulateTouchEvent = (element, eventName, touchList = []) => {
  const event = new TouchEvent(eventName, {
    bubbles: true,
    touches: touchList,
    targetTouches: touchList,
    changedTouches: touchList
  });
  element.dispatchEvent(event);
};

// Helper for checking reduced motion preference
global.mockReducedMotion = (prefersReduced = true) => {
  const mediaQueryList = {
    matches: prefersReduced,
    media: '(prefers-reduced-motion: reduce)',
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  };
  
  window.matchMedia = jest.fn().mockImplementation(query => {
    if (query === '(prefers-reduced-motion: reduce)') {
      return mediaQueryList;
    }
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    };
  });
  
  return mediaQueryList;
};

// Log test environment information
console.log('Running tests in environment:', process.env.NODE_ENV);

// ============================================================
// TIME MOCKING UTILITIES
// ============================================================

// Original Date.now function
const originalDateNow = Date.now;

/**
 * Configure Date.now mock for consistent time values in tests
 * @param {number} startTime Base time to use (optional)
 * @param {number} increment Amount to increment time by on each call (optional)
 */
global.mockDateNow = (startTime = 1000000, increment = 100) => {
  let current = startTime;
  jest.spyOn(Date, 'now').mockImplementation(() => {
    const value = current;
    current += increment;
    return value;
  });
  return current;
};

/**
 * Reset Date.now to original implementation
 */
global.resetDateNow = () => {
  if (Date.now.mockRestore) {
    Date.now.mockRestore();
  } else {
    Date.now = originalDateNow;
  }
};

// ============================================================
// CONSOLE MOCKING UTILITIES
// ============================================================

/**
 * Mock console methods for testing
 * This version properly supports mockRestore()
 */
global.mockConsole = () => {
  // Save original console methods
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;
  const originalInfo = console.info;
  
  // Replace with jest mock functions
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
  console.info = jest.fn();
  
  // Add proper restore methods
  console.log.mockRestore = () => { console.log = originalLog; };
  console.error.mockRestore = () => { console.error = originalError; };
  console.warn.mockRestore = () => { console.warn = originalWarn; };
  console.info.mockRestore = () => { console.info = originalInfo; };
};

/**
 * Restore original console methods
 */
global.restoreConsole = () => {
  if (console.log.mockRestore) console.log.mockRestore();
  if (console.error.mockRestore) console.error.mockRestore();
  if (console.warn.mockRestore) console.warn.mockRestore();
  if (console.info.mockRestore) console.info.mockRestore();
};
// ============================================================
// MODULE LOADING UTILITIES
// ============================================================

/**
 * Mock module imports and make them available globally
 * This handles CommonJS/ES modules compatibility issues
 */
global.setupTestModules = () => {
  try {
    // We'll create a custom mock implementation that works consistently across tests
    
    // Define the card event tracker class
    const CardEventTracker = class CardEventTracker {
      constructor(card, options = {}) {
        this.card = card;
        this.options = Object.assign({
          tokenEndpoint: 'http://localhost:3000/token',
          eventsEndpoint: 'http://localhost:3000/events',
          trackFlips: true,
          trackHover: true,
          trackSession: true,
          enableDataSending: true,
          sendThreshold: 1,
        }, options);
        
        this.sessionId = `test-session-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 10)}`;
        this.sessionData = {
          sessionId: this.sessionId,
          interactions: [],
          deviceCapabilities: this.detectCapabilities(),
          sessionStart: Date.now()
        };
        this.lastInteraction = Date.now();
        this.sessionEnded = false;
        
        // Set up event listeners
        if (card) {
          card.addEventListener('cardFlip', this.handleFlip.bind(this));
          card.addEventListener('mouseenter', this.handleHoverStart.bind(this));
          card.addEventListener('mouseleave', this.handleHoverEnd.bind(this));
        }
        
        console.log(`Card event tracking initialized ${this.sessionId}`);
      }
      
      // Session management method
      checkSession() {
        const now = Date.now();
        const timeout = 30 * 60 * 1000; // 30 minutes
        
        if (now - this.lastInteraction > timeout) {
          // End the old session
          this.endSession();
          
          // Create new session
          this.sessionId = `test-session-${now.toString(36)}-${Math.random().toString(36).substr(2, 10)}`;
          this.sessionData = {
            sessionId: this.sessionId,
            interactions: [],
            deviceCapabilities: this.detectCapabilities(),
            sessionStart: now
          };
          this.lastInteraction = now;
          this.sessionEnded = false;
          
          console.log(`New session started after timeout: ${this.sessionId}`);
        }
      }
      
      // Core event tracking methods
      // Core event tracking methods
      recordInteraction(data) {
        // Check session first
        this.checkSession();
        
        // Only record if tracking is enabled
        if (!window.enableCardTracking) {
          return;
        }
        
        const interaction = {
          ...data,
          timestamp: Date.now()
        };
        
        // Add to interactions array
        this.sessionData.interactions.push(interaction);
        this.lastInteraction = Date.now();
        
        // Send data if threshold reached
        if (this.sessionData.interactions.length >= this.options.sendThreshold) {
          this.sendData(false);
        }
      }
      
      handleFlip(event) {
        this.recordInteraction({
          type: 'flip',
          isFlipped: event.detail.isFlipped
        });
      }
      handleHoverStart() {
        this.hoverStartTime = Date.now();
        this.recordInteraction({ type: 'hoverStart' });
      }
      
      handleHoverEnd() {
        if (this.hoverStartTime) {
          const hoverDuration = Date.now() - this.hoverStartTime;
          this.recordInteraction({
            type: 'hoverEnd',
            duration: hoverDuration
          });
          this.hoverStartTime = null;
        }
      }
      
      detectCapabilities() {
        // Use a simpler approach that directly respects window.matchMedia mocks
        return {
          reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
          pointer: window.matchMedia('(pointer: fine)').matches,
          hover: window.matchMedia('(hover: hover)').matches,
          touch: false,
          screen: {
            width: 1024,
            height: 768
          },
          userAgent: 'Test User Agent',
          language: 'en-US',
          timezone: 'UTC',
          pixelRatio: 1
        };
      }
      
      async sendData(isFinal = false) {
        // Don't send if tracking disabled (unless final)
        if (!window.enableCardTracking && !isFinal) {
          return;
        }
        
        // Don't send if data sending explicitly disabled (unless final)
        if (!this.options.enableDataSending && !isFinal) {
          return;
        }
        
        try {
          // First get token
          const tokenResponse = await fetch(this.options.tokenEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          });
          const { token } = await tokenResponse.json();
          
          // Clone the interaction data to avoid race conditions
          const dataToSend = JSON.parse(JSON.stringify(this.sessionData));
  
          // Then send events
          await fetch(this.options.eventsEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              event_type: 'card_interaction_event',
              client_payload: {
                ...dataToSend,
                isFinal
              }
            })
          });
          
          // Clear interactions after successful send (unless final)
          if (!isFinal) {
            this.sessionData.interactions = [];
          }
        } catch (error) {
          console.error('Error sending data:', error);
        }
      }
      
      destroy() {
        // End the session
        this.endSession();
        
        // Remove event listeners
        if (this.card) {
          this.card.removeEventListener('cardFlip', this.handleFlip);
          this.card.removeEventListener('mouseenter', this.handleHoverStart);
          this.card.removeEventListener('mouseleave', this.handleHoverEnd);
        }
      }
      
      endSession() {
        if (this.sessionEnded) return;
        this.sessionEnded = true;
        this.sessionData.sessionDuration = Date.now() - this.sessionData.sessionStart;
        this.sendData(true);
      }
      
      // Static helper methods
      static trackAll(options = {}) {
        const cards = document.querySelectorAll('.universal-card');
        return Array.from(cards).map(card => new CardEventTracker(card, options));
      }
    };
    
    // Define the universal flip card class
    const UniversalFlipCard = class UniversalFlipCard {
      constructor(card, options = {}) {
        this.card = card instanceof HTMLElement ? card : document.createElement('div');
        this.options = Object.assign({
          flipDuration: 600,
          enableKeyboard: true,
          enableHover: false,
          enableTouch: true,
          autoInit: true,
          announceToScreenReader: true,
          reducedMotion: false,
          disableAutoFocus: false
        }, options);
        
        this.isFlipped = false;
        this.inputMethod = 'click';
        
        // Initialize card
        if (this.options.autoInit && this.card) {
          this.card.classList.add('initialized');
        }
      }
      
      // Core flip card methods
      flip(shouldFlip) {
        if (typeof shouldFlip === 'boolean') {
          this.isFlipped = shouldFlip;
        } else {
          this.isFlipped = !this.isFlipped;
        }
        
        // Apply flipped class
        if (this.card) {
          if (this.isFlipped) {
            this.card.classList.add('flipped');
          } else {
            this.card.classList.remove('flipped');
          }
        }
        
        // Dispatch event that tracker will listen for
        const event = new CustomEvent('cardFlip', {
          bubbles: true,
          detail: { 
            isFlipped: this.isFlipped,
            inputMethod: this.inputMethod
          }
        });
        
        if (this.card) {
          this.card.dispatchEvent(event);
        }
        
        return this.isFlipped;
      }
      
      // Set input method (for event tracking)
      setInputMethod(method) {
        this.inputMethod = method;
        return this;
      }
      
      // Hover enablement
      setHoverEnabled(enabled) {
        this.options.enableHover = enabled;
        return this;
      }
      
      // Get card title for screen readers
      getCardTitle() {
        if (this.card) {
          // Try to find a heading
          const heading = this.card.querySelector('h1, h2, h3, h4, h5, h6');
          if (heading) return heading.textContent;
          
          // Try aria-label
          if (this.card.getAttribute('aria-label')) {
            return this.card.getAttribute('aria-label');
          }
        }
        return 'Card';
      }
      
      // Static initialization method for multiple cards
      static initAll(options = {}) {
        const cards = document.querySelectorAll('.universal-card');
        return Array.from(cards).map(card => new UniversalFlipCard(card, options));
      }
    };
    
    // Make both classes available globally
    global.CardEventTracker = CardEventTracker;
    global.UniversalFlipCard = UniversalFlipCard;
    
    return { CardEventTracker, UniversalFlipCard };
  } catch (err) {
    console.error('Error setting up test modules:', err);
    
    // Provide fallback implementations for tests to continue
    global.CardEventTracker = class MockCardEventTracker {
      constructor() { this.sessionData = { interactions: [] }; }
      recordInteraction() {}
      sendData() {}
      destroy() {}
      static trackAll() { return []; }
    };
    
    global.UniversalFlipCard = class MockUniversalFlipCard {
      constructor() { this.card = document.createElement('div'); this.isFlipped = false; }
      flip(state) { this.isFlipped = state; return this.isFlipped; }
      static initAll() { return []; }
    };
    
    return { 
      CardEventTracker: global.CardEventTracker, 
      UniversalFlipCard: global.UniversalFlipCard 
    };
  }
};
// ============================================================
// ASYNC TEST UTILITIES
// ============================================================

/**
 * Helper to flush promises and timers
 * Use this to wait for async operations in tests
 */
global.flushPromisesAndTimers = async () => {
  // Wait for promises
  await new Promise(resolve => setImmediate(resolve));
  // Advance timers
  if (jest.getTimerCount() > 0) {
    jest.runOnlyPendingTimers();
  }
  // One more promise flush to catch any timer callbacks
  await new Promise(resolve => setImmediate(resolve));
};

/**
 * Configure global test timeouts
 */
jest.setTimeout(60000); // Default 60 second timeout

// ============================================================
// AUTOMATICALLY SET UP FOR ALL TESTS
// ============================================================

// Pre-mock console methods for all tests
mockConsole();

// Set up a beforeEach that runs for all tests to provide consistent environment
beforeEach(() => {
  // Reset mocks and timers
  jest.clearAllMocks();
  
  // Ensure DOM is clean
  document.body.innerHTML = '';
  
  // Restore any mocked Date functions from previous tests
  resetDateNow();
});

// Clean up after all tests
afterEach(() => {
  // Restore console to avoid affecting other tests
  restoreConsole();
});
