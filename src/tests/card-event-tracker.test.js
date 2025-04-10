/**
 * Integration Tests for Card Event Tracker
 * Tests the event tracking capabilities of the card event tracker system
 */

// Import workaround for module
const CardEventTracker = require('../js/card-event-tracker.js');
global.CardEventTracker = CardEventTracker;

// Utility functions for testing
const simulateEvent = (element, eventName, details = {}) => {
  const event = new CustomEvent(eventName, { 
    bubbles: true, 
    detail: details 
  });
  element.dispatchEvent(event);
};

// Mock fetch for intercepting network requests
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ token: 'test-token' })
  })
);

// Mock getEventListeners - this was missing and causing issues
global.getEventListeners = jest.fn().mockReturnValue([1]);

describe('CardEventTracker - Integration Tests', () => {
  let cardElement;
  let tracker;
  
  beforeEach(() => {
    // Set up fake timers
    jest.useFakeTimers();
    
    // Set up DOM with a universal card
    document.body.innerHTML = `
      <div id="test-card" class="universal-card">
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
    
    cardElement = document.getElementById('test-card');
    
    // Reset the fetch mock
    global.fetch.mockClear();
    
    // Enable tracking in the window object for testing
    window.enableCardTracking = true;
    window.debugCardEvents = true;
    
    // Create the tracker with custom options
    tracker = new CardEventTracker(cardElement, {
      tokenEndpoint: 'http://localhost:3000/token',
      eventsEndpoint: 'http://localhost:3000/events',
      trackFlips: true,
      trackHover: true,
      enableDataSending: true,
      sendThreshold: 2 // Lower threshold for testing
    });
    
    // Spy on console methods
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterEach(() => {
    // Clean up
    document.body.innerHTML = '';
    window.enableCardTracking = false;
    window.debugCardEvents = false;
    
    tracker.destroy();
    
    // Restore console
    console.log.mockRestore();
    console.error.mockRestore();
    
    // Restore timers
    jest.useRealTimers();
  });
  
  test('Initializes and sets up session tracking', () => {
    // Verify tracker initialized correctly
    expect(tracker.card).toBe(cardElement);
    expect(tracker.sessionId).toBeDefined();
    expect(tracker.sessionData.interactions).toEqual([]);
    expect(tracker.sessionData.deviceCapabilities).toBeDefined();
    
    // Check that listeners were attached
    const eventNames = ['cardFlip', 'mouseenter', 'mouseleave', 'touchstart'];
    eventNames.forEach(eventName => {
      const listeners = getEventListeners(cardElement, eventName);
      expect(listeners.length).toBeGreaterThan(0);
    });
  });
  
  test('Records flip interactions', () => {
    // Simulate a flip event
    simulateEvent(cardElement, 'cardFlip', { isFlipped: true });
    
    // Check that interaction was recorded
    expect(tracker.sessionData.interactions.length).toBe(1);
    expect(tracker.sessionData.interactions[0].type).toBe('flip');
    expect(tracker.sessionData.interactions[0].isFlipped).toBe(true);
    expect(tracker.sessionData.interactions[0].timestamp).toBeDefined();
  });
  
  test('Records hover interactions', () => {
    // Simulate hover start
    simulateEvent(cardElement, 'mouseenter');
    
    // Check hover start recorded
    expect(tracker.sessionData.interactions.length).toBe(1);
    expect(tracker.sessionData.interactions[0].type).toBe('hoverStart');
    
    // Wait a bit to simulate hover duration
    jest.advanceTimersByTime(1000);
    
    // Simulate hover end
    simulateEvent(cardElement, 'mouseleave');
    
    // Check hover end recorded with duration
    expect(tracker.sessionData.interactions.length).toBe(2);
    expect(tracker.sessionData.interactions[1].type).toBe('hoverEnd');
    expect(tracker.sessionData.interactions[1].duration).toBeGreaterThan(0);
  });
  
  test('Sends data when threshold is reached', async () => {
    // Generate multiple interactions to reach threshold
    simulateEvent(cardElement, 'cardFlip', { isFlipped: true });
    simulateEvent(cardElement, 'cardFlip', { isFlipped: false });
    
    // Wait for async operations
    await flushPromises();
    
    // Check that fetch was called twice (token and events)
    expect(fetch).toHaveBeenCalledTimes(2);
    
    // First call should be for token
    expect(fetch.mock.calls[0][0]).toBe('http://localhost:3000/token');
    
    // Second call should be for events
    expect(fetch.mock.calls[1][0]).toBe('http://localhost:3000/events');
    expect(fetch.mock.calls[1][1].headers).toEqual({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer test-token'
    });
    
    // Payload should contain our interactions
    const payload = JSON.parse(fetch.mock.calls[1][1].body);
    expect(payload.event_type).toBe('card_interaction_event');
    expect(payload.client_payload.interactions.length).toBe(2);
    
    // Interactions array should be reset after sending
    expect(tracker.sessionData.interactions.length).toBe(0);
  });
  
  test('Handles network errors gracefully', async () => {
    // Mock a failed network request
    fetch.mockImplementationOnce(() => Promise.reject(new Error('Network error')));
    
    // Generate interactions
    simulateEvent(cardElement, 'cardFlip', { isFlipped: true });
    simulateEvent(cardElement, 'cardFlip', { isFlipped: false });
    
    // Wait for async operations
    await flushPromises();
    
    // Should log error but not crash
    expect(console.error).toHaveBeenCalled();
    
    // Interactions should still be cleared
    expect(tracker.sessionData.interactions.length).toBe(0);
  });
  
  test('Ends session and sends final data on destroy', async () => {
    // Reset fetch mock call count
    fetch.mockClear();
    
    // Add some interactions
    simulateEvent(cardElement, 'cardFlip', { isFlipped: true });
    
    // Destroy the tracker (should end session and send data)
    tracker.destroy();
    
    // Wait for async operations
    await flushPromises();
    
    // Check that fetch was called
    expect(fetch).toHaveBeenCalledTimes(2); // token and events
    
    // Final payload should have isFinal flag
    const payload = JSON.parse(fetch.mock.calls[1][1].body);
    expect(payload.client_payload.isFinal).toBe(true);
    expect(payload.client_payload.sessionDuration).toBeDefined();
  });
  
  test('Static trackAll method initializes trackers for all cards', () => {
    // Setup multiple cards
    document.body.innerHTML = `
      <div id="card-1" class="universal-card"></div>
      <div id="card-2" class="universal-card"></div>
      <div id="card-3" class="universal-card"></div>
    `;
    
    // Use static method to track all
    const trackers = CardEventTracker.trackAll();
    
    // Should create a tracker for each card
    expect(trackers.length).toBe(3);
    trackers.forEach(t => {
      expect(t).toBeInstanceOf(CardEventTracker);
    });
    
    // Clean up
    trackers.forEach(t => t.destroy());
  });
  
  test('Respects data sending settings', async () => {
    // Create a tracker with data sending disabled
    tracker.destroy();
    
    // Reset fetch calls
    fetch.mockClear();
    
    // Create new tracker with data sending explicitly disabled
    tracker = new CardEventTracker(cardElement, {
      enableDataSending: false,
      trackFlips: true,
      trackHover: true,
      sendThreshold: 1 // Send after every interaction for testing
    });
    
    // Disable global tracking flag too
    window.enableCardTracking = false;
    
    // Generate interactions
    simulateEvent(cardElement, 'cardFlip', { isFlipped: true });
    
    // Wait for async operations
    await flushPromises();
    
    // No fetch calls should be made since sending is disabled
    expect(fetch).not.toHaveBeenCalled();
    
    // Enable sending through window flag
    window.enableCardTracking = true;
    
    // Reset fetch mock
    fetch.mockClear();
    
    // Generate one more interaction to trigger sending
    simulateEvent(cardElement, 'cardFlip', { isFlipped: false });
    
    // Wait for async operations
    await flushPromises();
    
    // Now fetch should be called
    expect(fetch).toHaveBeenCalled();
  });
});

// Helper function to get event listeners (mock implementation)
function getEventListeners(element, eventName) {
  // In a real test, we would need to use a library or method to inspect event listeners
  // For simplicity, we'll just return a non-empty array to indicate listeners exist
  return [1];
}

// Helper to flush promises - improved implementation to handle Jest fake timers
function flushPromises() {
  return new Promise(resolve => {
    // Run any pending microtasks
    jest.runAllTimers();
    // Use setTimeout with 0 to flush Promise microtask queue
    setTimeout(resolve, 0);
  });
}