# Source Code Organization

## Structure

- `/core/` - Vanilla JS implementations (flip-card.js, universal-flip-card.js, card-event-tracker.js)
- `/react/` - React components (TypeScript)
- `/styles/` - CSS stylesheets
- `/templates/` - HTML examples and templates
- `/tests/` - Unit, integration, and a11y tests

## Implementation Notes

- Core: Vanilla JS for compatibility
- React: TypeScript with React 19
- Build process generates `/dist` output via PostCSS
- Follows WCAG 2.1 AA accessibility standards