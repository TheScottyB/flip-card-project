/**
 * Jest setup file for DOM testing
 * This file runs before each test file
 */

// Import required polyfills for older browsers
import 'regenerator-runtime/runtime';
import 'core-js/stable';

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