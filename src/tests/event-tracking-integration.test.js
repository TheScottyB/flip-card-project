/**
 * End-to-end Integration Tests for Event Tracking System
 * Tests the integration between cards, event tracking, and the event delivery system
 */

// Import workaround for modules
const UniversalFlipCard = require('../js/universal-flip-card.js');
const CardEventTracker = require('../js/card-event-tracker.js');

// Make them available globally
global.UniversalFlipCard = UniversalFlipCard;
global.CardEventTracker = CardEventTracker;

// Mock fetch response for network calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ token: 'test-token' })
  })
);

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

// Utility function to wait for promises to resolve
const flushPromises = () => new Promise(resolve => {
  // Run any pending timers
  jest.runAllTimers();
  // Use setTimeout with 0 to flush Promise microtask queue
  setTimeout(resolve, 0);
});

describe('Event Tracking System - End-to-End Integration', () => {
  let card1, card2, cardTrackers, flipCards;
  
  beforeEach(() => {
    // Setup test DOM
    setupTestPage();
    
    // Clear fetch mock
    fetch.mockClear();
    
    // Enable tracking for testing
    window.enableCardTracking = true;
    window.debugCardEvents = true;
    
    // Set up UniversalFlipCard instances
    flipCards = window.UniversalFlipCard.initAll();
    card1 = flipCards[0];
    card2 = flipCards[1];
    
    // Spy on CardEventTracker's methods
    jest.spyOn(window.CardEventTracker.prototype, 'recordInteraction');
    jest.spyOn(window.CardEventTracker.prototype, 'sendData');
    
    // Create the trackers for the cards
    cardTrackers = window.CardEventTracker.trackAll({
      tokenEndpoint: 'http://localhost:3000/token',
      eventsEndpoint: 'http://localhost:3000/events',
      sendThreshold: 1, // Send after every interaction for testing
      enableDataSending: true
    });
    
    // Mock console methods
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Setup fake timers
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    // Clean up
    document.body.innerHTML = '';
    window.enableCardTracking = false;
    window.debugCardEvents = false;
    
    // Destroy trackers
    if (cardTrackers) {
      cardTrackers.forEach(tracker => tracker.destroy());
    }
    
    // Restore console
    console.log.mockRestore();
    console.error.mockRestore();
    
    // Restore timers
    jest.useRealTimers();
  });
  
  test('Tracks card flip events and sends to endpoint', async () => {
    // Flip the first card
    card1.flip(true);
    
    // The card should emit a cardFlip event which the tracker will catch
    expect(window.CardEventTracker.prototype.recordInteraction).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'flip',
        isFlipped: true
      })
    );
    
    // Verify data is being sent
    expect(window.CardEventTracker.prototype.sendData).toHaveBeenCalled();
    
    // Wait for fetch to complete
    await flushPromises();
    
    // Verify token request
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/token',
      expect.objectContaining({
        method: 'POST'
      })
    );
    
    // Verify event data sent
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/events',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-token'
        })
      })
    );
    
    // Verify data structure
    const lastCall = fetch.mock.calls[fetch.mock.calls.length - 1];
    const requestBody = JSON.parse(lastCall[1].body);
    
    expect(requestBody.event_type).toBe('card_interaction_event');
    expect(requestBody.client_payload.interactions).toHaveLength(1);
    expect(requestBody.client_payload.interactions[0].type).toBe('flip');
    expect(requestBody.client_payload.interactions[0].isFlipped).toBe(true);
  });
  
  test('Toggle tracking on/off using global flag', async () => {
    // Disable tracking
    window.enableCardTracking = false;
    
    // Flip card
    card1.flip(true);
    
    // Interaction should be recorded but not sent
    expect(window.CardEventTracker.prototype.recordInteraction).toHaveBeenCalled();
    
    // Wait for async operations
    await flushPromises();
    
    // No data should be sent
    expect(fetch).not.toHaveBeenCalled();
    
    // Re-enable tracking
    window.enableCardTracking = true;
    
    // Flip card again
    card1.flip(false);
    
    // Wait for async operations
    await flushPromises();
    
    // Data should be sent now
    expect(fetch).toHaveBeenCalledTimes(2); // token and events
  });
  
  test('Tracks interactions from multiple cards independently', async () => {
    // Reset call counts
    window.CardEventTracker.prototype.recordInteraction.mockClear();
    fetch.mockClear();
    
    // Interact with both cards
    card1.flip(true);
    card2.flip(true);
    
    // Should record 2 interactions
    expect(window.CardEventTracker.prototype.recordInteraction).toHaveBeenCalledTimes(2);
    
    // Wait for async operations
    await flushPromises();
    
    // Should have made 4 fetch calls (2 tokens, 2 events)
    expect(fetch).toHaveBeenCalledTimes(4);
    
    // Verify the payloads are for different cards
    const firstEventCall = fetch.mock.calls[1];
    const secondEventCall = fetch.mock.calls[3];
    
    const firstPayload = JSON.parse(firstEventCall[1].body);
    const secondPayload = JSON.parse(secondEventCall[1].body);
    
    // Each payload should have a different session ID
    expect(firstPayload.client_payload.sessionId).not.toBe(secondPayload.client_payload.sessionId);
  });
  
  test('Session tracking persists across multiple interactions', async () => {
    // Track first interaction
    card1.flip(true);
    await flushPromises();
    
    // Get the session ID from the first request
    // Make sure we have enough calls in the mock
    expect(fetch.mock.calls.length).toBeGreaterThanOrEqual(2);
    const firstCall = fetch.mock.calls[1]; // second call is the events call
    expect(firstCall).toBeDefined();
    const firstPayload = JSON.parse(firstCall[1].body);
    const sessionId = firstPayload.client_payload.sessionId;
    
    // Clear fetch calls
    fetch.mockClear();
    
    // Second interaction
    card1.flip(false);
    await flushPromises();
    
    // Get session ID from second request
    expect(fetch.mock.calls.length).toBeGreaterThanOrEqual(2);
    const secondCall = fetch.mock.calls[1]; // second call is the events call
    expect(secondCall).toBeDefined();
    const secondPayload = JSON.parse(secondCall[1].body);
    
    // Session ID should be the same
    expect(secondPayload.client_payload.sessionId).toBe(sessionId);
    
    // Wait for session timeout (simulated)
    jest.advanceTimersByTime(2000000); // > 30 minutes
    
    // Expect session ended event
    const endCall = fetch.mock.calls[fetch.mock.calls.length - 1];
    const endPayload = JSON.parse(endCall[1].body);
    
    // Final payload should have isFinal flag
    expect(endPayload.client_payload.isFinal).toBe(true);
    expect(endPayload.client_payload.sessionDuration).toBeGreaterThan(0);
  });
  
  test('Collects device capability data with interactions', async () => {
    // Mock a specific device capability
    window.matchMedia = jest.fn().mockImplementation(query => {
      if (query === '(prefers-reduced-motion: reduce)') {
        return { matches: true, media: query };
      }
      return { matches: false, media: query };
    });
    
    // Recreate trackers with new mocked capabilities
    cardTrackers.forEach(tracker => tracker.destroy());
    cardTrackers = window.CardEventTracker.trackAll();
    
    // Trigger interaction
    card1.flip(true);
    await flushPromises();
    
    // Verify device data was included
    const lastCall = fetch.mock.calls[fetch.mock.calls.length - 1];
    const payload = JSON.parse(lastCall[1].body);
    
    // Should include device capabilities
    expect(payload.client_payload.deviceCapabilities).toBeDefined();
    expect(payload.client_payload.deviceCapabilities.reducedMotion).toBe(true);
  });
  
  test('Records and reports user interactions through the entire flow', async () => {
    // Set up event log to capture events
    const eventLog = document.getElementById('event-log');
    
    // Create a function to log events
    const logEvent = (event, data) => {
      const entry = document.createElement('div');
      entry.textContent = `${event}: ${JSON.stringify(data)}`;
      eventLog.appendChild(entry);
    };
    
    // Register event handlers
    document.getElementById('enable-tracking').addEventListener('click', () => {
      window.enableCardTracking = true;
      logEvent('tracking-enabled', { timestamp: Date.now() });
    });
    
    document.getElementById('disable-tracking').addEventListener('click', () => {
      window.enableCardTracking = false;
      logEvent('tracking-disabled', { timestamp: Date.now() });
    });
    
    document.getElementById('trigger-event').addEventListener('click', () => {
      const customEvent = new CustomEvent('customCardEvent', { 
        detail: { action: 'custom-action', timestamp: Date.now() }
      });
      card1.card.dispatchEvent(customEvent);
      logEvent('custom-event-triggered', { timestamp: Date.now() });
    });
    
    // Simulate user enabling tracking
    simulateEvent(document.getElementById('enable-tracking'), 'click');
    
    // Simulate a sequence of card interactions
    card1.flip(true);
    await flushPromises();
    
    card2.flip(true);
    await flushPromises();
    
    card1.flip(false);
    await flushPromises();
    
    // Simulate custom event
    simulateEvent(document.getElementById('trigger-event'), 'click');
    await flushPromises();
    
    // Disable tracking
    simulateEvent(document.getElementById('disable-tracking'), 'click');
    
    // Final interaction (should not be sent)
    card2.flip(false);
    await flushPromises();
    
    // Verify the event log contains all actions
    expect(eventLog.children.length).toBe(3); // 3 event log entries
    
    // Check total network calls (should be 6 = 3 events x 2 calls each)
    expect(fetch).toHaveBeenCalledTimes(6);
  });
});