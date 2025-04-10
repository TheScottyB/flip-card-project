import React from 'react';
import AgentDemo from '../components/AgentDemo';

export default function Home() {
  return (
    <div>
      <h1>Agent SDK Documentation</h1>
      
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