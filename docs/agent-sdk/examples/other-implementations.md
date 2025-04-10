# Alternative Implementation Examples

This guide covers alternative implementations of the Agent SDK, including a simplified local-only version and a hybrid implementation that combines local and cloud processing.

## Table of Contents
- [Local-Only Implementation](#local-only-implementation)
- [Hybrid Implementation](#hybrid-implementation)
- [Implementation Comparison](#implementation-comparison)
- [Usage Examples](#usage-examples)

## Local-Only Implementation

The local-only implementation provides a lightweight alternative that doesn't require external API calls. This is perfect for development, testing, or when full AI capabilities aren't needed.

### Core Implementation

```javascript
/**
 * Simplified local-only implementation that doesn't require external API calls
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

### Usage Example

```javascript
// Initialize local runner
const localRunner = new LocalAgentRunner({
  name: 'LocalCardAgent',
  version: '1.0.0'
}, {
  toolHandlers: {
    customTool: (data) => {
      // Custom tool implementation
      return { result: 'processed' };
    }
  }
});

// Use in component
class LocalCard {
  constructor(element) {
    this.element = element;
    this.session = localRunner.startSession({
      cardId: element.id
    });
  }
  
  handleFlip() {
    this.session.trackEvent('storeInteraction', {
      eventType: 'flip',
      timestamp: Date.now()
    });
  }
  
  async analyze() {
    const insights = await this.session.runTool('analyzePatterns');
    console.log('Analysis:', insights);
    
    // Apply simple optimizations based on patterns
    if (insights.patterns.some(p => p.type === 'short_view')) {
      this.element.style.fontSize = '1.1rem'; // Increase readability
    }
  }
}
```

## Hybrid Implementation

The hybrid implementation combines local processing with cloud AI services, providing flexibility and fallback options.

### Configuration

```javascript
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

### Core Implementation

```javascript
class HybridAgentRunner {
  constructor(config) {
    this.config = {
      preferLocal: false, // Prefer local processing when available
      allowFallback: true, // Allow fallback to simpler implementations
      ...config
    };
    
    this.adapters = new Map();
    this.sessions = new Map();
  }
  
  // Initialize adapters
  async initialize() {
    // Load OpenAI adapter if enabled
    if (this.config.adapters.openai?.enabled) {
      const { OpenAIAdapter } = await import('./adapters/openai.js');
      this.adapters.set('openai', new OpenAIAdapter(this.config.adapters.openai));
    }
    
    // Load local model adapter if enabled
    if (this.config.adapters.localModel?.enabled) {
      const { LocalModelAdapter } = await import('./adapters/local-model.js');
      this.adapters.set('localModel', new LocalModelAdapter(this.config.adapters.localModel));
    }
    
    // Always load rules-based adapter as final fallback
    const { RulesAdapter } = await import('./adapters/rules.js');
    this.adapters.set('rules', new RulesAdapter());
  }
  
  // Choose appropriate adapter for a capability
  selectAdapter(capability) {
    const rule = this.config.selectionRules.find(r => r.capability === capability);
    if (!rule) return null;
    
    // Try preferred adapter first
    const preferredAdapter = this.adapters.get(rule.adapter);
    if (preferredAdapter?.isAvailable()) {
      return preferredAdapter;
    }
    
    // Try fallback if allowed
    if (this.config.allowFallback && rule.fallback) {
      const fallbackAdapter = this.adapters.get(rule.fallback);
      if (fallbackAdapter?.isAvailable()) {
        return fallbackAdapter;
      }
    }
    
    // Use rules adapter as last resort
    return this.adapters.get('rules');
  }
  
  // Run a capability with the most appropriate adapter
  async runCapability(capability, params) {
    const adapter = this.selectAdapter(capability);
    if (!adapter) {
      throw new Error(`No adapter available for capability: ${capability}`);
    }
    
    try {
      return await adapter.execute(capability, params);
    } catch (error) {
      console.error(`Error executing ${capability}:`, error);
      
      // Try fallback if available
      if (this.config.allowFallback && adapter.name !== 'rules') {
        console.log(`Falling back to rules adapter for ${capability}`);
        const rulesAdapter = this.adapters.get('rules');
        return rulesAdapter.execute(capability, params);
      }
      
      throw error;
    }
  }
  
  // Start a tracking session
  startSession(params) {
    const sessionId = params.sessionId || `hybrid-session-${Date.now()}`;
    
    // Create hybrid session
    const session = {
      id: sessionId,
      startTime: Date.now(),
      metadata: params.metadata || {},
      events: [],
      
      // Track events
      trackEvent: async (toolName, data) => {
        const event = {
          toolName,
          data,
          timestamp: Date.now()
        };
        
        session.events.push(event);
        
        // Delegate to appropriate adapter
        const adapter = this.selectAdapter(`process${toolName.charAt(0).toUpperCase() + toolName.slice(1)}`);
        if (adapter) {
          try {
            return await adapter.execute(`process${toolName.charAt(0).toUpperCase() + toolName.slice(1)}`, event);
          } catch (error) {
            console.warn(`Event processing failed:`, error);
          }
        }
        
        return { success: true, eventId: `${sessionId}-${session.events.length}` };
      },
      
      // Run capabilities
      runCapability: (capability, data) => {
        return this.runCapability(capability, {
          ...data,
          sessionId,
          events: session.events
        });
      },
      
      // End session
      end: () => {
        this.sessions.delete(sessionId);
        return { success: true };
      }
    };
    
    this.sessions.set(sessionId, session);
    return session;
  }
}
```

### Adapter Examples

#### OpenAI Adapter

```javascript
class OpenAIAdapter {
  constructor(config) {
    this.config = config;
    this.openai = null;
    this.initialized = false;
  }
  
  async initialize() {
    if (this.initialized) return;
    
    // Dynamically import OpenAI
    const { OpenAI } = await import('openai');
    this.openai = new OpenAI({
      apiKey: this.config.apiKey,
      baseURL: this.config.apiEndpoint || undefined
    });
    
    this.initialized = true;
  }
  
  isAvailable() {
    return navigator.onLine && !this.config.requiresServer;
  }
  
  async execute(capability, params) {
    await this.initialize();
    
    switch(capability) {
      case 'analyzePatterns':
        return this.analyzePatterns(params);
      case 'generateCardOptimizations':
        return this.generateOptimizations(params);
      default:
        throw new Error(`Capability not supported: ${capability}`);
    }
  }
}
```

#### Local Model Adapter

```javascript
class LocalModelAdapter {
  constructor(config) {
    this.config = config;
    this.model = null;
    this.initialized = false;
  }
  
  async initialize() {
    if (this.initialized) return;
    
    // Load local model using transformers.js
    const { pipeline } = await import('@xenova/transformers');
    this.model = await pipeline('text-generation', this.config.modelPath);
    
    this.initialized = true;
  }
  
  isAvailable() {
    return true; // Always available as it's local
  }
  
  async execute(capability, params) {
    await this.initialize();
    
    switch(capability) {
      case 'analyzePatterns':
        return this.localAnalysis(params);
      case 'adjustCardStyles':
        return this.generateSimpleStyles(params);
      default:
        throw new Error(`Capability not supported: ${capability}`);
    }
  }
}
```

### Usage Example

```javascript
// Initialize hybrid runner
const hybridRunner = new HybridAgentRunner(hybridDeployment);
await hybridRunner.initialize();

// Use in component
class HybridCard {
  constructor(element) {
    this.element = element;
    this.events = [];
    this.setupAgent();
  }
  
  async setupAgent() {
    // Determine optimal configuration based on environment
    const deviceType = this.getDeviceType();
    const preferLocal = deviceType === 'mobile' || !navigator.onLine;
    
    // Start session
    this.session = hybridRunner.startSession({
      cardId: this.element.id,
      metadata: {
        type: this.element.dataset.cardType,
        preferLocal,
        deviceType
      }
    });
  }
  
  async handleInteraction(type, details) {
    await this.session.trackEvent('storeInteraction', {
      eventType: type,
      details,
      timestamp: Date.now()
    });
    
    // Auto-analyze after sufficient interactions
    if (this.events.length % 5 === 0

