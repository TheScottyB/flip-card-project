/**
 * Voice Control Tests for Universal Flip Card
 * Tests the Web Speech API integration and voice command functionality
 */

describe('Universal Flip Card - Voice Control', () => {
  // Mock for Web Speech API
  let UniversalFlipCard;
  let card;
  let mockRecognition;
  
  beforeEach(() => {
    // Set up DOM
    document.body.innerHTML = `
      <div class="universal-card" id="test-card">
        <div class="universal-card-inner">
          <div class="universal-card-front">
            <div class="card-content">
              <h2>Test Card</h2>
              <button class="flip-trigger">View Details</button>
            </div>
          </div>
          <div class="universal-card-back">
            <div class="card-content">
              <h2>Back Side</h2>
              <button class="flip-trigger">Back to Front</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Mock SpeechRecognition
    mockRecognition = {
      start: jest.fn(),
      stop: jest.fn(),
      continuous: false,
      interimResults: false,
      lang: '',
      onresult: null,
      onerror: null,
      onend: null
    };
    
    global.SpeechRecognition = jest.fn(() => mockRecognition);
    global.webkitSpeechRecognition = jest.fn(() => mockRecognition);
    
    // Import module under test (with mocked speech recognition)
    jest.resetModules();
    jest.doMock('../../../js/universal-flip-card', () => {
      const actualModule = jest.requireActual('../../../js/universal-flip-card');
      return {
        ...actualModule,
        // Use the mock for Web Speech API
      };
    });
    
    UniversalFlipCard = require('../../../js/universal-flip-card').UniversalFlipCard;
    card = document.getElementById('test-card');
  });
  
  afterEach(() => {
    document.body.innerHTML = '';
    jest.resetAllMocks();
  });
  
  test('Voice control is not enabled by default', () => {
    const flipCard = new UniversalFlipCard(card);
    expect(flipCard.options.enableVoiceControl).toBe(false);
    expect(global.SpeechRecognition).not.toHaveBeenCalled();
    expect(global.webkitSpeechRecognition).not.toHaveBeenCalled();
  });
  
  test('Voice control can be enabled through options', () => {
    const flipCard = new UniversalFlipCard(card, { enableVoiceControl: true });
    expect(flipCard.options.enableVoiceControl).toBe(true);
    
    // Should initialize speech recognition
    expect(global.SpeechRecognition).toHaveBeenCalled();
  });
  
  test('Voice control can be toggled', () => {
    const flipCard = new UniversalFlipCard(card);
    
    // Initially disabled
    expect(flipCard.options.enableVoiceControl).toBe(false);
    
    // Enable voice control
    flipCard.setVoiceControlEnabled(true);
    expect(flipCard.options.enableVoiceControl).toBe(true);
    expect(mockRecognition.start).toHaveBeenCalled();
    
    // Disable voice control
    flipCard.setVoiceControlEnabled(false);
    expect(flipCard.options.enableVoiceControl).toBe(false);
    expect(mockRecognition.stop).toHaveBeenCalled();
  });
  
  test('Voice control creates a visual indicator', () => {
    // Create a new card with voice control enabled
    const flipCard = new UniversalFlipCard(card, { enableVoiceControl: true });
    
    // Check if the indicator was added to the DOM
    const indicator = document.getElementById('voice-control-indicator');
    expect(indicator).not.toBeNull();
    expect(indicator.textContent).toContain('Voice Control Active');
  });
  
  test('Voice commands flip the card correctly', () => {
    // Create a new card with voice control enabled
    const flipCard = new UniversalFlipCard(card, { enableVoiceControl: true });
    jest.spyOn(flipCard, 'flip');
    
    // Simulate a voice command being recognized
    const mockResultEvent = {
      results: [
        [{ transcript: 'flip the card' }]
      ]
    };
    
    // Trigger the onresult callback
    mockRecognition.onresult(mockResultEvent);
    
    // The card should be flipped
    expect(flipCard.flip).toHaveBeenCalledWith(true);
    expect(card.classList.contains('flipped')).toBe(true);
    
    // Test flipping back
    const mockBackResultEvent = {
      results: [
        [{ transcript: 'go back' }]
      ]
    };
    
    // Reset the spy
    flipCard.flip.mockClear();
    
    // Simulate the back command
    mockRecognition.onresult(mockBackResultEvent);
    
    // The card should be flipped back
    expect(flipCard.flip).toHaveBeenCalledWith(false);
    expect(card.classList.contains('flipped')).toBe(false);
  });
  
  test('Custom voice commands can be configured', () => {
    // Create a new card with custom voice commands
    const flipCard = new UniversalFlipCard(card, {
      enableVoiceControl: true,
      voiceCommands: {
        flip: ['open', 'reveal', 'show'],
        flipBack: ['close', 'hide', 'return']
      }
    });
    
    jest.spyOn(flipCard, 'flip');
    
    // Simulate a custom voice command
    const mockResultEvent = {
      results: [
        [{ transcript: 'show details' }]
      ]
    };
    
    // Trigger the onresult callback
    mockRecognition.onresult(mockResultEvent);
    
    // The card should be flipped
    expect(flipCard.flip).toHaveBeenCalledWith(true);
    
    // Test custom back command
    const mockBackResultEvent = {
      results: [
        [{ transcript: 'close card' }]
      ]
    };
    
    // Reset the spy and flip the card
    flipCard.flip.mockClear();
    flipCard.flip(true);
    
    // Simulate the back command
    mockRecognition.onresult(mockBackResultEvent);
    
    // The card should be flipped back
    expect(flipCard.flip).toHaveBeenCalledWith(false);
  });
});