# GitHub App Integration Configuration

This document provides clarity on the GitHub App integration setup for the event-driven architecture.

## Key Locations

- **Private key location**: `.github/app/private-key.pem`
- **Environment config**: `webhook-proxy/.env`
- **Webhook proxy server**: `webhook-proxy/server.js`
- **Setup script**: `scripts/setup-github-app.sh`

## Configuration Flow

1. The setup script (`setup-github-app.sh`) creates the GitHub App and:
   - Stores the private key in `.github/app/private-key.pem`
   - Creates `webhook-proxy/.env` with the correct configuration
   - Configures the webhook proxy to look for the key at `../.github/app/private-key.pem`

2. The webhook proxy server reads its configuration from `.env` and uses the private key to:
   - Generate JWT tokens for GitHub API authentication
   - Forward events from the client to GitHub repository dispatch API

## Security Notes

- Both the private key directory (`.github/app/`) and environment file (`webhook-proxy/.env`) are excluded from git via `.gitignore`
- The webhook proxy is configured to read the private key from `../.github/app/private-key.pem` (relative to the webhook-proxy directory)
- Always verify file permissions on the private key (should be 600: `-rw-------`)
- Never modify paths in `.env` to point outside the project directory
- Run `scripts/verify-config.sh` to verify your configuration is secure

## Connection with Integration Tests

The integration tests we've created simulate this flow by:
1. Mocking the JWT token generation (`/token` endpoint)
2. Mocking the event forwarding (`/events` endpoint)
3. Verifying that events are properly formatted and sent through the proxy
