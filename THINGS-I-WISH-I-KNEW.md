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
## App Store Review Lessons (Mortgage FlipCard Native App)

The mortgage calculator from this project graduated into a native iOS app — **Mortgage FlipCard** (Expo/React Native, `workspace/MortgageCalculatorNative`). Its August 2026 App Review rejection (1.1.0 build 6) and successful resubmission (build 8) produced lessons that apply to any app derived from this project:

1. **Third-party AI features need in-app consent, not just disclosure** (Guidelines 5.1.1(i)/5.1.2(i)):
   - Even when the user supplies their own API key and data goes directly device→provider with no middleman server, Apple requires the app itself to (a) say what data will be sent, (b) name the recipient, and (c) get explicit permission *before* the first request.
   - Explaining it in App Review notes or only in the privacy policy is not sufficient — the consent must be in the product.
   - Provide a decline path (nothing sent) and a way to revoke consent later (e.g., a Settings reset control).
   - The privacy policy must cover four points: what data is collected, how, all uses, and confirmation the third party provides "the same or equal protection."

2. **Screenshots must show the current app in use** (Guideline 2.3.3):
   - Marketing mockups and stale captures get rejected; capture from the actual build for every display size.
   - Splash and onboarding screens "are generally not considered to show the app in use" — lead with the real UI.
   - Visually inspect every capture before uploading: dev-mode redboxes and accidentally opened modals hide in automated capture runs.

3. **Resubmission has a hidden web-only step**: after attaching a fixed build via the App Store Connect API, `PATCH reviewSubmissions {submitted:true}` returns 409 "not ready" indefinitely. You must click **"Update Review"** on the web version page first — it commits the edited version item to "Ready for Review," which unlocks resubmission.

4. **Unusual IAP price points pause review** (Guideline 3): a premium lifetime tier (e.g., $599.99) triggers a Resolution Center question asking you to confirm the price is intended. Reply to unblock — no rebuild needed.

5. **Rejection reasons live only in the web Resolution Center.** The rejection emails and the API both say just "there's an issue" — the guideline citations and reviewer message require a signed-in App Store Connect web session.
