# Agent SDK Integration Guide

This guide provides step-by-step instructions for integrating the OpenAI Agent SDK into your projects. It covers installation, configuration, and common integration patterns.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Basic Configuration](#basic-configuration)
- [Integration Patterns](#integration-patterns)
- [Advanced Configuration](#advanced-configuration)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before integrating the SDK, ensure you have:

1. Node.js 14.x or higher
2. npm or yarn package manager
3. OpenAI API key (for cloud features)
4. Basic understanding of the [SDK architecture](./architecture.md)

## Installation

### 1. Install Required Packages

```bash
npm install openai
```

### 2. Update package.json

Add the following dependencies:

```json
{
  "dependencies": {
    "openai": "^4.24.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}
```

### 3. Environment Setup

Create a `.env` file in your project root:

```env
OPENAI_API_KEY=your-api-key
AGENT_SDK_DEBUG=true  # Enable debug logging
```

## Basic Configuration

### 1. Initialize the SDK

```javascript
import { initializeAgentSDK } from '@agent-sdk/core';

const agentSDK = initializeAgentSDK({
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4-turbo',
  debug: true,
  persistence: {
    enabled: true,
    adapter: 'sessionStorage'
  }
});
```

### 2. Configure Agent Options

```javascript
const agentConfig = {
  // Basic settings
  trackFlips: true,
  trackHover: true,
  trackSession: true,
  
  // Analytics configuration
  analyticsMode: 'batch',  // 'realtime' or 'batch'
  batchSize: 10,
  flushInterval: 5000,
  
  // Optimization settings
  optimizationInterval: 5, // Check for optimizations every 5 flips
  
  // Privacy settings
  anonymizeData: true,
  persistenceEnabled: true
};
```

## Integration Patterns

### 1. Basic Card Integration

```javascript
import { UniversalFlipCard } from './src/js/universal-flip-card';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize cards with agent integration
  const cards = document.querySelectorAll('.universal-card');
  
  const agentEnabledCards = Array.from(cards).map(card => 
    new UniversalFlipCard(card, {
      agentEnabled: true,
      enableHover: true,
      announceToScreenReader: true,
      agentConfig: {
        trackFlips: true,
        trackHover: true,
        analyticsMode: 'batch'
      }
    })
  );
});
```

### 2. React Component Integration

```jsx
import { useAgentSDK } from '@agent-sdk/react';

function FlipCard({ content, config }) {
  const { cardRef, agentState } = useAgentSDK(config);
  
  return (
    <div ref={cardRef} className="flip-card">
      <div className="card-front">
        {content.front}
      </div>
      <div className="card-back">
        {content.back}
      </div>
      
      {agentState.isOptimizing && (
        <div className="optimization-indicator">Optimizing...</div>
      )}
    </div>
  );
}
```

### 3. Event Handling Integration

```javascript
class CardEventManager {
  constructor(card, config = {}) {
    this.card = card;
    this.events = [];
    this.batchSize = config.batchSize || 10;
    this.flushInterval = config.flushInterval || 5000;
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    this.card.element.addEventListener('click', this.handleClick.bind(this));
    this.card.element.addEventListener('mouseover', this.handleHover.bind(this));
    this.card.element.addEventListener('flip', this.handleFlip.bind(this));
    
    // Set up batch processing
    this.flushTimer = setInterval(() => this.flushEvents(), this.flushInterval);
  }
  
  handleFlip(event) {
    this.recordEvent({
      type: 'flip',
      cardId: this.card.id,
      fromFace: event.detail.fromFace,
      toFace: event.detail.toFace,
      trigger: event.detail.trigger
    });
  }
  
  recordEvent(eventData) {
    this.events.push({
      ...eventData,
      timestamp: Date.now(),
      sessionId: this.card.sessionId
    });
    
    if (this.events.length >= this.batchSize) {
      this.flushEvents();
    }
  }
  
  async flushEvents() {
    if (this.events.length === 0) return;
    
    const eventsBatch = [...this.events];
    this.events = [];
    
    try {
      await cardInteractionAgent.processEvents(eventsBatch);
    } catch (error) {
      console.warn('Failed to process events:', error);
      // Re-add failed events for retry
      this.events = [...eventsBatch, ...this.events];
    }
  }
}
```

## Advanced Configuration

### 1. Custom Tool Handlers

```javascript
const customToolHandlers = {
  analyzePatterns: async (data) => {
    // Custom pattern analysis logic
    return {
      patterns: [
        {
          type: 'custom_pattern',
          confidence: 0.85,
          description: 'Custom pattern detected'
        }
      ],
      metrics: {
        customMetric1: 42,
        customMetric2: 'high'
      }
    };
  },
  
  optimizeCard: async (data) => {
    // Custom optimization logic
    return {
      styles: {
        frontFace: {
          fontSize: '1.2rem',
          color: '#333'
        }
      },
      behavior: {
        flipDelay: 150,
        autoFlip: false
      }
    };
  }
};

// Initialize SDK with custom handlers
const agentSDK = initializeAgentSDK({
  toolHandlers: customToolHandlers,
  // ... other config
});
```

### 2. Persistence Configuration

```javascript
const persistenceConfig = {
  enabled: true,
  adapter: 'sessionStorage', // or 'localStorage', 'custom'
  customAdapter: {
    // Custom persistence implementation
    save: async (key, data) => {
      // Custom save logic
      console.log(`Saving ${key}:`, data);
      // Example: saving to IndexedDB
      const db = await openDatabase();
      const tx = db.transaction('agentData', 'readwrite');
      await tx.objectStore('agentData').put({ key, data });
    },
    load: async (key) => {
      // Custom load logic
      const db = await openDatabase();
      const tx = db.transaction('agentData', 'readonly');
      return await tx.objectStore('agentData').get(key);
    },
    clear: async (key) => {
      // Custom clear logic
      const db = await openDatabase();
      const tx = db.transaction('agentData', 'readwrite');
      await tx.objectStore('agentData').delete(key);
    }
  }
};
```

### 3. Privacy Settings

```javascript
const privacyConfig = {
  anonymizeData: true,
  persistenceEnabled: true,
  dataRetentionDays: 7,
  allowedDataTypes: ['interactions', 'metrics'],
  excludedFields: ['userEmail', 'userId', 'ipAddress']
};
```

## Troubleshooting

### Common Issues

1. **Agent not initializing**
   - Check API key configuration
   - Verify environment variables are loaded properly
   - Check browser console for errors
   - Ensure your OpenAI account has sufficient credits

2. **Events not being tracked**
   - Verify agent is enabled for cards
   - Check batch configuration
   - Review event handler setup
   - Check network connectivity for API calls

3. **Optimizations not applying**
   - Check network connectivity
   - Verify optimization interval settings
   - Review console for API errors
   - Check CSS specificity to ensure optimizations aren't being overridden

4. **Performance issues**
   - Adjust batch size and flush intervals
   - Consider using the local-only implementation for high-traffic applications
   - Monitor API usage and adjust configuration accordingly

### Debugging

Enable debug mode for detailed logging:

```javascript
const agentSDK = initializeAgentSDK({
  debug: true,
  debugLevel: 'verbose', // 'error', 'warn', 'info', 'debug', 'verbose'
  logHandler: (level, message, data) => {
    console.log(`[Agent SDK] ${level}: ${message}`, data);
    
    // Optional: send logs to monitoring service
    if (level === 'error') {
      errorMonitoringService.report(message, data);
    }
  }
});
```

### Testing the Integration

To verify your integration is working correctly:

1. Enable debug mode
2. Interact with cards and check console output
3. Verify events are being sent to the Agent SDK
4. Check for optimization responses

```javascript
// Simple test function
function testAgentIntegration() {
  const testCard = document.querySelector('.universal-card');
  const card = new UniversalFlipCard(testCard, { agentEnabled: true });
  
  // Trigger events manually
  card.flip();
  
  // Check session
  console.log('Active sessions:', agentSDK.getActiveSessions());
  
  // Test optimization
  agentSDK.requestOptimization(card.sessionId)
    .then(result => {
      console.log('Optimization result:', result);
    })
    .catch(err => {
      console.error('Optimization failed:', err);
    });
}
```

## Performance Optimization

1. **Batch Processing**
   - Adjust batch size based on usage patterns
   - Configure appropriate flush intervals
   - Monitor network requests

2. **Memory Management**
   - Clear old sessions regularly
   - Implement proper cleanup in component unmount
   - Monitor event queue size

3. **Error Handling**
   - Implement proper fallbacks
   - Handle network failures gracefully
   - Log errors appropriately

## Best Practices

1. **Initialize Early**
   - Set up the Agent SDK as early as possible in your application lifecycle
   - Consider lazy-loading for performance optimization

2. **User Privacy**
   - Always anonymize user data
   - Provide clear opt-out mechanisms
   - Follow data retention best practices

3. **Progressive Enhancement**
   - Ensure cards work without the Agent SDK
   - Use the SDK to enhance functionality, not as a requirement
   - Implement fallbacks for all agent-dependent features

4. **Error Recovery**
   - Implement retry logic for failed requests
   - Cache events locally if connectivity is lost
   - Provide fallback behavior when agent services are unavailable

## Next Steps

- Review the [Architecture Guide](./architecture.md) for detailed implementation information
- Explore [Implementation Options](./implementation-options.md) for alternative approaches
- Check [Example Implementations](./examples/openai-implementation.md) for more patterns

For implementation alternatives that don't rely on OpenAI, see [Other Implementations](./examples/other-implementations.md).

Remember to review our [privacy and security guidelines](./architecture.md#7-privacy-and-security) when implementing the SDK.

