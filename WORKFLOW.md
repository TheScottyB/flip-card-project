# Event Tracking System: Complete Workflow

This document provides a comprehensive guide for working with the Flip Card Event Tracking System.

## Overview

The Flip Card Event Tracking System consists of:

1. **Client-Side Tracking**: JavaScript code embedded in flip cards that tracks user interactions
2. **Webhook Proxy**: Server that authenticates and forwards events to GitHub
3. **GitHub App**: Processes events and triggers workflows
4. **Developer Tools**: Utilities for testing, monitoring, and debugging

## Setup Process

### 1. Initial Configuration

```bash
# Clone the repository
git clone https://github.com/TheScottyB/flip-card-project.git
cd flip-card-project

# Install dependencies
npm install
cd webhook-proxy && npm install && cd ..

# Create GitHub App
# Follow the instructions in GITHUB-APP-SETUP.md
# This will guide you through creating a GitHub App and generating a private key

# Set up configuration
# Copy the sample env file and edit with your app credentials
cp webhook-proxy/.env.sample webhook-proxy/.env
# Edit webhook-proxy/.env with your GitHub App details

# Verify configuration
npm run verify
```

### 2. Launch the Environment

```bash
# Start the full environment (recommended for new users)
npm run launch

# Or start components individually:
# Start just the webhook proxy
npm run events:start

# Check system status
curl http://localhost:3000/health
```

### 3. Using Developer Tools

```bash
# Open the event tracking dashboard
npm run dashboard

# Run the event simulator
npm run simulate

# Run automated tests
npm run test:config    # Test configuration verification
npm run test:events    # Test event integration
```

## Development Workflow

### 1. Adding Event Tracking to a Card

```javascript
// Import the tracker
import CardEventTracker from './card-event-tracker.js';

// Initialize tracker with a card element
const card = document.getElementById('my-card');
const tracker = new CardEventTracker(card, {
  enableDataSending: true,
  trackFlips: true,
  trackHover: true
});

// Events will be tracked automatically
// Call tracker.destroy() when done to clean up
```

### 2. Testing Event Flow

1. Start the environment: `npm run launch`
2. Open the dashboard: `npm run dashboard`
3. Generate test events: `npm run simulate`
4. Monitor events in dashboard
5. Verify events are forwarded to GitHub

### 3. Configuring GitHub Workflows

Create a GitHub workflow file in `.github/workflows/process-events.yml`:

```yaml
name: Process Card Events

on:
  repository_dispatch:
    types: [card_interaction_event]

jobs:
  process_event:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Process event data
        run: |
          echo "Processing event: ${{ github.event.client_payload.sessionId }}"
          # Add your event processing logic here
```

## Troubleshooting

### Common Issues

1. **Webhook proxy won't start**
   - Check if port 3000 is already in use
   - Verify Node.js version is 20.x or higher
   - Check webhook-proxy/server.log for errors

2. **Events not being sent**
   - Check browser console for CORS errors
   - Verify `ALLOWED_ORIGINS` includes your page origin
   - Ensure `enableDataSending` is true or `window.enableCardTracking` is set

3. **GitHub integration not working**
   - Verify GitHub App credentials in webhook-proxy/.env
   - Check repository dispatch workflow configuration
   - Test connection with GitHub API

### Verification Tools

```bash
# Run the configuration verification script
npm run verify

# Test the event integration
npm run test:events

# Check server logs
cat webhook-proxy/server.log
```

## Security Notes

- The `.github/app` directory and webhook-proxy/.env file are excluded from git
- GitHub App private key must have 600 permissions (read/write for owner only)
- Never commit credentials to the repository
- For production, use proper secrets management

## Additional Resources

- [EVENT-DRIVEN-ARCHITECTURE.md](EVENT-DRIVEN-ARCHITECTURE.md): Design details
- [GITHUB-APP-SETUP.md](GITHUB-APP-SETUP.md): GitHub App creation guide
- [UNIVERSAL-CARD-README.md](UNIVERSAL-CARD-README.md): Card component docs
- [EVENT-TRACKING-QUICKSTART.md](EVENT-TRACKING-QUICKSTART.md): Quick start guide
- [tools/README.md](tools/README.md): Developer tools documentation
