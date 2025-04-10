# Flip Card Event Tracking System

A comprehensive event-driven system for tracking interactions with flip card components.

## Features

- **Universal Flip Card Component**: Accessible, responsive card with animation
- **Event Tracking System**: Tracks user interactions with cards
- **Event-Driven Architecture**: Uses GitHub as a serverless backend
- **Developer Tools**: Dashboard, simulator, and verification utilities

## Quick Start

```bash
# Clone the repository
git clone https://github.com/TheScottyB/flip-card-project.git
cd flip-card-project

# Install dependencies
npm install
cd webhook-proxy && npm install && cd ..

# Launch the complete environment
npm run launch

# Open the event dashboard
npm run dashboard

# Generate test events
npm run simulate
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

## Architecture Overview

```
┌──────────────────┐     ┌────────────────────┐     ┌───────────────────┐
│                  │     │                    │     │                   │
│  Universal Card  │────▶│   Webhook Proxy    │────▶│  GitHub Actions   │
│  Event Tracking  │     │   Server           │     │  Event Processing │
│                  │     │                    │     │                   │
└──────────────────┘     └────────────────────┘     └───────────────────┘
```

The system uses an event-driven architecture where:

1. Client-side JavaScript tracks card interactions
2. Events are sent to a webhook proxy server
3. The proxy authenticates and forwards events to GitHub
4. GitHub Actions workflows process the events
5. Processing results are used to optimize cards

## Developer Tools

### Event Dashboard

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
