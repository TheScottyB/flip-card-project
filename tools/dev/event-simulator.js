/**
 * Event Simulator for Flip Card Event Tracking
 * 
 * This tool generates mock events for testing the event tracking system without
 * requiring manual interaction with the cards.
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const readline = require('readline');

// Configuration
const DEFAULT_CONFIG = {
  tokenEndpoint: 'http://localhost:3000/token',
  eventsEndpoint: 'http://localhost:3000/events',
  simulationSpeed: 'medium', // slow, medium, fast
  eventCount: 10,
  sessions: 2,
  deviceTypes: ['desktop', 'mobile', 'tablet'],
  cardTypes: ['contact', 'product', 'pricing'],
  interactionTypes: ['flip', 'hover', 'touch']
};

// Read configuration if exists
let config = DEFAULT_CONFIG;
const configPath = path.join(__dirname, 'simulator-config.json');
if (fs.existsSync(configPath)) {
  try {
    const customConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    config = { ...DEFAULT_CONFIG, ...customConfig };
    console.log('✓ Loaded custom configuration');
  } catch (err) {
    console.error('Error loading configuration:', err.message);
    console.log('Using default configuration');
  }
}

// Generate session ID similar to the CardEventTracker
const generateSessionId = () => {
  return 'session-' + 
    Date.now().toString(36) + '-' + 
    Math.random().toString(36).substring(2, 15);
};

// Generate device capabilities data
const generateDeviceCapabilities = (deviceType) => {
  const capabilities = {
    touch: deviceType !== 'desktop',
    pointer: deviceType === 'desktop',
    hover: deviceType === 'desktop',
    reducedMotion: Math.random() > 0.9, // 10% chance for reduced motion
    darkMode: Math.random() > 0.7, // 30% chance for dark mode
    highContrast: Math.random() > 0.95, // 5% chance for high contrast
    screenWidth: 1920,
    screenHeight: 1080,
    pixelRatio: 1,
    language: 'en-US',
    timezone: 'America/New_York',
    userAgent: `Simulated ${deviceType} device`
  };

  // Adjust dimensions based on device type
  if (deviceType === 'mobile') {
    capabilities.screenWidth = 375;
    capabilities.screenHeight = 812;
    capabilities.pixelRatio = 2;
  } else if (deviceType === 'tablet') {
    capabilities.screenWidth = 768;
    capabilities.screenHeight = 1024;
    capabilities.pixelRatio = 2;
  }

  return capabilities;
};

// Generate card interactions
const generateInteractions = (count, cardType) => {
  const interactions = [];
  let isFlipped = false;
  let hoverStartTime = null;

  for (let i = 0; i < count; i++) {
    const timestamp = Date.now() - Math.floor(Math.random() * 300000); // Random time in last 5 minutes
    const interactionType = config.interactionTypes[Math.floor(Math.random() * config.interactionTypes.length)];
    
    let interaction = { timestamp, type: interactionType };

    switch (interactionType) {
      case 'flip':
        isFlipped = !isFlipped;
        interaction.isFlipped = isFlipped;
        interaction.triggerMethod = Math.random() > 0.7 ? 'touch' : 'click';
        break;
      case 'hover':
        if (hoverStartTime === null) {
          hoverStartTime = timestamp;
          interaction.type = 'hoverStart';
        } else {
          interaction.type = 'hoverEnd';
          interaction.duration = timestamp - hoverStartTime;
          hoverStartTime = null;
        }
        break;
      case 'touch':
        interaction.touchPoints = Math.floor(Math.random() * 2) + 1;
        break;
    }

    // Add card-specific data
    interaction.cardType = cardType;
    
    interactions.push(interaction);
  }

  return interactions;
};

// Generate a full session
const generateSession = () => {
  const deviceType = config.deviceTypes[Math.floor(Math.random() * config.deviceTypes.length)];
  const cardType = config.cardTypes[Math.floor(Math.random() * config.cardTypes.length)];
  const sessionId = generateSessionId();
  const sessionStart = Date.now() - Math.floor(Math.random() * 600000); // Random start time in last 10 minutes
  
  return {
    sessionId,
    interactions: generateInteractions(config.eventCount, cardType),
    deviceCapabilities: generateDeviceCapabilities(deviceType),
    sessionStart,
    sessionDuration: Date.now() - sessionStart,
    isFinal: true,
    simulatedData: true
  };
};

// Send session data to the webhook proxy
const sendSession = async (session) => {
  try {
    // First, get a token
    const tokenResponse = await axios.post(config.tokenEndpoint);
    const token = tokenResponse.data.token;
    
    // Then send the event
    const eventResponse = await axios.post(
      config.eventsEndpoint,
      {
        event_type: 'card_interaction_event',
        client_payload: session
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    return true;
  } catch (err) {
    console.error(`Error sending session ${session.sessionId}:`, err.message);
    return false;
  }
};

// Sleep utility for controlling simulation speed
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Get sleep duration based on simulation speed
const getSleepDuration = () => {
  switch (config.simulationSpeed) {
    case 'slow': return 2000;
    case 'fast': return 200;
    case 'medium':
    default: return 1000;
  }
};

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Show simulation options
const showOptions = () => {
  console.log('\n=======================================');
  console.log('   EVENT SIMULATOR - INTERACTIVE MODE  ');
  console.log('=======================================');
  console.log('1. Generate and send single event session');
  console.log('2. Generate and send multiple sessions');
  console.log('3. Start continuous event generation');
  console.log('4. Change simulation configuration');
  console.log('5. Exit');
  
  rl.question('\nSelect an option (1-5): ', handleOptionSelection);
};

// Handle option selection
const handleOptionSelection = async (option) => {
  switch (option) {
    case '1':
      await generateAndSendSession();
      showOptions();
      break;
    case '2':
      await generateAndSendMultipleSessions();
      showOptions();
      break;
    case '3':
      await startContinuousGeneration();
      break;
    case '4':
      changeConfiguration();
      break;
    case '5':
      console.log('Exiting simulator. Goodbye!');
      rl.close();
      break;
    default:
      console.log('Invalid option. Please select 1-5.');
      showOptions();
      break;
  }
};

// Generate and send a single session
const generateAndSendSession = async () => {
  console.log('\nGenerating session data...');
  const session = generateSession();
  console.log(`Session ID: ${session.sessionId}`);
  console.log(`Device: ${session.deviceCapabilities.userAgent}`);
  console.log(`Interactions: ${session.interactions.length}`);
  
  console.log('Sending session data...');
  const success = await sendSession(session);
  if (success) {
    console.log('✓ Session data sent successfully!');
  } else {
    console.log('✗ Failed to send session data.');
  }
};

// Generate and send multiple sessions
const generateAndSendMultipleSessions = async () => {
  rl.question('\nHow many sessions to generate? ', async (count) => {
    const sessionCount = parseInt(count) || config.sessions;
    console.log(`\nGenerating ${sessionCount} sessions...`);
    
    let successCount = 0;
    for (let i = 0; i < sessionCount; i++) {
      process.stdout.write(`Processing session ${i+1}/${sessionCount}... `);
      const session = generateSession();
      const success = await sendSession(session);
      if (success) {
        process.stdout.write('✓\n');
        successCount++;
      } else {
        process.stdout.write('✗\n');
      }
      await sleep(getSleepDuration());
    }
    
    console.log(`\nCompleted: ${successCount}/${sessionCount} sessions sent successfully.`);
    showOptions();
  });
};

// Start continuous event generation
const startContinuousGeneration = async () => {
  console.log('\nStarting continuous event generation.');
  console.log('Press Ctrl+C to stop.\n');
  
  let sessionCount = 0;
  
  // Set up infinite loop
  const generate = async () => {
    sessionCount++;
    process.stdout.write(`Generating session ${sessionCount}... `);
    const session = generateSession();
    const success = await sendSession(session);
    if (success) {
      process.stdout.write('✓\n');
    } else {
      process.stdout.write('✗\n');
    }
    
    // Schedule next generation after delay
    setTimeout(generate, getSleepDuration() * 2);
  };
  
  // Start first generation
  generate();
};

// Change configuration
const changeConfiguration = () => {
  console.log('\n=== Current Configuration ===');
  console.log(JSON.stringify(config, null, 2));
  
  rl.question('\nEnter new config as JSON or press Enter to keep current: ', (input) => {
    if (input.trim()) {
      try {
        const newConfig = JSON.parse(input);
        config = { ...DEFAULT_CONFIG, ...newConfig };
        console.log('✓ Configuration updated.');
        
        // Save to file
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        console.log('✓ Configuration saved to file.');
      } catch (err) {
        console.error('Invalid JSON:', err.message);
      }
    }
    showOptions();
  });
};

// Check if webhook proxy is running
const checkWebhookProxy = async () => {
  try {
    const response = await axios.get(config.tokenEndpoint.replace('/token', '/health'));
    if (response.status === 200) {
      console.log('✓ Webhook proxy server is running');
      return true;
    }
  } catch (err) {
    console.error('✗ Could not connect to webhook proxy server');
    console.error(`  Please ensure it's running at ${config.tokenEndpoint.replace('/token', '')}`);
    return false;
  }
};

// Main function
const main = async () => {
  console.log('\n=======================================');
  console.log('    FLIP CARD EVENT SIMULATOR TOOL     ');
  console.log('=======================================');
  
  const proxyRunning = await checkWebhookProxy();
  if (!proxyRunning) {
    console.log('\nTo start the webhook proxy server, run:');
    console.log('  npm run events:start');
    rl.close();
    return;
  }
  
  showOptions();
};

// Run main function
main().catch(err => {
  console.error('Error in simulator:', err);
  rl.close();
});
