#!/bin/bash
# Verify GitHub App configuration is secure
# This script checks that the configuration for the GitHub App integration is secure

set -e

# Colors for output
GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[1;33m"
BLUE="\033[0;34m"
NC="\033[0m" # No Color

echo -e "${BLUE}==============================================${NC}"
echo -e "${BLUE}GitHub App Configuration Verification Tool${NC}"
echo -e "${BLUE}==============================================${NC}"
echo

# Check if NodeJS is installed
if command -v node &> /dev/null; then
  NODE_VERSION=$(node -v)
  echo -e "${GREEN}✓ Node.js is installed (${NODE_VERSION})${NC}"
else
  echo -e "${RED}✗ Node.js is not installed. Required for webhook proxy${NC}"
  exit 1
fi

echo -e "\n${YELLOW}Checking directory and file structure...${NC}"

# Check if .github/app directory exists
if [ -d ".github/app" ]; then
  echo -e "${GREEN}✓ .github/app directory exists${NC}"
else
  echo -e "${RED}✗ .github/app directory does not exist. Run setup-github-app.sh first${NC}"
  exit 1
fi

# Check if private key exists
if [ -f ".github/app/private-key.pem" ]; then
  echo -e "${GREEN}✓ Private key exists${NC}"
else
  echo -e "${RED}✗ Private key not found. Run setup-github-app.sh first${NC}"
  exit 1
fi

# Check private key permissions
KEY_PERMS=$(stat -c "%a" .github/app/private-key.pem 2>/dev/null || stat -f "%Lp" .github/app/private-key.pem)
if [[ "$KEY_PERMS" == "600" ]]; then
  echo -e "${GREEN}✓ Private key has correct permissions (600)${NC}"
else
  echo -e "${YELLOW}! Private key has permissions $KEY_PERMS, should be 600. Fix with:${NC}"
  echo "  chmod 600 .github/app/private-key.pem"
  chmod 600 .github/app/private-key.pem
  echo -e "${GREEN}  Fixed permissions to 600${NC}"
fi

# Check if .github/app is in .gitignore
if grep -q ".github/app/" .gitignore; then
  echo -e "${GREEN}✓ .github/app/ is in .gitignore${NC}"
else
  echo -e "${RED}✗ .github/app/ is NOT in .gitignore. Add it to prevent committing credentials${NC}"
  exit 1
fi

# Check if webhook-proxy/.env exists
if [ -f "webhook-proxy/.env" ]; then
  echo -e "${GREEN}✓ webhook-proxy/.env exists${NC}"
else
  echo -e "${RED}✗ webhook-proxy/.env not found. Run setup-github-app.sh first${NC}"
  exit 1
fi

# Check if webhook-proxy/.env is in .gitignore
if grep -q "webhook-proxy/.env" .gitignore; then
  echo -e "${GREEN}✓ webhook-proxy/.env is in .gitignore${NC}"
else
  echo -e "${RED}✗ webhook-proxy/.env is NOT in .gitignore. Add it to prevent committing credentials${NC}"
  exit 1
fi

echo -e "\n${YELLOW}Checking webhook proxy configuration...${NC}"

# Check for webhook-proxy dependencies
if [ -d "webhook-proxy/node_modules" ]; then
  echo -e "${GREEN}✓ Webhook proxy dependencies are installed${NC}"
else
  echo -e "${YELLOW}! Webhook proxy dependencies are not installed. Install with:${NC}"
  echo "  cd webhook-proxy && npm install"
fi

# Check if GITHUB_APP_PRIVATE_KEY_PATH is set correctly in .env
if grep -q "GITHUB_APP_PRIVATE_KEY_PATH=../.github/app/private-key.pem" webhook-proxy/.env; then
  echo -e "${GREEN}✓ Private key path is correctly configured in .env${NC}"
else
  echo -e "${RED}✗ Private key path is not configured correctly in .env. Should be:${NC}"
  echo "  GITHUB_APP_PRIVATE_KEY_PATH=../.github/app/private-key.pem"
  exit 1
fi

# Check for GitHub App ID and Installation ID
if grep -q "GITHUB_APP_ID=" webhook-proxy/.env && ! grep -q "GITHUB_APP_ID=$" webhook-proxy/.env; then
  echo -e "${GREEN}✓ GitHub App ID is set in .env${NC}"
else
  echo -e "${RED}✗ GitHub App ID is missing or empty in .env${NC}"
  exit 1
fi

if grep -q "GITHUB_APP_INSTALLATION_ID=" webhook-proxy/.env && ! grep -q "GITHUB_APP_INSTALLATION_ID=$" webhook-proxy/.env; then
  echo -e "${GREEN}✓ GitHub App Installation ID is set in .env${NC}"
else
  echo -e "${RED}✗ GitHub App Installation ID is missing or empty in .env${NC}"
  exit 1
fi

# Check if repo information is set
if grep -q "GITHUB_OWNER=" webhook-proxy/.env && ! grep -q "GITHUB_OWNER=$" webhook-proxy/.env; then
  echo -e "${GREEN}✓ GitHub repository owner is set in .env${NC}"
else
  echo -e "${YELLOW}! GitHub repository owner is missing or empty in .env${NC}"
fi

if grep -q "GITHUB_REPO=" webhook-proxy/.env && ! grep -q "GITHUB_REPO=$" webhook-proxy/.env; then
  echo -e "${GREEN}✓ GitHub repository name is set in .env${NC}"
else
  echo -e "${YELLOW}! GitHub repository name is missing or empty in .env${NC}"
fi

echo -e "\n${YELLOW}Checking network and connectivity settings...${NC}"

# Check for allowed origins
if grep -q "ALLOWED_ORIGINS=" webhook-proxy/.env; then
  ORIGINS=$(grep "ALLOWED_ORIGINS=" webhook-proxy/.env | cut -d'=' -f2)
  echo -e "${GREEN}✓ Allowed origins are configured: ${ORIGINS}${NC}"
else
  echo -e "${YELLOW}! ALLOWED_ORIGINS is not set in .env${NC}"
fi

# Check if webhook proxy server is running
if [ -f "webhook-proxy/server.pid" ] && ps -p $(cat webhook-proxy/server.pid 2>/dev/null) > /dev/null; then
  echo -e "${GREEN}✓ Webhook proxy server is running (PID: $(cat webhook-proxy/server.pid))${NC}"
else
  echo -e "${YELLOW}! Webhook proxy server is not running. Start with:${NC}"
  echo "  cd webhook-proxy && npm start"
fi

# Optional: Test GitHub API connectivity
echo -e "\n${YELLOW}Would you like to test GitHub API connectivity? (y/n)${NC}"
read -r test_connectivity

if [[ "$test_connectivity" =~ ^[Yy]$ ]]; then
  if ! command -v curl &> /dev/null; then
    echo -e "${RED}✗ curl is not installed, cannot test connectivity${NC}"
  else
    echo -e "${BLUE}Testing GitHub API connectivity...${NC}"
    # Extract app ID and installation ID
    APP_ID=$(grep "GITHUB_APP_ID=" webhook-proxy/.env | cut -d'=' -f2)
    INSTALLATION_ID=$(grep "GITHUB_APP_INSTALLATION_ID=" webhook-proxy/.env | cut -d'=' -f2)
    
    # Check if the webhook proxy server is running and get health status
    if [ -f "webhook-proxy/server.pid" ] && ps -p $(cat webhook-proxy/server.pid 2>/dev/null) > /dev/null; then
      HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health)
      if [ "$HTTP_STATUS" == "200" ]; then
        echo -e "${GREEN}✓ Webhook proxy server is healthy (HTTP 200)${NC}"
      else
        echo -e "${RED}✗ Webhook proxy server returned HTTP ${HTTP_STATUS}${NC}"
      fi
    else
      echo -e "${YELLOW}! Cannot test API connectivity because proxy server is not running${NC}"
    fi
    
    # Simple test for GitHub API (doesn't require auth)
    GH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://api.github.com/zen)
    if [ "$GH_STATUS" == "200" ]; then
      echo -e "${GREEN}✓ GitHub API is reachable${NC}"
    else
      echo -e "${RED}✗ GitHub API is not reachable (HTTP ${GH_STATUS})${NC}"
    fi
  fi
fi

echo 
echo -e "${GREEN}Configuration verification complete. Your GitHub App setup appears secure.${NC}"
echo -e "${BLUE}Next steps:${NC}"
echo -e "1. Start the webhook proxy server: cd webhook-proxy && npm start"
echo -e "2. Open the universal-demo.html page in your browser"
echo -e "3. Enable event tracking in the demo page"
echo -e "4. Check the browser console and server logs for event transmission"
