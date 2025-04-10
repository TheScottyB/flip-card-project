# OpenAI-Powered Agent Implementation for Flip Card Project

This document outlines a practical, maintainable implementation approach using OpenAI's APIs to enhance the flip card system with intelligent agents.

## Managed Runner Architecture

The implementation uses a lightweight "managed runner" architecture aligned with OpenAI's APIs that provides several key advantages:

1. **Simplified Maintenance**: Centralizes configuration and reduces boilerplate
2. **Modular Implementation**: Enables easy swapping of underlying agent technology
3. **Flexible Deployment**: Supports both client-side and server-side execution
4. **Minimal Dependencies**: Reduces version conflicts and update requirements
5. **Easier Testing**: Allows for mocking of agent behaviors in development

### How It Works

1. Core operations are handled by a minimal `AgentRunner` that integrates with OpenAI APIs
2. Agents are defined using Functions API format for tool definition
3. The runner orchestrates communication and handles all networking and state management  
4. Implementation details are isolated, allowing us to switch between Assistants API, Functions API, or custom implementations

```
  ┌─────────────────┐     ┌─────────────────┐
  │ Card Components │     │ Business Logic  │
  └────────┬────────┘     └────────┬────────┘
           │                       │
           ▼                       ▼
  ┌─────────────────────────────────────────┐
  │            Agent Runner API             │
  └────────────────────┬────────────────────┘
                       │
                       ▼
  ┌─────────────────────────────────────────┐
  │      Implementation Adapter Layer       │
  └────────┬─────────────────────┬──────────┘
           │                     │
           ▼                     ▼
  ┌────────────────┐    ┌────────────────────┐
  │ OpenAI APIs    │    │ Alternative        │
  │ Implementation │    │ Implementations    │
  └────────────────┘    └────────────────────┘
```

## 1. Installation

```bash
npm install openai
```

Add to package.json:

```json
"dependencies": {
  "openai": "^4.24.0",
  "react": "^19.0.0",
  "react-dom": "^19.0.0"
}
```

## 2. Agent Definitions

### Card Interaction Agent

```javascript
// src/agents/card-interaction-agent.js
import OpenAI from 'openai';
import { storeInteraction, analyzePatterns } from '../services/analytics-service';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Only for client-side demo; use server-side in production
});

// Define functions using OpenAI Functions API format
const functions = [
  {
    name: 'storeInteraction',
    description: 'Store card interaction events',
    parameters: {
      type: 'object',
      properties: {
        eventType: { 
          type: 'string',
          description: 'Type of interaction event (flip, hover, touch, etc.)'
        },
        cardId: { 
          type: 'string',
          description: 'Unique identifier for the card'
        },
        timestamp: { 
          type: 'integer',
          description: 'Unix timestamp of when the event occurred'
        },
        metadata: { 
          type: 'object',
          description: 'Additional data about the interaction'
        }
      },
      required: ['eventType', 'cardId', 'timestamp']
    }
  },
  {
    name: 'analyzePatterns',
    description: 'Analyze user interaction patterns to identify usage trends',
    parameters: {
      type: 'object',
      properties: {
        userId: { 
          type: 'string',
          description: 'Unique identifier for the user or session'
        },
        timeframe: { 
          type: 'string',
          enum: ['current_session', 'today', 'week', 'month', 'all'],
          description: 'Time period to analyze'
        },
        metricType: { 
          type: 'string',
          enum: ['engagement', 'conversion', 'usability', 'all'],
          description: 'Type of metrics to analyze'
        }
      },
      required: ['userId']
    }
  }
];

// System message that defines the agent's behavior
const systemMessage = `
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
`;

// Function handlers for the tools
const functionHandlers = {
  storeInteraction,
  analyzePatterns
};

/**
 * Managed runner for Card Interaction Agent that integrates with OpenAI
 */
class CardInteractionAgentRunner {
  constructor(options = {}) {
    this.options = {
      model: 'gpt-4o',
      temperature: 0.2,
      allowFallback: true,
      timeout: 5000,
      deploymentMode: 'hybrid', // 'client', 'server', or 'hybrid'
      ...options
    };
    
    this.sessions = new Map();
  }
  
  /**
   * Start a tracking session
   */
  startSession(params) {
    const sessionId = params.sessionId || `session-${Date.now()}`;
    
    // Initialize the session
    const session = {
      id: sessionId,
      startTime: Date.now(),
      metadata: params.metadata || {},
      events: [],
      
      // Track an interaction event
      trackEvent: async (eventName, data) => {
        // Store event in session history
        const event = {
          type: eventName,
          data,
          timestamp: Date.now()
        };
        
        session.events.push(event);
        
        // Process with appropriate handler based on event type
        if (eventName === 'storeInteraction') {
          await this.executeTool('storeInteraction', data);
        } else if (eventName === 'storeBatchInteractions' && data.events) {
          // Handle batch operations
          for (const event of data.events) {
            await this.executeTool('storeInteraction', event);
          }
        }
        
        return { success: true };
      },
      
      // Run a specific tool with AI assistance
      runTool: async (toolName, data) => {
        if (toolName === 'analyzePatterns') {
          // This requires AI capabilities
          return this.analyzeWithAI(session, data);
        } else {
          // Direct tool execution for non-AI tools
          return this.executeTool(toolName, data);
        }
      },
      
      // End the session
      end: () => {
        session.endTime = Date.now();
        session.duration = session.endTime - session.startTime;
        
        // Store final session data
        console.log(`Session ${sessionId} ended after ${session.duration}ms with ${session.events.length} events`);
        
        // Clean up
        this.sessions.delete(sessionId);
        
        return { success: true };
      }
    };
    
    // Store the session
    this.sessions.set(sessionId, session);
    
    return session;
  }
  
  /**
   * Execute a function directly
   */
  async executeTool(toolName, data) {
    try {
      // Check if we have a handler for this tool
      if (functionHandlers[toolName]) {
        return await functionHandlers[toolName](data);
      }
      
      console.warn(`No handler for tool: ${toolName}`);
      return null;
    } catch (error) {
      console.error(`Error executing tool ${toolName}:`, error);
      
      // Return error information
      return {
        error: true,
        message: error.message
      };
    }
  }
  
  /**
   * Use OpenAI to analyze patterns
   */
  async analyzeWithAI(session, data) {
    try {
      // Prepare context from session events
      const events = session.events
        .filter(e => e.type === 'storeInteraction')
        .map(e => e.data);
      
      // If no events, return empty analysis
      if (events.length === 0) {
        return {
          patterns: [],
          metrics: { totalEvents: 0 }
        };
      }
      
      // Structure messages for OpenAI
      const messages = [
        { role: 'system', content: systemMessage },
        { role: 'user', content: `Analyze these card interaction events for user ${data.userId} and identify usage patterns:\n${JSON.stringify(events, null, 2)}` }
      ];
      
      // For client-side/fallback mode, use simplified approach
      if (this.options.deploymentMode === 'client' || 
          (this.options.allowFallback && !process.env.OPENAI_API_KEY)) {
        return this.generateFallbackAnalysis(events);
      }
      
      // Call OpenAI API with function calling
      const response = await openai.chat.completions.create({
        model: this.options.model,
        temperature: this.options.temperature,
        messages,
        functions,
        function_call: 'auto'
      });
      
      // Extract the analysis from the response
      const responseMessage = response.choices[0].message;
      
      if (responseMessage.function_call && 
          responseMessage.function_call.name === 'analyzePatterns') {
        // Parse the function arguments
        const args = JSON.parse(responseMessage.function_call.arguments);
        
        // Validate and return the results
        return {
          patterns: args.patterns || [],
          metrics: args.metrics || {},
          recommendations: args.recommendations || []
        };
      }
      
      // If no function call, extract insights from the message content
      const content = responseMessage.content || '';
      return {
        patterns: [{ type: 'general_observation', description: content }],
        metrics: { totalEvents: events.length }
      };
    } catch (error) {
      console.error('Error analyzing patterns with AI:', error);
      
      // Fallback to simplified analysis
      return this.generateFallbackAnalysis(events);
    }
  }
  
  /**
   * Generate basic analysis without requiring OpenAI
   */
  generateFallbackAnalysis(events) {
    // Extract flip events
    const flipEvents = events.filter(e => e.eventType === 'flip');
    
    // Calculate basic metrics
    const flipCount = flipEvents.length;
    let avgViewDuration = 0;
    
    if (flipCount >= 2) {
      let totalDuration = 0;
      let count = 0;
      
      for (let i = 1; i < flipEvents.length; i++) {
        const duration = flipEvents[i].timestamp - flipEvents[i-1].timestamp;
        if (duration > 0 && duration < 300000) { // Ignore outliers
          totalDuration += duration;
          count++;
        }
      }
      
      avgViewDuration = count > 0 ? Math.round(totalDuration / count) : 0;
    }
    
    // Generate basic patterns
    const patterns = [];
    
    if (avgViewDuration < 2000 && flipCount > 0) {
      patterns.push({
        type: 'short_view',
        confidence: 0.8,
        description: 'User is spending very little time viewing each side'
      });
    } else if (avgViewDuration > 10000 && flipCount > 0) {
      patterns.push({
        type: 'long_view',
        confidence: 0.8,
        description: 'User is spending significant time on each side'
      });
    }
    
    if (flipCount > 5 && avgViewDuration < 3000) {
      patterns.push({
        type: 'rapid_exploration',
        confidence: 0.7,
        description: 'User is rapidly exploring card content'
      });
    }
    
    // Return simplified analysis
    return {
      patterns,
      metrics: {
        flipCount,
        avgViewDuration,
        totalEvents: events.length
      }
    };
  }
}

// Export a singleton instance
export const cardInteractionAgent = new CardInteractionAgentRunner({
  deploymentMode: process.env.NODE_ENV === 'production' ? 'hybrid' : 'client'
});
```

### Card Optimization Agent

```javascript
// src/agents/card-optimization-agent.js
import OpenAI from 'openai';
import { 
  generateCardOptimizations, 
  adjustCardStyles, 
  rebalanceCardContent 
} from '../services/optimization-service';

// Initialize OpenAI client - in production this should be server-side only
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Only for demo purposes
});

// Define functions using OpenAI Functions API format
const functions = [
  {
    name: 'generateCardOptimizations',
    description: 'Generate optimizations for card display based on user interaction data',
    parameters: {
      type: 'object',
      properties: {
        cardType: { 
          type: 'string',
          enum: ['standard', 'contact', 'product', 'universal', 'loan'],
          description: 'The type of card to optimize'
        },
        deviceType: { 
          type: 'string', 
          enum: ['mobile', 'tablet', 'desktop'],
          description: 'The device type to optimize for'
        },
        interactionHistory: { 
          type: 'array',
          description: 'Array of previous user interactions with cards'
        },
        userPreferences: {
          type: 'object',
          properties: {
            prefersReducedMotion: { type: 'boolean' },
            prefersDarkMode: { type: 'boolean' },
            preferredColorScheme: { type: 'string' }
          },
          description: 'User preferences that may affect optimization recommendations'
        }
      },
      required: ['cardType', 'deviceType']
    }
  },
  {
    name: 'adjustCardStyles',
    description: 'Apply styling changes to a specific card',
    parameters: {
      type: 'object',
      properties: {
        cardId: { 
          type: 'string',
          description: 'Unique identifier for the card'
        },
        styleAdjustments: { 
          type: 'object',
          properties: {
            fontSize: { type: 'string' },
            lineHeight: { type: 'string' },
            padding: { type: 'string' },
            borderRadius: { type: 'string' },
            animationDuration: { type: 'number' },
            shadow: { type: 'string' },
            maxWidth: { type: 'string' }
          },
          description: 'CSS properties to modify on the card'
        }
      },
      required: ['cardId', 'styleAdjustments']
    }
  },
  {
    name: 'rebalanceCardContent',
    description: 'Move content between card faces for optimal user experience',
    parameters: {
      type: 'object',
      properties: {
        cardId: { 
          type: 'string',
          description: 'Unique identifier for the card'
        },
        frontFaceMetrics: { 
          type: 'object',
          properties: {
            viewTime: { type: 'number' },
            interactionCount: { type: 'number' },
            contentDensity: { type: 'string' }
          },
          description: 'Metrics about the front face of the card'
        },
        backFaceMetrics: { 
          type: 'object',
          properties: {
            viewTime: { type: 'number' },
            interactionCount: { type: 'number' },
            contentDensity: { type: 'string' }
          },
          description: 'Metrics about the back face of the card'
        },
        recommendedChanges: {
          type: 'object',
          properties: {
            moveToFront: { type: 'array', items: { type: 'string' } },
            moveToBack: { type: 'array', items: { type: 'string' } }
          },
          description: 'Recommended content elements to move between card faces'
        }
      },
      required: ['cardId']
    }
  }
];

// System message that defines the agent's behavior
const systemMessage = `
You are an expert AI assistant specialized in optimizing interactive card components.

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

When recommending optimizations:
- For mobile devices, prefer larger touch targets (min 44px), larger fonts, and simpler layouts
- For users with reduced motion preference, suggest disabling animations
- For low engagement cards (short view times), suggest content simplification
- For high flip rates, suggest better content organization between front/back faces
`;

// Function handlers for the tools
const functionHandlers = {
  generateCardOptimizations,
  adjustCardStyles,
  rebalanceCardContent
};

/**
 * Card Optimization Agent that uses OpenAI's API
 */
class CardOptimizationAgent {
  constructor(options = {}) {
    this.options = {
      model: 'gpt-4o',
      temperature: 0.1, // Lower temperature for more consistent recommendations
      deploymentMode: 'server', // Prefer server-side for optimization logic
      allowFallback: true,
      cacheResults: true,
      ...options
    };
    
    this.optimizationCache = new Map();
    this.pendingTasks = new Map();
  }
  
  /**
   * Run an optimization task using OpenAI
   */
  async run(task) {
    const { action, inputs } = task;
    const taskId = `${action}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    
    // Create a promise that will be resolved when the task completes
    let resolveTask, rejectTask;
    const taskPromise = new Promise((resolve, reject) => {
      resolveTask = resolve;
      rejectTask = reject;
    });
    
    // Store the task
    this.pendingTasks.set(taskId, {
      id: taskId,
      action,
      inputs,
      status: 'pending',
      startTime: Date.now(),
      onComplete: null,
      promise: taskPromise,
      resolve: resolveTask,
      reject: rejectTask
    });
    
    // Process the task
    this.processTask(taskId)
      .then(result => {
        const task = this.pendingTasks.get(taskId);
        if (task) {
          task.status = 'completed';
          task.result = result;
          task.completedAt = Date.now();
          
          // Call the onComplete callback if registered
          if (task.onComplete) {
            task.onComplete(result);
          }
          
          // Resolve the promise
          task.resolve(result);
          
          // Clean up after some time
          setTimeout(() => {
            this.pendingTasks.delete(taskId);
          }, 60000);
        }
      })
      .catch(error => {
        const task = this.pendingTasks.get(taskId);
        if (task) {
          task.status = 'error';
          task.error = error;
          task.completedAt = Date.now();
          task.reject(error);
          
          // Clean up after some time
          setTimeout(() => {
            this.pendingTasks.delete(taskId);
          }, 60000);
        }
      });
    
    // Return a task object with methods to check status and register callbacks
    return {
      id: taskId,
      onComplete: (callback) => {
        const task = this.pendingTasks.get(taskId);
        if (task) {
          task.onComplete = callback;
          // If task already completed, call the callback immediately
          if (task.status === 'completed' && task.result) {
            callback(task.result);
          }
        }
        return taskPromise;
      },
      getStatus: () => {
        const task = this.pendingTasks.get(taskId);
        return task ? task.status : 'unknown';
      },
      getResult: () => {
        const task = this.pendingTasks.get(taskId);
        return task && task.status === 'completed' ? task.result : null;
      },
      cancel: () => {
        const task = this.pendingTasks.get(taskId);
        if (task && task.status === 'pending') {
          task.status = 'cancelled';
          task.completedAt = Date.now();
          this.pendingTasks.delete(taskId);
          return true;
        }
        return false;
      }
    };
  }
  
  /**
   * Process a task with OpenAI or fallback
   */
  async processTask(taskId) {
    const task = this.pendingTasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }
    
    // Check cache first if enabled
    if (this.options.cacheResults) {
      const cacheKey = `${task.action}-${JSON.stringify(task.inputs)}`;
      const cachedResult = this.optimizationCache.get(cacheKey);
      if (cachedResult) {
        console.log(`Using cached result for ${task.action}`);
        return cachedResult;
      }
    }
    
    // Select function based on the action
    let functionName = null;
    switch (task.action) {
      case 'generateOptimizations':
        functionName = 'generateCardOptimizations';
        break;
      case 'adjustStyles':
        functionName = 'adjustCardStyles';
        break;
      case 'rebalanceContent':
        functionName = 'rebalanceCardContent';
        break;
    }
    
    // If we're in client mode or need to use fallback, use local implementation
    if ((this.options.deploymentMode === 'client' || 
        (this.options.allowFallback && !process.env.OPENAI_API_KEY)) &&
        functionHandlers[functionName]) {
      return await functionHandlers[functionName](task.inputs);
    }
    
    try {
      // Create messages for the API call
      const messages = [
        { role: 'system', content: systemMessage },
        { role: 'user', content: `Analyze the following data and optimize the card experience:\n${JSON.stringify(task.inputs, null, 2)}` }
      ];
      
      // Call OpenAI API
      const response = await openai.chat.completions.create({
        model: this.options.model,
        temperature: this.options.temperature,
        messages,
        functions,
        function_call: { name: functionName }
      });
      
      // Extract the result
      const responseMessage = response.choices[0].message;
      
      if (responseMessage.function_call) {
        const result = JSON.parse(responseMessage.function_call.arguments);
        
        // Cache the result if caching is enabled
        if (this.options.cacheResults) {
          const cacheKey = `${task.action}-${JSON.stringify(task.inputs)}`;
          this.optimizationCache.set(cacheKey, result);
        }
        
        return result;
      }
      
      // If no function call, return the content as a general recommendation
      return {
        generalRecommendation: responseMessage.content,
        type: 'general'
      };
      
    } catch (error) {
      console.error(`Error processing task ${taskId}:`, error);
      
      // Fall back to local implementations if available
      if (this.options.allowFallback && functionHandlers[functionName]) {
        console.log(`Falling back to local implementation for ${functionName}`);
        return await functionHandlers[functionName](task.inputs);
      }
      
      throw error;
    }
  }
}

// Export a singleton instance
export const cardOptimizationAgent = new CardOptimizationAgent({
  deploymentMode: process.env.NODE_ENV === 'production' ? 'server' : 'client'
});
```

## 3. Implementation in Card Components

### Universal Flip Card Integration

```javascript
// src/js/universal-flip-card.js

import { cardInteractionAgent } from '../agents/card-interaction-agent';
import { agentOrchestrator } from '../agents/agent-orchestrator';

class UniversalFlipCard {
  constructor(element, options = {}) {
    // Existing initialization code...
    
    // Add agent integration
    this.agentEnabled = options.agentEnabled || false;
    
    if (this.agentEnabled) {
      this.setupAgentIntegration(options.agentConfig || {});
    }
  }
  
  setupAgentIntegration(agentConfig = {}) {
    // Setup tracking configuration
    this.agentConfig = {
      // Merge default and provided config
      trackFlips: true,
      trackHover: true,
      trackSession: true,
      optimizationInterval: 5, // Check for optimizations every 5 flips
      analyticsMode: 'batch',  // 'realtime' or 'batch'
      ...agentConfig
    };
    
    // Create unique session ID for this card instance
    this.sessionId = `card-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    this.creationTime = Date.now();
    this.flipCount = 0;
    this.interactionQueue = [];
    
    // Start a card tracking session
    this.trackingSession = cardInteractionAgent.startSession({
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
    
    // Initialize the orchestrator if not already done
    if (!window.agentOrchestratorInitialized) {
      agentOrchestrator.init();
      window.agentOrchestratorInitialized = true;
    }
    
    console.log(`Agent integration initialized for card ${this.sessionId}`);
  }
  
  // Override flip method to integrate with agent
  flip(shouldFlip) {
    // Original flip implementation
    // [EXISTING CODE]
    
    // Track interactions when agent is enabled
    if (this.agentEnabled) {
      // Increment flip count
      this.flipCount++;
      
      // Record the interaction data
      const interactionData = {
        eventType: 'flip',
        cardId: this.card.id || this.sessionId,
        timestamp: Date.now(),
        metadata: {
          isFlipped: this.isFlipped,
          inputMethod: this.inputMethod,
          viewDuration: Date.now() - (this.lastFlipTime || this.creationTime)
        }
      };
      
      // Update last flip time
      this.lastFlipTime = Date.now();
      
      // Track the interaction (with batching support)
      if (this.agentConfig.analyticsMode === 'batch') {
        this.interactionQueue.push(interactionData);
        
        // Send batch if queue gets large enough
        if (this.interactionQueue.length >= 3) {
          this.sendInteractionBatch();
        }
      } else {
        // Realtime mode - send immediately
        this.trackingSession.trackEvent('storeInteraction', interactionData);
      }
      
      // Check for optimizations periodically
      if (this.flipCount % this.agentConfig.optimizationInterval === 0) {
        this.requestOptimizations();
      }
    }
    
    // Return flip state
    return this.isFlipped;
  }
  
  // Handle hover start with agent integration
  handleHoverStart() {
    // Original implementation
    // [EXISTING CODE]
    
    // Add agent tracking
    if (this.agentEnabled && this.agentConfig.trackHover) {
      this.hoverStartTime = Date.now();
      
      this.trackingSession.trackEvent('storeInteraction', {
        eventType: 'hoverStart',
        cardId: this.card.id || this.sessionId,
        timestamp: Date.now()
      });
    }
  }
  
  // Handle hover end with agent integration
  handleHoverEnd() {
    // Original implementation
    // [EXISTING CODE]
    
    // Add agent tracking
    if (this.agentEnabled && this.agentConfig.trackHover && this.hoverStartTime) {
      const hoverDuration = Date.now() - this.hoverStartTime;
      
      this.trackingSession.trackEvent('storeInteraction', {
        eventType: 'hoverEnd',
        cardId: this.card.id || this.sessionId,
        timestamp: Date.now(),
        metadata: {
          duration: hoverDuration
        }
      });
      
      this.hoverStartTime = null;
    }
  }
  
  // Send queued interactions in batch
  sendInteractionBatch() {
    if (!this.interactionQueue.length) return;
    
    // Clone and clear the queue
    const batch = [...this.interactionQueue];
    this.interactionQueue = [];
    
    // Send as a single batch operation
    this.trackingSession.trackEvent('storeBatchInteractions', {
      events: batch,
      batchId: `${this.sessionId}-${Date.now()}`,
      cardId: this.card.id || this.sessionId
    });
  }
  
  // Request optimizations through agent orchestrator
  async requestOptimizations() {
    // Ensure any pending interactions are sent first
    if (this.interactionQueue.length > 0) {
      this.sendInteractionBatch();
    }
    
    try {
      // Use analyzer tool to get insights
      const analysisResults = await this.trackingSession.runTool('analyzePatterns', {
        userId: this.sessionId,
        timeframe: 'current_session',
        metricType: 'engagement'
      });
      
      // Share insights with optimization agent through orchestrator
      if (analysisResults && analysisResults.patterns) {
        const optimizationRequest = await agentOrchestrator.notifyInteractionInsight({
          source: 'card_interactions',
          cardIds: [this.card.id || this.sessionId],
          patterns: analysisResults.patterns,
          metrics: analysisResults.metrics || {},
          deviceType: this.capabilities.touch ? 'mobile' : 'desktop'
        });
        
        // Listen for optimization results
        agentOrchestrator.onMessage('optimization_applied', (message) => {
          // Only apply if this card is targeted
          if (message.payload.targetCards.includes(this.card.id || this.sessionId)) {
            this.applyOptimizations(message.payload.optimization);
          }
        });
      }
    } catch (error) {
      console.warn('Failed to get optimizations:', error);
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
    
    // Apply content adjustments if any
    if (optimizations.content) {
      this.updateCardContent(optimizations.content);
    }
    
    // Track that optimizations were applied
    this.trackingSession.trackEvent('optimizationApplied', {
      cardId: this.card.id || this.sessionId,
      timestamp: Date.now(),
      optimizations
    });
    
    console.log('Applied card optimizations:', optimizations);
  }
  
  // Update card content based on optimizations
  updateCardContent(contentOptimizations) {
    // Example implementation - would need customization for actual content structure
    if (contentOptimizations.densityLevel) {
      // Adjust content based on density recommendation
      this.card.setAttribute('data-content-density', contentOptimizations.densityLevel);
      
      // Apply specific class based on density
      this.card.classList.remove('content-dense', 'content-sparse');
      
      if (contentOptimizations.densityLevel === 'low') {
        this.card.classList.add('content-sparse');
      } else if (contentOptimizations.densityLevel === 'high') {
        this.card.classList.add('content-dense');
      }
    }
  }
  
  // Clean up agent session
  endAgentSession() {
    if (this.agentEnabled) {
      // Send any remaining interaction data
      if (this.interactionQueue.length > 0) {
        this.sendInteractionBatch();
      }
      
      // Track session end event
      this.trackingSession.trackEvent('storeInteraction', {
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
      });
      
      // End the session properly
      this.trackingSession.end();
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

## 8. Multi-Agent Collaboration System

The real power of our approach comes from agent collaboration. Unlike isolated agents, our agents share insights and work together to optimize the user experience.

### Agent Orchestrator

```javascript
// src/agents/agent-orchestrator.js
import OpenAI from 'openai';
import { cardInteractionAgent } from './card-interaction-agent';
import { cardOptimizationAgent } from './card-optimization-agent';

// Define message types for type safety
const MESSAGE_TYPES = {
  // Messages from interaction agent
  INTERACTION_INSIGHTS: 'interaction_insights',
  USER_PREFERENCE_DETECTED: 'user_preference_detected',
  BEHAVIOR_PATTERN_IDENTIFIED: 'behavior_pattern_identified',
  
  // Messages from optimization agent
  OPTIMIZATION_APPLIED: 'optimization_applied',
  CONTENT_REBALANCE_SUGGESTION: 'content_rebalance_suggestion',
  STYLE_UPDATE_PERFORMED: 'style_update_performed'
};

// Initialize OpenAI client (server-side only in production)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Only for demo
});

/**
 * Agent Orchestrator for coordinating multiple AI agents
 */
class AgentOrchestrator {
  constructor(config = {}) {
    this.config = {
      name: 'CardAgentOrchestrator',
      version: '1.0.0',
      logMessages: true,
      persistence: {
        enabled: true,
        adapter: 'sessionStorage'
      },
      ...config
    };
    
    this.initialized = false;
    this.messages = [];
    this.messageHandlers = new Map();
    this.nextMessageId = 1;
  }
  
  /**
   * Initialize the orchestrator
   */
  initialize() {
    if (this.initialized) return;
    
    // Set up persistence if enabled
    if (this.config.persistence.enabled) {
      try {
        // Load existing messages
        if (this.config.persistence.adapter === 'sessionStorage') {
          const savedMessages = sessionStorage.getItem('agentMessages');
          if (savedMessages) {
            this.messages = JSON.parse(savedMessages);
            this.nextMessageId = this.messages.length > 0 
              ? Math.max(...this.messages.map(m => m.id)) + 1 
              : 1;
          }
        }
      } catch (error) {
        console.warn('Failed to load persisted messages:', error);
      }
    }
    
    this.initialized = true;
    return this;
  }
  
  /**
   * Send a message between agents
   */
  async sendMessage(options) {
    if (!this.initialized) {
      this.initialize();
    }
    
    const { from, to, type, payload } = options;
    
    // Validate message
    if (!from || !to || !type) {
      throw new Error('Invalid message: must specify from, to, and type');
    }
    
    // Create message object
    const message = {
      id: this.nextMessageId++,
      from: typeof from === 'string' ? from : from.constructor.name,
      to: typeof to === 'string' ? to : to.constructor.name,
      type,
      payload: payload || {},
      timestamp: Date.now()
    };
    
    // Log the message
    if (this.config.logMessages) {
      console.log(`[Agent Orchestrator] Message sent: ${message.from} → ${message.to} (${message.type})`);
    }
    
    // Add to message history
    this.messages.push(message);
    
    // Persist messages if enabled
    if (this.config.persistence.enabled) {
      try {
        if (this.config.persistence.adapter === 'sessionStorage') {
          sessionStorage.setItem('agentMessages', JSON.stringify(this.messages));
        }
      } catch (error) {
        console.warn('Failed to persist messages:', error);
      }
    }
    
    // Execute handlers
    const handlers = this.messageHandlers.get(`${message.to}:${message.type}`) || [];
    const handlerPromises = handlers.map(handler => handler(message));
    
    // Wait for all handlers to complete
    const results = await Promise.allSettled(handlerPromises);
    
    // Return the message ID for reference
    return { messageId: message.id, handled: handlers.length > 0 };
  }
  
  /**
   * Register a message handler for a specific agent and message type
   */
  onMessage(agent, messageType, handler) {
    if (!this.initialized) {
      this.initialize();
    }
    
    const agentName = typeof agent === 'string' ? agent : agent.constructor.name;
    const key = `${agentName}:${messageType}`;
    
    // Create handler array if it doesn't exist
    if (!this.messageHandlers.has(key)) {
      this.messageHandlers.set(key, []);
    }
    
    // Add the handler
    this.messageHandlers.get(key).push(handler);
    
    // Return a function to unregister the handler
    return () => {
      const handlers = this.messageHandlers.get(key) || [];
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    };
  }
  
  /**
   * Register a handler for any message of a specific type
   */
  onAnyMessage(messageType, handler) {
    if (!this.initialized) {
      this.initialize();
    }
    
    // Create a unique key for tracking this handler
    const handleId = `any:${messageType}:${Date.now()}`;
    
    // We'll track all the individual handlers we create
    const registeredHandlers = [];
    
    // Get all registered agents
    const allAgentNames = new Set([
      ...Array.from(this.messageHandlers.keys()).map(key => key.split(':')[0])
    ]);
    
    // Register the handler for each agent
    for (const agentName of allAgentNames) {
      const unregister = this.onMessage(agentName, messageType, handler);
      registeredHandlers.push(unregister);
    }
    
    // Return a function to unregister all handlers
    return () => {
      registeredHandlers.forEach(unregister => unregister());
    };
  }
  
  /**
   * Get message history for debugging
   */
  getMessageHistory() {
    return [...this.messages];
  }
  
  /**
   * Clear message history
   */
  clearMessageHistory() {
    this.messages = [];
    
    // Clear persisted messages
    if (this.config.persistence.enabled) {
      try {
        if (this.config.persistence.adapter === 'sessionStorage') {
          sessionStorage.removeItem('agentMessages');
        }
      } catch (error) {
        console.warn('Failed to clear persisted messages:', error);
      }
    }
  }
  
  /**
   * Use OpenAI to mediate communication between agents
   * This is a more advanced capability that can interpret and translate between agents
   */
  async mediateMessage(options) {
    const { from, to, content, context } = options;
    
    // Use OpenAI to interpret the message
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        temperature: 0.2,
        messages: [
          {
            role: 'system',
            content: `You are a mediator between AI agents. 
            Your job is to interpret messages from one agent and translate them for another agent.
            From Agent: ${from}
            To Agent: ${to}
            
            Context: ${context || 'No additional context provided'}`
          },
          {
            role: 'user',
            content: `Please interpret this message and translate it appropriately for the receiving agent: ${content}`
          }
        ]
      });
      
      // Get the interpreted message
      const interpretedMessage = response.choices[0].message.content;
      
      // Forward the interpreted message
      return this.sendMessage({
        from,
        to,
        type: MESSAGE_TYPES.MEDIATED_MESSAGE,
        payload: {
          originalContent: content,
          interpretedContent: interpretedMessage,
          context
        }
      });
    } catch (error) {
      console.error('Failed to mediate message:', error);
      
      // Fall back to sending the original message
      return this.sendMessage({
        from,
        to,
        type: MESSAGE_TYPES.MEDIATED_MESSAGE,
        payload: {
          originalContent: content,
          interpretedContent: content, // No interpretation
          context,
          error: 'Mediation failed'
        }
      });
    }
  }
}

// Create orchestrator instance
const orchestrator = new AgentOrchestrator({
  name: 'CardAgentOrchestrator',
  logMessages: true,
  persistence: {
    enabled: true,
    adapter: 'sessionStorage'
  }
});

// Set up message handlers
orchestrator.onMessage(
  'CardInteractionAgent',
  MESSAGE_TYPES.OPTIMIZATION_APPLIED,
  async (message) => {
    console.log(`InteractionAgent: Received optimization confirmation`);
    
    // Monitor effectiveness of applied optimization
    const monitorTask = await cardInteractionAgent.trackingSession.runTool(
      'analyzePatterns',
      {
        userId: 'system',
        metricType: 'optimization_effectiveness',
        optimizationId: message.payload.optimizationId
      }
    );
    
    return { success: true, taskId: message.id };
  }
);

orchestrator.onMessage(
  'CardOptimizationAgent',
  MESSAGE_TYPES.INTERACTION_INSIGHTS,
  async (message) => {
    console.log(`OptimizationAgent: Received insights`);
    
    // Generate optimizations based on insights
    const optimizationTask = await cardOptimizationAgent.run({
      action: 'generateOptimizations',
      inputs: {
        cardType: message.payload.insights.cardType || 'universal',
        deviceType: message.payload.insights.deviceType || 'desktop',
        interactionHistory: message.payload.insights.interactions || [],
        userPreferences: message.payload.insights.userPreferences || {}
      }
    });
    
    // Send notification when optimizations are ready
    optimizationTask.onComplete(async (result) => {
      if (result && (result.styles || result.behavior || result.content)) {
        await orchestrator.sendMessage({
          from: 'CardOptimizationAgent',
          to: 'CardInteractionAgent',
          type: MESSAGE_TYPES.OPTIMIZATION_APPLIED,
          payload: {
            optimizationId: optimizationTask.id,
            optimization: result,
            targetCards: message.payload.insights.cardIds || []
          }
        });
      }
    });
    
    return { taskId: optimizationTask.id };
  }
);

// Export a simplified API for the orchestrator
export const agentOrchestrator = {
  // Initialize the system
  init() {
    orchestrator.initialize();
    console.log('Agent collaboration system initialized');
    return this;
  },
  
  // Send interaction insights to optimization agent
  async notifyInteractionInsight(insights) {
    return orchestrator.sendMessage({
      from: 'CardInteractionAgent',
      to: 'CardOptimizationAgent',
      type: MESSAGE_TYPES.INTERACTION_INSIGHTS,
      payload: { 
        insights,
        timestamp: Date.now()
      }
    });
  },
  
  // Request optimizations directly
  async requestOptimization(data) {
    return orchestrator.sendMessage({
      from: 'CardInteractionAgent',
      to: 'CardOptimizationAgent',
      type: MESSAGE_TYPES.OPTIMIZATION_REQUEST,
      payload: {
        request: data,
        timestamp: Date.now()
      }
    });
  },
  
  // Get message history for debugging
  getMessageHistory() {
    return orchestrator.getMessageHistory();
  },
  
  // Listen for specific message types
  onMessage(type, callback) {
    return orchestrator.onAnyMessage(type, callback);
  },
  
  // Clear message history
  clearHistory() {
    orchestrator.clearMessageHistory();
  },
  
  // Advanced - mediate a message between agents using AI
  async mediateMessage(from, to, content, context) {
    return orchestrator.mediateMessage({
      from,
      to,
      content,
      context
    });
  }
};
```

### Collaborative Intelligence Implementation

```javascript
// src/js/universal-flip-card.js

import { cardInteractionAgent } from '../agents/card-interaction-agent';
import { agentCoordinator } from '../agents/agent-coordinator';

class UniversalFlipCard {
  // ... existing code ...
  
  async analyzeInteractions(userSession) {
    if (!this.agentEnabled) return;
    
    try {
      // Create analysis run
      const analysisRun = await cardInteractionAgent.createRun({
        instruction: "Analyze recent interactions and identify actionable patterns",
        inputs: {
          sessionData: userSession || this.sessionData,
          cardType: this.options.cardType || 'universal',
          cardId: this.card.id || this.sessionId
        }
      });
      
      // When analysis completes, share insights with other agents
      analysisRun.onComplete(async (result) => {
        if (result.insights && Object.keys(result.insights).length > 0) {
          // Share insights with optimization agent via coordinator
          await agentCoordinator.notifyInteractionInsight({
            source: 'card_analysis',
            cardIds: [this.card.id || this.sessionId],
            patterns: result.insights.patterns || [],
            metrics: result.insights.metrics || {},
            recommendedActions: result.insights.recommendedActions || []
          });
          
          console.log('Shared interaction insights with optimization agent', result.insights);
        }
      });
      
      return analysisRun;
    } catch (error) {
      console.error('Failed to analyze interactions:', error);
    }
  }
  
  // Helper to apply optimizations coming from any agent
  applyCollaborativeOptimizations(optimizations) {
    // First apply standard optimizations
    this.applyOptimizations(optimizations);
    
    // Then handle any special collaborative features
    if (optimizations.collaborative) {
      // Apply cross-card synchronization
      if (optimizations.collaborative.syncWith) {
        this.syncWithOtherCards(optimizations.collaborative.syncWith);
      }
      
      // Apply learned patterns from other cards
      if (optimizations.collaborative.learnedPatterns) {
        this.applyLearnedPatterns(optimizations.collaborative.learnedPatterns);
      }
    }
  }
  
  // Synchronize this card with others for consistent experience
  syncWithOtherCards(cardIds) {
    if (!cardIds || !cardIds.length) return;
    
    // Find other card instances on the page
    const allCards = window.universalCards || [];
    const targetCards = allCards.filter(card => 
      cardIds.includes(card.card.id || card.sessionId));
    
    if (targetCards.length) {
      console.log(`Synchronizing card ${this.card.id} with ${targetCards.length} other cards`);
      
      // Set up event sharing between cards
      targetCards.forEach(otherCard => {
        // Create a link between the cards
        if (!this.linkedCards) this.linkedCards = new Set();
        this.linkedCards.add(otherCard);
        
        // Bi-directional linking
        if (!otherCard.linkedCards) otherCard.linkedCards = new Set();
        otherCard.linkedCards.add(this);
      });
    }
  }
}

// Update the flip method to notify linked cards
flip(shouldFlip) {
  // Original implementation
  // ...existing code...
  
  // Notify any linked cards (collaborative behavior)
  if (this.linkedCards && this.linkedCards.size > 0) {
    // Get synchronized cards (cards that should flip together)
    const syncedCards = Array.from(this.linkedCards)
      .filter(card => card.options.syncFlipWithGroup === this.options.syncFlipWithGroup);
    
    // Propagate flip state to synchronized cards
    if (syncedCards.length) {
      syncedCards.forEach(card => {
        if (card.isFlipped !== this.isFlipped) {
          // Prevent infinite loops by temporarily unlinking
          const tempLinked = card.linkedCards;
          card.linkedCards = null;
          
          // Perform the flip
          card.flip(this.isFlipped);
          
          // Restore linking
          card.linkedCards = tempLinked;
        }
      });
      
      // Notify agents about group interaction
      if (this.agentEnabled) {
        agentCoordinator.notifyInteractionInsight({
          source: 'group_interaction',
          cardIds: [this.card.id, ...syncedCards.map(c => c.card.id)],
          interaction: 'synchronized_flip',
          initiatorCard: this.card.id,
          timestamp: Date.now()
        });
      }
    }
  }
  
  // Return flip state
  return this.isFlipped;
}
```

### Cross-Card Learning System

```javascript
// src/services/cross-card-learning.js

/**
 * Service that enables cards to learn from each other's interactions
 */
export class CrossCardLearningService {
  constructor() {
    this.cardInsights = new Map();
    this.globalPatterns = {
      flipFrequencies: {},
      viewDurations: {},
      commonOptimizations: []
    };
  }
  
  /**
   * Store insights from a specific card
   */
  addCardInsight(cardId, insight) {
    if (!this.cardInsights.has(cardId)) {
      this.cardInsights.set(cardId, []);
    }
    
    this.cardInsights.get(cardId).push({
      ...insight,
      timestamp: Date.now()
    });
    
    // Update global patterns when new insights arrive
    this.updateGlobalPatterns();
    
    return true;
  }
  
  /**
   * Update global pattern recognition across all cards
   */
  updateGlobalPatterns() {
    // Reset counters
    const flipDurations = [];
    const viewDurations = [];
    const optimizationCounts = {};
    
    // Collect data from all cards
    for (const [cardId, insights] of this.cardInsights.entries()) {
      // Only process recent insights (last 24 hours)
      const recentInsights = insights.filter(i => 
        (Date.now() - i.timestamp) < 24 * 60 * 60 * 1000);
      
      // Process each insight
      recentInsights.forEach(insight => {
        // Gather flip timing data
        if (insight.metrics && insight.metrics.avgFlipDuration) {
          flipDurations.push(insight.metrics.avgFlipDuration);
        }
        
        // Gather view duration data
        if (insight.metrics && insight.metrics.avgViewDuration) {
          viewDurations.push(insight.metrics.avgViewDuration);
        }
        
        // Track which optimizations were applied
        if (insight.appliedOptimizations) {
          Object.entries(insight.appliedOptimizations).forEach(([key, value]) => {
            optimizationCounts[key] = (optimizationCounts[key] || 0) + 1;
          });
        }
      });
    }
    
    // Calculate global patterns
    this.globalPatterns = {
      flipFrequencies: this.calculateStatistics(flipDurations),
      viewDurations: this.calculateStatistics(viewDurations),
      commonOptimizations: Object.entries(optimizationCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([optimization, count]) => ({ 
          optimization, 
          frequency: count / this.cardInsights.size 
        }))
    };
    
    return this.globalPatterns;
  }
  
  /**
   * Get recommendations for a specific card based on all card data
   */
  getRecommendationsForCard(cardId, cardType, deviceType) {
    // Get card-specific insights
    const cardInsights = this.cardInsights.get(cardId) || [];
    
    // Find similar cards (same type, similar device usage)
    const similarCardIds = this.findSimilarCards(cardId, cardType, deviceType);
    
    // Get insights from similar cards
    const similarCardsInsights = [];
    for (const similarId of similarCardIds) {
      const insights = this.cardInsights.get(similarId) || [];
      similarCardsInsights.push(...insights);
    }
    
    // Generate recommendations based on global patterns and similar cards
    return {
      recommendedOptimizations: this.generateOptimizations(
        cardInsights, 
        similarCardsInsights,
        deviceType
      ),
      similarCards: similarCardIds,
      confidence: this.calculateConfidence(cardInsights, similarCardsInsights),
      globalPatterns: this.globalPatterns
    };
  }
  
  /**
   * Find cards similar to the given card
   */
  findSimilarCards(cardId, cardType, deviceType) {
    const similarCards = [];
    
    for (const [otherId, insights] of this.cardInsights.entries()) {
      // Skip self
      if (otherId === cardId) continue;
      
      // Check for type match
      const typeMatch = insights.some(i => i.cardType === cardType);
      
      // Check for device compatibility
      const deviceMatch = insights.some(i => 
        i.deviceType === deviceType || 
        (deviceType === 'mobile' && i.deviceType === 'tablet') ||
        (deviceType === 'tablet' && i.deviceType === 'mobile'));
      
      // Calculate similarity score
      if (typeMatch && deviceMatch) {
        similarCards.push(otherId);
      }
    }
    
    return similarCards;
  }
  
  // Helper methods
  calculateStatistics(values) {
    if (!values.length) return { avg: 0, median: 0, min: 0, max: 0 };
    
    const sorted = [...values].sort((a, b) => a - b);
    
    return {
      avg: values.reduce((sum, val) => sum + val, 0) / values.length,
      median: sorted[Math.floor(values.length / 2)],
      min: sorted[0],
      max: sorted[sorted.length - 1]
    };
  }
  
  generateOptimizations(cardInsights, similarInsights, deviceType) {
    // Combine successful optimizations from similar cards
    const optimizationCandidates = {};
    
    // Process similar cards' insights
    similarInsights.forEach(insight => {
      if (insight.successfulOptimizations) {
        Object.entries(insight.successfulOptimizations).forEach(([key, data]) => {
          if (!optimizationCandidates[key]) {
            optimizationCandidates[key] = {
              value: data.value,
              successCount: 0,
              totalApplications: 0
            };
          }
          
          optimizationCandidates[key].successCount += data.improved ? 1 : 0;
          optimizationCandidates[key].totalApplications += 1;
        });
      }
    });
    
    // Filter to optimizations with good success rate
    const recommendations = [];
    
    Object.entries(optimizationCandidates).forEach(([key, data]) => {
      const successRate = data.totalApplications > 0 
        ? data.successCount / data.totalApplications 
        : 0;
        
      if (successRate > 0.6) { // Only recommend optimizations with >60% success
        recommendations.push({
          type: key,
          value: data.value,
          confidence: successRate,
          source: 'cross_card_learning'
        });
      }
    });
    
    return recommendations;
  }
  
  calculateConfidence(cardInsights, similarInsights) {
    // Base confidence on amount and recency of data
    const totalInsightsCount = cardInsights.length + similarInsights.length;
    
    // No data = no confidence
    if (totalInsightsCount === 0) return 0;
    
    // Calculate recency factor (more recent = higher confidence)
    const allInsights = [...cardInsights, ...similarInsights];
    const recentInsights = allInsights.filter(i => 
      (Date.now() - i.timestamp) < 7 * 24 * 60 * 60 * 1000); // Within 7 days
      
    const recencyFactor = recentInsights.length / allInsights.length;
    
    // Calculate data volume factor (more data = higher confidence, max at 50 insights)
    const volumeFactor = Math.min(totalInsightsCount / 50, 1);
    
    // Combined confidence score (0-1)
    return (0.7 * volumeFactor) + (0.3 * recencyFactor);
  }
}

// Singleton instance
export const crossCardLearning = new CrossCardLearningService();
```

### Agent Feedback Loop for Continuous Improvement

```javascript
// src/agents/continuous-learning.js
import { agentCoordinator } from './agent-coordinator';
import { crossCardLearning } from '../services/cross-card-learning';

/**
 * This module creates a feedback loop between agents,
 * allowing them to continuously learn from each other's actions and results
 */
export class ContinuousLearningSystem {
  constructor() {
    this.optimizationResults = new Map();
    this.lastEvaluation = Date.now();
    this.evaluationInterval = 3600000; // 1 hour
  }
  
  /**
   * Track the result of an applied optimization
   */
  recordOptimizationResult(optimizationId, metrics) {
    this.optimizationResults.set(optimizationId, {
      ...metrics,
      recordedAt: Date.now()
    });
    
    // Schedule evaluation if needed
    this.scheduleEvaluation();
    
    return true;
  }
  
  /**
   * Schedule periodic evaluation of optimization effectiveness
   */
  scheduleEvaluation() {
    const now = Date.now();
    
    // Only evaluate periodically
    if (now - this.lastEvaluation < this.evaluationInterval) return;
    
    // Reset timer
    this.lastEvaluation = now;
    
    // Perform evaluation
    this.evaluateOptimizations();
  }
  
  /**
   * Evaluate optimization effectiveness and propagate learnings
   */
  async evaluateOptimizations() {
    // Skip if no data
    if (this.optimizationResults.size === 0) return;
    
    console.log(`Evaluating ${this.optimizationResults.size} optimization results`);
    
    // Group results by optimization type
    const optimizationTypes = {};
    
    for (const [id, result] of this.optimizationResults.entries()) {
      if (!result.type) continue;
      
      if (!optimizationTypes[result.type]) {
        optimizationTypes[result.type] = {
          applied: 0,
          improved: 0,
          neutral: 0,
          worsened: 0,
          results: []
        };
      }
      
      // Categorize the result
      optimizationTypes[result.type].applied++;
      optimizationTypes[result.type].results.push(result);
      
      if (result.improved) {
        optimizationTypes[result.type].improved++;
      } else if (result.worsened) {
        optimizationTypes[result.type].worsened++;
      } else {
        optimizationTypes[result.type].neutral++;
      }
    }
    
    // Analyze each optimization type
    const insights = [];
    
    for (const [type, data] of Object.entries(optimizationTypes)) {
      // Calculate effectiveness
      const successRate = data.applied > 0 ? data.improved / data.applied : 0;
      const failureRate = data.applied > 0 ? data.worsened / data.applied : 0;
      
      // Generate insight
      insights.push({
        optimizationType: type,
        effectivenessScore: successRate - failureRate,
        confidenceLevel: Math.min(1, data.applied / 10), // Higher with more data
        recommendedAction: this.getRecommendedAction(successRate, failureRate),
        sampleSize: data.applied
      });
      
      // Add to cross-card learning system
      const deviceTypes = new Set(data.results.map(r => r.deviceType).filter(Boolean));
      
      for (const deviceType of deviceTypes) {
        // Filter results for this device type
        const deviceResults = data.results.filter(r => r.deviceType === deviceType);
        
        if (deviceResults.length >= 3) { // Minimum sample size
          crossCardLearning.addCardInsight(`system_${type}_${deviceType}`, {
            cardType: 'system',
            deviceType,
            optimizationType: type,
            metrics: {
              successRate,
              failureRate,
              sampleSize: deviceResults.length
            },
            successfulOptimizations: {
              [type]: {
                value: this.extractOptimizationValue(deviceResults),
                improved: successRate > 0.5
              }
            }
          });
        }
      }
    }
    
    // Send insights to agents via coordinator
    if (insights.length > 0) {
      await agentCoordinator.notifyInteractionInsight({
        source: 'optimization_evaluation',
        insights,
        timestamp: Date.now()
      });
      
      console.log('Shared optimization evaluation insights with agents', insights);
    }
    
    // Prune old results (keep last 7 days)
    const cutoff = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    for (const [id, result] of this.optimizationResults.entries()) {
      if (result.recordedAt < cutoff) {
        this.optimizationResults.delete(id);
      }
    }
  }
  
  // Helper methods
  getRecommendedAction(successRate, failureRate) {
    if (successRate > 0.7) return 'promote';
    if (failureRate > 0.4) return 'disable';
    if (successRate > failureRate) return 'continue';
    return 'review';
  }
  
  extractOptimizationValue(results) {
    // Try to extract the most common value
    const valueCount = {};
    
    results.forEach(result => {
      if (result.value) {
        const key = JSON.stringify(result.value);
        valueCount[key] = (valueCount[key] || 0) + 1;
      }
    });
    
    // Find most common value
    let mostCommonValue = null;
    let highestCount = 0;
    
    for (const [key, count] of Object.entries(valueCount)) {
      if (count > highestCount) {
        mostCommonValue = JSON.parse(key);
        highestCount = count;
      }
    }
    
    return mostCommonValue;
  }
}

// Singleton instance
export const continuousLearning = new ContinuousLearningSystem();
```

## 9. Alternative Implementation Options

The Managed Agent Runner approach makes it easy to swap implementation details without changing the overall architecture. Here are some alternative implementations that can be easily integrated:

### 9.1 Simplified Local-Only Version

```javascript
// src/agents/agent-runner-local.js

/**
 * Simplified local-only implementation that doesn't require external API calls
 * Perfect for development or when full agent capabilities aren't needed
 */
export class LocalAgentRunner {
  constructor(definition, options) {
    this.definition = definition;
    this.options = options;
    this.handlers = options.toolHandlers || {};
    this.sessions = new Map();
  }
  
  // Start a tracking session
  startSession(params) {
    const sessionId = params.sessionId || `session-${Date.now()}`;
    
    // Create a new session
    const session = {
      id: sessionId,
      startTime: Date.now(),
      metadata: params.metadata || {},
      events: [],
      
      // Simple API that matches the full agent API
      trackEvent: (toolName, data) => {
        // Add to session events
        const event = {
          toolName,
          data,
          timestamp: Date.now()
        };
        
        session.events.push(event);
        
        // Process with handler if available
        if (this.handlers[toolName]) {
          try {
            this.handlers[toolName](data);
          } catch (err) {
            console.warn(`Error in handler for ${toolName}:`, err);
          }
        }
        
        return { success: true, eventId: `${sessionId}-${session.events.length}` };
      },
      
      // Run a specific tool
      runTool: async (toolName, data) => {
        // Basic rules-based implementations that don't need AI
        if (toolName === 'analyzePatterns') {
          return this.generateBasicInsights(session, data);
        }
        
        // Call handler for other tools
        if (this.handlers[toolName]) {
          return this.handlers[toolName](data);
        }
        
        return null;
      },
      
      // End the session
      end: () => {
        session.endTime = Date.now();
        session.duration = session.endTime - session.startTime;
        
        // Store session data locally if needed
        const sessionData = {
          id: session.id,
          metadata: session.metadata,
          events: session.events,
          duration: session.duration
        };
        
        try {
          // Save to local storage for persistence
          const savedSessions = JSON.parse(localStorage.getItem('agentSessions') || '[]');
          savedSessions.push(sessionData);
          localStorage.setItem('agentSessions', JSON.stringify(savedSessions));
        } catch (err) {
          console.warn('Failed to save session to storage:', err);
        }
        
        // Remove from active sessions
        this.sessions.delete(sessionId);
        
        return { success: true };
      }
    };
    
    // Store the session
    this.sessions.set(sessionId, session);
    
    return session;
  }
  
  // Generate basic insights without AI
  generateBasicInsights(session, params) {
    // Extract flip events
    const flipEvents = session.events
      .filter(e => e.toolName === 'storeInteraction' && e.data.eventType === 'flip');
    
    // Calculate basic metrics
    const flipCount = flipEvents.length;
    let avgViewDuration = 0;
    
    if (flipCount >= 2) {
      let totalDuration = 0;
      
      for (let i = 1; i < flipEvents.length; i++) {
        const duration = flipEvents[i].timestamp - flipEvents[i-1].timestamp;
        if (duration > 0 && duration < 300000) { // Ignore outliers over 5 minutes
          totalDuration += duration;
        }
      }
      
      avgViewDuration = Math.round(totalDuration / (flipCount - 1));
    }
    
    // Generate basic patterns
    const patterns = [];
    
    if (avgViewDuration < 2000) {
      patterns.push({
        type: 'short_view',
        confidence: 0.8,
        description: 'User is spending very little time viewing each side'
      });
    } else if (avgViewDuration > 10000) {
      patterns.push({
        type: 'long_view',
        confidence: 0.8,
        description: 'User is spending significant time on each side'
      });
    }
    
    if (flipCount > 5 && avgViewDuration < 3000) {
      patterns.push({
        type: 'rapid_exploration',
        confidence: 0.7,
        description: 'User is rapidly exploring card content'
      });
    }
    
    // Return insights
    return {
      patterns,
      metrics: {
        flipCount,
        avgViewDuration,
        totalEvents: session.events.length
      }
    };
  }
}
```

### 9.2 Hybrid Implementation with Real AI Services

For production systems where you want real AI capabilities but with flexible hosting:

```javascript
// Example configuration for hybrid mode
const hybridDeployment = {
  name: 'HybridCardAgents',
  
  // Implementation adapters for different environments
  adapters: {
    // Use OpenAI for server-side processing
    openai: {
      enabled: true,
      requiresServer: true,
      provider: 'openai',
      modelName: 'gpt-4-turbo',
      apiEndpoint: '/api/openai-proxy'
    },
    
    // Use a local model for client-side processing
    localModel: {
      enabled: true,
      requiresServer: false,
      provider: 'transformers.js',
      modelPath: '/models/lite-agent',
      quantized: true
    }
  },
  
  // Rules for choosing implementation
  selectionRules: [
    {
      capability: 'generateCardOptimizations',
      adapter: 'openai', // Complex reasoning needs full AI
      fallback: null // No fallback available
    },
    {
      capability: 'analyzePatterns',
      adapter: 'openai',
      fallback: 'localModel' // Can use local model as fallback
    },
    {
      capability: 'adjustCardStyles',
      adapter: 'localModel', // Simple task can use local model
      fallback: 'rules' // Fallback to rule-based implementation
    }
  ]
};
```

## 10. Future Extensions

1. **A/B Testing**: Automatic variant generation and tracking
2. **Cross-Card Learning**: Apply insights from one card type to others
3. **Content Optimization**: Dynamic content rebalancing between card faces
4. **Predictive Preloading**: Use ML to predict which cards user will interact with
5. **Adaptive Accessibility**: Automatically enhance accessibility based on usage patterns