import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';

/**
 * AgentDemo - Interactive component for demonstrating Agent SDK functionality
 */
const AgentDemo = ({ 
  config = {
    model: "openai/gpt-4o",
    tools: [
      { name: "storeInteraction", enabled: true },
      { name: "analyzePatterns", enabled: true }
    ],
    memory: true,
    deploymentMode: "hybrid"
  },
  initialPrompt = "Analyze these card interactions",
  sampleData = {
    interactions: [
      { type: "flip", timestamp: 1650012345678, metadata: { isFlipped: true, inputMethod: "touch" } },
      { type: "hover", timestamp: 1650012355678, metadata: { duration: 2500 } },
      { type: "flip", timestamp: 1650012365678, metadata: { isFlipped: false, inputMethod: "touch" } }
    ]
  }
}) => {
  // State
  const [activeTab, setActiveTab] = useState('demo');
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState('');
  const [currentConfig, setCurrentConfig] = useState(config);
  const [currentData, setCurrentData] = useState(sampleData);
  const [prompt, setPrompt] = useState(initialPrompt);
  const [agentState, setAgentState] = useState('idle');
  
  // Refs
  const configEditorRef = useRef(null);
  const dataEditorRef = useRef(null);
  
  // Simulate agent execution
  const runAgent = async () => {
    setAgentState('initializing');
    setRunning(true);
    setOutput('');
    
    // Add initial messages
    addOutput('Initializing agent with configuration...');
    await sleep(500);
    addOutput(`Model: ${currentConfig.model}`);
    await sleep(300);
    addOutput(`Enabled tools: ${currentConfig.tools.filter(t => t.enabled).map(t => t.name).join(', ')}`);
    await sleep(700);
    
    // Simulate agent setup
    setAgentState('configuring');
    addOutput('\nSetting up agent runner...');
    await sleep(1000);
    addOutput('Runner initialized successfully');
    await sleep(500);
    
    // Process the data
    setAgentState('processing');
    addOutput('\nProcessing input data...');
    await sleep(800);
    
    // Show data summary
    const interactionCount = currentData.interactions?.length || 0;
    addOutput(`Found ${interactionCount} interactions to analyze`);
    await sleep(500);
    
    // Generate "insights"
    setAgentState('analyzing');
    addOutput('\nAnalyzing patterns...');
    await sleep(1200);
    
    // Generate a simple analysis based on the data
    const flipCount = currentData.interactions?.filter(i => i.type === 'flip').length || 0;
    const hoverCount = currentData.interactions?.filter(i => i.type === 'hover').length || 0;
    
    addOutput('\nResults:');
    await sleep(500);
    
    if (flipCount > 0) {
      addOutput(`- Detected ${flipCount} card flip events`);
      await sleep(300);
      
      if (flipCount > 1) {
        const firstFlip = currentData.interactions.find(i => i.type === 'flip');
        const lastFlip = [...currentData.interactions.filter(i => i.type === 'flip')].pop();
        const timeBetween = lastFlip.timestamp - firstFlip.timestamp;
        const avgFlipTime = Math.round(timeBetween / (flipCount - 1));
        
        addOutput(`- Average time between flips: ${avgFlipTime}ms`);
        await sleep(400);
        
        if (avgFlipTime < 5000) {
          addOutput(`- Pattern detected: Rapid exploration (user quickly examining both sides)`);
        } else {
          addOutput(`- Pattern detected: Deliberate examination (user spending time on each side)`);
        }
      }
    }
    
    if (hoverCount > 0) {
      await sleep(300);
      addOutput(`- Detected ${hoverCount} hover interactions`);
      
      const hoverDurations = currentData.interactions
        .filter(i => i.type === 'hover' && i.metadata?.duration)
        .map(i => i.metadata.duration);
        
      if (hoverDurations.length > 0) {
        const avgDuration = Math.round(hoverDurations.reduce((a, b) => a + b, 0) / hoverDurations.length);
        await sleep(400);
        addOutput(`- Average hover duration: ${avgDuration}ms`);
      }
    }
    
    await sleep(800);
    addOutput('\nAgent execution completed successfully');
    setAgentState('complete');
    setRunning(false);
  };
  
  // Add text to the output with a typewriter effect
  const addOutput = (text) => {
    setOutput(prev => prev + (prev ? '\n' : '') + text);
  };
  
  // Handle configuration updates
  const updateConfig = () => {
    try {
      const newConfig = JSON.parse(configEditorRef.current.value);
      setCurrentConfig(newConfig);
    } catch (e) {
      alert('Invalid JSON in configuration. Please check your syntax.');
    }
  };
  
  // Handle data updates
  const updateData = () => {
    try {
      const newData = JSON.parse(dataEditorRef.current.value);
      setCurrentData(newData);
    } catch (e) {
      alert('Invalid JSON in sample data. Please check your syntax.');
    }
  };
  
  // Utility function to simulate async operations
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  
  // Render the component
  return (
    <div className="agent-demo">
      <div className="agent-demo-tabs">
        <button 
          className={`tab ${activeTab === 'demo' ? 'active' : ''}`}
          onClick={() => setActiveTab('demo')}
        >
          Agent Demo
        </button>
        <button 
          className={`tab ${activeTab === 'config' ? 'active' : ''}`}
          onClick={() => setActiveTab('config')}
        >
          Configuration
        </button>
        <button 
          className={`tab ${activeTab === 'data' ? 'active' : ''}`}
          onClick={() => setActiveTab('data')}
        >
          Sample Data
        </button>
        <button 
          className={`tab ${activeTab === 'code' ? 'active' : ''}`}
          onClick={() => setActiveTab('code')}
        >
          Code
        </button>
      </div>
      
      <div className="agent-demo-content">
        {activeTab === 'demo' && (
          <div className="demo-tab">
            <div className="demo-controls">
              <input 
                type="text" 
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="Enter prompt for the agent"
                disabled={running}
              />
              <button 
                onClick={runAgent}
                disabled={running}
              >
                {running ? 'Running...' : 'Run Agent'}
              </button>
            </div>
            
            <div className="agent-status">
              Status: <span className={`status-${agentState}`}>{agentState}</span>
            </div>
            
            <div className="output-container">
              <pre>{output || 'Agent output will appear here...'}</pre>
            </div>
          </div>
        )}
        
        {activeTab === 'config' && (
          <div className="config-tab">
            <h3>Agent Configuration</h3>
            <textarea
              ref={configEditorRef}
              defaultValue={JSON.stringify(currentConfig, null, 2)}
              rows={10}
            />
            <button onClick={updateConfig}>
              Update Configuration
            </button>
          </div>
        )}
        
        {activeTab === 'data' && (
          <div className="data-tab">
            <h3>Sample Data</h3>
            <textarea
              ref={dataEditorRef}
              defaultValue={JSON.stringify(currentData, null, 2)}
              rows={10}
            />
            <button onClick={updateData}>
              Update Sample Data
            </button>
          </div>
        )}
        
        {activeTab === 'code' && (
          <div className="code-tab">
            <h3>Implementation Code</h3>
            <pre className="code-sample">
{`// Agent runner implementation
const agentRunner = new AgentRunner({
  model: "${currentConfig.model}",
  tools: [
${currentConfig.tools.map(tool => `    { name: "${tool.name}", enabled: ${tool.enabled} }`).join(',\n')}
  ],
  memory: ${currentConfig.memory},
  deploymentMode: "${currentConfig.deploymentMode}"
});

// Initialize a session
const session = agentRunner.createSession();

// Process data with the agent
async function runAnalysis() {
  const result = await session.run({
    prompt: "${prompt}",
    data: ${JSON.stringify(currentData, null, 2)}
  });
  
  console.log(result);
}`}
            </pre>
          </div>
        )}
      </div>
      
      <style jsx>{`
        .agent-demo {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          overflow: hidden;
          margin: 20px 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', sans-serif;
        }
        
        .agent-demo-tabs {
          display: flex;
          background: #f5f5f5;
          border-bottom: 1px solid #e0e0e0;
        }
        
        .tab {
          padding: 12px 16px;
          border: none;
          background: none;
          cursor: pointer;
          font-weight: 500;
          color: #444;
        }
        
        .tab.active {
          background: #fff;
          border-bottom: 2px solid #0066cc;
          color: #0066cc;
        }
        
        .agent-demo-content {
          padding: 16px;
          min-height: 300px;
        }
        
        .demo-controls {
          display: flex;
          margin-bottom: 16px;
          gap: 8px;
        }
        
        .demo-controls input {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }
        
        button {
          background: #0066cc;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 8px 16px;
          cursor: pointer;
          font-weight: 500;
        }
        
        button:disabled {
          background: #cccccc;
          cursor: not-allowed;
        }
        
        .agent-status {
          margin-bottom: 12px;
          font-size: 14px;
        }
        
        .status-idle { color: #888; }
        .status-initializing { color: #ff9900; }
        .status-configuring { color: #ff9900; }
        .status-processing { color: #0066cc; }
        .status-analyzing { color: #0066cc; }
        .status-complete { color: #00cc66; }
        
        .output-container {
          background: #f9f9f9;
          border: 1px solid #eee;
          border-radius: 4px;
          padding: 16px;
          min-height: 200px;
          font-family: 'Courier New', monospace;
          font-size: 14px;
          overflow: auto;
        }
        
        textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 14px;
          resize: vertical;
        }
        
        .code-sample {
          background: #282c34;
          color: #abb2bf;
          padding: 16px;
          border-radius: 4px;
          overflow: auto;
          line-height: 1.5;
          font-family: 'Fira Code', 'Courier New', monospace;
        }
      `}</style>
    </div>
  );
};

// Export the component for use in MDX
export default AgentDemo;

// For MDX-based GitBook, ensure the component is registered
if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  // Check if we're in a browser environment
  if (!window._agentDemoRegistered) {
    window._agentDemoRegistered = true;
    
    // Register the component for custom element mounting
    window.AgentDemo = AgentDemo;
    
    // Find and replace <agent-demo> placeholders with the React component
    document.addEventListener('DOMContentLoaded', () => {
      document.querySelectorAll('agent-demo-placeholder').forEach(placeholder => {
        const props = placeholder.dataset.props ? JSON.parse(placeholder.dataset.props) : {};
        const container = document.createElement('div');
        placeholder.parentNode.replaceChild(container, placeholder);
        
        const root = createRoot(container);
        root.render(<AgentDemo {...props} />);
      });
    });
  }
}