# GitHub App Setup Guide

This document guides you through the process of creating and configuring a GitHub App for the event-driven architecture.

## Creating a GitHub App

1. Navigate to your GitHub account settings
2. Go to Developer settings > GitHub Apps
3. Click "New GitHub App"
4. Fill in the form:
   - GitHub App name: "Flip Card Agent" (or your preferred name)
   - Description: "Event-driven, multi-agent system for Universal Flip Card components"
   - Homepage URL: Your repository URL
   - Webhook URL: http://localhost:3000/webhook (for development)
   - Webhook secret: Generate a secure random string
   - Permissions:
     - Repository contents: Read & write
     - Issues: Read & write
     - Discussions: Read & write
     - Actions: Read & write
   - Subscribe to events: repository_dispatch
   - Where can this GitHub App be installed?: Only on this account
5. Click "Create GitHub App"

## Generating a Private Key

1. On your app's page, scroll down to "Private keys"
2. Click "Generate a private key"
3. Save the downloaded .pem file

## Installing the App

1. Click "Install App" in the sidebar
2. Choose the repository where you want to install the app
3. Click "Install"

## Configuring the Webhook Proxy

1. Create the `.github/app` directory:
   ```bash
   mkdir -p .github/app
   ```
2. Copy the private key to the directory:
   ```bash
   cp /path/to/downloaded/private-key.pem .github/app/
   ```
3. Set proper permissions:
   ```bash
   chmod 600 .github/app/private-key.pem
   ```
4. Create the webhook proxy .env file:
   ```bash
   cp webhook-proxy/.env.sample webhook-proxy/.env
   ```
5. Edit the .env file with your GitHub App details:
   - GITHUB_APP_ID: Your app ID (from the app's settings page)
   - GITHUB_APP_INSTALLATION_ID: Your installation ID (from the URL when you installed the app)
   - GITHUB_OWNER: Your GitHub username
   - GITHUB_REPO: Your repository name

## Using the Setup Script

Alternatively, you can use the provided setup script:

```bash
./scripts/setup-github-app.sh
```

The script will guide you through the manual steps and set up the configuration files automatically.

## Verifying the Setup

After configuration, run the verification script:

```bash
npm run verify
```

This will check that all components are properly configured.

## Running the Webhook Proxy

Start the webhook proxy server:

```bash
npm run events:start
```

or

```bash
cd webhook-proxy && npm start
```

You should see output confirming the server is running on port 3000.

## Testing the Integration

1. Start the webhook proxy server
2. Open the demo page
3. Enable event tracking
4. Interact with cards
5. Check the webhook proxy logs for events
6. Verify events appear in GitHub Actions workflows

## Troubleshooting

- If verification fails, check the error messages and fix any issues
- If the webhook proxy doesn't start, check for port conflicts
- If events aren't sent, check browser console for CORS errors
- If GitHub doesn't receive events, check your app's permissions and webhook configuration

## Security Notes

- Keep your private key secure and never commit it to the repository
- The `.github/app` directory is excluded from git in the .gitignore file
- For production, consider using environment variables or a secure secrets manager
- Regularly rotate your private key for better security
