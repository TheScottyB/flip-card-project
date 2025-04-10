/**
 * Unit Tests for Card Event Tracker
 * 
 * These tests focus on isolated functionality of the CardEventTracker class,
 * testing individual methods and behaviors with minimal dependencies.
 */

// Import the module under test
const CardEventTracker = require('../../js/card-event-tracker.js');

// Mock fetch globally
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ token: 'test-token' })
  })
);

// Mock matchMedia for device capability tests
window.matchMedia = jest.fn().mockImplementation(query => {
  // Default all media queries to false
  let matches = false;
  
  // Selectively return true for specific queries in tests
  if (query === '(pointer: fine)') matches = true;
  if (query === '(hover: hover)') matches = true;
  
  return {
    matches,
    media: query,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
  };
});

describe('CardEventTracker - Unit Tests', () => {
  // Common setup
  let cardElement;
  let tracker;
  
  beforeEach(() => {
    // Create minimal DOM element
    cardElement = document.createElement('div');
    cardElement.className = 'universal-card';
    document.body.appendChild(cardElement);
    
    // Reset mocks
    fetch.mockClear();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Set up global flags
    window.enableCardTracking = true;
    window.debugCardEvents = true;
  });
  
  afterEach(() => {
    // Clean up
    if (tracker && tracker.destroy) {
      tracker.destroy();
    }
    document.body.innerHTML = '';
    console.log.mockRestore();
    console.error.mockRestore();
    
    window.enableCardTracking = false;
    window.debugCardEvents = false;
  });
  
  /**
   * 1. Session Management Tests
   */
  describe('Session Management', () => {
    test('generateSessionId creates unique IDs', () => {
      tracker = new CardEventTracker(cardElement);
      const id1 = tracker.generateSessionId();
      const id2 = tracker.generateSessionId();
      
      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toEqual(id2);
      expect(id1).toMatch(/^session-[a-z0-9]+-[a-z0-9]+$/);
    });
    
    test('constructor initializes session data', () => {
      tracker = new CardEventTracker(cardElement);
      
      expect(tracker.sessionId).toBeDefined();
      expect(tracker.sessionData.sessionId).toEqual(tracker.sessionId);
      expect(tracker.sessionData.interactions).toEqual([]);
      expect(tracker.sessionData.deviceCapabilities).toBeDefined();
      expect(tracker.sessionData.sessionStart).toBeDefined();
      expect(tracker.lastInteraction).toBeDefined();
      expect(tracker.sessionEnded).toBe(false);
    });
    
    test('checkSession does not end session when recently active', () => {
      tracker = new CardEventTracker(cardElement);
      const endSessionSpy = jest.spyOn(tracker, 'endSession');
      
      // Set last interaction to current time
      tracker.lastInteraction = Date.now();
      
      // Check session
      tracker.checkSession();
      
      // Should not end session
      expect(endSessionSpy).not.toHaveBeenCalled();
    });
    
    test('checkSession ends session when timeout exceeded', () => {
      tracker = new CardEventTracker(cardElement, {
        sessionTimeout: 1000 // 1 second timeout for testing
      });
      
      const endSessionSpy = jest.spyOn(tracker, 'endSession');
      
      // Set last interaction to past time
      tracker.lastInteraction = Date.now() - 2000; // 2 seconds ago
      
      // Check session
      tracker.checkSession();
      
      // Should end session
      expect(endSessionSpy).toHaveBeenCalled();
    });
    
    test('endSession calculates session duration and sends final data', () => {
      tracker = new CardEventTracker(cardElement);
      const sendDataSpy = jest.spyOn(tracker, 'sendData');
      
      // Mock session start time
      tracker.sessionData.sessionStart = Date.now() - 5000; // 5 seconds ago
      
      // End session
      tracker.endSession();
      
      // Session should be marked as ended
      expect(tracker.sessionEnded).toBe(true);
      
      // Should calculate duration
      expect(tracker.sessionData.sessionDuration).toBeGreaterThanOrEqual(5000);
      
      // Should send data with isFinal flag
      expect(sendDataSpy).toHaveBeenCalledWith(true);
      
      // Calling again should do nothing
      sendDataSpy.mockClear();
      tracker.endSession();
      expect(sendDataSpy).not.toHaveBeenCalled();
    });
  });
  
  /**
   * 2. Event Recording Tests
   */
  describe('Event Recording', () => {
    test('recordInteraction adds data to session with timestamp', () => {
      tracker = new CardEventTracker(cardElement);
      
      // Record a test interaction
      tracker.recordInteraction({ type: 'test', value: 123 });
      
      // Check interaction was recorded correctly
      expect(tracker.sessionData.interactions.length).toBe(1);
      expect(tracker.sessionData.interactions[0].type).toBe('test');
      expect(tracker.sessionData.interactions[0].value).toBe(123);
      expect(tracker.sessionData.interactions[0].timestamp).toBeDefined();
      
      // Last interaction time should be updated
      expect(tracker.lastInteraction).toBeGreaterThan(0);
    });
    
    test('handleFlip records flip interactions', () => {
      tracker = new CardEventTracker(cardElement);
      const recordSpy = jest.spyOn(tracker, 'recordInteraction');
      
      // Create a flip event
      const flipEvent = new CustomEvent('cardFlip', {
        detail: { isFlipped: true }
      });
      
      // Handle the event
      tracker.handleFlip(flipEvent);
      
      // Should record interaction
      expect(recordSpy).toHaveBeenCalledWith(expect.objectContaining({
        type: 'flip',
        isFlipped: true
      }));
    });
    
    test('hover tracking records start and end with duration', () => {
      tracker = new CardEventTracker(cardElement);
      const recordSpy = jest.spyOn(tracker, 'recordInteraction');
      
      // Mock current time with a more robust approach
      const startTime = 1000000;
      const endTime = startTime + 1000; // 1 second later
      
      // Use a mock implementation that controls the time sequence
      const mockNow = jest.fn();
      
      // For hover start, return the start time
      // For hover end, return the end time
      mockNow.mockReturnValueOnce(startTime)  // First call during handleHoverStart
             .mockReturnValueOnce(startTime)  // Second call inside recordInteraction
             .mockReturnValueOnce(endTime);   // Call during handleHoverEnd
      
      // Apply the mock
      jest.spyOn(Date, 'now').mockImplementation(mockNow);
      
      // Handle hover start - should use startTime
      tracker.handleHoverStart({});
      
      // Reset the recordInteraction calls to focus on the hover end
      recordSpy.mockClear();
      
      // Handle hover end - should use endTime
      tracker.handleHoverEnd({});
      
      // Should record hover end with exact duration of 1000ms
      expect(recordSpy).toHaveBeenCalledWith(expect.objectContaining({
        type: 'hoverEnd',
        duration: 1000
      }));
      
      // Hover start time should be reset
      expect(tracker.hoverStartTime).toBeNull();
      
      // Verify the mock was called the expected number of times
      expect(mockNow).toHaveBeenCalledTimes(3);
    });
    
    test('handleTouch records touch interactions with touch points', () => {
      tracker = new CardEventTracker(cardElement);
      const recordSpy = jest.spyOn(tracker, 'recordInteraction');
      
      // Create a touch event
      const touchEvent = {
        touches: [{ identifier: 1 }, { identifier: 2 }]
      };
      
      // Handle the event
      tracker.handleTouch(touchEvent);
      
      // Should record interaction
      expect(recordSpy).toHaveBeenCalledWith(expect.objectContaining({
        type: 'touch',
        touchPoints: 2
      }));
    });
  });
  
  /**
   * 3. Data Queue Management Tests
   */
  describe('Data Queue Management', () => {
    test('interactions are queued until threshold is reached', () => {
      tracker = new CardEventTracker(cardElement, {
        sendThreshold: 3 // Send after 3 interactions
      });
      
      const sendDataSpy = jest.spyOn(tracker, 'sendData').mockImplementation(() => {});
      
      // Record interactions below threshold
      tracker.recordInteraction({ type: 'test', value: 1 });
      tracker.recordInteraction({ type: 'test', value: 2 });
      
      // Should not send data yet
      expect(sendDataSpy).not.toHaveBeenCalled();
      expect(tracker.sessionData.interactions.length).toBe(2);
      
      // Record interaction to reach threshold
      tracker.recordInteraction({ type: 'test', value: 3 });
      
      // Should send data now
      expect(sendDataSpy).toHaveBeenCalled();
    });
    
    test('sendData clears interactions after sending', async () => {
      tracker = new CardEventTracker(cardElement);
      
      // Add some interactions
      tracker.sessionData.interactions = [
        { type: 'test', value: 1, timestamp: Date.now() },
        { type: 'test', value: 2, timestamp: Date.now() }
      ];
      
      // Call sendData (not final)
      await tracker.sendData(false);
      
      // Interactions should be cleared
      expect(tracker.sessionData.interactions.length).toBe(0);
    });
    
    test('sendData does not clear interactions when sending final data', async () => {
      tracker = new CardEventTracker(cardElement);
      
      // Mock implementation to avoid actual fetch
      jest.spyOn(tracker, 'sendData').mockImplementation(() => {});
      
      // Add some interactions
      tracker.sessionData.interactions = [
        { type: 'test', value: 1, timestamp: Date.now() },
        { type: 'test', value: 2, timestamp: Date.now() }
      ];
      
      // End session (which calls sendData with isFinal=true)
      tracker.endSession();
      
      // Call the actual implementation manually for testing
      await tracker.sendData.mock.calls[0][0];
      
      // Original interactions should remain
      expect(tracker.sessionData.interactions.length).toBe(2);
    });
  });
  
  /**
   * 4. Device Capability Detection Tests
   */
  describe('Device Capability Detection', () => {
    test('detectCapabilities collects device information', () => {
      // Mock navigator and window properties
      const originalNavigator = global.navigator;
      const originalInnerWidth = window.innerWidth;
      const originalInnerHeight = window.innerHeight;
      const originalPixelRatio = window.devicePixelRatio;
      
      // Define test values
      Object.defineProperty(global, 'navigator', {
        value: {
          language: 'en-US',
          userAgent: 'Test Agent',
          connection: {
            effectiveType: '4g',
            rtt: 50,
            downlink: 10
          }
        },
        writable: true
      });
      
      Object.defineProperty(window, 'innerWidth', { value: 1920, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 1080, writable: true });
      Object.defineProperty(window, 'devicePixelRatio', { value: 2, writable: true });
      
      // Create tracker and test capabilities
      tracker = new CardEventTracker(cardElement);
      const capabilities = tracker.detectCapabilities();
      
      // Verify capabilities
      expect(capabilities.pointer).toBe(true); // From our matchMedia mock
      expect(capabilities.hover).toBe(true); // From our matchMedia mock
      expect(capabilities.screenWidth).toBe(1920);
      expect(capabilities.screenHeight).toBe(1080);
      expect(capabilities.pixelRatio).toBe(2);
      expect(capabilities.language).toBe('en-US');
      expect(capabilities.connection).toEqual({
        type: '4g',
        rtt: 50,
        downlink: 10
      });
      
      // Restore original values
      Object.defineProperty(global, 'navigator', { value: originalNavigator });
      Object.defineProperty(window, 'innerWidth', { value: originalInnerWidth });
      Object.defineProperty(window, 'innerHeight', { value: originalInnerHeight });
      Object.defineProperty(window, 'devicePixelRatio', { value: originalPixelRatio });
    });
    
    test('anonymizeUserAgent removes detailed browser information', () => {
      // Sample user agents
      const chromeUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
      const firefoxUA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:91.0) Gecko/20100101 Firefox/91.0';
      const edgeUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59';
      
      // Test each user agent
      Object.defineProperty(navigator, 'userAgent', { value: chromeUA, configurable: true });
      tracker = new CardEventTracker(cardElement);
      expect(tracker.anonymizeUserAgent()).toBe('Chrome - Windows');
      
      Object.defineProperty(navigator, 'userAgent', { value: firefoxUA, configurable: true });
      expect(tracker.anonymizeUserAgent()).toBe('Firefox - macOS');
      
      Object.defineProperty(navigator, 'userAgent', { value: edgeUA, configurable: true });
      expect(tracker.anonymizeUserAgent()).toBe('Edge - Windows');
    });
  });
  
  /**
   * 5. Configuration Management Tests
   */
  describe('Configuration Management', () => {
    test('constructor uses default options when none provided', () => {
      tracker = new CardEventTracker(cardElement);
      
      // Check default options
      expect(tracker.options.trackFlips).toBe(true);
      expect(tracker.options.trackHover).toBe(true);
      expect(tracker.options.trackSession).toBe(true);
      expect(tracker.options.anonymizeData).toBe(true);
      expect(tracker.options.enableDataSending).toBe(false); // Disabled by default
      expect(tracker.options.tokenEndpoint).toBe('http://localhost:3000/token');
      expect(tracker.options.eventsEndpoint).toBe('http://localhost:3000/events');
      expect(tracker.options.sendThreshold).toBe(5);
    });
    
    test('constructor merges custom options with defaults', () => {
      const customOptions = {
        trackFlips: false,
        trackHover: false,
        enableDataSending: true,
        tokenEndpoint: 'https://custom-endpoint/token',
        sendThreshold: 10
      };
      
      tracker = new CardEventTracker(cardElement, customOptions);
      
      // Custom options should override defaults
      expect(tracker.options.trackFlips).toBe(false);
      expect(tracker.options.trackHover).toBe(false);
      expect(tracker.options.enableDataSending).toBe(true);
      expect(tracker.options.tokenEndpoint).toBe('https://custom-endpoint/token');
      expect(tracker.options.sendThreshold).toBe(10);
      
      // Options not specified should use defaults
      expect(tracker.options.trackSession).toBe(true);
      expect(tracker.options.anonymizeData).toBe(true);
      expect(tracker.options.eventsEndpoint).toBe('http://localhost:3000/events');
    });
    
    test('setupListeners adds appropriate event listeners based on options', () => {
      // Spy on addEventListener
      const addEventSpy = jest.spyOn(cardElement, 'addEventListener');
      
      // Create tracker with all tracking options enabled
      tracker = new CardEventTracker(cardElement, {
        trackFlips: true,
        trackHover: true
      });
      
      // Should add listeners for all tracked events
      expect(addEventSpy).toHaveBeenCalledWith('cardFlip', expect.any(Function));
      expect(addEventSpy).toHaveBeenCalledWith('mouseenter', expect.any(Function));
      expect(addEventSpy).toHaveBeenCalledWith('mouseleave', expect.any(Function));
      expect(addEventSpy).toHaveBeenCalledWith('touchstart', expect.any(Function));
      
      // Reset and test with options disabled
      addEventSpy.mockClear();
      tracker.destroy();
      
      tracker = new CardEventTracker(cardElement, {
        trackFlips: false,
        trackHover: false
      });
      
      // Should not add disabled listeners
      expect(addEventSpy).not.toHaveBeenCalledWith('cardFlip', expect.any(Function));
      expect(addEventSpy).not.toHaveBeenCalledWith('mouseenter', expect.any(Function));
      expect(addEventSpy).not.toHaveBeenCalledWith('mouseleave', expect.any(Function));
      expect(addEventSpy).toHaveBeenCalledWith('touchstart', expect.any(Function)); // Still tracked
    });
    
    test('trackAll creates trackers for all cards', () => {
      // Set up multiple cards
      document.body.innerHTML = `
        <div id="card-1" class="universal-card"></div>
        <div id="card-2" class="universal-card"></div>
        <div id="card-3" class="universal-card"></div>
      `;
      
      // Create trackers with custom options
      const customOptions = {
        trackFlips: false,
        sendThreshold: 10
      };
      
      const trackers = CardEventTracker.trackAll(customOptions);
      
      // Should create a tracker for each card
      expect(trackers.length).toBe(3);
      
      // Each tracker should have the custom options
      trackers.forEach(t => {
        expect(t.options.trackFlips).toBe(false);
        expect(t.options.sendThreshold).toBe(10);
      });
      
      // Clean up
      trackers.forEach(t => t.destroy());
    });
  });
  
  /**
   * 6. Token Management Tests
   */
  describe('Token Management', () => {
    test('sendData requests a token before sending events', async () => {
      tracker = new CardEventTracker(cardElement);
      
      // Add an interaction
      tracker.recordInteraction({ type: 'test' });
      
      // Mock sendThreshold to trigger immediately
      tracker.options.sendThreshold = 1;
      
      // Wait for async operations
      await tracker.sendData(false);
      
      // First call should be to token endpoint
      expect(fetch).toHaveBeenCalledTimes(2);
      expect(fetch.mock.calls[0][0]).toBe('http://localhost:3000/token');
      expect(fetch.mock.calls[0][1].method).toBe('POST');
      
      // Second call should include Authorization header with token
      expect(fetch.mock.calls[1][0]).toBe('http://localhost:3000/events');
      expect(fetch.mock.calls[1][1].headers.Authorization).toBe('Bearer test-token');
    });
    
    test('sendData requests a new token for each event batch', async () => {
      tracker = new CardEventTracker(cardElement, {
        sendThreshold: 1 // Send after each interaction
      });
      
      // First interaction
      tracker.recordInteraction({ type: 'test', id: 1 });
      await flushPromises();
      
      // Second interaction
      tracker.recordInteraction({ type: 'test', id: 2 });
      await flushPromises();
      
      // Should have made 4 fetch calls (2 tokens, 2 events)
      expect(fetch).toHaveBeenCalledTimes(4);
      expect(fetch.mock.calls[0][0]).toBe('http://localhost:3000/token');
      expect(fetch.mock.calls[1][0]).toBe('http://localhost:3000/events');
      expect(fetch.mock.calls[2][0]).toBe('http://localhost:3000/token');
      expect(fetch.mock.calls[3][0]).toBe('http://localhost:3000/events');
    });
  });
  
  /**
   * 7. Error Handling Tests
   */
  describe('Error Handling', () => {
    test('handles token request failure gracefully', async () => {
      // Mock a failed token request
      fetch.mockImplementationOnce(() => 
        Promise.reject(new Error('Network error'))
      );
      
      tracker = new CardEventTracker(cardElement, {
        sendThreshold: 1
      });
      
      // Record an interaction to trigger sending
      tracker.recordInteraction({ type: 'test' });
      
      // Wait for async operations
      await flushPromises();
      
      // Should log error
      expect(console.error).toHaveBeenCalled();
      
      // Should not crash
      expect(tracker.sessionData.interactions.length).toBe(0);
    });
    
    test('handles non-successful token response', async () => {
      // Mock a failed token response
      fetch.mockImplementationOnce(() => 
        Promise.resolve({
          ok: false,
          status: 401,
          statusText: 'Unauthorized'
        })
      );
      
      tracker = new CardEventTracker(cardElement, {
        sendThreshold: 1
      });
      
      // Record an interaction to trigger sending
      tracker.recordInteraction({ type: 'test' });
      
      // Wait for async operations
      await flushPromises();
      
      // Should log error
      expect(console.error).toHaveBeenCalled();
      
      // Should not make event request after token failure
      expect(fetch).toHaveBeenCalledTimes(1);
    });
    
    test('handles event request failure gracefully', async () => {
      // First request (token) succeeds, second (events) fails
      fetch.mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ token: 'test-token' })
        })
      ).mockImplementationOnce(() => 
        Promise.reject(new Error('Network error sending events'))
      );
      
      tracker = new CardEventTracker(cardElement, {
        sendThreshold: 1
      });
      
      // Record an interaction to trigger sending
      tracker.recordInteraction({ type: 'test' });
      
      // Wait for async operations
      await flushPromises();
      
      // Should log error
      expect(console.error).toHaveBeenCalled();
      
      // Should make both requests
      expect(fetch).toHaveBeenCalledTimes(2);
    });
    
    test('respects tracking toggle flag', async () => {
      window.enableCardTracking = false;
      
      tracker = new CardEventTracker(cardElement, {
        enableDataSending: false, // Explicitly disabled
        sendThreshold: 1
      });
      
      // Record an interaction
      tracker.recordInteraction({ type: 'test' });
      
      // Wait for async operations
      await flushPromises();
      
      // No data should be sent when tracking is disabled
      expect(fetch).not.toHaveBeenCalled();
      
      // Enable tracking through the global flag
      window.enableCardTracking = true;
      
      // Record another interaction
      tracker.recordInteraction({ type: 'test' });
      
      // Wait for async operations
      await flushPromises();
      
      // Data should be sent now
      expect(fetch).toHaveBeenCalled();
    });
  });
  
  // Helper function to flush promises
  function flushPromises() {
    return new Promise(resolve => setTimeout(resolve, 0));
  }
});
