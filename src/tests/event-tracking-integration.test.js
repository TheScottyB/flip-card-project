/**
 * End-to-end Integration Tests for Event Tracking System
 * Tests the integration between cards, event tracking, and the event delivery system
 */

// Instead of directly importing, use the setupTestModules utility from setup.js
// This ensures proper module loading and makes modules available globally
setupTestModules();

// Set longer timeout for integration tests
jest.setTimeout(120000); // 2 minutes for integration tests

// Mock fetch response for network calls - optimized for tests
global.fetch = jest.fn((url, options) => {
  // Ensure options.body is properly stringified
  if (options && typeof options.body === 'string') {
    try {
      JSON.parse(options.body); // Validate JSON
    } catch (error) {
      console.error('Invalid JSON in fetch mock:', error);
      throw error;
    }
  }
  
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ 
      token: 'test-token',
      success: true 
    })
  });
});

// Mock MutationObserver
global.MutationObserver = class {
  constructor(callback) {
    this.callback = callback;
    this.observe = jest.fn();
    this.disconnect = jest.fn();
  }
  
  // Trigger mutations programmatically from tests
  trigger(mutations) {
    this.callback(mutations, this);
  }
};

// Mock matchMedia for device capability detection
window.matchMedia = jest.fn().mockImplementation(query => {
  return {
    matches: false, // Default to false
    media: query,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
  };
});

// Launch test page and integrate components
const setupTestPage = () => {
  document.body.innerHTML = `
    <!-- Test controls -->
    <div class="test-controls">
      <button id="enable-tracking">Enable Event Tracking</button>
      <button id="disable-tracking">Disable Event Tracking</button>
      <button id="trigger-event">Simulate Custom Event</button>
      <div id="event-log"></div>
    </div>
    
    <!-- Demo Cards -->
    <div class="card-container">
      <!-- Card 1: Standard universal card -->
      <div id="demo-card-1" class="universal-card" data-testid="card1">
        <div class="universal-card-inner">
          <div class="universal-card-front">
            <h2>Product Info</h2>
            <p>This is a demonstration card</p>
            <button class="flip-trigger">View Details</button>
          </div>
          <div class="universal-card-back">
            <h2>Product Details</h2>
            <p>Additional information about this product</p>
            <button class="flip-trigger">Back</button>
          </div>
        </div>
      </div>
      
      <!-- Card 2: Another universal card -->
      <div id="demo-card-2" class="universal-card" data-testid="card2">
        <div class="universal-card-inner">
          <div class="universal-card-front">
            <h2>Feature Overview</h2>
            <p>Features and benefits</p>
            <button class="flip-trigger">More Info</button>
          </div>
          <div class="universal-card-back">
            <h2>Feature Details</h2>
            <p>Detailed description of features</p>
            <button class="flip-trigger">Back</button>
          </div>
        </div>
      </div>
    </div>
  `;
};

// Utility function to simulate events
const simulateEvent = (element, eventName, details = {}) => {
  const event = new CustomEvent(eventName, { 
    bubbles: true, 
    detail: details 
  });
  element.dispatchEvent(event);
};

// We'll use the flushPromisesAndTimers utility from setup.js instead of a local implementation

describe('Event Tracking System - End-to-End Integration', () => {
  let card1, card2, cardTrackers, flipCards;
  
  beforeEach(() => {
    // Set up the test page DOM
    setupTestPage();
    
    // Use mockDateNow for consistent time values in tests
    mockDateNow();
    
    // Set up UniversalFlipCard instances
    // Using the initAll method that's guaranteed to be available via setupTestModules
    flipCards = UniversalFlipCard.initAll();
    card1 = flipCards[0];
    card2 = flipCards[1];
    
    // Spy on CardEventTracker's methods
    jest.spyOn(CardEventTracker.prototype, 'recordInteraction');
    jest.spyOn(CardEventTracker.prototype, 'sendData');
    
    // Create the trackers for the cards
    cardTrackers = CardEventTracker.trackAll({
      tokenEndpoint: 'http://localhost:3000/token',
      eventsEndpoint: 'http://localhost:3000/events',
      sendThreshold: 1, // Send after every interaction for testing
      enableDataSending: true
    });
    
    // Setup event handlers for test controls
    document.getElementById('enable-tracking')?.addEventListener('click', () => {
      window.enableCardTracking = true;
    });
    
    document.getElementById('disable-tracking')?.addEventListener('click', () => {
      window.enableCardTracking = false;
    });
    // Make sure we're starting with real timers for setup
    jest.useRealTimers();
    
    // Then use fake timers for tests
    jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] });
  });
  
  afterEach(async () => {
    // Make sure all pending timers and promises are resolved
    try {
      // First flush any pending promises
      await flushPromisesAndTimers();
      
      // Clean up trackers properly
      if (cardTrackers) {
        cardTrackers.forEach(tracker => {
          if (tracker && tracker.destroy) tracker.destroy();
        });
      }
      
      // Make sure event listeners are removed
      document.body.innerHTML = '';
      window.enableCardTracking = false;
      window.debugCardEvents = false;
      
      // Reset Date.now mocking
      resetDateNow();
      
      // Clear all mocks and restore timers
      jest.clearAllMocks();
      jest.clearAllTimers();
      jest.useRealTimers();
    } catch (error) {
      console.error('Error in afterEach cleanup:', error);
    }
  });
  
  test('Tracks card flip events and sends to endpoint', async () => {
    try {
        // Start fresh
        jest.clearAllMocks();
        window.enableCardTracking = true;

        // Flip the first card
        card1.flip(true);
        await flushPromisesAndTimers();

        // Verify interaction was recorded
        expect(CardEventTracker.prototype.recordInteraction).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'flip',
                isFlipped: true
            })
        );

        // Verify data was sent
        expect(CardEventTracker.prototype.sendData).toHaveBeenCalled();

        // Verify token request
        expect(fetch).toHaveBeenCalledWith(
            'http://localhost:3000/token',
            expect.objectContaining({
                method: 'POST'
            })
        );

        // Verify event data
        const eventCall = fetch.mock.calls.find(call => 
            call[0] === 'http://localhost:3000/events');
        expect(eventCall).toBeDefined();

        // Verify payload structure
        const payload = JSON.parse(eventCall[1].body);
        expect(payload.event_type).toBe('card_interaction_event');
        expect(payload.client_payload.sessionId).toBeDefined();
        expect(payload.client_payload.deviceCapabilities).toBeDefined();

    } catch (error) {
        console.error('Test failed:', error);
        throw error;
    }
  });
  test('Tracks interactions from multiple cards independently', async () => {
    try {
        // Start fresh
        jest.clearAllMocks();
        window.enableCardTracking = true;
        
        // Destroy existing trackers
        if (cardTrackers) {
            cardTrackers.forEach(tracker => tracker.destroy());
        }
        
        // Create new trackers for each card
        const tracker1 = new CardEventTracker(card1.card, {
            tokenEndpoint: 'http://localhost:3000/token',
            eventsEndpoint: 'http://localhost:3000/events',
            sendThreshold: 1
        });
        
        const tracker2 = new CardEventTracker(card2.card, {
            tokenEndpoint: 'http://localhost:3000/token',
            eventsEndpoint: 'http://localhost:3000/events',
            sendThreshold: 1
        });
        
        // Track first card
        card1.flip(true);
        await flushPromisesAndTimers();
        
        const firstSessionId = tracker1.sessionId;
        
        // Track second card
        card2.flip(true);
        await flushPromisesAndTimers();
        
        const secondSessionId = tracker2.sessionId;
        
        // Verify different session IDs
        expect(firstSessionId).not.toBe(secondSessionId);
        
        // Clean up
        tracker1.destroy();
        tracker2.destroy();
    } catch (error) {
        console.error('Test failed:', error);
        throw error;
    }
  });
  
  test('Toggle tracking on/off using global flag', async () => {
    // Start with tracking disabled and clean up
    window.enableCardTracking = false;
    
    // Important: First destroy ALL existing trackers
    if (cardTrackers) {
        cardTrackers.forEach(tracker => tracker.destroy());
        cardTrackers = null; // Important: Clear the reference
    }
    
    // Clear all mocks and wait
    jest.clearAllMocks();
    await flushPromisesAndTimers();
    
    // Now create new trackers with tracking disabled
    cardTrackers = CardEventTracker.trackAll({
        tokenEndpoint: 'http://localhost:3000/token',
        eventsEndpoint: 'http://localhost:3000/events',
        sendThreshold: 1,
        enableDataSending: false,
        trackingEnabled: false // Important: Set initial state
    });
    
    // Wait for trackers to initialize
    await flushPromisesAndTimers();
    
    // Flip card - should not send when tracking is disabled
    card1.flip(true);
    await flushPromisesAndTimers();
    
    // Verify no network calls were made while tracking is disabled
    expect(fetch).not.toHaveBeenCalled();
    
    // Re-enable tracking
    window.enableCardTracking = true;
    
    // Clear mocks before next interaction
    jest.clearAllMocks();
    
    // Flip the card again
    card1.flip(false);
    await flushPromisesAndTimers();
    
    // Should have new calls
    expect(fetch.mock.calls.length).toBeGreaterThanOrEqual(2);
  });
  test('Session tracking persists across multiple interactions', async () => {
    // Start fresh with a clean state
    jest.clearAllMocks();
    window.enableCardTracking = true;
    
    // Clear any existing trackers
    if (cardTrackers) {
        cardTrackers.forEach(tracker => tracker.destroy());
        cardTrackers = null;
    }
    
    // Create a single tracker with a short timeout
    const sessionTimeout = 5000; // 5 seconds
    const tracker = new CardEventTracker(card1.card, {
        tokenEndpoint: 'http://localhost:3000/token',
        eventsEndpoint: 'http://localhost:3000/events',
        sendThreshold: 1,
        sessionTimeout: sessionTimeout,
        enableDataSending: true,
        trackingEnabled: true
    });
    
    // First interaction
    card1.flip(true);
    await flushPromisesAndTimers();
    const initialSessionId = tracker.sessionId;
    
    // Second interaction (same session)
    card1.flip(false);
    await flushPromisesAndTimers();
    expect(tracker.sessionId).toBe(initialSessionId);
    
    // Force session timeout
    jest.advanceTimersByTime(sessionTimeout + 1000);
    tracker.checkSession(); // Force session check
    await flushPromisesAndTimers();
    // New interaction should create new session
    card1.flip(true);
    await flushPromisesAndTimers();
    
    // Session ID should be different after timeout
    expect(tracker.sessionId).not.toBe(initialSessionId);
    // Clean up
    tracker.destroy();
  });
  
  test('Collects device capability data with interactions', async () => {
    // Mock matchMedia to return true for reduced motion
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    }));
    // Clean up existing trackers
    if (cardTrackers) {
      cardTrackers.forEach(tracker => tracker.destroy());
    }
    
    // Create a new tracker after mocking matchMedia
    const testTracker = new CardEventTracker(card1.card, {
      tokenEndpoint: 'http://localhost:3000/token',
      eventsEndpoint: 'http://localhost:3000/events',
      sendThreshold: 1
    });
    
    // Clear previous fetch calls
    fetch.mockClear();
    
    // Trigger an interaction
    card1.flip(true);
    await flushPromisesAndTimers();
    
    // Make sure we have fetch calls
    expect(fetch.mock.calls.length).toBeGreaterThan(0);
    
    // Get the last call which should be the events endpoint
    const eventCall = fetch.mock.calls.find(call => 
      call[0] === 'http://localhost:3000/events');
    expect(eventCall).toBeDefined();
    
    let payload;
    try {
      payload = JSON.parse(eventCall[1].body);
    } catch (e) {
      throw new Error(`Failed to parse payload: ${eventCall[1].body}`);
    }
    
    // Verify device capabilities
    expect(payload.client_payload.deviceCapabilities).toBeDefined();
    expect(payload.client_payload.deviceCapabilities.reducedMotion).toBe(true);
    testTracker.destroy();
  });
  test('Records and reports user interactions through the entire flow', async () => {
    try {
        // Reset everything
        jest.clearAllMocks();
        
        // Destroy existing trackers
        if (cardTrackers) {
            cardTrackers.forEach(tracker => tracker.destroy());
        }
        
        // Clear DOM and re-setup
        document.body.innerHTML = '';
        setupTestPage();
        flipCards = UniversalFlipCard.initAll();
        card1 = flipCards[0];
        card2 = flipCards[1];
        
        // Create event log
        const eventLog = document.getElementById('event-log');
        
        // Setup event handlers
        document.getElementById('enable-tracking').addEventListener('click', () => {
            window.enableCardTracking = true;
            const entry = document.createElement('div');
            entry.textContent = 'Tracking enabled';
            entry.dataset.eventType = 'tracking-enabled';
            eventLog.appendChild(entry);
        });
        
        document.getElementById('disable-tracking').addEventListener('click', () => {
            window.enableCardTracking = false;
            const entry = document.createElement('div');
            entry.textContent = 'Tracking disabled';
            entry.dataset.eventType = 'tracking-disabled';
            eventLog.appendChild(entry);
        });
        
        // Create trackers with tracking enabled
        window.enableCardTracking = true;
        cardTrackers = [
            new CardEventTracker(card1.card, {
                tokenEndpoint: 'http://localhost:3000/token',
                eventsEndpoint: 'http://localhost:3000/events',
                sendThreshold: 1
            }),
            new CardEventTracker(card2.card, {
                tokenEndpoint: 'http://localhost:3000/token',
                eventsEndpoint: 'http://localhost:3000/events',
                sendThreshold: 1
            })
        ];
        
        // Initial interaction
        card1.flip(true);
        await flushPromisesAndTimers();
        
        // Verify initial calls
        expect(fetch.mock.calls.length).toBeGreaterThanOrEqual(2);
        
        // Disable tracking and clear mocks
        jest.clearAllMocks();
        window.enableCardTracking = false;
        simulateEvent(document.getElementById('disable-tracking'), 'click');
        
        // Interaction while disabled
        card2.flip(true);
        await flushPromisesAndTimers();
        
        // Re-enable tracking
        jest.clearAllMocks();
        window.enableCardTracking = true;
        simulateEvent(document.getElementById('enable-tracking'), 'click');
        // Interaction after re-enabling
        card1.flip(false);
        await flushPromisesAndTimers();
        
        // Should have new calls after re-enabling
        expect(fetch.mock.calls.length).toBeGreaterThanOrEqual(2);
    } catch (error) {
        console.error('Test failed:', error);
        throw error;
    }
  });
}); // End of describe block
