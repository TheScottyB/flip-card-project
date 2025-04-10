/**
 * End-to-end Integration Tests for Event Tracking System
 * Tests the integration between cards, event tracking, and the event delivery system
 */

// Instead of directly importing, use the setupTestModules utility from setup.js
// This ensures proper module loading and makes modules available globally
setupTestModules();

// Set longer timeout for integration tests
jest.setTimeout(120000); // 2 minutes

// Mock fetch response for network calls - optimized for tests
global.fetch = jest.fn(() => {
  // Return a pre-resolved promise for faster test execution
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ token: 'test-token' })
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
    
    // Setup fake timers
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    // Clean up
    if (cardTrackers) {
      cardTrackers.forEach(tracker => {
        if (tracker && tracker.destroy) tracker.destroy();
      });
    }
    
    document.body.innerHTML = '';
    window.enableCardTracking = false;
    window.debugCardEvents = false;
    
    // Reset Date.now mocking if defined
    if (typeof resetDateNow === 'function') resetDateNow();
    
    // Restore timers
    jest.useRealTimers();
  });
  
  test('Tracks card flip events and sends to endpoint', async () => {
    jest.setTimeout(120000); // Increase timeout for this specific test
    // Flip the first card
    card1.flip(true);
    
    // The card should emit a cardFlip event which the tracker will catch
    expect(CardEventTracker.prototype.recordInteraction).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'flip',
        isFlipped: true
      })
    );
    
    // Verify data is being sent
    expect(CardEventTracker.prototype.sendData).toHaveBeenCalled();
    
    // Wait for fetch to complete using the improved utility
    await flushPromisesAndTimers();
    
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
    jest.setTimeout(120000); // Increase timeout for this specific test
    window.enableCardTracking = false;
    
    // Flip card
    card1.flip(true);
    
    // Interaction should be recorded but not sent
    expect(CardEventTracker.prototype.recordInteraction).toHaveBeenCalled();
    
    // Wait for async operations
    await flushPromisesAndTimers();
    
    // No data should be sent
    expect(fetch).not.toHaveBeenCalled();
    
    // Re-enable tracking
    window.enableCardTracking = true;
    
    // Reset call counts
    CardEventTracker.prototype.recordInteraction.mockClear();
    fetch.mockClear();
    
    // Interact with both cards
    card1.flip(true);
    card2.flip(true);
    
    // Should record 2 interactions
    expect(CardEventTracker.prototype.recordInteraction).toHaveBeenCalledTimes(2);
    
    // Wait for async operations
    await flushPromisesAndTimers();
    
    // Should have made fetch calls for both interactions
    expect(fetch).toHaveBeenCalledTimes(4); // 2 tokens, 2 events
  });
  
  test('Tracks interactions from multiple cards independently', async () => {
    jest.setTimeout(120000); // Increase timeout for this specific test
    
    // Reset call counts
    CardEventTracker.prototype.recordInteraction.mockClear();
    fetch.mockClear();
    
    // Track first interaction
    card1.flip(true);
    await flushPromisesAndTimers();
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
    jest.setTimeout(120000); // Increase timeout for this specific test
    
    // First interaction - clear previous calls
    fetch.mockClear();
    
    // First interaction to establish a session
    card1.flip(true);
    await flushPromisesAndTimers();
    
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
    await flushPromisesAndTimers();
    
    // Get session ID from second request
    expect(fetch.mock.calls.length).toBeGreaterThanOrEqual(2);
    const secondCall = fetch.mock.calls[1]; // second call is the events call
    expect(secondCall).toBeDefined();
    const secondPayload = JSON.parse(secondCall[1].body);
    
    // Session ID should be the same
    expect(secondPayload.client_payload.sessionId).toBe(sessionId);
    
    // Wait for session timeout (simulated)
    jest.advanceTimersByTime(2000000); // > 30 minutes
    
    // Trigger interaction after session timeout
    fetch.mockClear();
    card1.flip(true);
    await flushPromisesAndTimers();
    
    // Verify a new session was created
    expect(fetch.mock.calls.length).toBeGreaterThanOrEqual(2);
    const finalCall = fetch.mock.calls[1];
    expect(finalCall).toBeDefined();
    const finalPayload = JSON.parse(finalCall[1].body);
    
    // Should have a different session ID after timeout
    expect(finalPayload.client_payload.sessionId).not.toBe(sessionId);
  });
  
  test('Collects device capability data with interactions', async () => {
    jest.setTimeout(120000); // Increase timeout for this specific test
    // Mock a specific device capability
    window.matchMedia = jest.fn().mockImplementation(query => {
      if (query === '(prefers-reduced-motion: reduce)') {
        return { matches: true, media: query };
      }
      return { matches: false, media: query };
    });
    
    // Recreate trackers with new mocked capabilities
    cardTrackers.forEach(tracker => tracker.destroy());
    cardTrackers = CardEventTracker.trackAll();
    
    // Trigger interaction
    card1.flip(true);
    await flushPromisesAndTimers();
    
    // Verify device data was included
    const lastCall = fetch.mock.calls[fetch.mock.calls.length - 1];
    const payload = JSON.parse(lastCall[1].body);
    
    // Should include device capabilities
    expect(payload.client_payload.deviceCapabilities).toBeDefined();
    expect(payload.client_payload.deviceCapabilities.reducedMotion).toBe(true);
  });
  
  test('Records and reports user interactions through the entire flow', async () => {
    jest.setTimeout(120000); // Increase timeout for this specific test
    
    // Reset tracking data and network calls
    fetch.mockClear();
    CardEventTracker.prototype.recordInteraction.mockClear();
    CardEventTracker.prototype.sendData.mockClear();
    
    // Enable tracking explicitly
    window.enableCardTracking = true;
    
    // Set up event log to capture events
    const eventLog = document.getElementById('event-log');
    
    // Create a function to log events
    const logEvent = (event, data) => {
      const entry = document.createElement('div');
      entry.textContent = `${event}: ${JSON.stringify(data)}`;
      entry.dataset.eventType = event;
      eventLog.appendChild(entry);
    };
    
    // Set up custom event handlers for UI elements
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
    
    // STEP 1: Initial card flip - should be tracked and sent
    logEvent('test-step', { step: 1, action: 'initial-flip' });
    card1.flip(true);
    await flushPromisesAndTimers();
    
    // Verify the interaction was recorded and sent
    expect(CardEventTracker.prototype.recordInteraction).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'flip', isFlipped: true })
    );
    expect(CardEventTracker.prototype.sendData).toHaveBeenCalled();
    expect(fetch).toHaveBeenCalledTimes(2); // Token and event
    
    // STEP 2: Trigger custom event through UI
    logEvent('test-step', { step: 2, action: 'custom-event' });
    simulateEvent(document.getElementById('trigger-event'), 'click');
    await flushPromisesAndTimers();
    
    // STEP 3: Disable tracking
    logEvent('test-step', { step: 3, action: 'disable-tracking' });
    simulateEvent(document.getElementById('disable-tracking'), 'click');
    await flushPromisesAndTimers();
    
    // Save the fetch call count before disabled interaction
    const fetchCallsBeforeDisabled = fetch.mock.calls.length;
    
    // STEP 4: Final interaction with tracking disabled - should not be sent
    logEvent('test-step', { step: 4, action: 'disabled-flip' });
    card2.flip(false);
    await flushPromisesAndTimers();
    
    // STEP 5: Re-enable tracking
    logEvent('test-step', { step: 5, action: 'enable-tracking' });
    simulateEvent(document.getElementById('enable-tracking'), 'click');
    await flushPromisesAndTimers();
    
    // STEP 6: Final interaction with tracking re-enabled - should be sent
    logEvent('test-step', { step: 6, action: 'final-flip' });
    card1.flip(false);
    await flushPromisesAndTimers();
    
    // Verify the event log contains all expected actions
    // 6 test steps + other logged events
    expect(eventLog.children.length).toBeGreaterThanOrEqual(6);
    
    // Verify interaction with disabled tracking was not sent
    expect(fetch.mock.calls.length).toBe(fetchCallsBeforeDisabled);
    
    // Verify re-enabling tracking resumes sending
    simulateEvent(document.getElementById('enable-tracking'), 'click');
    card2.flip(true);
    await flushPromisesAndTimers();
    
    // Should have new fetch calls after re-enabling
    expect(fetch.mock.calls.length).toBeGreaterThan(fetchCallsBeforeDisabled);
    
    // Check event log for state changes
    const disableEvents = Array.from(eventLog.children).filter(
      el => el.dataset.eventType === 'tracking-disabled'
    );
    const enableEvents = Array.from(eventLog.children).filter(
      el => el.dataset.eventType === 'tracking-enabled'
    );
    
    // Should have at least one disable and re-enable event
    expect(disableEvents.length).toBeGreaterThanOrEqual(1);
    expect(enableEvents.length).toBeGreaterThanOrEqual(1);
  });
});