// MDX Integration Setup for Agent SDK Documentation
import React from 'react';
import { MDXProvider } from '@mdx-js/react';
import AgentDemo from './components/AgentDemo';

// Custom components to enhance MDX documents
const components = {
  // Map the <AgentDemo> tag in MDX to our React component
  AgentDemo,
  
  // Enhanced code blocks with syntax highlighting
  pre: (props) => <div className="code-block-wrapper" {...props} />,
  code: (props) => {
    const { children, className = '' } = props;
    const language = className.replace(/language-/, '');
    
    return (
      <pre className={`language-${language}`}>
        <code className={className}>{children}</code>
      </pre>
    );
  },
  
  // Other custom components can be added here
};

// Export the MDXProvider with our custom components
export function withMDXComponents(Component) {
  return (props) => (
    <MDXProvider components={components}>
      <Component {...props} />
    </MDXProvider>
  );
}

// For GitBook integration
if (typeof window !== 'undefined') {
  // Register global components for GitBook
  window.AgentSDKComponents = {
    AgentDemo
  };
  
  // Setup script to insert components when the page loads
  document.addEventListener('DOMContentLoaded', () => {
    console.log('Agent SDK Documentation Setup initialized');
  });
}

// Webpack/bundler entry point
export { AgentDemo };

// Default export for Next.js or similar frameworks
export default withMDXComponents;