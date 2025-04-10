# Pre-Launch Verification Checklist

This document provides a step-by-step verification process to ensure all components of the event-driven architecture are correctly configured before going live.

## 1. GitHub App Configuration

- [x] Verify GitHub App exists with ID: `1210766`
- [x] Verify Installation ID is correct: `64257259`
- [x] Verify the app has the following permissions:
  - [x] Repository contents: Read & write
  - [x] Issues: Read & write
  - [x] Discussions: Read & write
  - [x] Actions: Read & write
- [x] Verify the app is subscribed to `repository_dispatch` events
- [x] Verify a private key has been generated and stored at `.github/app/private-key.pem`
- [x] Verify the app is properly installed on your repository

**Verification command:**
```bash
# Check if GitHub App is properly configured in _config.yml
grep -A 3 "github_app" _config.yml

# Verify private key exists
ls -la .github/app/private-key.pem
```

## 2. Webhook Proxy Server Configuration

- [x] Verify the `.env` file contains the correct GitHub App ID and Installation ID
- [x] Verify the private key path is correct in the `.env` file
- [x] Verify allowed origins include your development and production domains
- [x] Verify the rate limit settings are appropriate
- [x] Verify the repository owner and name are correct

**Verification commands:**
```bash
# Check environment configuration
grep -v "^#" webhook-proxy/.env | grep -v "^$"

# Verify the server dependencies are installed
cd webhook-proxy && npm list --depth=0
```

## 3. GitHub Actions Workflows

- [x] Verify the Data Processing Agent workflow file exists
- [x] Verify the Card Optimization Agent workflow file exists
- [x] Verify workflow triggers include `repository_dispatch` events
- [x] Verify workflows have appropriate repository permissions

**Verification commands:**
```bash
# Check workflow files
ls -la .github/workflows/

# Verify workflow triggers
grep -A 3 "repository_dispatch" .github/workflows/data-processing-agent.yml
grep -A 3 "repository_dispatch" .github/workflows/card-optimization-agent.yml
```

## 4. Client-Side Integration

- [x] Verify the Universal Card Demo includes the card-event-tracker.js script
- [x] Verify the event tracker is properly initialized
- [x] Verify the webhook endpoints are correctly configured
- [x] Verify the UI controls for enabling/disabling tracking work correctly

**Verification commands:**
```bash
# Check script inclusion
grep -n "card-event-tracker.js" universal-demo.html

# Check endpoint configuration
grep -n "tokenEndpoint\|eventsEndpoint" universal-demo.html
```

## 5. Local Test Suite

Run the following tests before deploying:

### Server Tests:

1. Start the webhook proxy:
   ```bash
   cd webhook-proxy && npm start
   ```

2. Test server health endpoint:
   ```bash
   # Navigate to test-server.html in browser and click "Test Health Endpoint"
   # Or use curl if available:
   # curl http://localhost:3000/health
   ```

3. Test token generation:
   ```bash
   # In test-server.html, click "Test Token Endpoint"
   ```

4. Test event submission:
   ```bash
   # In test-server.html, click "Test Event Endpoint"
   ```

### Client Tests:

1. Open universal-demo.html in browser
2. Check debug panel for device capability detection
3. Enable event tracking
4. Interact with the card (flip, hover, etc.)
5. Verify interactions appear in the debug panel

## 6. GitHub Integration Tests

- [x] Verify the GitHub repository exists and is accessible
- [x] Verify GitHub Actions is enabled for the repository
- [x] Verify GitHub Pages is correctly set up (if using for demonstration)
- [x] Test a manual workflow dispatch to ensure workflows function correctly

**Verification commands:**
```bash
# Check repository connection
git remote -v

# Check GitHub Actions status
gh workflow list
```

## 7. Security Verification

- [x] Verify `.github/app/` directory is in .gitignore
- [x] Verify webhook-proxy/.env is in .gitignore
- [x] Verify webhook-proxy/server.pid is in .gitignore
- [x] Verify CORS is properly configured to restrict origins
- [x] Verify rate limiting is enabled

**Verification command:**
```bash
# Check gitignore entries
grep -n "github/app\|.env\|server.pid" .gitignore
```

## Final Verification

Before launching, run a complete end-to-end test:

1. Start the webhook proxy server
2. Open the universal-demo.html page
3. Enable event tracking
4. Interact with the card
5. Verify events are received by the server
6. Check GitHub Actions to see if workflows were triggered

If all tests pass, the system is ready for production deployment!