import React from 'react';
import { MDXProvider } from '@mdx-js/react';
import AgentDemo from '../components/AgentDemo';

// Custom components for MDX
const components = {
  AgentDemo
};

// Main App component with MDX provider
export default function MyApp({ Component, pageProps }) {
  return (
    <MDXProvider components={components}>
      <div className="docs-container">
        <div className="sidebar">
          <div className="logo">Agent SDK</div>
          <nav>
            <a href="/">Home</a>
            <a href="/overview">Overview</a>
            <a href="/examples/openai-implementation">OpenAI Example</a>
            <a href="/examples/other-implementations">Other Implementations</a>
          </nav>
        </div>
        <main>
          <Component {...pageProps} />
        </main>
      </div>
      <style jsx global>{`
        :root {
          --primary-color: #0066cc;
          --secondary-color: #f5f5f5;
          --text-color: #333;
          --sidebar-width: 250px;
        }
        
        * {
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          margin: 0;
          padding: 0;
          color: var(--text-color);
          line-height: 1.6;
        }
        
        .docs-container {
          display: flex;
          min-height: 100vh;
        }
        
        .sidebar {
          width: var(--sidebar-width);
          background: var(--secondary-color);
          padding: 2rem 1rem;
          position: fixed;
          top: 0;
          bottom: 0;
          overflow-y: auto;
          border-right: 1px solid #e0e0e0;
        }
        
        .logo {
          font-size: 1.5rem;
          font-weight: bold;
          color: var(--primary-color);
          margin-bottom: 2rem;
        }
        
        nav {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        nav a {
          padding: 0.5rem;
          text-decoration: none;
          color: var(--text-color);
          border-radius: 4px;
        }
        
        nav a:hover {
          background: rgba(0, 0, 0, 0.05);
        }
        
        main {
          flex: 1;
          padding: 2rem;
          margin-left: var(--sidebar-width);
          max-width: 900px;
        }
        
        h1 {
          font-size: 2.5rem;
          margin-top: 0;
          color: var(--primary-color);
        }
        
        h2 {
          font-size: 1.8rem;
          margin-top: 2rem;
          border-bottom: 1px solid #eee;
          padding-bottom: 0.5rem;
        }
        
        h3 {
          font-size: 1.4rem;
          margin-top: 1.5rem;
        }
        
        pre {
          background: #f4f4f4;
          padding: 1rem;
          border-radius: 4px;
          overflow-x: auto;
        }
        
        code {
          font-family: 'Fira Code', 'Courier New', monospace;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 2rem 0;
        }
        
        th, td {
          padding: 0.5rem;
          border: 1px solid #eee;
          text-align: left;
        }
        
        th {
          background: var(--secondary-color);
        }
        
        blockquote {
          margin: 2rem 0;
          padding: 0.5rem 1rem;
          border-left: 3px solid var(--primary-color);
          background: var(--secondary-color);
        }
        
        .agent-demo {
          margin: 2rem 0;
        }
      `}</style>
    </MDXProvider>
  );
}