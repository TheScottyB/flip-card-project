# OpenAI Implementation Guide

This guide provides detailed information about implementing the Agent SDK using OpenAI's APIs. It includes specific examples, configurations, and best practices for OpenAI integration.

## Table of Contents
- [Configuration](#configuration)
- [Core Components](#core-components)
- [Implementation Examples](#implementation-examples)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Configuration

### OpenAI Setup

1. **API Configuration**
```javascript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Only for client-side demo
});

// Production configuration should be server-side
const productionConfig = {
  apiKey: process.env.OPENAI_API_KEY,
  maxRetries: 3,
  timeout: 30000,
  dangerouslyAllowBrowser: false
};
```

2. **Model Selection**
```javascript
const modelConfig = {
  name: 'gpt-4-turbo',
  temperature: 0.2, // Lower for more consistent responses
  maxTokens: 500,
  topP: 1,
  frequencyPenalty: 0,
  presencePenalty: 0
};
```

## Core Components

### 1. Card Interaction Agent

```javascript
class CardInteractionAgent {
  constructor(options = {}) {
    this.options = {
      model: 'gpt-4-turbo',
      temperature: 0.2,
      allowFallback: true,
      timeout: 5000,
      deploymentMode: 'hybrid',
      ...options
    };
    
    this.sessions = new Map();
  }
  
  async createAnalysisRun(params) {
    try {
      const response = await openai.chat.completions.create({
        model: this.options.model,
        temperature: this.options.temperature,
        messages: [
          {
            role: 'system',
            content: `You are analyzing card interaction patterns. Consider:
              - User engagement levels
              - Interaction frequency
              - View duration patterns
              - Device-specific behavior`
          },
          {
            role: 'user',
            content: `Analyze these interactions and identify patterns:\n${JSON.stringify(params.interactions)}`
          }
        ],
        functions: [
          {
            name: 'analyzePatterns',
            description: 'Analyze interaction patterns to identify usage trends',
            parameters: {
              type: 'object',
              properties: {
                patterns: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      type: { type: 'string' },
                      confidence: { type: 'number' },
                      description: { type: 'string' }
                    }
                  }
                },
                metrics: {
                  type: 'object',
                  properties: {
                    avgViewDuration: { type: 'number' },
                    flipFrequency: { type: 'number' },
                    engagementScore: { type: 'number' }
                  }
                }
              }
            }
          }
        ]
      });
      
      return this.processAnalysisResponse(response);
    } catch (error) {
      console.error('Analysis failed:', error);
      return this.generateFallbackAnalysis(params.interactions);
    }
  }
  
  processAnalysisResponse(response) {
    const message = response.choices[0].message;
    
    if (message.function_call) {
      const result = JSON.parse(message.function_call.arguments);
      return {
        patterns: result.patterns || [],
        metrics: result.metrics || {},
        confidence: 0.8
      };
    }
    
    return {
      patterns: [],
      metrics: {},
      confidence: 0
    };
  }
  
  // Generate basic fallback analysis when OpenAI call fails
  generateFallbackAnalysis(interactions) {
    let flipCount = 0;
    let totalDuration = 0;
    
    for (const interaction of interactions) {
      if (interaction.type === 'flip') {
        flipCount++;
      }
      
      if (interaction.duration) {
        totalDuration += interaction.duration;
      }
    }
    
    const avgDuration = interactions.length ? totalDuration / interactions.length : 0;
    
    return {
      patterns: [
        {
          type: 'basic_usage',
          confidence: 0.5,
          description: 'Basic usage pattern detected (fallback analysis)'
        }
      ],
      metrics: {
        flipCount,
        avgViewDuration: avgDuration,
        engagementScore: Math.min(flipCount * 0.1, 1) // Simple engagement calculation
      },
      confidence: 0.5,
      isFallback: true
    };
  }
}
```

### 2. Card Optimization Agent

```javascript
class CardOptimizationAgent {
  constructor(options = {}) {
    this.options = {
      model: 'gpt-4-turbo',
      temperature: 0.1,
      deploymentMode: 'server',
      allowFallback: true,
      cacheResults: true,
      ...options
    };
    
    this.optimizationCache = new Map();
  }
  
  async generateOptimizations(params) {
    const cacheKey = this.generateCacheKey(params);
    if (this.options.cacheResults) {
      const cached = this.optimizationCache.get(cacheKey);
      if (cached) return cached;
    }
    
    try {
      const response = await openai.chat.completions.create({
        model: this.options.model,
        temperature: this.options.temperature,
        messages: [
          {
            role: 'system',
            content: `You are an expert in optimizing card-based interfaces. Consider:
              - Device type and capabilities
              - User interaction patterns
              - Accessibility requirements
              - Performance constraints`
          },
          {
            role: 'user',
            content: `Generate optimizations for this card:\n${JSON.stringify(params)}`
          }
        ],
        functions: [
          {
            name: 'generateOptimizations',
            description: 'Generate optimizations for card display and behavior',
            parameters: {
              type: 'object',
              properties: {
                styles: {
                  type: 'object',
                  properties: {
                    fontSize: { type: 'string' },
                    spacing: { type: 'string' },
                    animation: { type: 'object' }
                  }
                },
                behavior: {
                  type: 'object',
                  properties: {
                    flipTiming: { type: 'number' },
                    hoverDelay: { type: 'number' },
                    autoFlip: { type: 'boolean' }
                  }
                },
                content: {
                  type: 'object',
                  properties: {
                    density: { type: 'string' },
                    reflow: { type: 'boolean' }
                  }
                }
              }
            }
          }
        ]
      });
      
      const result = this.processOptimizationResponse(response);
      
      if (this.options.cacheResults) {
        this.optimizationCache.set(cacheKey, result);
      }
      
      return result;
    } catch (error) {
      console.error('Optimization generation failed:', error);
      return this.generateFallbackOptimizations(params);
    }
  }
  
  processOptimizationResponse(response) {
    const message = response.choices[0].message;
    
    if (message.function_call) {
      return JSON.parse(message.function_call.arguments);
    }
    
    return {
      styles: {},
      behavior: {},
      content: {}
    };
  }
  
  generateCacheKey(params) {
    // Create a deterministic key from the parameters
    const keyParts = [
      params.cardType || 'default',
      params.deviceType || 'unknown',
      // Hash patterns into a consistent key
      JSON.stringify(params.patterns || []).split('').reduce(
        (hash, char) => ((hash << 5) - hash) + char.charCodeAt(0), 0
      )
    ];
    
    return keyParts.join(':');
  }
  
  generateFallbackOptimizations(params) {
    // Simple fallbacks based on device type
    const deviceType = params.deviceType || 'desktop';
    
    const fallbacks = {
      desktop: {
        styles: {
          fontSize: '1rem',
          spacing: 'normal'
        },
        behavior: {
          flipTiming: 400,
          hoverDelay: 200,
          autoFlip: false
        }
      },
      mobile: {
        styles: {
          fontSize: '0.9rem',
          spacing: 'compact'
        },
        behavior: {
          flipTiming: 300,
          hoverDelay: 0, // No hover on mobile
          autoFlip: false
        }
      },
      tablet: {
        styles: {
          fontSize: '0.95rem',
          spacing: 'normal'
        },
        behavior: {
          flipTiming: 350,
          hoverDelay: 150,
          autoFlip: false
        }
      }
    };
    
    return {
      ...fallbacks[deviceType] || fallbacks.desktop,
      isFallback: true
    };
  }
}
```

## Implementation Examples

### 1. Basic Usage

```javascript
// Initialize agents
const interactionAgent = new CardInteractionAgent({
  model: 'gpt-4-turbo',
  deploymentMode: 'hybrid'
});

const optimizationAgent = new CardOptimizationAgent({
  model: 'gpt-4-turbo',
  deploymentMode: 'server'
});

// Use in card component
class SmartCard {
  constructor(element) {
    this.element = element;
    this.session = interactionAgent.startSession({
      cardId: element.id,
      metadata: {
        type: element.dataset.cardType,
        initialState: this.getState()
      }
    });
  }
  
  async optimize() {
    const interactions = await this.session.getInteractions();
    const analysis = await interactionAgent.createAnalysisRun({
      interactions,
      cardType: this.element.dataset.cardType
    });
    
    if (analysis.patterns.length > 0) {
      const optimizations = await optimizationAgent.generateOptimizations({
        patterns: analysis.patterns,
        metrics: analysis.metrics,
        deviceType: this.getDeviceType()
      });
      
      this.applyOptimizations(optimizations);
    }
  }
  
  getDeviceType() {
    // Simple device detection
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }
  
  getState() {
    return {
      isFlipped: this.element.classList.contains('flipped'),
      content: {
        front: this.element.querySelector('.card-front').textContent.length,
        back: this.element.querySelector('.card-back').textContent.length
      }
    };
  }
  
  applyOptimizations(optimizations) {
    console.log('Applying optimizations:', optimizations);
    
    // Apply style optimizations
    if (optimizations.styles) {
      const styles = optimizations.styles;
      if (styles.fontSize) {
        this.element.style.fontSize = styles.fontSize;
      }
      
      if (styles.spacing) {
        switch(styles.spacing) {
          case 'compact':
            this.element.style.padding = '0.5rem';
            break;
          case 'normal':
            this.element.style.padding = '1rem';
            break;
          case 'spacious':
            this.element.style.padding = '1.5rem';
            break;
        }
      }
    }
    
    // Apply behavior optimizations
    if (optimizations.behavior) {
      const behavior = optimizations.behavior;
      if (behavior.flipTiming !== undefined) {
        this.element.style.transition = `transform ${behavior.flipTiming}ms ease`;
      }
      
      if (behavior.autoFlip) {
        this.setupAutoFlip(behavior.autoFlipInterval || 5000);
      }
    }
    
    // Force reflow to apply changes
    this.element.offsetHeight;
  }
  
  setupAutoFlip(interval) {
    if (this.autoFlipTimer) {
      clearInterval(this.autoFlipTimer);
    }
    
    this.autoFlipTimer = setInterval(() => {
      this.flip();
    }, interval);
  }
  
  flip() {
    this.element.classList.toggle('flipped');
    
    this.session.trackEvent('flip', {
      fromFace: this.element.classList.contains('flipped') ? 'front' : 'back',
      toFace: this.element.classList.contains('flipped') ? 'back' : 'front',
      timestamp: Date.now()
    });
  }
}
```

### 2. Advanced Integration

```javascript
// Enhanced agent configuration
const enhancedConfig = {
  model: 'gpt-4-turbo',
  temperature: 0.2,
  maxTokens: 500,
  streaming: true,
  functions: [
    {
      name: 'analyzeInteractions',
      parameters: {
        type: 'object',
        properties: {
          interactionType: { type: 'string' },
          metadata: { type: 'object' }
        }
      }
    }
  ],
  hooks: {
    beforeRequest: async (params) => {
      // Preprocess request parameters
      return params;
    },
    afterResponse: async (response) => {
      // Post-process API response
      return response;
    }
  }
};

// Implementation with streaming support
class StreamingCardAgent {
  async streamAnalysis(interactions) {
    const stream = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: 'Analyze card interactions in real-time.' },
        { role: 'user', content: JSON.stringify(interactions) }
      ],
      stream: true
    });
    
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        this.processStreamChunk(content);
      }
    }
  }
  
  processStreamChunk(content) {
    // Process streaming content
    console.log('Received chunk:', content);
    
    // Update UI with intermediate results
    if (this.options.onChunk) {
      this.options.onChunk(content);
    }
  }
}
```

## Best Practices

### 1. Error Handling

```javascript
class ResilientAgent {
  async makeOpenAIRequest(params) {
    const maxRetries = 3;
    let attempt = 0;
    
    while (attempt < maxRetries) {
      try {
        return await openai.chat.completions.create(params);

