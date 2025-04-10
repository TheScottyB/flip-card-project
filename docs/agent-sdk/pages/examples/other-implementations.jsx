import React from 'react';
import AgentDemo from '../../components/AgentDemo';

export default function OtherImplementations() {
  return (
    <div>
      <h1>Alternative Agent SDK Implementations</h1>
      
      <p className="intro">
        The Agent SDK is designed to be model-agnostic, allowing you to use different AI providers or even local implementations. This page demonstrates some alternative approaches.
      </p>
      
      <h2>Local-Only Implementation</h2>
      
      <p>This implementation uses simple rule-based logic without requiring external AI APIs:</p>
      
      <AgentDemo 
        config={{
          model: "local/rule-based",
          tools: [
            { name: "storeInteraction", enabled: true },
            { name: "analyzePatterns", enabled: true }
          ],
          memory: false,
          deploymentMode: "client"
        }}
        initialPrompt="Analyze these user interactions"
        sampleData={{
          interactions: [
            { type: "flip", timestamp: 1650012345678, metadata: { isFlipped: true, inputMethod: "touch" } },
            { type: "hover", timestamp: 1650012355678, metadata: { duration: 2500 } },
            { type: "flip", timestamp: 1650012365678, metadata: { isFlipped: false, inputMethod: "touch" } }
          ]
        }}
      />
      
      <div className="code-container">
        <pre className="code-sample">{`import { AgentRunner } from '../core/AgentRunner';

/**
 * Rule-based local implementation that doesn't require external AI APIs
 */
class LocalAgentRunner extends AgentRunner {
  constructor(options) {
    super(options);
  }
  
  async executeAgent(prompt, data, options = {}) {
    // Simple rule-based analysis of the data
    const results = {
      insights: [],
      metrics: {}
    };
    
    // Extract and count interaction types
    const interactions = data.interactions || [];
    const types = {};
    
    interactions.forEach(interaction => {
      types[interaction.type] = (types[interaction.type] || 0) + 1;
    });
    
    results.metrics.interactionCounts = types;
    
    // Calculate time ranges
    if (interactions.length > 1) {
      const timestamps = interactions.map(i => i.timestamp).sort();
      results.metrics.sessionDuration = timestamps[timestamps.length - 1] - timestamps[0];
    }
    
    // Apply simple rules to generate insights
    if (types.flip > 3) {
      results.insights.push({
        type: 'high_engagement',
        confidence: 0.8,
        description: 'User is actively flipping cards, showing engagement'
      });
    }
    
    if (types.hover && interactions.some(i => i.type === 'hover' && i.metadata?.duration > 5000)) {
      results.insights.push({
        type: 'content_interest',
        confidence: 0.7,
        description: 'User is spending significant time hovering, indicating interest in content'
      });
    }
    
    return results;
  }
}`}</pre>
      </div>
      
      <h2>Anthropic API Implementation</h2>
      
      <p>You can also implement the Agent SDK using Anthropic's Claude models:</p>
      
      <AgentDemo 
        config={{
          model: "anthropic/claude-3-opus",
          tools: [
            { name: "storeInteraction", enabled: true },
            { name: "analyzePatterns", enabled: true }
          ],
          memory: true,
          deploymentMode: "server"
        }}
        initialPrompt="What recommendations can you make based on these interaction patterns?"
        sampleData={{
          interactions: [
            { type: "flip", timestamp: 1650012345678, metadata: { isFlipped: true, inputMethod: "touch" } },
            { type: "hover", timestamp: 1650012355678, metadata: { duration: 7500 } },
            { type: "flip", timestamp: 1650012365678, metadata: { isFlipped: false, inputMethod: "touch" } },
            { type: "hover", timestamp: 1650012375678, metadata: { duration: 6200 } }
          ]
        }}
      />
      
      <div className="code-container collapsible">
        <div className="code-header">
          <span>AnthropicAgentRunner.js</span>
          <button className="expand-button" onClick={() => document.querySelector('.code-body').classList.toggle('expanded')}>
            Expand/Collapse
          </button>
        </div>
        <div className="code-body">
          <pre className="code-sample">{`import Anthropic from '@anthropic-ai/sdk';
import { AgentRunner } from '../core/AgentRunner';

class AnthropicAgentRunner extends AgentRunner {
  constructor(options) {
    super(options);
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
    this.model = options.model || 'claude-3-opus';
    
    // Define tools in Anthropic's tool format
    this.tools = [
      {
        name: 'storeInteraction',
        description: 'Store card interaction events',
        input_schema: {
          type: 'object',
          properties: {
            eventType: { 
              type: 'string',
              description: 'Type of interaction event'
            },
            cardId: { 
              type: 'string',
              description: 'Card identifier'
            },
            timestamp: { 
              type: 'integer',
              description: 'Event timestamp'
            },
            metadata: { 
              type: 'object',
              description: 'Additional data'
            }
          },
          required: ['eventType', 'cardId', 'timestamp']
        }
      },
      {
        name: 'analyzePatterns',
        description: 'Analyze interaction patterns',
        input_schema: {
          type: 'object',
          properties: {
            userId: { 
              type: 'string',
              description: 'User identifier'
            },
            timeframe: { 
              type: 'string',
              enum: ['current_session', 'today', 'week', 'month', 'all']
            },
            metricType: { 
              type: 'string',
              enum: ['engagement', 'conversion', 'usability', 'all']
            }
          },
          required: ['userId']
        }
      }
    ];
  }
  
  async executeAgent(prompt, data, options = {}) {
    try {
      // Create the message structure for Claude
      const systemPrompt = \`You are an agent that analyzes card interaction patterns.
                           You help identify user behavior patterns and suggest optimizations.\`;
      
      // Call Anthropic API with tool use
      const response = await this.anthropic.messages.create({
        model: this.model,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: \`\${prompt}\\n\\nHere is the data to analyze:\\n\${JSON.stringify(data, null, 2)}\`
          }
        ],
        tools: this.tools,
        max_tokens: 1024
      });
      
      // Process and return the response
      return this.processAnthropicResponse(response);
    } catch (error) {
      console.error('Error with Anthropic API:', error);
      throw error;
    }
  }
  
  processAnthropicResponse(response) {
    // Handle tool use in the response
    const message = response.content[0];
    
    if (message.type === 'tool_use') {
      return {
        type: 'tool_use',
        tool: message.name,
        args: message.input,
        id: message.id
      };
    }
    
    // Handle text response
    return {
      type: 'message',
      content: message.text
    };
  }
}`}</pre>
        </div>
      </div>
      
      <h2>Hybrid Implementation</h2>
      
      <p>For production applications, a hybrid approach that can switch between providers or fall back to local processing might be ideal:</p>
      
      <div className="hybrid-demo">
        <div className="hybrid-visual">
          <div className="hybrid-box primary">
            <h4>Primary Implementation</h4>
            <div className="tag">OpenAI</div>
            <div className="line"></div>
          </div>
          <div className="fallback-arrow">⬇️ Fallback Path</div>
          <div className="hybrid-box secondary">
            <h4>Secondary Implementation</h4>
            <div className="tag">Anthropic</div>
            <div className="line"></div>
          </div>
          <div className="fallback-arrow">⬇️ Fallback Path</div>
          <div className="hybrid-box tertiary">
            <h4>Final Fallback</h4>
            <div className="tag">Local</div>
            <div className="line"></div>
          </div>
        </div>
        
        <div className="code-container">
          <pre className="code-sample">{`import { AgentRunner } from '../core/AgentRunner';
import OpenAIAgentRunner from './OpenAIAgentRunner';
import AnthropicAgentRunner from './AnthropicAgentRunner';
import LocalAgentRunner from './LocalAgentRunner';

class HybridAgentRunner extends AgentRunner {
  constructor(options) {
    super(options);
    
    // Initialize different implementations
    this.implementations = {
      openai: new OpenAIAgentRunner(options),
      anthropic: new AnthropicAgentRunner(options),
      local: new LocalAgentRunner(options)
    };
    
    this.preferredImplementation = options.preferredImplementation || 'openai';
    this.fallbackOrder = options.fallbackOrder || ['anthropic', 'local'];
  }
  
  async executeAgent(prompt, data, options = {}) {
    // Try preferred implementation first
    try {
      return await this.implementations[this.preferredImplementation].executeAgent(prompt, data, options);
    } catch (error) {
      console.warn(\`Primary implementation (\${this.preferredImplementation}) failed:\`, error);
      
      // Try fallbacks in order
      for (const fallback of this.fallbackOrder) {
        try {
          console.log(\`Attempting fallback to \${fallback} implementation\`);
          return await this.implementations[fallback].executeAgent(prompt, data, options);
        } catch (fallbackError) {
          console.warn(\`Fallback implementation (\${fallback}) failed:\`, fallbackError);
        }
      }
      
      // All implementations failed - throw error
      throw new Error('All agent implementations failed');
    }
  }
}`}</pre>
        </div>
      </div>
      
      <h2>Comparing Implementations</h2>
      
      <p>Each implementation approach has its own advantages:</p>
      
      <table className="comparison-table">
        <thead>
          <tr>
            <th>Implementation</th>
            <th>Advantages</th>
            <th>Disadvantages</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>OpenAI API</strong></td>
            <td>High-quality analysis, function calling</td>
            <td>Requires API key, network dependency</td>
          </tr>
          <tr>
            <td><strong>Anthropic API</strong></td>
            <td>Excellent reasoning capabilities</td>
            <td>Similar API dependencies</td>
          </tr>
          <tr>
            <td><strong>Local Rule-based</strong></td>
            <td>No external dependencies, fast</td>
            <td>Limited analytical capabilities</td>
          </tr>
          <tr>
            <td><strong>Hybrid</strong></td>
            <td>Reliability through fallbacks</td>
            <td>More complex implementation</td>
          </tr>
        </tbody>
      </table>
      
      <p className="benefit-note">
        The beauty of the Agent SDK is that you can switch between these implementations without changing your application code, as they all conform to the same interface.
      </p>
      
      <div className="navigation-buttons">
        <a href="/examples/openai-implementation" className="nav-button">&larr; OpenAI Implementation</a>
        <a href="/" className="nav-button">Back to Home</a>
      </div>
      
      <style jsx>{`
        .intro {
          font-size: 1.2rem;
          line-height: 1.6;
          color: #555;
          margin-bottom: 2rem;
        }
        
        .code-container {
          margin: 2rem 0;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .code-sample {
          background: #282c34;
          color: #abb2bf;
          padding: 1.5rem;
          overflow: auto;
          line-height: 1.5;
          font-family: 'Fira Code', 'Courier New', monospace;
          font-size: 0.9rem;
          margin: 0;
        }
        
        .collapsible .code-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          background: #1e2127;
          color: #abb2bf;
          font-family: 'Fira Code', 'Courier New', monospace;
          font-size: 0.9rem;
        }
        
        .expand-button {
          background: #2c313a;
          border: none;
          color: #abb2bf;
          padding: 0.25rem 0.75rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.8rem;
        }
        
        .code-body {
          max-height: 300px;
          overflow: hidden;
          transition: max-height 0.5s ease;
        }
        
        .code-body.expanded {
          max-height: 2000px;
        }
        
        .comparison-table {
          width: 100%;
          border-collapse: collapse;
          margin: 2rem 0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .comparison-table th {
          background: #f0f6ff;
          color: #0066cc;
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          border: 1px solid #e0e8f7;
        }
        
        .comparison-table td {
          padding: 1rem;
          border: 1px solid #e0e8f7;
          vertical-align: top;
        }
        
        .comparison-table tr:nth-child(even) {
          background: #f9f9f9;
        }
        
        .hybrid-demo {
          margin: 2rem 0;
        }
        
        .hybrid-visual {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 2rem;
        }
        
        .hybrid-box {
          width: 80%;
          max-width: 400px;
          padding: 1.5rem;
          border-radius: 8px;
          margin-bottom: 0.5rem;
          position: relative;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        .hybrid-box h4 {
          margin: 0 0 0.75rem 0;
        }
        
        .hybrid-box .tag {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: rgba(0,0,0,0.1);
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 500;
        }
        
        .hybrid-box .line {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 4px;
        }
        
        .primary {
          background: linear-gradient(to right, #f0f6ff, #e6f0ff);
        }
        
        .primary .line {
          background: #0066cc;
        }
        
        .secondary {
          background: linear-gradient(to right, #f7f0ff, #f0e6ff);
        }
        
        .secondary .line {
          background: #6600cc;
        }
        
        .tertiary {
          background: linear-gradient(to right, #f0fff0, #e6ffe6);
        }
        
        .tertiary .line {
          background: #00cc66;
        }
        
        .fallback-arrow {
          margin: 0.25rem 0;
          font-size: 1.2rem;
          color: #777;
        }
        
        .benefit-note {
          background: #f0fff0;
          border-left: 4px solid #00cc66;
          padding: 1rem 1.5rem;
          border-radius: 0 8px 8px 0;
          margin: 2rem 0;
          font-weight: 500;
        }
        
        .navigation-buttons {
          display: flex;
          justify-content: space-between;
          margin-top: 3rem;
        }
        
        .nav-button {
          display: inline-block;
          padding: 0.75rem 1.25rem;
          background: #f5f5f5;
          color: var(--text-color);
          text-decoration: none;
          border-radius: 4px;
          transition: background 0.2s;
        }
        
        .nav-button:hover {
          background: #e5e5e5;
        }
      `}</style>
      
      <script jsx="true">{`
        // This would be properly implemented in a React component
        // But for demo purposes, adding a simple script
        document.addEventListener('DOMContentLoaded', () => {
          const expandButtons = document.querySelectorAll('.expand-button');
          expandButtons.forEach(button => {
            button.addEventListener('click', (e) => {
              const codeBody = e.target.closest('.collapsible').querySelector('.code-body');
              codeBody.classList.toggle('expanded');
            });
          });
        });
      `}</script>
    </div>
  );
}