# CLAUDE.md - Flip Card Project Guide

## Build & Test Commands
- Run development server: `npm run dev`
- Build for development: `npm run build`
- Build for production: `npm run build:prod`
- Run all tests: `npm test`
- Run a single test: `npx jest src/tests/filename.test.js`
- Run accessibility tests: `npm run test:a11y`
- Generate test report: `npm run test:report`
- Minify CSS/JS: `npm run minify`
- Lint/format: Currently no explicit lint commands found

## Code Style Guidelines
- **React Components**: Use functional components with TypeScript (.tsx)
- **Imports**: Import React explicitly (`import React from 'react'`)
- **Exports**: Use named exports for utility functions, default exports for components
- **Naming**:
  - Components: PascalCase (ContactCard)
  - Functions/variables: camelCase (getCardData)
  - Files: kebab-case (contact-card.tsx)
- **JSDoc**: Include JSDoc comments for all functions, components, and their props:
  ```javascript
  /**
   * @param {HTMLElement} card - The flip card element
   * @param {boolean} shouldFlip - Whether the card should be flipped
   */
  ```
- **Accessibility**: Ensure WCAG 2.1 AA compliance with proper ARIA attributes:
  - Use `aria-pressed`, `aria-expanded` and `aria-controls` for flip triggers
  - Include `aria-live` regions for state changes
  - Support keyboard interactions (Tab, Enter, Space, Escape)
  - Respect prefers-reduced-motion setting
- **Error Handling**: Use try/catch blocks with meaningful error messages
- **Testing**: Include unit tests for components and accessibility tests

Follow these guidelines when modifying or creating new code for consistency.