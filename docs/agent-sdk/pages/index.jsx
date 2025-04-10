import React from 'react';
import AgentDemo from '../components/AgentDemo';

export default function Home() {
  return (
    <div>
      <h1>Agent SDK Documentation</h1>
      
      <div className="important-notice">
        <h2>🚨 What We Mean By "Agent"</h2>
        <p>The Agent SDK represents a fundamental rethinking of how agentic applications are built and orchestrated. It is <strong>not</strong>:</p>
        <ul>
          <li>A wrapper around the OpenAI Assistants API or Chat API</li>
          <li>A simple function-calling implementation</li>
          <li>A basic RAG pipeline with some orchestration</li>
        </ul>
        
        <p>Instead, the Agent SDK is a comprehensive framework for building truly agentic applications with:</p>
        <ul>
          <li>Model-agnostic architecture that works with any AI provider or local implementation</li>
          <li>Full control over agent behavior, capabilities and execution flow</li>
          <li>Sophisticated state management and context handling</li>
          <li>Built-in error handling and fallback strategies</li>
          <li>Hybrid execution environments (client/server/edge)</li>
        </ul>
        
        <p>When discussing "agents" in this project, we always mean this comprehensive, model-agnostic approach rather than any specific vendor implementation.</p>
      </div>
      
      <p className="intro">
        Welcome to the interactive documentation for the Agent SDK. This documentation provides a hands-on approach to understanding and implementing the Agent SDK in your applications.
      </p>
      
      <div className="features">
        <div className="feature">
          <h3>🔄 Interactive Examples</h3>
          <p>Try the Agent SDK directly in your browser without any setup.</p>
        </div>
        
        <div className="feature">
          <h3>🧩 Model-Agnostic</h3>
          <p>Use OpenAI, Anthropic, or your own custom implementations.</p>
        </div>
        
        <div className="feature">
          <h3>⚡ Live Editing</h3>
          <p>Modify examples in real-time to see how changes affect behavior.</p>
        </div>
      </div>
      
      <h2>Try It Now</h2>
      
      <p>Here's a quick demo of the Agent SDK in action:</p>
      
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
        initialPrompt="What insights can you provide from this user data?"
        sampleData={{
          interactions: [
            { type: "flip", timestamp: 1650012345678, metadata: { isFlipped: true, inputMethod: "touch" } },
            { type: "hover", timestamp: 1650012355678, metadata: { duration: 2500 } },
            { type: "flip", timestamp: 1650012365678, metadata: { isFlipped: false, inputMethod: "touch" } }
          ]
        }}
      />
      
      <h2>Documentation Sections</h2>
      
      <div className="doc-sections">
        <a href="/overview" className="doc-section">
          <h3>Overview</h3>
          <p>Introduction to the Agent SDK architecture and concepts</p>
        </a>
        
        <a href="/examples/openai-implementation" className="doc-section">
          <h3>OpenAI Implementation</h3>
          <p>Implementing the Agent SDK with OpenAI's function calling</p>
        </a>
        
        <a href="/examples/other-implementations" className="doc-section">
          <h3>Alternative Implementations</h3>
          <p>Using Anthropic, local rule-based approaches, and hybrid models</p>
        </a>
      </div>
      
      <style jsx>{`
        .important-notice {
          background: #fffaeb;
          border-left: 5px solid #ff9900;
          padding: 1.5rem;
          margin: 2rem 0;
          border-radius: 0 8px 8px 0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        
        .important-notice h2 {
          margin-top: 0;
          color: #d97706;
          border-bottom: 1px solid #f0e6d2;
          padding-bottom: 0.5rem;
          margin-bottom: 1rem;
        }
        
        .important-notice p {
          margin-bottom: 1rem;
        }
        
        .important-notice ul {
          padding-left: 1.5rem;
          margin-bottom: 1.5rem;
        }
        
        .important-notice li {
          margin-bottom: 0.5rem;
        }
        
        .intro {
          font-size: 1.2rem;
          line-height: 1.6;
          color: #555;
          margin-bottom: 2rem;
        }
        
        .features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          margin: 2rem 0;
        }
        
        .feature {
          background: #f9f9f9;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .feature h3 {
          margin-top: 0;
          color: var(--primary-color);
        }
        
        .doc-sections {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin: 2rem 0;
        }
        
        .doc-section {
          background: #fff;
          padding: 1.5rem;
          border-radius: 8px;
          border: 1px solid #eee;
          text-decoration: none;
          color: inherit;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .doc-section:hover {
          transform: translateY(-3px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .doc-section h3 {
          margin-top: 0;
          color: var(--primary-color);
        }
      `}</style>
    </div>
  );
}