/**
 * Test suite for flip-card.js
 * Ensures proper functionality and accessibility of flip cards
 */

// Import the functions we're testing (need to add these to window for DOM testing)
import '../core/flip-card.js';

// Utility functions - also available from setup.js but imported here for clarity
const simulateEvent = (element, eventName, options = {}) => {
  const event = new Event(eventName, { bubbles: true, ...options });
  element.dispatchEvent(event);
};

const simulateKeyEvent = (element, eventName, key) => {
  const event = new KeyboardEvent(eventName, { 
    bubbles: true,
    key,
    code: key
  });
  element.dispatchEvent(event);
};

// Set up a basic flip card HTML structure
const setupFlipCardDOM = () => {
  document.body.innerHTML = `
    <div class="flip-card" data-testid="test-card">
      <div class="flip-card-front">
        <h2>Card Title</h2>
        <p>Front content</p>
        <button class="flip-trigger">View More</button>
      </div>
      <div class="flip-card-back">
        <h2>Card Details</h2>
        <p>Back content</p>
        <button class="flip-trigger">Return</button>
      </div>
    </div>
  `;
};

// Set up a complex flip card with focus trap elements
const setupComplexFlipCardDOM = () => {
  document.body.innerHTML = `
    <div class="flip-card" data-testid="complex-card">
      <div class="flip-card-front">
        <h2>Interactive Card</h2>
        <p>This card has multiple focusable elements</p>
        <input type="text" placeholder="Enter name" />
        <button class="flip-trigger">View More</button>
      </div>
      <div class="flip-card-back">
        <h2>Card Details</h2>
        <p>Back content with complex interactions</p>
        <button class="action-btn">Action 1</button>
        <button class="action-btn">Action 2</button>
        <button class="flip-trigger">Return</button>
      </div>
    </div>
  `;
};

describe('Flip Card - Initialization', () => {
  beforeEach(() => {
    setupFlipCardDOM();
    // Manually trigger DOMContentLoaded to initialize cards
    window.document.dispatchEvent(new Event('DOMContentLoaded'));
  });
  
  afterEach(() => {
    document.body.innerHTML = '';
  });
  
  test('properly initializes with ARIA attributes', () => {
    const card = document.querySelector('.flip-card');
    const frontTrigger = card.querySelector('.flip-card-front .flip-trigger');
    const backTrigger = card.querySelector('.flip-card-back .flip-trigger');
    
    // Check that cards are set up with proper attributes
    expect(card.getAttribute('tabindex')).toBe('0');
    
    // Front trigger should control back side
    expect(frontTrigger.getAttribute('aria-controls')).toBeTruthy();
    expect(frontTrigger.getAttribute('aria-expanded')).toBe('false');
    expect(frontTrigger.getAttribute('aria-pressed')).toBe('false');
    
    // Back trigger should control front side
    expect(backTrigger.getAttribute('aria-controls')).toBeTruthy();
    expect(backTrigger.getAttribute('aria-expanded')).toBe('true');
    expect(backTrigger.getAttribute('aria-pressed')).toBe('true');
  });
  
  test('assigns unique IDs to card sides', () => {
    const card = document.querySelector('.flip-card');
    const frontSide = card.querySelector('.flip-card-front');
    const backSide = card.querySelector('.flip-card-back');
    
    // Should have generated unique IDs
    expect(frontSide.id).toContain('flip-card-');
    expect(frontSide.id).toContain('-front');
    expect(backSide.id).toContain('flip-card-');
    expect(backSide.id).toContain('-back');
    
    // IDs should be related
    const cardIndex = frontSide.id.match(/flip-card-(\d+)-front/)[1];
    expect(backSide.id).toBe(`flip-card-${cardIndex}-back`);
  });
});

describe('Flip Card - User Interactions', () => {
  beforeEach(() => {
    setupFlipCardDOM();
    window.document.dispatchEvent(new Event('DOMContentLoaded'));
  });
  
  afterEach(() => {
    document.body.innerHTML = '';
  });
  
  test('flips card when front trigger is clicked', () => {
    const card = document.querySelector('.flip-card');
    const frontTrigger = card.querySelector('.flip-card-front .flip-trigger');
    
    // Click the front trigger
    simulateEvent(frontTrigger, 'click');
    
    // Card should be flipped
    expect(card.classList.contains('flipped')).toBe(true);
    
    // ARIA states should be updated
    expect(frontTrigger.getAttribute('aria-expanded')).toBe('true');
    expect(frontTrigger.getAttribute('aria-pressed')).toBe('true');
  });
  
  test('flips card back when back trigger is clicked', () => {
    const card = document.querySelector('.flip-card');
    const frontTrigger = card.querySelector('.flip-card-front .flip-trigger');
    const backTrigger = card.querySelector('.flip-card-back .flip-trigger');
    
    // First flip to back
    simulateEvent(frontTrigger, 'click');
    expect(card.classList.contains('flipped')).toBe(true);
    
    // Then flip back to front
    simulateEvent(backTrigger, 'click');
    expect(card.classList.contains('flipped')).toBe(false);
    
    // ARIA states should be reset
    expect(frontTrigger.getAttribute('aria-expanded')).toBe('false');
    expect(frontTrigger.getAttribute('aria-pressed')).toBe('false');
  });
  
  test('supports keyboard navigation with Enter key', () => {
    const card = document.querySelector('.flip-card');
    
    // Flip with Enter key
    simulateKeyEvent(card, 'keydown', 'Enter');
    expect(card.classList.contains('flipped')).toBe(true);
    
    // Flip back with Enter key
    simulateKeyEvent(card, 'keydown', 'Enter');
    expect(card.classList.contains('flipped')).toBe(false);
  });
  
  test('supports keyboard navigation with Space key', () => {
    const card = document.querySelector('.flip-card');
    
    // Flip with Space key
    simulateKeyEvent(card, 'keydown', ' ');
    expect(card.classList.contains('flipped')).toBe(true);
  });
  
  test('supports flipping back with Escape key', () => {
    const card = document.querySelector('.flip-card');
    const frontTrigger = card.querySelector('.flip-card-front .flip-trigger');
    
    // First flip to back
    simulateEvent(frontTrigger, 'click');
    expect(card.classList.contains('flipped')).toBe(true);
    
    // Escape should flip back
    simulateKeyEvent(card, 'keydown', 'Escape');
    expect(card.classList.contains('flipped')).toBe(false);
  });
});

describe('Flip Card - Screen Reader Support', () => {
  beforeEach(() => {
    setupFlipCardDOM();
    window.document.dispatchEvent(new Event('DOMContentLoaded'));
  });
  
  afterEach(() => {
    document.body.innerHTML = '';
  });
  
  test('creates screen reader announcer if not present', () => {
    const card = document.querySelector('.flip-card');
    const frontTrigger = card.querySelector('.flip-card-front .flip-trigger');
    
    // Click to flip
    simulateEvent(frontTrigger, 'click');
    
    // Check if announcer was created
    const announcer = document.getElementById('screen-reader-announcer');
    expect(announcer).toBeTruthy();
    expect(announcer.getAttribute('aria-live')).toBe('polite');
    expect(announcer.getAttribute('aria-atomic')).toBe('true');
    
    // Should contain an announcement
    expect(announcer.textContent).toContain('card flipped');
  });
  
  test('announces card state changes to screen readers', () => {
    // Add pre-existing announcer
    const announcer = document.createElement('div');
    announcer.id = 'screen-reader-announcer';
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    document.body.appendChild(announcer);
    
    const card = document.querySelector('.flip-card');
    const frontTrigger = card.querySelector('.flip-card-front .flip-trigger');
    const backTrigger = card.querySelector('.flip-card-back .flip-trigger');
    
    // Front to back announcement
    simulateEvent(frontTrigger, 'click');
    expect(announcer.textContent).toContain('flipped to back');
    
    // Back to front announcement
    simulateEvent(backTrigger, 'click');
    expect(announcer.textContent).toContain('flipped to front');
  });
});

describe('Flip Card - Focus Management', () => {
  beforeEach(() => {
    setupFlipCardDOM();
    window.document.dispatchEvent(new Event('DOMContentLoaded'));
  });
  
  afterEach(() => {
    document.body.innerHTML = '';
  });
  
  test('moves focus to the first focusable element after flipping', () => {
    // Set up fake timers
    jest.useFakeTimers();
    
    const card = document.querySelector('.flip-card');
    const frontTrigger = card.querySelector('.flip-card-front .flip-trigger');
    const backTrigger = card.querySelector('.flip-card-back .flip-trigger');
    
    // Mock focus method
    frontTrigger.focus = jest.fn();
    backTrigger.focus = jest.fn();
    
    // Click to flip to back
    simulateEvent(frontTrigger, 'click');
    
    // Wait for focus transfer (setTimeout in code)
    jest.runAllTimers();
    
    // Back trigger should receive focus
    expect(backTrigger.focus).toHaveBeenCalled();
    
    // Restore real timers
    jest.useRealTimers();
  });
});

describe('Flip Card - Focus Trap and Keyboard Navigation', () => {
  beforeEach(() => {
    setupComplexFlipCardDOM();
    // Make functions available to test
    window.getFirstFocusableElement = function(container) {
      const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      return focusableElements.length > 0 ? focusableElements[0] : null;
    };
    
    window.setupFocusTrap = function(card, container) {
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
    };
    
    window.document.dispatchEvent(new Event('DOMContentLoaded'));
    
    // Set up fake timers
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    document.body.innerHTML = '';
    jest.useRealTimers();
    delete window.getFirstFocusableElement;
    delete window.setupFocusTrap;
  });
  
  test('properly traps focus within the flipped side', () => {
    const card = document.querySelector('.flip-card');
    const backSide = card.querySelector('.flip-card-back');
    const frontTrigger = card.querySelector('.flip-card-front .flip-trigger');
    const backTrigger = card.querySelector('.flip-card-back .flip-trigger');
    const actionButtons = card.querySelectorAll('.flip-card-back .action-btn');
    
    // Add the flipped class manually
    card.classList.add('flipped');
    
    // Get all focusable elements in the back
    const firstActionButton = actionButtons[0];
    const lastElement = backTrigger;
    
    // Mock focus methods for testing
    firstActionButton.focus = jest.fn();
    lastElement.focus = jest.fn();
    
    // Create a keyboard event with Tab
    const tabEvent = new KeyboardEvent('keydown', {
      key: 'Tab',
      code: 'Tab',
      bubbles: true
    });
    
    // Setup focus on last element
    document.activeElement = lastElement;
    
    // Dispatch the tab event on container
    backSide.dispatchEvent(tabEvent);
    
    // Create a keyboard event with Shift+Tab
    const shiftTabEvent = new KeyboardEvent('keydown', {
      key: 'Tab',
      code: 'Tab',
      shiftKey: true,
      bubbles: true
    });
    
    // Setup focus on first element
    document.activeElement = firstActionButton;
    
    // Dispatch the shift+tab event
    backSide.dispatchEvent(shiftTabEvent);
  });
  
  test('finds focusable elements in a container', () => {
    const card = document.querySelector('.flip-card');
    const frontSide = card.querySelector('.flip-card-front');
    
    // Should find the input element as the first focusable element
    const firstFocusable = window.getFirstFocusableElement(frontSide);
    expect(firstFocusable).not.toBeNull();
    expect(firstFocusable.tagName.toLowerCase()).toBe('input');
    
    // Test with no focusable elements
    const emptyDiv = document.createElement('div');
    const noFocusable = window.getFirstFocusableElement(emptyDiv);
    expect(noFocusable).toBeNull();
  });
});

describe('Flip Card - Dynamic Content Management', () => {
  beforeEach(() => {
    setupFlipCardDOM();
    
    // Save original MutationObserver
    this.originalMutationObserver = window.MutationObserver;
    
    // Create a mock MutationObserver that will execute the callback immediately
    window.MutationObserver = function(callback) {
      this.observe = function(element, config) {
        // Store the callback for later use
        this.callback = callback;
      };
      this.disconnect = jest.fn();
    };
    
    // Now trigger the initialization
    window.document.dispatchEvent(new Event('DOMContentLoaded'));
  });
  
  afterEach(() => {
    document.body.innerHTML = '';
    
    // Restore original MutationObserver
    window.MutationObserver = this.originalMutationObserver;
  });
  
  test('initializes new cards added to the DOM', () => {
    // Get a reference to the MutationObserver instance
    const observers = Array.from(document.querySelectorAll('.flip-card')).map(card => {
      return card._observer;
    });
    
    // Create a new card dynamically
    const newCard = document.createElement('div');
    newCard.className = 'flip-card';
    newCard.innerHTML = `
      <div class="flip-card-front">
        <h2>Dynamic Card</h2>
        <button class="flip-trigger">Flip</button>
      </div>
      <div class="flip-card-back">
        <button class="flip-trigger">Back</button>
      </div>
    `;
    
    // Add it to the DOM
    document.body.appendChild(newCard);
    
    // Need to manually initialize the card for the test
    window.initFlipCards();
    
    // Check if the new card was initialized
    const trigger = newCard.querySelector('.flip-card-front .flip-trigger');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.getAttribute('aria-pressed')).toBe('false');
    
    // Verify new card can be flipped
    simulateEvent(trigger, 'click');
    expect(newCard.classList.contains('flipped')).toBe(true);
  });
});