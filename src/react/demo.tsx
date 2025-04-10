import React from 'react';
import ReactDOM from 'react-dom/client';
import { FlipCard, UniversalFlipCard } from './index';

/**
 * Example implementation of the flip card React components
 */
const FlipCardDemo = () => {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">Flip Card React Components</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Standard flip card */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Standard Flip Card</h2>
          <p className="mb-4 text-gray-600">
            Functional component implementation with hook-based state management.
          </p>
          
          <FlipCard
            frontTriggerText="View Details"
            backTriggerText="Go Back"
            frontContent={
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4">Product Overview</h3>
                <p className="mb-4">
                  A high-quality product with amazing features. This product will
                  revolutionize the way you work and play.
                </p>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <span className="font-bold text-blue-600">$199.99</span>
                  <span className="ml-2 text-sm text-gray-500">Free shipping</span>
                </div>
              </div>
            }
            backContent={
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4">Technical Specifications</h3>
                <ul className="list-disc pl-5 mb-4">
                  <li>High-resolution display</li>
                  <li>64GB storage capacity</li>
                  <li>12-hour battery life</li>
                  <li>Waterproof construction</li>
                  <li>Two-year warranty</li>
                </ul>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Compatible with all major operating systems
                  </p>
                </div>
              </div>
            }
            onFlip={(isFlipped) => console.log('Standard card flipped:', isFlipped)}
          />
        </div>
        
        {/* Universal flip card */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Universal Flip Card</h2>
          <p className="mb-4 text-gray-600">
            Class-based component with advanced features like voice control and device adaptation.
          </p>
          
          <UniversalFlipCard
            frontTriggerText="Show Me More"
            backTriggerText="Return to Card"
            enableVoiceControl={false}
            frontContent={
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4">Team Member Profile</h3>
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-blue-300 rounded-full mr-4"></div>
                  <div>
                    <p className="font-bold text-lg">Jane Smith</p>
                    <p className="text-gray-600">Lead Developer</p>
                  </div>
                </div>
                <p className="mb-4">
                  Jane has been with the company for 5 years and specializes in frontend development
                  and UI/UX design.
                </p>
              </div>
            }
            backContent={
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4">Skills & Experience</h3>
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-700">Technical Skills</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">React</span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">TypeScript</span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">CSS/SASS</span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">Node.js</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700">Contact</h4>
                  <p className="text-blue-600 mt-1">jane.smith@example.com</p>
                  <p>(555) 123-4567</p>
                </div>
              </div>
            }
            onFlip={(isFlipped) => console.log('Universal card flipped:', isFlipped)}
          />
        </div>
      </div>
      
      <div className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Usage Examples</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-2">Standard Flip Card</h3>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
{`<FlipCard
  frontTriggerText="View Details"
  backTriggerText="Go Back"
  frontContent={<div>Front content...</div>}
  backContent={<div>Back content...</div>}
  onFlip={(isFlipped) => console.log(isFlipped)}
/>`}
            </pre>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Universal Flip Card</h3>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
{`<UniversalFlipCard
  frontTriggerText="Show Me More"
  backTriggerText="Return to Card"
  enableVoiceControl={true}
  voiceCommands={{
    flip: ['flip', 'turn', 'rotate'],
    flipBack: ['back', 'return', 'front']
  }}
  frontContent={<div>Front content...</div>}
  backContent={<div>Back content...</div>}
/>`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

// Render the demo
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<FlipCardDemo />);
}