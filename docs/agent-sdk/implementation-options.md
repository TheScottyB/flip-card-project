# Implementation Options Guide

## 9. Alternative Implementation Options

The Managed Agent Runner approach makes it easy to swap implementation details without changing the overall architecture. This guide outlines different implementation approaches to suit various needs and constraints.

### 9.1 Simplified Local-Only Version

This implementation provides a lightweight alternative that doesn't require external API calls, perfect for development or when full agent capabilities aren't needed.

```javascript
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

For production systems where you want real AI capabilities but with flexible hosting, you can use a hybrid approach that combines local processing with cloud AI services:

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

/**
 * Hybrid implementation that can switch between local and cloud processing
 */
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
}
```

### Implementation Comparison

| Feature | Local-Only | Hybrid | Full Cloud |
|---------|------------|--------|------------|
| Setup Complexity | Low | Medium | High |
| AI Capabilities | Basic | Mixed | Full |
| Offline Support | Yes | Partial | No |
| Cost | Free | Mixed | Usage-based |
| Performance | Fast | Variable | Network-dependent |
| Maintenance | Simple | Moderate | Complex |

### Choosing an Implementation

Consider these factors when selecting an implementation:

1. **Development vs. Production**
   - Use Local-Only for development and testing
   - Use Hybrid or Full Cloud for production

2. **Online vs. Offline Requirements**
   - Need offline support? Use Local-Only or Hybrid
   - Always online? Full Cloud might be best

3. **Cost Considerations**
   - Limited budget? Start with Local-Only
   - Mixed requirements? Hybrid offers good balance
   - Need full AI capabilities? Full Cloud with usage monitoring

4. **Performance Requirements**
   - Need consistent performance? Local-Only or Hybrid
   - Need advanced AI features? Full Cloud or Hybrid

5. **Maintenance Capacity**
   - Limited DevOps resources? Local-Only is simplest
   - Good infrastructure? Full Cloud is manageable
   - Need flexibility? Hybrid offers best of both

For more details on specific implementations, see:
- [OpenAI Implementation](./examples/openai-implementation.md)
- [Other Examples](./examples/other-implementations.md)

## Related Documentation

- [Overview](./overview.md) - Basic concepts and architecture
- [Integration Guide](./integration-guide.md) - Setup instructions
- [Architecture Guide](./architecture.md) - Detailed technical information

