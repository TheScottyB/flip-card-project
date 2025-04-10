# OpenAI Agent SDK Implementation for Flip Card Project

This document outlines a lightweight implementation approach using the OpenAI Agent SDK to enhance the flip card system with intelligent agents.

## 1. Installation

```bash
npm install @openai/agent-sdk
```

Add to package.json:

```json
"dependencies": {
  "@openai/agent-sdk": "^0.1.x",
  "react": "^19.0.0",
  "react-dom": "^19.0.0"
}
```

## 2. Agent Definitions

### Card Interaction Agent

```javascript
// src/agents/card-interaction-agent.js
import { Agent, ToolRegistry } from '@openai/agent-sdk';
import { storeInteraction, analyzePatterns } from '../services/analytics-service';

// Set up tool registry
const toolRegistry = new ToolRegistry();

// Register analytics tools
toolRegistry.register('storeInteraction', {
  description: 'Store card interaction events',
  parameters: {
    type: 'object',
    properties: {
      eventType: { type: 'string' },
      cardId: { type: 'string' },
      timestamp: { type: 'number' },
      metadata: { type: 'object' }
    },
    required: ['eventType', 'cardId', 'timestamp']
  },
  handler: storeInteraction
});

toolRegistry.register('analyzePatterns', {
  description: 'Analyze user interaction patterns',
  parameters: {
    type: 'object',
    properties: {
      userId: { type: 'string' },
      timeframe: { type: 'string' },
      metricType: { type: 'string' }
    },
    required: ['userId']
  },
  handler: analyzePatterns
});

// Create agent
export const cardInteractionAgent = new Agent({
  name: 'CardInteractionAgent',
  description: 'Tracks and analyzes card interactions to identify patterns',
  tools: toolRegistry,
  instructions: `
    You are an agent responsible for tracking user interactions with flip cards.
    
    Your responsibilities:
    1. Collect and store interaction events (flips, hovers, view durations)
    2. Identify patterns in user behavior
    3. Suggest optimizations for card display and content
    4. Work asynchronously and efficiently
    
    Privacy requirements:
    - Never store personally identifiable information
    - Anonymize session data
    - Focus on aggregate patterns, not individual tracking
  `
});
```

### Card Optimization Agent

```javascript
// src/agents/card-optimization-agent.js
import { Agent, ToolRegistry } from '@openai/agent-sdk';
import { 
  generateCardOptimizations, 
  adjustCardStyles, 
  rebalanceCardContent 
} from '../services/optimization-service';

// Set up tool registry
const toolRegistry = new ToolRegistry();

// Register optimization tools
toolRegistry.register('generateCardOptimizations', {
  description: 'Generate optimizations for card display',
  parameters: {
    type: 'object',
    properties: {
      cardType: { type: 'string' },
      deviceType: { type: 'string' },
      interactionHistory: { type: 'array' }
    },
    required: ['cardType', 'deviceType']
  },
  handler: generateCardOptimizations
});

toolRegistry.register('adjustCardStyles', {
  description: 'Modify card styling based on user behavior',
  parameters: {
    type: 'object',
    properties: {
      cardId: { type: 'string' },
      styleAdjustments: { type: 'object' }
    },
    required: ['cardId', 'styleAdjustments']
  },
  handler: adjustCardStyles
});

toolRegistry.register('rebalanceCardContent', {
  description: 'Rebalance content between card faces',
  parameters: {
    type: 'object',
    properties: {
      cardId: { type: 'string' },
      frontFaceMetrics: { type: 'object' },
      backFaceMetrics: { type: 'object' }
    },
    required: ['cardId']
  },
  handler: rebalanceCardContent
});

// Create agent
export const cardOptimizationAgent = new Agent({
  name: 'CardOptimizationAgent',
  description: 'Optimizes card display and content based on interaction data',
  tools: toolRegistry,
  instructions: `
    You are an agent responsible for optimizing flip cards based on interaction data.
    
    Your responsibilities:
    1. Analyze interaction patterns to identify improvement opportunities
    2. Generate specific style and content adjustments
    3. Implement A/B tests to validate optimizations
    4. Continuously improve card performance
    
    Optimization priorities:
    - Increase engagement (flip rate, view time)
    - Improve conversion metrics
    - Enhance accessibility
    - Optimize for device capabilities
  `
});
```

## 3. Implementation in Card Components

### Universal Flip Card Integration

```javascript
// src/js/universal-flip-card.js

import { cardInteractionAgent } from '../agents/card-interaction-agent';

class UniversalFlipCard {
  constructor(element, options = {}) {
    // Existing initialization code...
    
    // Add agent integration
    this.agentEnabled = options.agentEnabled || false;
    
    if (this.agentEnabled) {
      this.setupAgentIntegration();
    }
  }
  
  setupAgentIntegration() {
    // Create unique session ID for this card instance
    this.sessionId = `card-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    
    // Initialize agent run
    this.agentRun = cardInteractionAgent.createRun({
      sessionId: this.sessionId,
      metadata: {
        cardType: 'universal',
        deviceCapabilities: this.capabilities,
        initialState: {
          isFlipped: this.isFlipped,
          inputMethod: this.inputMethod
        }
      }
    });
    
    // Set up session end handler
    window.addEventListener('beforeunload', this.endAgentSession.bind(this));
  }
  
  // Override flip method to integrate with agent
  flip(shouldFlip) {
    // Original flip implementation
    // [EXISTING CODE]
    
    // Agent interaction tracking
    if (this.agentEnabled && this.agentRun) {
      this.agentRun.submitToolOutputs([{
        toolName: 'storeInteraction',
        output: {
          eventType: 'flip',
          cardId: this.card.id || this.sessionId,
          timestamp: Date.now(),
          metadata: {
            isFlipped: this.isFlipped,
            inputMethod: this.inputMethod,
            viewDuration: Date.now() - (this.lastFlipTime || this.creationTime)
          }
        }
      }]);
      
      // Update last flip time
      this.lastFlipTime = Date.now();
      
      // Check for optimizations every 5 flips
      if (this.flipCount % 5 === 0) {
        this.requestOptimizations();
      }
    }
    
    // Return flip state
    return this.isFlipped;
  }
  
  // Request optimizations from the agent
  async requestOptimizations() {
    try {
      const response = await this.agentRun.submitToolOutputs([{
        toolName: 'analyzePatterns',
        output: {
          userId: this.sessionId,
          timeframe: 'current_session',
          metricType: 'engagement'
        }
      }]);
      
      // Apply optimizations if available
      if (response && response.optimizations) {
        this.applyOptimizations(response.optimizations);
      }
    } catch (error) {
      console.warn('Failed to get agent optimizations:', error);
    }
  }
  
  // Apply optimization suggestions from agent
  applyOptimizations(optimizations) {
    if (!optimizations) return;
    
    // Apply style optimizations
    if (optimizations.styles) {
      Object.entries(optimizations.styles).forEach(([property, value]) => {
        this.card.style.setProperty(`--card-${property}`, value);
      });
    }
    
    // Apply behavior optimizations
    if (optimizations.behavior) {
      if (optimizations.behavior.hoverEnabled !== undefined) {
        this.setHoverEnabled(optimizations.behavior.hoverEnabled);
      }
      
      if (optimizations.behavior.animationDuration) {
        this.card.style.setProperty('--flip-duration', 
          optimizations.behavior.animationDuration + 'ms');
      }
    }
    
    // Log applied optimizations
    console.log('Applied card optimizations:', optimizations);
  }
  
  // Clean up agent session
  endAgentSession() {
    if (this.agentEnabled && this.agentRun) {
      this.agentRun.submitToolOutputs([{
        toolName: 'storeInteraction',
        output: {
          eventType: 'session_end',
          cardId: this.card.id || this.sessionId,
          timestamp: Date.now(),
          metadata: {
            totalDuration: Date.now() - this.creationTime,
            flipCount: this.flipCount || 0,
            finalState: {
              isFlipped: this.isFlipped,
              inputMethod: this.inputMethod
            }
          }
        }
      }]);
      
      // Complete the run
      this.agentRun.complete();
    }
  }
}
```

## 4. Service Implementations

### Analytics Service

```javascript
// src/services/analytics-service.js

// Simple in-memory storage for demo purposes
// In production, use a proper database or analytics service
const interactionStore = [];

/**
 * Store a card interaction event
 */
export async function storeInteraction(params) {
  const { eventType, cardId, timestamp, metadata } = params;
  
  // Add to store
  interactionStore.push({
    eventType,
    cardId,
    timestamp,
    metadata: metadata || {},
  });
  
  // In a real implementation, we would batch and send to a server
  if (interactionStore.length >= 10) {
    await sendBatchToServer(interactionStore.slice(-10));
  }
  
  return { success: true, eventCount: interactionStore.length };
}

/**
 * Analyze interaction patterns
 */
export async function analyzePatterns(params) {
  const { userId, timeframe = 'all', metricType = 'all' } = params;
  
  // Filter events for this user/session
  const userEvents = interactionStore.filter(event => 
    event.metadata.sessionId === userId || event.cardId === userId);
  
  // Simple analysis - in production this would be more sophisticated
  const flipEvents = userEvents.filter(e => e.eventType === 'flip');
  const hoverEvents = userEvents.filter(e => 
    e.eventType === 'hoverStart' || e.eventType === 'hoverEnd');
  
  const avgViewDuration = calculateAverageViewDuration(flipEvents);
  const flipFrequency = calculateFlipFrequency(flipEvents);
  const deviceType = determineDeviceType(userEvents);
  
  return {
    metrics: {
      totalEvents: userEvents.length,
      flipCount: flipEvents.length,
      hoverCount: hoverEvents.length,
      avgViewDuration,
      flipFrequency,
    },
    deviceType,
    recommendations: generateRecommendations({
      avgViewDuration,
      flipFrequency,
      deviceType
    })
  };
}

// Helper functions
function calculateAverageViewDuration(flipEvents) {
  if (flipEvents.length < 2) return 0;
  
  let totalDuration = 0;
  let count = 0;
  
  for (let i = 1; i < flipEvents.length; i++) {
    const duration = flipEvents[i].timestamp - flipEvents[i-1].timestamp;
    if (duration > 0 && duration < 300000) { // Ignore outliers over 5 minutes
      totalDuration += duration;
      count++;
    }
  }
  
  return count > 0 ? Math.round(totalDuration / count) : 0;
}

function calculateFlipFrequency(flipEvents) {
  if (flipEvents.length < 2) return 0;
  
  const firstEvent = flipEvents[0];
  const lastEvent = flipEvents[flipEvents.length - 1];
  const totalTimeMs = lastEvent.timestamp - firstEvent.timestamp;
  
  if (totalTimeMs <= 0) return 0;
  
  // Events per minute
  return (flipEvents.length / totalTimeMs) * 60000;
}

function determineDeviceType(events) {
  // Use the most recent event with device info
  const eventWithDevice = [...events].reverse()
    .find(e => e.metadata && e.metadata.deviceCapabilities);
  
  if (!eventWithDevice) return 'unknown';
  
  const { deviceCapabilities } = eventWithDevice.metadata;
  
  if (deviceCapabilities.touch && !deviceCapabilities.pointer) {
    return 'mobile';
  } else if (deviceCapabilities.screenWidth < 768) {
    return 'mobile';
  } else if (deviceCapabilities.screenWidth < 1024) {
    return 'tablet';
  } else {
    return 'desktop';
  }
}

function generateRecommendations(metrics) {
  const { avgViewDuration, flipFrequency, deviceType } = metrics;
  
  // Simple rule-based recommendations
  // In production, this would use more sophisticated ML models
  const recommendations = [];
  
  if (avgViewDuration < 2000) {
    recommendations.push({
      type: 'content',
      action: 'simplify',
      reason: 'Short view duration indicates content may be too complex'
    });
  }
  
  if (flipFrequency > 10) {
    recommendations.push({
      type: 'behavior',
      action: 'adjustTiming',
      reason: 'High flip frequency suggests user is exploring quickly'
    });
  }
  
  if (deviceType === 'mobile' && avgViewDuration < 1500) {
    recommendations.push({
      type: 'layout',
      action: 'increaseFontSize',
      reason: 'Mobile users are spending little time reading, text may be too small'
    });
  }
  
  return recommendations;
}

// Mock server communication
async function sendBatchToServer(events) {
  console.log(`[Analytics] Sending ${events.length} events to server`);
  // In production, this would POST to an API endpoint
  return { success: true };
}
```

### Optimization Service

```javascript
// src/services/optimization-service.js

/**
 * Generate card optimizations based on user behavior
 */
export async function generateCardOptimizations(params) {
  const { cardType, deviceType, interactionHistory = [] } = params;
  
  // Default optimizations
  const optimizations = {
    styles: {},
    behavior: {},
    content: {}
  };
  
  // Apply device-specific optimizations
  switch (deviceType) {
    case 'mobile':
      optimizations.styles = {
        ...optimizations.styles,
        fontSize: '1.1rem',
        padding: '1rem',
        borderRadius: '0.75rem',
        shadow: '0 2px 8px rgba(0,0,0,0.15)'
      };
      optimizations.behavior = {
        ...optimizations.behavior,
        hoverEnabled: false,
        animationDuration: 450 // Slightly faster animations for mobile
      };
      break;
      
    case 'tablet':
      optimizations.styles = {
        ...optimizations.styles,
        maxWidth: '85%',
        padding: '1.25rem',
        borderRadius: '1rem'
      };
      break;
      
    case 'desktop':
      optimizations.styles = {
        ...optimizations.styles,
        maxWidth: '400px',
        padding: '1.5rem',
        borderRadius: '1rem',
        shadow: '0 4px 12px rgba(0,0,0,0.1)'
      };
      optimizations.behavior = {
        ...optimizations.behavior,
        hoverEnabled: true
      };
      break;
  }
  
  // Analyze interaction history for more specific optimizations
  if (interactionHistory.length > 0) {
    const avgViewDuration = calculateAverageViewTime(interactionHistory);
    
    // Content density adjustments based on view time
    if (avgViewDuration < 2000) {
      // Users spending little time - simplify content
      optimizations.content.densityLevel = 'low';
      optimizations.styles.lineHeight = '1.6';
    } else if (avgViewDuration > 8000) {
      // Users spending lot of time - can handle more content
      optimizations.content.densityLevel = 'high';
      optimizations.styles.lineHeight = '1.4';
    }
    
    // Animation speed adjustments based on flip frequency
    const flipFrequency = calculateFlipFrequency(interactionHistory);
    if (flipFrequency > 0.2) { // More than 1 flip every 5 seconds
      // Fast flipper - speed up animations
      optimizations.behavior.animationDuration = 400;
    } else if (flipFrequency < 0.05) { // Less than 1 flip every 20 seconds
      // Slow, deliberate user - can use slightly longer animations
      optimizations.behavior.animationDuration = 700;
    }
  }
  
  return optimizations;
}

/**
 * Apply style adjustments to a specific card
 */
export async function adjustCardStyles(params) {
  const { cardId, styleAdjustments } = params;
  
  // In a real implementation, this would update a database or config
  // For demo purposes, we'll just return the styles to be applied
  console.log(`[Optimization] Applying styles to card ${cardId}:`, styleAdjustments);
  
  return {
    success: true,
    styles: styleAdjustments,
    cardId
  };
}

/**
 * Rebalance content between card faces based on metrics
 */
export async function rebalanceCardContent(params) {
  const { cardId, frontFaceMetrics, backFaceMetrics } = params;
  
  // Analyze which content elements should move between faces
  let contentMoves = [];
  
  // Example logic - move elements that get little attention to the other face
  if (frontFaceMetrics && backFaceMetrics) {
    // Find low-attention elements on front face
    const frontLowAttention = findLowAttentionElements(frontFaceMetrics);
    
    // Find high-attention elements on back face
    const backHighAttention = findHighAttentionElements(backFaceMetrics);
    
    // Suggest content moves
    contentMoves = [
      ...frontLowAttention.map(el => ({
        element: el.id,
        from: 'front',
        to: 'back',
        reason: 'Low attention on front face'
      })),
      ...backHighAttention.map(el => ({
        element: el.id,
        from: 'back',
        to: 'front',
        reason: 'High attention on back face should be more accessible'
      }))
    ];
  }
  
  console.log(`[Optimization] Content rebalancing for card ${cardId}:`, contentMoves);
  
  return {
    success: true,
    contentMoves,
    cardId
  };
}

// Helper functions
function calculateAverageViewTime(interactions) {
  const flipEvents = interactions.filter(i => i.type === 'flip');
  if (flipEvents.length < 2) return 0;
  
  let totalDuration = 0;
  let count = 0;
  
  for (let i = 1; i < flipEvents.length; i++) {
    const duration = flipEvents[i].timestamp - flipEvents[i-1].timestamp;
    if (duration > 0 && duration < 300000) { // Ignore outliers over 5 minutes
      totalDuration += duration;
      count++;
    }
  }
  
  return count > 0 ? Math.round(totalDuration / count) : 0;
}

function calculateFlipFrequency(interactions) {
  const flipEvents = interactions.filter(i => i.type === 'flip');
  if (flipEvents.length < 2) return 0;
  
  const firstEvent = flipEvents[0];
  const lastEvent = flipEvents[flipEvents.length - 1];
  const totalTimeMs = lastEvent.timestamp - firstEvent.timestamp;
  
  if (totalTimeMs <= 0) return 0;
  
  // Flips per second
  return flipEvents.length / (totalTimeMs / 1000);
}

function findLowAttentionElements(metrics) {
  // In a real implementation, this would analyze heatmap or element-level metrics
  // For demo, return placeholder data
  return [
    { id: 'credentials-section', score: 0.2 },
    { id: 'company-details', score: 0.3 }
  ];
}

function findHighAttentionElements(metrics) {
  // Placeholder implementation
  return [
    { id: 'contact-info', score: 0.8 },
    { id: 'callback-button', score: 0.9 }
  ];
}
```

## 5. Usage Example

```javascript
// Using the agent-enabled universal flip card

import { UniversalFlipCard } from './src/js/universal-flip-card';

// Initialize with agent integration
document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.universal-card');
  
  const agentEnabledCards = Array.from(cards).map(card => 
    new UniversalFlipCard(card, {
      agentEnabled: true,
      enableHover: true,
      announceToScreenReader: true
    })
  );
  
  console.log(`Initialized ${agentEnabledCards.length} agent-enabled flip cards`);
});
```

## 6. Performance Considerations

1. **Lazy Loading**: Agent SDK is loaded only when needed
2. **Batched Events**: Interactions are batched to minimize API calls
3. **Minimal UI Updates**: Optimizations are applied incrementally
4. **Fallback Behavior**: Cards function normally if agent is unavailable
5. **Caching**: Common optimizations are cached for reuse

## 7. Privacy and Security

1. All user data is anonymized before processing
2. No session data contains PII (personally identifiable information)
3. Aggregated metrics are used for optimization decisions
4. Users can opt out of intelligence features via data-attribute
5. Session data is auto-expired after 24 hours

## 8. Future Extensions

1. **A/B Testing**: Automatic variant generation and tracking
2. **Cross-Card Learning**: Apply insights from one card type to others
3. **Content Optimization**: Dynamic content rebalancing between card faces
4. **Predictive Preloading**: Use ML to predict which cards user will interact with
5. **Adaptive Accessibility**: Automatically enhance accessibility based on usage patterns