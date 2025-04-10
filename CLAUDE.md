# CLAUDE.md - Flip Card Project Guide

## Build & Test Commands
- Dev server: `npm run dev` (http-server on port 8080)
- Build dev: `npm run build` 
- Build prod: `npm run build:prod`
- Build all: `npm run build:all` (with JS minification)
- Test all: `npm test`
- Test single: `npx jest src/tests/filename.test.js`
- Test a11y: `npm run test:a11y`
- Test report: `npm run test:report`
- Webhook server: `cd webhook-proxy && npm start`

## Structure
- `/src/core/` - Vanilla JS implementations
- `/src/react/` - React components (TypeScript)
- `/src/styles/` - CSS stylesheets
- `/src/templates/` - HTML examples
- `/src/tests/` - Test files

## Code Style
- **Architecture**: Event-driven for tracking
- **Implementation**: Core in vanilla JS, React components in TypeScript (React 19)
- **HTML**: BEM-like structure (card, card-inner, card-front, card-back)
- **Naming**:
  - Components/Classes: PascalCase
  - Functions/variables: camelCase
  - Files: kebab-case
  - CSS classes: card-based namespacing
- **A11y**: WCAG 2.1 AA with ARIA, keyboard support, screen readers
- **Error Handling**: Use try/catch with meaningful messages
- **Testing**: Functional and accessibility tests