# Event Tracking Quick Start Guide

This guide will help you set up and test the event-driven multi-agent architecture for Universal Flip Cards.

## Prerequisites

- GitHub account with repository permissions
- Node.js (v20 or later recommended)
- npm or yarn

## Setup Steps

### 1. Set up the GitHub App

```bash
# Make the setup script executable
chmod +x scripts/setup-github-app.sh

# Run the setup script
./scripts/setup-github-app.sh
```

Follow the prompts to:
- Create a GitHub App on GitHub's website
- Set required permissions
- Generate a private key
- Install the app on your repository
- Configure the webhook proxy

### 2. Start the Webhook Proxy Server

```bash
# Navigate to the webhook proxy directory
cd webhook-proxy

# Install dependencies
npm install

# Start the server
npm start
```

You should see:
```
Webhook proxy server running on port 3000
Allowed origins: [your configured origins]
```

### 3. Test with the Universal Demo Page

Open `universal-demo.html` in your browser:
- Find the "Event Tracking" section in the controls
- Click "Enable Event Tracking"
- Interact with the flip card
- Check the browser console for confirmation messages

### 4. Verify Workflow Execution

- Check your GitHub repository's Actions tab
- You should see the Data Processing Agent workflow running
- This will analyze the interaction data
- The workflow will trigger the Card Optimization Agent
- New optimized configurations will be generated

## Troubleshooting

- Check the webhook proxy server console for errors
- Verify your GitHub App permissions
- Ensure the private key is properly configured
- Check browser console for CORS or connection issues

## Architecture Overview

See `EVENT-DRIVEN-ARCHITECTURE.md` for a complete description of the system's design and components.

## Security Notes

- Protect your GitHub App credentials
- Never commit the `.github/app` directory or `webhook-proxy/.env` files (these are already in .gitignore)
- The private key is stored in `.github/app/private-key.pem` and referenced in the webhook proxy's `.env` file
- Use environment variables for sensitive information
- Rate limit API requests to prevent abuse