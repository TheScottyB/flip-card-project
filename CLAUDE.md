# CLAUDE.md - Flip Card Project Guide

## Build & Test Commands
- Run all tests: `npm test`
- Run accessibility tests: `npm run test:a11y`
- Run a single test: `npx jest src/tests/path/to/test.js`
- Generate test report: `npm run test:report`
- CI test with coverage: `npm run test:ci`
- Build for development: `npm run build`
- Build for production: `npm run build:prod`
- Start development server: `npm run dev`

## Code Style Guidelines
- **React Components**: Use functional components with TypeScript (.tsx)
- **Imports**: Import React explicitly (`import React from 'react'`)
- **Exports**: Use named exports for utility functions, default exports for components
- **Naming**:
  - Components: PascalCase (ContactCard)
  - Functions/variables: camelCase (getCardData)
  - Files: kebab-case (contact-card.tsx)
- **CSS**: Follow utility-first approach with Tailwind classes
- **Accessibility**: Ensure WCAG 2.1 AA compliance with proper ARIA attributes
- **Error Handling**: Use try/catch blocks with meaningful error messages
- **Testing**: Include unit tests for components and accessibility tests
- **Comments**: Include JSDoc style comments for component props and functions

Follow these guidelines when modifying or creating new code for consistency.