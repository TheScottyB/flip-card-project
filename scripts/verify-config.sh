#!/bin/bash
# Verification script for event-driven architecture configuration
# Run this script to verify that everything is set up correctly

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}Event-Driven Architecture Configuration Verification${NC}"
echo -e "${BLUE}=========================================${NC}"

# 1. GitHub App Configuration
echo -e "\n${BLUE}Checking GitHub App Configuration...${NC}"

if grep -q "github_app" _config.yml; then
  APP_ID=$(grep -A 2 "github_app" _config.yml | grep "app_id" | cut -d ':' -f 2 | sed 's/[^0-9]*//g')
  INSTALL_ID=$(grep -A 2 "github_app" _config.yml | grep "installation_id" | cut -d ':' -f 2 | sed 's/[^0-9]*//g')
  
  echo -e "  GitHub App ID: ${GREEN}$APP_ID${NC}"
  echo -e "  Installation ID: ${GREEN}$INSTALL_ID${NC}"
else
  echo -e "  ${RED}GitHub App configuration not found in _config.yml${NC}"
fi

# Check private key
if [ -f ".github/app/private-key.pem" ]; then
  echo -e "  Private key: ${GREEN}Found${NC}"
else
  echo -e "  Private key: ${RED}Not found${NC} (should be at .github/app/private-key.pem)"
fi

# 2. Webhook Proxy Server Configuration
echo -e "\n${BLUE}Checking Webhook Proxy Server Configuration...${NC}"

if [ -f "webhook-proxy/.env" ]; then
  echo -e "  .env file: ${GREEN}Found${NC}"
  
  # Extract key values without displaying everything (for security)
  ENV_APP_ID=$(grep "GITHUB_APP_ID" webhook-proxy/.env | cut -d '=' -f 2)
  ENV_INSTALL_ID=$(grep "GITHUB_APP_INSTALLATION_ID" webhook-proxy/.env | cut -d '=' -f 2)
  ALLOWED_ORIGINS=$(grep "ALLOWED_ORIGINS" webhook-proxy/.env | cut -d '=' -f 2)
  
  if [ "$ENV_APP_ID" = "$APP_ID" ]; then
    echo -e "  App ID in .env: ${GREEN}Matches${NC}"
  else
    echo -e "  App ID in .env: ${RED}Doesn't match${NC} (_config.yml has $APP_ID)"
  fi
  
  if [ "$ENV_INSTALL_ID" = "$INSTALL_ID" ]; then
    echo -e "  Installation ID in .env: ${GREEN}Matches${NC}"
  else
    echo -e "  Installation ID in .env: ${RED}Doesn't match${NC} (_config.yml has $INSTALL_ID)"
  fi
  
  echo -e "  Allowed origins: ${GREEN}$ALLOWED_ORIGINS${NC}"
else
  echo -e "  .env file: ${RED}Not found${NC} (should be at webhook-proxy/.env)"
fi

# Check dependencies
echo -e "  Checking webhook proxy dependencies..."
if [ -d "webhook-proxy/node_modules" ]; then
  DEPS_COUNT=$(ls -la webhook-proxy/node_modules | wc -l)
  echo -e "  Dependencies: ${GREEN}Installed${NC} ($DEPS_COUNT modules)"
else
  echo -e "  Dependencies: ${RED}Not installed${NC} (run 'cd webhook-proxy && npm install')"
fi

# 3. GitHub Actions Workflows
echo -e "\n${BLUE}Checking GitHub Actions Workflows...${NC}"

if [ -f ".github/workflows/data-processing-agent.yml" ]; then
  echo -e "  Data Processing Agent workflow: ${GREEN}Found${NC}"
  
  if grep -q "repository_dispatch" .github/workflows/data-processing-agent.yml; then
    echo -e "  Trigger configuration: ${GREEN}Found${NC}"
  else
    echo -e "  Trigger configuration: ${RED}Missing${NC} (repository_dispatch not found)"
  fi
else
  echo -e "  Data Processing Agent workflow: ${RED}Not found${NC}"
fi

if [ -f ".github/workflows/card-optimization-agent.yml" ]; then
  echo -e "  Card Optimization Agent workflow: ${GREEN}Found${NC}"
else
  echo -e "  Card Optimization Agent workflow: ${RED}Not found${NC}"
fi

# 4. Client-Side Integration
echo -e "\n${BLUE}Checking Client-Side Integration...${NC}"

if grep -q "card-event-tracker.js" universal-demo.html; then
  echo -e "  Event tracker script: ${GREEN}Included${NC}"
else
  echo -e "  Event tracker script: ${RED}Not included${NC}"
fi

if grep -q "tokenEndpoint.*localhost:3000" universal-demo.html; then
  echo -e "  Token endpoint: ${GREEN}Configured${NC}"
else
  echo -e "  Token endpoint: ${RED}Not properly configured${NC}"
fi

if grep -q "eventsEndpoint.*localhost:3000" universal-demo.html; then
  echo -e "  Events endpoint: ${GREEN}Configured${NC}"
else
  echo -e "  Events endpoint: ${RED}Not properly configured${NC}"
fi

if grep -q "toggle-tracking" universal-demo.html; then
  echo -e "  Tracking controls: ${GREEN}Found${NC}"
else
  echo -e "  Tracking controls: ${RED}Not found${NC}"
fi

# 5. Security Verification
echo -e "\n${BLUE}Checking Security Configuration...${NC}"

if grep -q ".github/app/" .gitignore; then
  echo -e "  GitHub App directory in .gitignore: ${GREEN}Yes${NC}"
else
  echo -e "  GitHub App directory in .gitignore: ${RED}No${NC}"
fi

if grep -q "webhook-proxy/.env" .gitignore; then
  echo -e "  webhook-proxy/.env in .gitignore: ${GREEN}Yes${NC}"
else
  echo -e "  webhook-proxy/.env in .gitignore: ${RED}No${NC}"
fi

if grep -q "webhook-proxy/server.pid" .gitignore; then
  echo -e "  webhook-proxy/server.pid in .gitignore: ${GREEN}Yes${NC}"
else
  echo -e "  webhook-proxy/server.pid in .gitignore: ${RED}No${NC}"
fi

# 6. Check server status
echo -e "\n${BLUE}Checking Server Status...${NC}"

if lsof -i :3000 > /dev/null 2>&1; then
  echo -e "  Webhook proxy server: ${GREEN}Running${NC}"
else
  echo -e "  Webhook proxy server: ${RED}Not running${NC} (start with 'cd webhook-proxy && npm start')"
fi

if lsof -i :8080 > /dev/null 2>&1; then
  echo -e "  Development server: ${GREEN}Running${NC}"
else
  echo -e "  Development server: ${RED}Not running${NC} (start with 'npm run dev')"
fi

echo -e "\n${BLUE}=========================================${NC}"
echo -e "${YELLOW}Verification complete!${NC}"
echo -e "${YELLOW}For a complete verification checklist, see VERIFICATION-CHECKLIST.md${NC}"
echo -e "${BLUE}=========================================${NC}"