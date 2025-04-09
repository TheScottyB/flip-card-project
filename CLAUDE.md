# CLAUDE.md - Flip Card Project Guide

## Build & Test Commands
- Run all tests: `npm test`
- Run accessibility tests: `npm run test:a11y`
- Run a single test: `npx jest tests/path/to/test.js`
- Generate test report: `npm run test:report`
- CI test with coverage: `npm run test:ci`

## Code Style Guidelines
- **React Components**: Use functional components with TypeScript (.tsx)
- **Imports**: Import React explicitly (`import React from 'react'`)
- **Exports**: Use named exports for utility functions, default exports for components
- **Naming**:
  - Components: PascalCase (ContactCard)
  - Functions/variables: camelCase (getCardData)
  - Files: kebab-case (contact-card.tsx)
- **CSS**: Follow utility-first approach
- **Accessibility**: Ensure WCAG compliance with proper ARIA attributes
- **Error Handling**: Use try/catch blocks with meaningful error messages
- **Comments**: Include JSDoc style comments for component props and functions

Follow these guidelines when modifying or creating new code for consistency.