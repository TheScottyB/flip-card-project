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
 * Simplified implementation for Jest compatibility
 */
global.setupTestModules = () => {
  // Define the CardEventTracker class
  global.CardEventTracker = class CardEventTracker {
    constructor(card, options = {}) {
      this.card = card;
      this.options = {
        tokenEndpoint: 'http://localhost:3000/token',
        eventsEndpoint: 'http://localhost:3000/events',
        trackFlips: true,
        trackHover: true,
        trackSession: true,
        enableDataSending: true,
        sendThreshold: 1,
        ...options
      };
      
      this.sessionId = `test-session-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 10)}`;
      this.sessionData = {
        sessionId: this.sessionId,
        interactions: [],
        deviceCapabilities: this.detectCapabilities(),
        sessionStart: Date.now()
      };
      this.lastInteraction = Date.now();
      this.sessionEnded = false;
      
      if (card) {
        this.setupListeners();
      }
      
      console.log(`Card event tracking initialized ${this.sessionId}`);
    }
    
    setupListeners() {
      this.card.addEventListener('cardFlip', this.handleFlip.bind(this));
      this.card.addEventListener('mouseenter', this.handleHoverStart.bind(this));
      this.card.addEventListener('mouseleave', this.handleHoverEnd.bind(this));
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
      return {
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        pointer: window.matchMedia('(pointer: fine)').matches,
        hover: window.matchMedia('(hover: hover)').matches,
        touch: false,
        screen: { width: 1024, height: 768 },
        userAgent: 'Test User Agent',
        language: 'en-US',
        timezone: 'UTC',
        pixelRatio: 1
      };
    }

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
      
      this.sessionData.interactions.push(interaction);
      this.lastInteraction = Date.now();
      
      if (this.sessionData.interactions.length >= this.options.sendThreshold) {
        this.sendData(false);
      }
    }
    
    async sendData(isFinal = false) {
      if (!window.enableCardTracking && !isFinal) {
        return;
      }
      
      if (!this.options.enableDataSending && !isFinal) {
        return;
      }
      
      try {
        const tokenResponse = await fetch(this.options.tokenEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        const { token } = await tokenResponse.json();
        
        await fetch(this.options.eventsEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            event_type: 'card_interaction_event',
            client_payload: {
              ...this.sessionData,
              isFinal
            }
          })
        });
        
        if (!isFinal) {
          this.sessionData.interactions = [];
        }
      } catch (error) {
        console.error('Error sending data:', error);
      }
    }
    
    checkSession() {
      const now = Date.now();
      const timeout = 30 * 60 * 1000; // 30 minutes
      
      if (now - this.lastInteraction > timeout) {
        this.endSession();
        
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
    
    endSession() {
      if (this.sessionEnded) return;
      this.sessionEnded = true;
      this.sessionData.sessionDuration = Date.now() - this.sessionData.sessionStart;
      this.sendData(true);
    }
    
    destroy() {
      this.endSession();
      
      if (this.card) {
        this.card.removeEventListener('cardFlip', this.handleFlip);
        this.card.removeEventListener('mouseenter', this.handleHoverStart);
        this.card.removeEventListener('mouseleave', this.handleHoverEnd);
      }
    }
    
    static trackAll(options = {}) {
      const cards = document.querySelectorAll('.universal-card');
      return Array.from(cards).map(card => new CardEventTracker(card, options));
    }
  };
  
  // Define the UniversalFlipCard class
  global.UniversalFlipCard = class UniversalFlipCard {
    constructor(card, options = {}) {
      this.card = card;
      this.options = {
        flipDuration: 600,
        enableKeyboard: true,
        enableHover: false,
        enableTouch: true,
        autoInit: true,
        ...options
      };
      this.isFlipped = false;
      this.inputMethod = 'click';
    }
    
    flip(shouldFlip) {
      if (typeof shouldFlip === 'boolean') {
        this.isFlipped = shouldFlip;
      } else {
        this.isFlipped = !this.isFlipped;
      }
      
      if (this.card) {
        if (this.isFlipped) {
          this.card.classList.add('flipped');
        } else {
          this.card.classList.remove('flipped');
        }
        
        const event = new CustomEvent('cardFlip', {
          bubbles: true,
          detail: { 
            isFlipped: this.isFlipped,
            inputMethod: this.inputMethod
          }
        });
        
        this.card.dispatchEvent(event);
      }
      
      return this.isFlipped;
    }
    
    setInputMethod(method) {
      this.inputMethod = method;
      return this;
    }
    
    setHoverEnabled(enabled) {
      this.options.enableHover = enabled;
      return this;
    }
    
    static initAll(options = {}) {
      const cards = document.querySelectorAll('.universal-card');
      return Array.from(cards).map(card => new UniversalFlipCard(card, options));
    }
  };
  
  return {
    CardEventTracker: global.CardEventTracker,
    UniversalFlipCard: global.UniversalFlipCard
  };
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
