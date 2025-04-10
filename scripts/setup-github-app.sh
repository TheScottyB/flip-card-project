#!/bin/bash
# GitHub App Setup Script for Flip Card Agent
# This script uses gh CLI to create and configure a GitHub App

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
REPO_NAME=$(basename $(git rev-parse --show-toplevel))
OWNER=$(git config --get remote.origin.url | sed -n 's/.*github.com[:/]\([^/]*\).*/\1/p')
APP_NAME="Flip Card Agent"
APP_DESCRIPTION="Event-driven, multi-agent system for Universal Flip Card components"
APP_URL="https://github.com/$OWNER/$REPO_NAME"
WEBHOOK_URL="http://localhost:3000/webhook" # Default placeholder

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
  echo -e "${RED}Error: GitHub CLI (gh) is not installed.${NC}"
  echo -e "Please install it from https://cli.github.com/"
  exit 1
fi

# Check if authenticated with gh
if ! gh auth status &> /dev/null; then
  echo -e "${YELLOW}You need to authenticate with GitHub CLI${NC}"
  gh auth login
fi

# Print banner
echo -e "${BLUE}===================================${NC}"
echo -e "${BLUE}GitHub App Setup for Flip Card Agent${NC}"
echo -e "${BLUE}===================================${NC}"
echo -e "This script will set up the GitHub App for the event-driven architecture."
echo

# Ask for confirmation
read -p "Do you want to continue with setup? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Setup cancelled."
  exit 0
fi

# Allow custom webhook URL
echo -e "${YELLOW}Enter the webhook URL for your app (default: $WEBHOOK_URL):${NC}"
read custom_webhook
if [ ! -z "$custom_webhook" ]; then
  WEBHOOK_URL=$custom_webhook
fi

# Create a temporary directory to store the app credentials
mkdir -p .github/app
CREDS_DIR=".github/app"

echo -e "\n${BLUE}Creating GitHub App manifest...${NC}"
cat > $CREDS_DIR/app-manifest.json << EOL
{
  "name": "$APP_NAME",
  "url": "$APP_URL",
  "hook_attributes": {
    "url": "$WEBHOOK_URL",
    "active": true
  },
  "redirect_url": "$APP_URL",
  "public": false,
  "default_permissions": {
    "contents": "write",
    "issues": "write",
    "discussions": "write",
    "actions": "write"
  },
  "default_events": [
    "repository_dispatch"
  ]
}
EOL

echo -e "${GREEN}App manifest created at $CREDS_DIR/app-manifest.json${NC}"

# Create GitHub App using API (as CLI doesn't have direct app creation)
echo -e "\n${BLUE}Creating GitHub App...${NC}"
echo -e "${YELLOW}This will open a browser window where you can create the app.${NC}"
echo -e "Please review the settings and click 'Create GitHub App'."
echo -e "After creation, make note of the App ID and download the private key."

# Use gh api or just provide instructions
echo -e "\n${GREEN}Please follow these steps:${NC}"
echo -e "1. Go to: https://github.com/settings/apps/new"
echo -e "2. Fill in the form with:"
echo -e "   - GitHub App name: $APP_NAME"
echo -e "   - Description: $APP_DESCRIPTION"
echo -e "   - Homepage URL: $APP_URL"
echo -e "   - Webhook URL: $WEBHOOK_URL"
echo -e "   - Webhook secret: [Generate a secure random string]"
echo -e "   - Permissions: "
echo -e "     - Repository contents: Read & write"
echo -e "     - Issues: Read & write"
echo -e "     - Discussions: Read & write"
echo -e "     - Actions: Read & write"
echo -e "   - Subscribe to events: repository_dispatch"
echo -e "   - Where can this GitHub App be installed?: Only on this account"
echo -e "3. Click 'Create GitHub App'"
echo -e "4. On the next page, note your App ID"
echo -e "5. Scroll down to 'Private keys' and click 'Generate a private key'"
echo -e "6. Save the downloaded .pem file"
echo -e "7. Click 'Install App' in the sidebar"
echo -e "8. Choose your repository and click 'Install'"

# Wait for user to complete app creation
read -p "Press Enter when you've completed the GitHub App creation and installation..." -r

# Ask for App ID
echo -e "\n${YELLOW}Enter your GitHub App ID:${NC}"
read app_id

# Ask for Installation ID
echo -e "\n${YELLOW}Enter your GitHub App Installation ID:${NC}"
echo -e "${BLUE}You can find this in the URL when you installed the app:${NC}"
echo -e "${BLUE}https://github.com/settings/installations/[THIS-IS-YOUR-INSTALLATION-ID]${NC}"
read installation_id

# Ask for private key path
echo -e "\n${YELLOW}Enter the full path to your downloaded private key (.pem file):${NC}"
read private_key_path

# Validate inputs
if [ -z "$app_id" ] || [ -z "$installation_id" ] || [ -z "$private_key_path" ]; then
  echo -e "${RED}Error: All fields are required.${NC}"
  exit 1
fi

# Check if private key exists
if [ ! -f "$private_key_path" ]; then
  echo -e "${RED}Error: Private key file not found at $private_key_path${NC}"
  exit 1
fi

# Copy private key to credentials directory
cp "$private_key_path" "$CREDS_DIR/private-key.pem"
echo -e "${GREEN}Private key copied to $CREDS_DIR/private-key.pem${NC}"

# Create environment file for webhook proxy
echo -e "\n${BLUE}Creating environment file for webhook proxy...${NC}"
cat > webhook-proxy/.env << EOL
# GitHub App Configuration
GITHUB_APP_ID=$app_id
GITHUB_APP_INSTALLATION_ID=$installation_id
GITHUB_APP_PRIVATE_KEY_PATH=../$CREDS_DIR/private-key.pem

# Server Configuration
PORT=3000
ALLOWED_ORIGINS=https://$OWNER.github.io/$REPO_NAME,http://localhost:8080
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Security
JWT_EXPIRATION_SECONDS=600  # 10 minutes
WEBHOOK_SECRET=$(openssl rand -hex 20)

# Repository Info
GITHUB_OWNER=$OWNER
GITHUB_REPO=$REPO_NAME
EOL

echo -e "${GREEN}Environment file created at webhook-proxy/.env${NC}"

# Add .github/app directory to .gitignore to protect credentials
if ! grep -q ".github/app/" .gitignore; then
  echo -e "\n# GitHub App credentials" >> .gitignore
  echo ".github/app/" >> .gitignore
  echo -e "${GREEN}Added .github/app/ to .gitignore to protect credentials${NC}"
fi

# Instructions for starting the proxy server
echo -e "\n${BLUE}=== Next Steps ===${NC}"
echo -e "1. Install webhook proxy dependencies:"
echo -e "   ${YELLOW}cd webhook-proxy && npm install${NC}"
echo -e "2. Start the webhook proxy server:"
echo -e "   ${YELLOW}npm start${NC}"
echo -e "3. Update the card-event-tracker.js with your webhook URL:"
echo -e "   ${YELLOW}tokenEndpoint: 'http://localhost:3000/token',${NC}"
echo -e "   ${YELLOW}eventsEndpoint: 'http://localhost:3000/events'${NC}"
echo -e "4. Test the integration by enabling tracking in the universal demo"

echo -e "\n${GREEN}GitHub App setup complete!${NC}"