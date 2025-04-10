import React from 'react';
import AgentDemo from '../../components/AgentDemo';

export default function OpenAIImplementation() {
  return (
    <div>
      <h1>OpenAI Implementation of Agent SDK</h1>
      
      <p className="intro">
        This example shows how to implement the Agent SDK using OpenAI's APIs. The implementation leverages the Function Calling feature to provide structured interaction between your application and AI agents.
      </p>
      
      <h2>Live Demo</h2>
      
      <p>Try out the OpenAI integration:</p>
      
      <AgentDemo 
        config={{
          model: "openai/gpt-4o",
          tools: [
            { name: "storeInteraction", enabled: true },
            { name: "analyzePatterns", enabled: true }
          ],
          memory: true,
          deploymentMode: "hybrid"
        }}
        initialPrompt="Analyze these user interactions for optimization opportunities"
        sampleData={{
          interactions: [
            { type: "flip", timestamp: 1650012345678, metadata: { isFlipped: true, inputMethod: "touch" } },
            { type: "hover", timestamp: 1650012355678, metadata: { duration: 2500 } },
            { type: "flip", timestamp: 1650012365678, metadata: { isFlipped: false, inputMethod: "touch" } },
            { type: "hover", timestamp: 1650012375678, metadata: { duration: 900 } },
            { type: "flip", timestamp: 1650012385678, metadata: { isFlipped: true, inputMethod: "mouse" } }
          ],
          userPreferences: {
            reducedMotion: false,
            colorScheme: "light"
          },
          deviceInfo: {
            type: "mobile",
            screenWidth: 390,
            screenHeight: 844
          }
        }}
      />
      
      <h2>Implementation Code</h2>
      
      <p>Here's how to implement the OpenAI version of the Agent SDK:</p>
      
      <div className="code-container">
        <pre className="code-sample">{`import OpenAI from 'openai';
import { AgentRunner } from '../core/AgentRunner';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Define tools using OpenAI Functions API format
const tools = [
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
    description: 'Analyze user interaction patterns',
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

// Create the OpenAI implementation of the agent runner
class OpenAIAgentRunner extends AgentRunner {
  constructor(options) {
    super(options);
    this.openai = openai;
    this.model = options.model || 'gpt-4o';
    this.tools = tools;
  }
  
  async executeAgent(prompt, data, options = {}) {
    try {
      // Create messages for the API call
      const messages = [
        { 
          role: 'system', 
          content: 'You are an agent responsible for tracking and analyzing card interactions.'
        },
        { 
          role: 'user', 
          content: `${prompt}\\n\\nData: ${JSON.stringify(data, null, 2)}`
        }
      ];
      
      // Call OpenAI API with function calling
      const response = await this.openai.chat.completions.create({
        model: this.model,
        temperature: 0.2,
        messages,
        tools: this.tools.map(tool => ({
          type: 'function',
          function: tool
        })),
        tool_choice: 'auto'
      });
      
      // Process the response
      return this.processResponse(response);
    } catch (error) {
      console.error('Error executing agent with OpenAI:', error);
      throw error;
    }
  }
  
  processResponse(response) {
    const message = response.choices[0].message;
    
    if (message.tool_calls && message.tool_calls.length > 0) {
      // Process function calls
      const results = message.tool_calls.map(toolCall => {
        const functionName = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments);
        
        return {
          tool: functionName,
          args,
          id: toolCall.id
        };
      });
      
      return {
        type: 'tool_calls',
        results,
        message: message.content || ''
      };
    }
    
    // Return direct message content
    return {
      type: 'message',
      content: message.content
    };
  }
}`}</pre>
      </div>
      
      <h2>Configuration Options</h2>
      
      <table className="config-table">
        <thead>
          <tr>
            <th>Option</th>
            <th>Type</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>model</code></td>
            <td>string</td>
            <td>The OpenAI model to use (default: 'gpt-4o')</td>
          </tr>
          <tr>
            <td><code>temperature</code></td>
            <td>number</td>
            <td>Temperature setting for response creativity (0-1)</td>
          </tr>
          <tr>
            <td><code>tools</code></td>
            <td>array</td>
            <td>Tool definitions using OpenAI function calling format</td>
          </tr>
          <tr>
            <td><code>deploymentMode</code></td>
            <td>string</td>
            <td>'client', 'server', or 'hybrid' deployment mode</td>
          </tr>
          <tr>
            <td><code>memory</code></td>
            <td>boolean</td>
            <td>Whether to enable context memory between requests</td>
          </tr>
        </tbody>
      </table>
      
      <h2>Making it Your Own</h2>
      
      <div className="customization-tips">
        <p>You can easily adapt this implementation by:</p>
        <ol>
          <li>Customizing the tools to match your specific application needs</li>
          <li>Adjusting the system prompt to provide domain-specific guidance</li>
          <li>Implementing your own <code>processResponse</code> method to handle the results</li>
        </ol>
        <p>Try modifying the configuration in the demo above to see how different settings affect the agent's behavior.</p>
      </div>
      
      <div className="navigation-buttons">
        <a href="/overview" className="nav-button">&larr; Back to Overview</a>
        <a href="/examples/other-implementations" className="nav-button">Alternative Implementations &rarr;</a>
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
        
        .config-table {
          width: 100%;
          border-collapse: collapse;
          margin: 2rem 0;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .config-table th {
          background: #f5f5f5;
          padding: 0.75rem;
          text-align: left;
          font-weight: 600;
          border: 1px solid #eee;
        }
        
        .config-table td {
          padding: 0.75rem;
          border: 1px solid #eee;
          vertical-align: top;
        }
        
        .config-table code {
          background: #f0f0f0;
          padding: 2px 4px;
          border-radius: 4px;
          font-size: 0.9em;
        }
        
        .customization-tips {
          background: #f9f9f9;
          padding: 1.5rem;
          border-radius: 8px;
          margin: 2rem 0;
        }
        
        .customization-tips ol {
          padding-left: 1.5rem;
        }
        
        .customization-tips li {
          margin-bottom: 0.5rem;
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
    </div>
  );
}