# GitHub App Integration Configuration

This document provides clarity on the GitHub App integration setup for the event-driven architecture.

## Key Locations

- **Private key location**: `.github/app/private-key.pem`
- **Environment config**: `webhook-proxy/.env`
- **Webhook proxy server**: `webhook-proxy/server.js`
- **Setup script**: `scripts/setup-github-app.sh`
- **Verification script**: `scripts/verify-config.sh`

## Configuration Flow

1. The setup script (`setup-github-app.sh`) creates the GitHub App and:
   - Stores the private key in `.github/app/private-key.pem`
   - Creates `webhook-proxy/.env` with the correct configuration
   - Configures the webhook proxy to look for the key at `../.github/app/private-key.pem`

2. The webhook proxy server reads its configuration from `.env` and uses the private key to:
   - Generate JWT tokens for GitHub API authentication
   - Forward events from the client to GitHub repository dispatch API

![Event Flow](https://mermaid.ink/img/pako:eNp1UstOwzAQ_BVrz6ikbdLSXCpFQkKIExxA3HxZJ6lE4ijrFKVV_52NkwJCwJcdzc7szO6xUNohC0WjK2skUKecbJUPgqKqoQHN8KQBRVp9UNXr1B9GFjFkzQTB35yvKIMOw0Dqk-fBNUrRQr0YnbztVZnRuXUODZw5w9_FYgHpzXLrZ8kFgTHpJXGe51kmMqKdQs1Bi7xI9iRFTRLJWP-uZYgZtjwEcE4Ppp-s9YZ2g-qf7PoZ1jJYUCYFmURUWZzpv5dkRQI6B80_09__zxKHbzbnidBagb4qZxFsSoyjJ2CZVp6QyuKcpxm_0lVCNLzznDRXhNbUP3Kx1WhjPgKG42F_rO_4tUJvA6ZJLLztM0s3DbF1a8k4zcZ3J7KoI-RxqLZPYokZdqPrsMOt4_cPiIaeOQ)

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

## Troubleshooting Guide

### Common Issues and Solutions

#### 1. Authentication Failures

**Symptoms:**
- Error messages about invalid JWT token
- 401 Unauthorized responses from GitHub API

**Possible causes:**
- Private key is invalid or corrupted
- App ID or Installation ID is incorrect
- JWT token has expired

**Solutions:**
- Verify the private key was downloaded correctly and has proper permissions (600)
- Confirm App ID and Installation ID in webhook-proxy/.env match the GitHub App
- Check if the GitHub App was uninstalled or reinstalled (new Installation ID)

#### 2. Network Connectivity Issues

**Symptoms:**
- Timeout errors when trying to send events
- Connection refused errors

**Possible causes:**
- Webhook proxy server is not running
- Firewall blocking connections
- Incorrect port configuration

**Solutions:**
- Start the webhook proxy server: `cd webhook-proxy && npm start`
- Check firewall settings to allow connections on port 3000
- Verify the port in webhook-proxy/.env matches the port in client configuration

#### 3. CORS Errors

**Symptoms:**
- Browser console errors about Cross-Origin Resource Sharing
- Events not being sent from the client

**Possible causes:**
- ALLOWED_ORIGINS in webhook-proxy/.env doesn't include the demo page origin
- Webhook proxy CORS configuration issues

**Solutions:**
- Add your demo page origin to ALLOWED_ORIGINS in webhook-proxy/.env
- Restart the webhook proxy server after making changes

#### 4. Event Processing Failures

**Symptoms:**
- Events are sent but no GitHub Actions workflows trigger
- GitHub API returns errors

**Possible causes:**
- Repository dispatch event is misconfigured
- Workflow files are missing or have syntax errors
- GitHub App lacks necessary permissions

**Solutions:**
- Verify workflow files exist in .github/workflows/ directory
- Check that workflows are triggered by 'repository_dispatch' events
- Verify the GitHub App has 'actions: write' permission

### Debugging Tools

1. **Server Logs**: Check webhook-proxy/server.log for detailed error messages
2. **Browser DevTools**: Check the Network tab to see requests and responses
3. **GitHub API Status**: https://www.githubstatus.com/ to check if GitHub API is operational
4. **Webhook Tester**: Use a tool like Webhook.site to test GitHub webhook delivery

If you encounter persistent issues, consider running the verification script with the GitHub API connectivity test:
```bash
./scripts/verify-config.sh
```
