import React from 'react';
import AgentDemo from '../components/AgentDemo';

export default function Overview() {
  return (
    <div>
      <h1>Agent SDK Overview</h1>
      
      <p className="intro">
        The Agent SDK provides a framework for building intelligent agents that can interact with your application components. It uses a "managed runner" architecture that offers flexibility, maintainability, and optimal performance.
      </p>
      
      <h2>Interactive Demo</h2>
      
      <p>Experiment with a basic implementation of the Agent SDK:</p>
      
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
        initialPrompt="Analyze these user interactions"
        sampleData={{
          interactions: [
            { type: "flip", timestamp: 1650012345678, metadata: { isFlipped: true, inputMethod: "touch" } },
            { type: "hover", timestamp: 1650012355678, metadata: { duration: 2500 } },
            { type: "flip", timestamp: 1650012365678, metadata: { isFlipped: false, inputMethod: "touch" } }
          ]
        }}
      />
      
      <h2>Key Benefits</h2>
      
      <div className="benefits">
        <div className="benefit">
          <h3>Simplified Maintenance</h3>
          <p>Centralizes configuration and reduces boilerplate code</p>
        </div>
        
        <div className="benefit">
          <h3>Modular Implementation</h3>
          <p>Easily swap underlying agent technology without changing your application</p>
        </div>
        
        <div className="benefit">
          <h3>Flexible Deployment</h3>
          <p>Run agents client-side, server-side, or in a hybrid configuration</p>
        </div>
        
        <div className="benefit">
          <h3>Minimal Dependencies</h3>
          <p>Reduce version conflicts and external requirements</p>
        </div>
        
        <div className="benefit">
          <h3>Easier Testing</h3>
          <p>Mock agent behaviors in development and testing environments</p>
        </div>
      </div>
      
      <h2>Architecture</h2>
      
      <p>The Agent SDK uses a layered architecture that separates concerns:</p>
      
      <div className="architecture-diagram">
        <pre>{`
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
  └────────────────┘    └────────────────────┘`}</pre>
      </div>
      
      <h2>How It Works</h2>
      
      <ol className="how-it-works">
        <li>
          <strong>Core operations</strong> are handled by a minimal <code>AgentRunner</code> that can use any agent implementation
        </li>
        <li>
          <strong>Agents are defined</strong> using a standardized tool definition format
        </li>
        <li>
          <strong>The runner orchestrates</strong> communication and handles all networking and state management
        </li>
        <li>
          <strong>Implementation details are isolated</strong>, allowing switching between different AI providers
        </li>
      </ol>
      
      <div className="cta-section">
        <h2>Ready to Dive In?</h2>
        <p>Check out our implementation examples to see the Agent SDK in action:</p>
        <div className="cta-buttons">
          <a href="/examples/openai-implementation" className="cta-button primary">
            OpenAI Implementation &rarr;
          </a>
          <a href="/examples/other-implementations" className="cta-button secondary">
            Explore Alternatives &rarr;
          </a>
        </div>
      </div>
      
      <style jsx>{`
        .intro {
          font-size: 1.2rem;
          line-height: 1.6;
          color: #555;
          margin-bottom: 2rem;
        }
        
        .benefits {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin: 2rem 0;
        }
        
        .benefit {
          background: linear-gradient(to bottom right, #f9f9f9, #f0f0f0);
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .benefit h3 {
          margin-top: 0;
          color: var(--primary-color);
          border-bottom: 1px solid #eee;
          padding-bottom: 0.5rem;
        }
        
        .architecture-diagram {
          background: #282c34;
          color: #abb2bf;
          padding: 1rem;
          border-radius: 6px;
          overflow: auto;
          margin: 2rem 0;
        }
        
        .architecture-diagram pre {
          background: transparent;
          padding: 0;
          margin: 0;
          font-family: 'Fira Code', 'Courier New', monospace;
        }
        
        .how-it-works {
          background: #f9f9f9;
          padding: 1.5rem 2rem;
          border-radius: 8px;
          margin: 2rem 0;
        }
        
        .how-it-works li {
          margin-bottom: 1rem;
        }
        
        .how-it-works strong {
          color: var(--primary-color);
        }
        
        .cta-section {
          background: linear-gradient(to bottom right, #f0f6ff, #e6f0ff);
          padding: 2rem;
          border-radius: 8px;
          margin-top: 3rem;
          text-align: center;
        }
        
        .cta-buttons {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-top: 1.5rem;
        }
        
        .cta-button {
          display: inline-block;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          text-decoration: none;
          font-weight: 500;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        .cta-button.primary {
          background: var(--primary-color);
          color: white;
        }
        
        .cta-button.secondary {
          background: white;
          color: var(--primary-color);
          border: 1px solid var(--primary-color);
        }
      `}</style>
    </div>
  );
}