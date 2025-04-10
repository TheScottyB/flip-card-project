/**
 * Test suite for universal-flip-card.js
 * Tests the enhanced class-based implementation with all features
 */

// Import the class we're testing
import '../core/universal-flip-card.js';

// Utility functions for testing
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

// Set up universal card DOM structure
const setupUniversalCardDOM = () => {
  document.body.innerHTML = `
    <div id="card-1" class="universal-card">
      <div class="universal-card-inner">
        <div class="universal-card-front">
          <h2>Card Title</h2>
          <p>Front content</p>
          <button class="flip-trigger">View Details</button>
        </div>
        <div class="universal-card-back">
          <h2>Card Details</h2>
          <p>Back content with more information</p>
          <button class="flip-trigger">Back to Front</button>
        </div>
      </div>
    </div>
  `;
};

// Simple mock for speech recognition
class MockSpeechRecognition {
  constructor() {
    this.onresult = null;
    this.onerror = null;
    this.onend = null;
    this.continuous = false;
    this.interimResults = false;
    this.lang = '';
  }
  
  start() {}
  stop() {}
  
  // Helper to simulate speech recognition results
  simulateResult(transcript) {
    if (this.onresult) {
      const mockResult = {
        results: [
          [
            {
              transcript: transcript,
              confidence: 0.9
            }
          ]
        ]
      };
      mockResult.results.length = 1;
      this.onresult(mockResult);
    }
  }
}

describe('UniversalFlipCard - Initialization & Configuration', () => {
  beforeEach(() => {
    setupUniversalCardDOM();
    // Make the UniversalFlipCard class available to tests
    global.UniversalFlipCard = window.UniversalFlipCard;
  });
  
  afterEach(() => {
    document.body.innerHTML = '';
  });
  
  test('initializes with default options', () => {
    const cardElement = document.getElementById('card-1');
    const card = new UniversalFlipCard(cardElement);
    
    // Check default properties
    expect(card.options.enableHover).toBe(true);
    expect(card.options.announceToScreenReader).toBe(true);
    expect(card.options.enableVoiceControl).toBe(false);
    expect(card.isFlipped).toBe(false);
  });
  
  test('accepts custom options', () => {
    const cardElement = document.getElementById('card-1');
    const customOptions = {
      enableHover: false,
      customFrontTriggerLabel: 'Show More',
      customBackTriggerLabel: 'Go Back'
    };
    
    const card = new UniversalFlipCard(cardElement, customOptions);
    
    expect(card.options.enableHover).toBe(false);
    expect(card.options.customFrontTriggerLabel).toBe('Show More');
    expect(card.options.customBackTriggerLabel).toBe('Go Back');
    expect(card.options.announceToScreenReader).toBe(true); // Default value
  });
  
  test('generates unique IDs if not present', () => {
    // Remove the ID to test generation
    const cardElement = document.getElementById('card-1');
    cardElement.removeAttribute('id');
    
    const card = new UniversalFlipCard(cardElement);
    
    // Should have generated an ID
    expect(cardElement.id).toMatch(/universal-card-\d+/);
    expect(card.frontSide.id).toContain(cardElement.id + '-front');
    expect(card.backSide.id).toContain(cardElement.id + '-back');
  });
  
  test('preserves existing IDs', () => {
    const cardElement = document.getElementById('card-1');
    const frontSide = cardElement.querySelector('.universal-card-front');
    const backSide = cardElement.querySelector('.universal-card-back');
    
    // Add explicit IDs
    frontSide.id = 'custom-front-id';
    backSide.id = 'custom-back-id';
    
    const card = new UniversalFlipCard(cardElement);
    
    // Should keep the existing IDs
    expect(frontSide.id).toBe('custom-front-id');
    expect(backSide.id).toBe('custom-back-id');
  });
});

describe('UniversalFlipCard - Device Capability Detection', () => {
  beforeEach(() => {
    setupUniversalCardDOM();
    global.UniversalFlipCard = window.UniversalFlipCard;
    
    // Reset matchMedia mocks
    window.matchMedia = jest.fn().mockImplementation(query => {
      return {
        matches: false,
        media: query,
        onchange: null,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn()
      };
    });
  });
  
  afterEach(() => {
    document.body.innerHTML = '';
  });
  
  test('detects touch capabilities', () => {
    // Mock touch device
    global.ontouchstart = jest.fn();
    
    const cardElement = document.getElementById('card-1');
    const card = new UniversalFlipCard(cardElement);
    
    expect(card.capabilities.touch).toBe(true);
  });
  
  test('detects hover capabilities', () => {
    // Mock hover-capable device
    window.matchMedia = jest.fn().mockImplementation(query => {
      if (query === '(hover: hover)') {
        return { 
          matches: true,
          media: query,
          addEventListener: jest.fn(),
          removeEventListener: jest.fn()
        };
      }
      return { 
        matches: false,
        media: query,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn()
      };
    });
    
    const cardElement = document.getElementById('card-1');
    const card = new UniversalFlipCard(cardElement);
    
    expect(card.capabilities.hover).toBe(true);
  });
  
  test('detects reduced motion preference', () => {
    // Mock reduced motion preference
    window.matchMedia = jest.fn().mockImplementation(query => {
      if (query === '(prefers-reduced-motion: reduce)') {
        return { 
          matches: true,
          media: query,
          addEventListener: jest.fn(),
          removeEventListener: jest.fn()
        };
      }
      return { 
        matches: false,
        media: query,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn()
      };
    });
    
    const cardElement = document.getElementById('card-1');
    const card = new UniversalFlipCard(cardElement);
    
    expect(card.capabilities.reducedMotion).toBe(true);
    expect(document.body.classList.contains('reduced-motion')).toBe(true);
  });
});

describe('UniversalFlipCard - ARIA Accessibility', () => {
  beforeEach(() => {
    setupUniversalCardDOM();
    global.UniversalFlipCard = window.UniversalFlipCard;
  });
  
  afterEach(() => {
    document.body.innerHTML = '';
  });
  
  test('sets up ARIA attributes correctly', () => {
    const cardElement = document.getElementById('card-1');
    const card = new UniversalFlipCard(cardElement);
    
    const frontTrigger = cardElement.querySelector('.universal-card-front .flip-trigger');
    const backTrigger = cardElement.querySelector('.universal-card-back .flip-trigger');
    
    // Card should be focusable
    expect(cardElement.getAttribute('tabindex')).toBe('0');
    
    // Front trigger controls back side
    expect(frontTrigger.getAttribute('aria-controls')).toBe(card.backSide.id);
    expect(frontTrigger.getAttribute('aria-expanded')).toBe('false');
    expect(frontTrigger.getAttribute('aria-pressed')).toBe('false');
    
    // Back trigger controls front side
    expect(backTrigger.getAttribute('aria-controls')).toBe(card.frontSide.id);
    expect(backTrigger.getAttribute('aria-expanded')).toBe('true');
    expect(backTrigger.getAttribute('aria-pressed')).toBe('true');
  });
  
  test('sets up aria-hidden correctly', () => {
    const cardElement = document.getElementById('card-1');
    const card = new UniversalFlipCard(cardElement);
    
    // Initially, back should be hidden
    expect(card.frontSide.getAttribute('aria-hidden')).toBe('false');
    expect(card.backSide.getAttribute('aria-hidden')).toBe('true');
    
    // After flipping, front should be hidden
    card.flip(true);
    expect(card.frontSide.getAttribute('aria-hidden')).toBe('true');
    expect(card.backSide.getAttribute('aria-hidden')).toBe('false');
  });
  
  test('sets up custom ARIA labels', () => {
    const cardElement = document.getElementById('card-1');
    const options = {
      customFrontTriggerLabel: 'Show Details',
      customBackTriggerLabel: 'Return to Summary'
    };
    
    const card = new UniversalFlipCard(cardElement, options);
    
    const frontTrigger = cardElement.querySelector('.universal-card-front .flip-trigger');
    const backTrigger = cardElement.querySelector('.universal-card-back .flip-trigger');
    
    expect(frontTrigger.getAttribute('aria-label')).toBe('Show Details');
    expect(backTrigger.getAttribute('aria-label')).toBe('Return to Summary');
  });
});

describe('UniversalFlipCard - User Interactions', () => {
  beforeEach(() => {
    setupUniversalCardDOM();
    global.UniversalFlipCard = window.UniversalFlipCard;
  });
  
  afterEach(() => {
    document.body.innerHTML = '';
  });
  
  test('flips when front trigger is clicked', () => {
    const cardElement = document.getElementById('card-1');
    const card = new UniversalFlipCard(cardElement);
    const frontTrigger = cardElement.querySelector('.universal-card-front .flip-trigger');
    
    simulateEvent(frontTrigger, 'click');
    
    expect(card.isFlipped).toBe(true);
    expect(cardElement.classList.contains('flipped')).toBe(true);
  });
  
  test('flips back when back trigger is clicked', () => {
    const cardElement = document.getElementById('card-1');
    const card = new UniversalFlipCard(cardElement);
    const frontTrigger = cardElement.querySelector('.universal-card-front .flip-trigger');
    const backTrigger = cardElement.querySelector('.universal-card-back .flip-trigger');
    
    // First flip to back
    simulateEvent(frontTrigger, 'click');
    expect(card.isFlipped).toBe(true);
    
    // Then flip to front
    simulateEvent(backTrigger, 'click');
    expect(card.isFlipped).toBe(false);
    expect(cardElement.classList.contains('flipped')).toBe(false);
  });
  
  test('handles keyboard interactions', () => {
    const cardElement = document.getElementById('card-1');
    const card = new UniversalFlipCard(cardElement);
    
    // Enter key should flip
    simulateKeyEvent(cardElement, 'keydown', 'Enter');
    expect(card.isFlipped).toBe(true);
    
    // Escape key should flip back
    simulateKeyEvent(cardElement, 'keydown', 'Escape');
    expect(card.isFlipped).toBe(false);
    
    // Space key should flip
    simulateKeyEvent(cardElement, 'keydown', ' ');
    expect(card.isFlipped).toBe(true);
  });
  
  test('handles card click on touch devices', () => {
    // Set up as touch device
    global.ontouchstart = {};
    window.matchMedia = jest.fn().mockImplementation(query => {
      return {
        matches: query === '(pointer: fine)' ? false : true,
        media: query,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn()
      };
    });
    
    const cardElement = document.getElementById('card-1');
    const card = new UniversalFlipCard(cardElement);
    
    // Simulate touch tap on card surface (not a button)
    simulateEvent(cardElement.querySelector('.universal-card-front p'), 'click');
    
    expect(card.isFlipped).toBe(true);
  });
});

describe('UniversalFlipCard - Screen Reader Announcements', () => {
  beforeEach(() => {
    setupUniversalCardDOM();
    global.UniversalFlipCard = window.UniversalFlipCard;
  });
  
  afterEach(() => {
    document.body.innerHTML = '';
  });
  
  test('creates screen reader announcer element', () => {
    const cardElement = document.getElementById('card-1');
    const card = new UniversalFlipCard(cardElement);
    
    const announcer = document.getElementById('sr-announcer');
    expect(announcer).toBeTruthy();
    expect(announcer.getAttribute('aria-live')).toBe('polite');
    expect(announcer.getAttribute('aria-atomic')).toBe('true');
  });
  
  test('announces card flip actions', () => {
    const cardElement = document.getElementById('card-1');
    const card = new UniversalFlipCard(cardElement);
    
    // Spy on the announce method
    const announceSpy = jest.spyOn(card, 'announceToScreenReader');
    
    // Flip the card
    card.flip(true);
    
    expect(announceSpy).toHaveBeenCalledWith(expect.stringContaining('flipped to back'));
    
    // Flip back
    card.flip(false);
    
    expect(announceSpy).toHaveBeenCalledWith(expect.stringContaining('flipped to front'));
  });
  
  test('respects announceToScreenReader option', () => {
    const cardElement = document.getElementById('card-1');
    const card = new UniversalFlipCard(cardElement, { announceToScreenReader: false });
    
    // Get announcer element
    const announcer = document.getElementById('sr-announcer');
    const initialText = announcer.textContent;
    
    // Flip card
    card.flip(true);
    
    // Announcer text should not change
    expect(announcer.textContent).toBe(initialText);
  });
});

describe('UniversalFlipCard - Focus Management', () => {
  beforeEach(() => {
    setupUniversalCardDOM();
    global.UniversalFlipCard = window.UniversalFlipCard;
    
    // Mock setTimeout
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    document.body.innerHTML = '';
    jest.useRealTimers();
  });
  
  test('sets focus on first focusable element after flip', () => {
    const cardElement = document.getElementById('card-1');
    const card = new UniversalFlipCard(cardElement);
    
    // Mock focus methods
    const frontTrigger = cardElement.querySelector('.universal-card-front .flip-trigger');
    const backTrigger = cardElement.querySelector('.universal-card-back .flip-trigger');
    frontTrigger.focus = jest.fn();
    backTrigger.focus = jest.fn();
    
    // Flip card
    card.flip(true);
    
    // Run timers to trigger focus change
    jest.runAllTimers();
    
    // Back trigger should have focus
    expect(backTrigger.focus).toHaveBeenCalled();
    
    // Flip back
    card.flip(false);
    jest.runAllTimers();
    
    // Front trigger should have focus
    expect(frontTrigger.focus).toHaveBeenCalled();
  });
  
  test('respects disableAutoFocus option', () => {
    const cardElement = document.getElementById('card-1');
    const card = new UniversalFlipCard(cardElement, { disableAutoFocus: true });
    
    // Mock focus methods
    const backTrigger = cardElement.querySelector('.universal-card-back .flip-trigger');
    backTrigger.focus = jest.fn();
    
    // Flip card
    card.flip(true);
    
    // Run timers
    jest.runAllTimers();
    
    // Focus should not be changed
    expect(backTrigger.focus).not.toHaveBeenCalled();
  });
});

describe('UniversalFlipCard - Static Methods', () => {
  beforeEach(() => {
    // Set up multiple cards
    document.body.innerHTML = `
      <div id="card-1" class="universal-card">
        <div class="universal-card-inner">
          <div class="universal-card-front"><button class="flip-trigger">Flip</button></div>
          <div class="universal-card-back"><button class="flip-trigger">Back</button></div>
        </div>
      </div>
      <div id="card-2" class="universal-card">
        <div class="universal-card-inner">
          <div class="universal-card-front"><button class="flip-trigger">Flip</button></div>
          <div class="universal-card-back"><button class="flip-trigger">Back</button></div>
        </div>
      </div>
    `;
    
    global.UniversalFlipCard = window.UniversalFlipCard;
  });
  
  afterEach(() => {
    document.body.innerHTML = '';
  });
  
  test('initAll initializes all cards on the page', () => {
    const cards = UniversalFlipCard.initAll();
    
    // Should have created instances for both cards
    expect(cards.length).toBe(2);
    expect(cards[0]).toBeInstanceOf(UniversalFlipCard);
    expect(cards[1]).toBeInstanceOf(UniversalFlipCard);
    
    // Each instance should be tied to the correct element
    expect(cards[0].card.id).toBe('card-1');
    expect(cards[1].card.id).toBe('card-2');
  });
  
  test('initAll applies options to all cards', () => {
    const cards = UniversalFlipCard.initAll({ enableHover: false });
    
    // All cards should have the option applied
    expect(cards[0].options.enableHover).toBe(false);
    expect(cards[1].options.enableHover).toBe(false);
  });
});

describe('UniversalFlipCard - Input Method & Hover Settings', () => {
  beforeEach(() => {
    setupUniversalCardDOM();
    global.UniversalFlipCard = window.UniversalFlipCard;
  });
  
  afterEach(() => {
    document.body.innerHTML = '';
  });
  
  test('setInputMethod changes input method attribute', () => {
    const cardElement = document.getElementById('card-1');
    const card = new UniversalFlipCard(cardElement);
    
    // Initial value based on detection
    const initialMethod = card.inputMethod;
    
    // Change to a different method
    card.setInputMethod('touch');
    expect(cardElement.getAttribute('data-input-method')).toBe('touch');
    expect(card.inputMethod).toBe('touch');
    
    // Try an invalid method (should not change)
    card.setInputMethod('invalid-method');
    expect(card.inputMethod).toBe('touch'); // Should remain unchanged
    
    // Change to keyboard
    card.setInputMethod('keyboard');
    expect(cardElement.getAttribute('data-input-method')).toBe('keyboard');
  });
  
  test('setHoverEnabled toggles hover behavior', () => {
    const cardElement = document.getElementById('card-1');
    const card = new UniversalFlipCard(cardElement, { enableHover: true });
    
    // Should start with hover enabled
    expect(cardElement.getAttribute('data-disable-hover')).toBe('false');
    
    // Disable hover
    card.setHoverEnabled(false);
    expect(cardElement.getAttribute('data-disable-hover')).toBe('true');
    expect(card.options.enableHover).toBe(false);
    
    // Re-enable hover
    card.setHoverEnabled(true);
    expect(cardElement.getAttribute('data-disable-hover')).toBe('false');
    expect(card.options.enableHover).toBe(true);
  });
});

describe('UniversalFlipCard - Card Title Detection', () => {
  beforeEach(() => {
    setupUniversalCardDOM();
    global.UniversalFlipCard = window.UniversalFlipCard;
  });
  
  afterEach(() => {
    document.body.innerHTML = '';
  });
  
  test('getCardTitle finds heading content', () => {
    const cardElement = document.getElementById('card-1');
    const card = new UniversalFlipCard(cardElement);
    
    // Should find the h2 content
    expect(card.getCardTitle()).toBe('Card Title');
  });
  
  test('getCardTitle falls back to aria-label', () => {
    // Setup card without headings
    document.body.innerHTML = `
      <div id="card-no-heading" class="universal-card" aria-label="Test Card Label">
        <div class="universal-card-inner">
          <div class="universal-card-front"><p>No heading here</p></div>
          <div class="universal-card-back"><p>Back content</p></div>
        </div>
      </div>
    `;
    
    const cardElement = document.getElementById('card-no-heading');
    const card = new UniversalFlipCard(cardElement);
    
    // Should use aria-label
    expect(card.getCardTitle()).toBe('Test Card Label');
  });
  
  test('getCardTitle uses fallback for cards without heading or label', () => {
    // Setup card without headings or labels
    document.body.innerHTML = `
      <div id="basic-card" class="universal-card">
        <div class="universal-card-inner">
          <div class="universal-card-front"><p>Just some content</p></div>
          <div class="universal-card-back"><p>Back content</p></div>
        </div>
      </div>
    `;
    
    const cardElement = document.getElementById('basic-card');
    const card = new UniversalFlipCard(cardElement);
    
    // Should use fallback
    expect(card.getCardTitle()).toBe('Flip');
  });
});

describe('UniversalFlipCard - Voice Control', () => {
  beforeEach(() => {
    setupUniversalCardDOM();
    global.UniversalFlipCard = window.UniversalFlipCard;
    
    // Mock the SpeechRecognition API
    global.SpeechRecognition = MockSpeechRecognition;
    global.webkitSpeechRecognition = MockSpeechRecognition;
  });
  
  afterEach(() => {
    document.body.innerHTML = '';
    delete global.SpeechRecognition;
    delete global.webkitSpeechRecognition;
  });
  
  test('setupVoiceControl initializes speech recognition', () => {
    const cardElement = document.getElementById('card-1');
    const card = new UniversalFlipCard(cardElement, { enableVoiceControl: true });
    
    // Should have created a recognition instance
    expect(card.recognition).toBeInstanceOf(MockSpeechRecognition);
    expect(card.recognition.continuous).toBe(true);
    expect(card.recognition.lang).toBe('en-US');
  });
  
  test('adds visual indicator for voice control', () => {
    const cardElement = document.getElementById('card-1');
    const card = new UniversalFlipCard(cardElement, { enableVoiceControl: true });
    
    // Check if indicator was created
    const indicator = document.getElementById('voice-control-indicator');
    expect(indicator).toBeTruthy();
    expect(indicator.textContent).toContain('Voice Control Active');
  });
  
  test('processVoiceCommand handles flip commands', () => {
    const cardElement = document.getElementById('card-1');
    const card = new UniversalFlipCard(cardElement, { enableVoiceControl: true });
    
    // Spy on flip method
    const flipSpy = jest.spyOn(card, 'flip');
    
    // Simulate a voice command to flip
    card.processVoiceCommand('flip the card please');
    
    // Should call flip with true
    expect(flipSpy).toHaveBeenCalledWith(true);
    
    // Reset state
    flipSpy.mockClear();
    card.isFlipped = true;
    
    // Simulate a voice command to flip back
    card.processVoiceCommand('go back to the front please');
    
    // Should call flip with false
    expect(flipSpy).toHaveBeenCalledWith(false);
  });
  
  test('responds to different voice command variations', () => {
    const cardElement = document.getElementById('card-1');
    const card = new UniversalFlipCard(cardElement, {
      enableVoiceControl: true,
      voiceCommands: {
        flip: ['flip', 'turn', 'rotate'],
        flipBack: ['back', 'return', 'front']
      }
    });
    
    // Spy on flip method
    const flipSpy = jest.spyOn(card, 'flip');
    
    // Test different command variations
    card.processVoiceCommand('turn the card over');
    expect(flipSpy).toHaveBeenCalledWith(true);
    
    flipSpy.mockClear();
    card.isFlipped = true;
    
    card.processVoiceCommand('rotate to see more info');
    // Should not flip since we're already flipped
    expect(flipSpy).not.toHaveBeenCalled();
    
    card.processVoiceCommand('return to the front');
    expect(flipSpy).toHaveBeenCalledWith(false);
  });
  
  test('setVoiceControlEnabled toggles voice control', () => {
    const cardElement = document.getElementById('card-1');
    const card = new UniversalFlipCard(cardElement);
    
    // Initially disabled
    expect(card.options.enableVoiceControl).toBe(false);
    expect(card.recognition).toBeUndefined();
    
    // Enable voice control
    card.setVoiceControlEnabled(true);
    expect(card.options.enableVoiceControl).toBe(true);
    expect(card.recognition).toBeInstanceOf(MockSpeechRecognition);
    
    // Should have added the indicator
    expect(document.getElementById('voice-control-indicator')).toBeTruthy();
    
    // Mock stop method
    const stopSpy = jest.spyOn(card.recognition, 'stop');
    
    // Disable voice control
    card.setVoiceControlEnabled(false);
    expect(card.options.enableVoiceControl).toBe(false);
    expect(stopSpy).toHaveBeenCalled();
    
    // Should have removed the indicator
    expect(document.getElementById('voice-control-indicator')).toBeFalsy();
  });
  
  test('handles speech recognition errors gracefully', () => {
    // Mock console.warn
    const originalWarn = console.warn;
    console.warn = jest.fn();
    
    const cardElement = document.getElementById('card-1');
    const card = new UniversalFlipCard(cardElement, { enableVoiceControl: true });
    
    // Trigger error handler
    card.recognition.onerror({ error: 'not-allowed' });
    
    // Should log warning
    expect(console.warn).toHaveBeenCalled();
    
    // Restore console.warn
    console.warn = originalWarn;
  });
  
  test('recognition restarts when ended', () => {
    const cardElement = document.getElementById('card-1');
    const card = new UniversalFlipCard(cardElement, { enableVoiceControl: true });
    
    // Spy on start method
    const startSpy = jest.spyOn(card.recognition, 'start');
    
    // Trigger end event
    card.recognition.onend();
    
    // Should restart recognition
    expect(startSpy).toHaveBeenCalled();
  });
});