# CLAUDE.md - Flip Card Project Guide

## Build & Test Commands
- Start development server: `npm run dev` (builds + starts http-server on port 8080)
- Build for development: `npm run build` (postcss processing only)
- Build for production: `npm run build:prod` (with optimization)
- Build everything: `npm run build:all` (includes JS minification)
- Run all tests: `npm test`
- Run specific test: `npx jest src/tests/filename.test.js`
- Run specific test with timeout: `npx jest src/tests/filename.test.js --testTimeout=60000`
- Run a11y tests: `npm run test:a11y`
- Generate test report: `npm run test:report`
- Start webhook proxy: `cd webhook-proxy && npm start`

## Code Style Guidelines
- **Architecture**: Follow event-driven architecture patterns for tracking
- **Implementation Approach**:
  - Core components use vanilla JavaScript (.js) for maximum compatibility
  - React-specific components use TypeScript (.tsx)
  - Use React 19 for all React components (see package.json dependencies)
- **HTML Structure**: Follow BEM-like structure for card components (card, card-inner, card-front, card-back)
- **Imports/Exports**: 
  - For JS: Use ES modules with named exports for utilities
  - For React: Import React explicitly; use named exports for utilities, default for components
- **Naming**:
  - Components/Classes: PascalCase (UniversalFlipCard)
  - Functions/variables: camelCase (recordInteraction)
  - Files: kebab-case (card-event-tracker.js)
  - CSS classes: card-based namespacing (flip-card-front, universal-card-inner)
- **Documentation**: Use JSDoc for all functions, classes and parameters
- **Accessibility**: Ensure WCAG 2.1 AA compliance with:
  - Proper ARIA roles, states (aria-pressed, aria-expanded, aria-controls)
  - Focus management and keyboard navigation (Tab, Enter, Space, Escape)
  - Screen reader announcements via aria-live regions
  - Support for reduced motion preference
- **Error Handling**: Use try/catch with meaningful error messages, avoid uncaught exceptions
- **Testing**: Write tests for all components, test both functionality and accessibility

Follow these guidelines when modifying code to maintain consistency and quality.