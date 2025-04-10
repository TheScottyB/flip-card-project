# Source Code Organization

This directory contains the source code for the Flip Card project. The structure is organized as follows:

## Directory Structure

- `/core/` - Core vanilla JavaScript implementations
  - `flip-card.js` - Basic flip card implementation
  - `universal-flip-card.js` - Enhanced universal flip card with advanced features
  - `card-event-tracker.js` - Event tracking system for cards

- `/react/` - React implementations
  - `/components/` - React components (TypeScript)
  - `/hooks/` - Custom React hooks
  - `/types/` - TypeScript type definitions

- `/styles/` - CSS stylesheets
  - `flip-card.css` - Basic flip card styles
  - `universal-flip-card.css` - Universal card styles
  - `mobile-flip-card.css` - Mobile-specific styles

- `/templates/` - HTML templates and examples
  - Various card component examples and templates

- `/tests/` - Test files
  - Unit tests, integration tests, and accessibility tests

## Implementation Notes

- Core components use vanilla JavaScript for maximum compatibility
- React components use TypeScript with React 19
- All components follow the accessibility guidelines in CLAUDE.md
- The event-driven architecture uses the card-event-tracker.js for tracking and analytics

## Build Process

The build process compiles and optimizes these source files into the `/dist` directory using PostCSS and other tools as configured in package.json.