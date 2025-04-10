# Event Tracking Environment Setup

This document provides instructions for setting up and running the event tracking environment for the Flip Card project.

## Quick Start

```bash
# Launch the complete environment with verification and browser demo
npm run launch

# Start just the webhook proxy server
npm run events:start

# Stop the webhook proxy server
npm run events:stop
```

## Components

The event tracking environment consists of:

1. **GitHub App Configuration** - Credentials in `.github/app/`
2. **Webhook Proxy Server** - Node.js server in `webhook-proxy/`
3. **Event Tracking Client** - JavaScript in `src/js/card-event-tracker.js`
4. **Demo Page** - `universal-demo.html`

## Manual Setup Steps

If you prefer to set up each component manually:

### 1. Verify Configuration

Ensure your GitHub App is properly configured:

```bash
npm run verify
```

This checks for:
- Private key existence and permissions
- GitHub App ID and Installation ID
- Webhook proxy configuration

### 2. Install Dependencies

```bash
cd webhook-proxy
npm install
cd ..
```

### 3. Start Webhook Proxy

```bash
cd webhook-proxy
npm start
cd ..
```

### 4. Test Environment

- Open `universal-demo.html` in your browser
- Click "Enable Event Tracking" in the demo controls
- Interact with the cards to generate events
- Check `webhook-proxy/server.log` for event logging

## Testing the Integration

We have automated tests for the environment:

```bash
# Test the configuration verification script
npm run test:config

# Test the event tracking integration (mock mode)
npm run test:events
```

These tests verify that all components work together correctly without requiring actual credentials or network connectivity.

## Troubleshooting

### Common Issues:

1. **Webhook proxy won't start**
   - Check `webhook-proxy/server.log` for errors
   - Ensure the port specified in `.env` (default 3000) is available
   - Verify Node.js version is 20+

2. **Events not being sent**
   - Check browser console for CORS errors
   - Verify `ALLOWED_ORIGINS` in `.env` includes your demo page origin
   - Make sure `enableDataSending` is true or `window.enableCardTracking` is set

3. **GitHub integration not working**
   - Check GitHub App permissions and installation
   - Verify your GitHub workflow is configured to handle repository_dispatch events

### Logs:

- Webhook proxy server: `webhook-proxy/server.log`
- Browser console: Open Dev Tools in your browser to see client-side logs

## Cleanup:

When finished, remember to stop the webhook proxy server:

```bash
npm run events:stop
```

Or you can use the following:

```bash
kill $(cat webhook-proxy/server.pid)
```

## Security Notes:

- Never commit the private key or .env file
- The GitHub App private key should have 600 permissions
- For production, use proper secrets management for credentials
