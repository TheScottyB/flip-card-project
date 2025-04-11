# Things I Wish I Knew Before I Started

## High-Level Design

The Flip Card Project implements an event-driven architecture with these key components:

1. **Card Components**: 
   - Core module provides interactive, accessible flip card UI components
   - Support for vanilla JS, HTML, and React (TypeScript) integrations
   - Fully accessible, with keyboard navigation, ARIA roles, and screen reader support

2. **Event Tracking System**:
   - Client-side module captures user interactions with cards
   - Tracks flips, hovers, timing data, and device capabilities
   - Supports data anonymization and respects user privacy

3. **Webhook Proxy**:
   - Node.js server handles authentication and GitHub communication
   - Uses GitHub App credentials to create JWT tokens
   - Provides security layer between client and GitHub

4. **GitHub-based Backend**:
   - Repository dispatch events trigger GitHub Actions workflows
   - Event processing pipeline analyzes interaction data
   - Card optimization system generates enhancement recommendations

## Important Architecture Decisions

1. **Why GitHub as backend?**
   - Serverless architecture eliminates infrastructure costs
   - GitHub Actions provide compute capability without dedicated servers
   - Repository-based storage reduces database requirements

2. **Why separate core from React?**
   - Core components in vanilla JS maximize compatibility
   - React layer provides convenience for React-based applications
   - Separation allows incremental adoption

3. **Why event-driven architecture?**
   - Decouples UI components from analytics processing
   - Enables asynchronous, batch processing of events
   - Allows scaling analytics without affecting UI performance

## Key Technical Concepts

1. **Universal Flip Card**:
   - Implements BEM-like structure (card, card-inner, card-front, card-back)
   - Uses CSS 3D transforms for flip animation
   - Maintains WCAG 2.1 AA compliance across all interactions

2. **Event Tracking**:
   - Session-based tracking with unique session IDs
   - Device capability detection for segmentation
   - Batched event transmission to reduce network overhead

3. **GitHub Integration**:
   - GitHub App provides authenticated API access
   - Repository dispatch events trigger workflows
   - GitHub Actions workflows process events and generate insights

## Gotchas and Important Notes

1. **Testing**:
   - Jest integration tests need longer timeouts due to async operations
   - Use specific test flags for targeting test types (a11y, unit, integration)
   - Integration tests with webhook proxy can be tricky - use the simulator

2. **GitHub App Setup**:
   - Private key must be stored securely
   - App requires specific permissions (contents, issues, actions)
   - Installation ID is critical for API operations

3. **Developer Experience**:
   - CLAUDE.md contains code style and project standards
   - src/README.md explains the directory structure
   - Always run tests before committing changes

4. **File Organization**:
   - Core JS implementations in /src/core/
   - React components in /src/react/
   - HTML templates in /src/templates/
   - CSS styles in /src/styles/
   - Tests in /src/tests/

# Known Issues and Observations

## Animation Stuttering in Flip Cards
- **Issue**: Some flip card animations show stuttering/jank in certain browsers
- **Observed Behavior**: 
  - Inconsistent animation smoothness during card flips
  - More noticeable with complex background animations
  - Not present in all browsers/devices
- **Potential Causes**:
  - GPU acceleration issues with 3D transforms
  - Complex background gradients + animations
  - Multiple transform properties competing
- **Investigation Needed**:
  - Browser-specific rendering differences
  - Performance impact of concurrent animations
  - Hardware acceleration triggers
- **Priority**: Medium
- **Next Steps**:
  - Profile performance in different browsers
  - Test with simplified animations
  - Consider conditional feature detection
  - Explore CSS containment strategies