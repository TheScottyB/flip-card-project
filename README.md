# Flip Card Event Tracking System

Interactive flip cards with built-in analytics and an event-driven architecture on GitHub.

## Why Use This System?

- **Accessible UI Components**: WCAG 2.1 AA compliant flip cards that work across all devices
- **Built-in Analytics**: Track user engagement without additional services
- **Serverless Architecture**: Uses GitHub as your backend - no AWS/Azure required
- **Easy Integration**: Drop-in JavaScript with minimal configuration

## Live Demos

- [Basic Flip Card](https://thescottyb.github.io/flip-card-project/index.html)
- [Mobile-First Demo](https://thescottyb.github.io/flip-card-project/mobile-demo.html)
- [Universal Card with Tracking](https://thescottyb.github.io/flip-card-project/universal-demo.html)

## Quick Start

```bash
# Option 1: Use prebuilt assets in your project
<script src="https://thescottyb.github.io/flip-card-project/dist/js/flip-card.min.js"></script>
<link rel="stylesheet" href="https://thescottyb.github.io/flip-card-project/dist/css/flip-card.min.css">

# Option 2: Clone and run locally
git clone https://github.com/TheScottyB/flip-card-project.git
cd flip-card-project
npm install && npm run dev
```

## Documentation

| Document | Description |
|----------|-------------|
| [WORKFLOW.md](WORKFLOW.md) | Complete workflow guide for the event tracking system |
| [EVENT-DRIVEN-ARCHITECTURE.md](EVENT-DRIVEN-ARCHITECTURE.md) | Architecture design and technical details |
| [GITHUB-APP-CONFIG.md](GITHUB-APP-CONFIG.md) | GitHub App configuration instructions |
| [EVENT-TRACKING-QUICKSTART.md](EVENT-TRACKING-QUICKSTART.md) | Quick start guide for event tracking |
| [UNIVERSAL-CARD-README.md](UNIVERSAL-CARD-README.md) | Documentation for the Universal Flip Card component |
| [VERIFICATION-CHECKLIST.md](VERIFICATION-CHECKLIST.md) | Pre-launch verification checklist |
| [tools/README.md](tools/README.md) | Developer tools documentation |

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run launch` | Launch the complete event tracking environment |
| `npm run dashboard` | Open the event tracking dashboard |
| `npm run simulate` | Run the event simulator tool |
| `npm run verify` | Verify the GitHub App configuration |
| `npm run events:start` | Start the webhook proxy server |
| `npm run events:stop` | Stop the webhook proxy server |
| `npm run test:config` | Run configuration verification tests |
| `npm run test:events` | Run event integration tests |

## How It Works

```
┌──────────────────┐     ┌────────────────────┐     ┌───────────────────┐
│                  │     │                    │     │                   │
│  Universal Card  │────▶│   Webhook Proxy    │────▶│  GitHub Actions   │
│  Event Tracking  │     │   Server           │     │  Event Processing │
│                  │     │                    │     │                   │
└──────────────────┘     └────────────────────┘     └───────────────────┘
```

**Simple Architecture, Powerful Results:**

1. **Track** - Users interact with your cards, interactions are captured automatically
2. **Process** - Data flows through a secure webhook to GitHub
3. **Analyze** - GitHub Actions workflows parse and analyze the data
4. **Optimize** - Get insights to improve your card components

**Benefits:**
- Zero infrastructure costs (uses GitHub's compute)
- Privacy-focused (optional anonymization)
- Works with any website or React application

## Implementation Examples

### Basic Card (HTML/CSS/JS)

```html
<div class="flip-card">
  <div class="flip-card-inner">
    <div class="flip-card-front">
      <h2>Front Content</h2>
      <button class="flip-trigger">View Details</button>
    </div>
    <div class="flip-card-back">
      <h2>Back Content</h2>
      <button class="flip-trigger">Back</button>
    </div>
  </div>
</div>
```

### React Component (TypeScript)

```tsx
import React from 'react';
import { FlipCard } from 'flip-card-project';

export const MyCard = () => (
  <FlipCard
    frontContent={<h2>Front Side</h2>}
    backContent={<h2>Back Side</h2>}
    trackEvents={true}
  />
);
```

## Developer Tools

A web-based dashboard for monitoring and managing the event tracking system.

```bash
npm run dashboard
```

### Event Simulator

An interactive CLI tool for generating test events without manual card interaction.

```bash
npm run simulate
```

### Configuration Verification

A script that verifies the GitHub App configuration is correct and secure.

```bash
npm run verify
```

## Testing

```bash
# Test configuration verification
npm run test:config

# Test event integration
npm run test:events

# Run all tests
npm test
```

## Security

- GitHub App credentials are stored securely and excluded from git
- Private key permissions are verified and fixed if needed
- Rate limiting and CORS protection are implemented

## Requirements

- Node.js 20.x or higher
- NPM 8.x or higher
- GitHub account with repository permissions

## License

ISC
