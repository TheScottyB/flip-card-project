# Agent SDK Architecture Guide

## 5. Implementation in Card Components

The Agent SDK integrates seamlessly with card components through a modular architecture that separates concerns and maintains flexibility. This section details the implementation patterns and component integration strategies.

### 5.1 Universal Flip Card Integration

The SDK provides deep integration with card components while maintaining clean separation of concerns. Here's how the integration works:

```javascript
class UniversalFlipCard {
  constructor(element, options = {}) {
    // Agent integration configuration
    this.agentEnabled = options.agentEnabled || false;
    
    if (this.agentEnabled) {
      this.setupAgentIntegration(options.agentConfig || {});
    }
  }
  
  setupAgentIntegration(agentConfig = {}) {
    // Setup tracking configuration
    this.agentConfig = {
      trackFlips: true,
      trackHover: true,
      trackSession: true,
      optimizationInterval: 5,
      analyticsMode: 'batch',
      ...agentConfig
    };
    
    // Initialize tracking session
    this.sessionId = `card-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
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
  }
}
```

### 5.2 Event Handling

The SDK captures and processes user interactions with cards through a comprehensive event handling system:

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

For the complete implementation, see [OpenAI Implementation Examples](./examples/openai-implementation.md).

## 6. Performance Considerations

The SDK implements several strategies to ensure optimal performance:

### 6.1 Lazy Loading

- Agent SDK is loaded only when needed
- Components can opt-in to agent features
- Dynamic import support for reduced initial bundle size

```javascript
// Dynamic import example
async function enableAgentFeatures() {
  if (userHasOptedIn() && isHighPerformanceDevice()) {
    const { initAgentSDK } = await import('./agent-sdk.js');
    return initAgentSDK(config);
  }
  return null;
}
```

### 6.2 Batched Events

- Interactions are batched to minimize API calls
- Configurable batch size and timing
- Automatic flush on critical events

### 6.3 Minimal UI Updates

- Optimizations are applied incrementally
- Changes are batched when possible
- DOM updates are minimized

```javascript
class OptimizationManager {
  constructor() {
    this.pendingOptimizations = new Map();
    this.updateDebounceTime = 150; // ms
    this.updateTimer = null;
  }
  
  scheduleOptimization(cardId, optimizations) {
    this.pendingOptimizations.set(cardId, {
      ...this.pendingOptimizations.get(cardId) || {},
      ...optimizations
    });
    
    this.scheduleUpdate();
  }
  
  scheduleUpdate() {
    if (this.updateTimer) clearTimeout(this.updateTimer);
    this.updateTimer = setTimeout(() => this.applyOptimizations(), this.updateDebounceTime);
  }
  
  applyOptimizations() {
    for (const [cardId, optimizations] of this.pendingOptimizations.entries()) {
      const card = cardRegistry.getCard(cardId);
      if (card) {
        card.applyOptimizations(optimizations);
      }
    }
    
    this.pendingOptimizations.clear();
  }
}
```

### 6.4 Fallback Behavior

- Cards function normally if agent is unavailable
- Graceful degradation of features
- Local-first approach for critical functionality

### 6.5 Caching

- Common optimizations are cached for reuse
- Response caching for similar queries
- State persistence for session continuity

```javascript
class OptimizationCache {
  constructor(options = {}) {
    this.cache = new Map();
    this.maxSize = options.maxSize || 100;
    this.ttl = options.ttl || 3600000; // 1 hour in ms
  }
  
  set(key, value) {
    if (this.cache.size >= this.maxSize) {
      this.prune();
    }
    
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }
  
  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.value;
  }
  
  prune() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key);
      }
    }
    
    // If still too large, remove oldest entries
    if (this.cache.size >= this.maxSize) {
      const entries = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toRemove = Math.ceil(this.cache.size * 0.2); // Remove oldest 20%
      for (let i = 0; i < toRemove; i++) {
        if (entries[i]) {
          this.cache.delete(entries[i][0]);
        }
      }
    }
  }
}
```

## 7. Privacy and Security

The SDK implements comprehensive privacy and security measures:

### 7.1 Data Anonymization

- All user data is anonymized before processing
- No PII (personally identifiable information) in session data
- Configurable data retention policies

```javascript
class PrivacyManager {
  anonymizeEvent(event) {
    const anonymized = {...event};
    
    // Remove potential PII
    delete anonymized.userEmail;
    delete anonymized.userId;
    delete anonymized.ipAddress;
    
    // Generate anonymous session ID if needed
    if (!anonymized.anonymousId) {
      anonymized.anonymousId = this.generateAnonymousId(event);
    }
    
    return anonymized;
  }
  
  generateAnonymousId(event) {
    // Create a device-specific anonymous ID that doesn't contain PII
    const components = [
      event.sessionId || '',
      event.deviceType || '',
      navigator.language || ''
    ];
    
    // Create hash of components
    return this.hashString(components.join('-'));
  }
  
  hashString(str) {
    // Simple hashing function (would use more robust method in production)
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }
}
```

### 7.2 Secure Communication

- All API calls use secure protocols
- Authentication tokens are properly managed
- Rate limiting and request validation

### 7.3 User Control

- Users can opt out of intelligence features
- Clear data collection notifications
- Configurable privacy settings

### 7.4 Data Management

- Session data expires after 24 hours
- Secure storage of temporary data
- Regular data cleanup processes

### 7.5 Compliance

- GDPR-compliant data handling
- Accessibility standards adherence
- Regular security audits

## 8. Multi-Agent Collaboration System

The SDK implements a sophisticated multi-agent collaboration system that enables agents to share insights and work together to optimize the user experience.

### 8.1 Agent Orchestrator

The Agent Orchestrator manages communication and coordination between different agents:

```javascript
class AgentOrchestrator {
  constructor(config = {}) {
    this.config = {
      name: 'CardAgentOrchestrator',
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
  
  // Initialize the orchestrator
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
  
  // Handle agent communication
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
      from,
      to,
      type,
      payload,
      timestamp: Date.now()
    };
    
    // Store message
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
    
    // Log message if enabled
    if (this.config.logMessages) {
      console.debug(`Agent message [${message.id}]: ${message.from} → ${message.to} (${message.type})`);
    }
    
    // Execute handlers and return results
    const handlers = this.messageHandlers.get(`${message.to}:${message.type}`) || [];
    const results = await Promise.allSettled(handlers.map(h => h(message)));
    
    return { messageId: message.id, handled: handlers.length > 0, results };
  }
  
  // Register message handler
  onMessage(agent, type, handler) {
    const key = `${agent}:${type}`;
    if (!this.messageHandlers.has(key)) {
      this.messageHandlers.set(key, []);
    }
    
    this.messageHandlers.get(key).push(handler);
    return this;
  }
}
```

### 8.2 Cross-Card Learning

The SDK implements a cross-card learning system that enables cards to learn from each other's interactions:

```javascript
class CrossCardLearningService {
  constructor() {
    this.cardInsights = new Map();
    this.globalPatterns = {
      flipFrequencies: {},
      viewDurations: {},
      commonOptimizations: []
    };
  }
  
  // Store insights from a specific card
  addCardInsight(cardId, insight) {
    if (!this.cardInsights.has(cardId)) {
      this.cardInsights.set(cardId, []);
    }
    
    this.cardInsights.get(cardId).push({
      ...insight,
      timestamp: Date.now()
    });
    
    this.updateGlobalPatterns();
    return true;
  }
  
  // Update global patterns based on all card insights
  updateGlobalPatterns() {
    // Process flip frequencies
    const flipFrequencies = {};
    
    // Process view durations
    const viewDurations = {};
    
    // Find common optimizations
    const optimizationCounts = {};
    
    // Process all cards
    for (const [cardId, insights] of this.cardInsights.entries()) {
      for (const insight of insights) {
        // Update flip frequencies
        if (insight.flipFrequency) {
          const key = `${insight.cardType}_${insight.deviceType}`;
          if (!flipFrequencies[key]) {
            flipFrequencies[key] = { total: 0, count: 0 };
          }
          flipFrequencies[key].total += insight.flipFrequency;
          flipFrequencies[key].count += 1;
        }
        
        // Update view durations
        if (insight.viewDuration) {
          const key = `${insight.cardType}_${insight.deviceType}_${insight.cardFace}`;
          if (!viewDurations[key]) {
            viewDurations[key] = { total: 0, count: 0 };
          }
          viewDurations[key].total += insight.viewDuration;
          viewDurations[key].count += 1;
        }
        
        // Count optimizations
        if (insight.appliedOptimizations) {
          for (const opt of insight.appliedOptimizations) {
            if (!optimizationCounts[opt.type]) {
              optimizationCounts[opt.type] =

