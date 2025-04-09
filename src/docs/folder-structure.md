# Flip Card Project - Folder Structure

## Overview
This document describes the organized folder structure for the Flip Card Project.

```
flip-card-project/
├── index.html                # Main project page and documentation
├── multi-card.html           # Multiple card gallery showcase
├── CLAUDE.md                 # Guidelines for agentic coding assistants
│
├── src/                      # Source code files
│   ├── components/           # Reusable components
│   │   ├── contact-card.html # Standalone contact card implementation
│   │   ├── multi-card.html   # Gallery of various card types
│   │   └── react-card.tsx    # React implementation of flip card
│   │
│   ├── styles/               # CSS files
│   │   └── flip-card.css     # Core styles for flip card functionality
│   │
│   ├── js/                   # JavaScript files
│   │   └── flip-card.js      # Core JS functionality for flip cards
│   │
│   ├── images/               # Image assets
│   │   ├── avatars/          # Profile photos and avatar images
│   │   ├── logos/            # Company logos and branding
│   │   └── content/          # Content images for cards
│   │
│   ├── docs/                 # Documentation
│   │   ├── folder-structure.md  # This file
│   │   └── accessibility.md     # Accessibility guidelines
│   │
│   └── tests/                # Test files
│       └── accessibility.test.js # A11y test suite
│
└── dist/                     # Built/minified files for production (to be added)
    ├── css/
    ├── js/
    └── assets/
```

## Key Files and Directories

### Root Files
- `index.html` - Main landing page and project documentation
- `multi-card.html` - Gallery showcase of multiple card styles
- `CLAUDE.md` - Guidelines for agentic coding assistants

### Source Code (`src/`)
- `components/` - Contains all reusable components
  - HTML implementations
  - React implementations
- `styles/` - CSS files and stylesheets
- `js/` - JavaScript functionality
- `images/` - Organized image resources
- `docs/` - Project documentation
- `tests/` - Testing files

### Production Build (`dist/`)
Future implementation will include a build process that outputs optimized files to this directory.

## Naming Conventions
- Files use kebab-case (e.g., `flip-card.js`, `contact-card.html`)
- Component names use PascalCase in React code
- CSS classes use kebab-case
- JavaScript functions use camelCase