# CLAUDE.md - Flip Card Project Guide

## Build & Test Commands
- Dev server: `npm run dev` (http-server on port 8080)
- Build dev: `npm run build` 
- Build prod: `npm run build:prod`
- Build universal: `npm run build:universal`
- Build all: `npm run build:all` (with JS minification)
- Test all: `npm test`
- Test a11y: `npm run test:a11y`
- Test calculator: `npm run test:calculator`
- Test integration: `npm run test:integration`
- Test accessibility: `npm run test:accessibility`
- Test watch: `npm run test:watch`
- Test coverage: `npm run test:coverage`
- Test report: `npm run test:report`
- Test config: `npm run test:config`
- Test events: `npm run test:events`
- Webhook server: `npm run events:start`
- Event dashboard: `npm run dashboard`
- Event simulator: `npm run simulate`

## Structure
- `/src/core/` - Vanilla JS implementations
- `/src/react/` - React components (TypeScript)
- `/src/styles/` - CSS stylesheets
- `/src/templates/` - HTML examples
- `/src/tests/` - Test files
- `/docs/` - Documentation
- `/tools/` - Development tools
- `/scripts/` - Utility scripts
- `/webhook-proxy/` - Event tracking server
- `/react-components/` - React component demos
- `/test/` - Test configurations and scripts
- `/coverage/` - Test coverage reports
- `/dist/` - Built assets

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
- **Testing**: Functional, integration, and accessibility tests