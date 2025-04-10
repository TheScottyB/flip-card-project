#!/bin/bash
# Launch Event Tracking Environment
# This script sets up and launches the complete event tracking environment

set -e

# Colors for output
GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[1;33m"
BLUE="\033[0;34m"
CYAN="\033[0;36m"
BOLD="\033[1m"
NC="\033[0m" # No Color

# Banner
echo -e "${BLUE}================================================================${NC}"
echo -e "${BLUE}${BOLD}           FLIP CARD EVENT TRACKING ENVIRONMENT           ${NC}"
echo -e "${BLUE}================================================================${NC}"

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
  echo -e "\n${CYAN}${BOLD}CHECKING PREREQUISITES${NC}"
  
  # Check for Node.js
  if command_exists node; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓ Node.js is installed (${NODE_VERSION})${NC}"
  else
    echo -e "${RED}✗ Node.js is not installed. Required for webhook proxy${NC}"
    echo -e "${YELLOW}Please install Node.js (v20+) and try again${NC}"
    exit 1
  fi
  
  # Check for npm
  if command_exists npm; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✓ npm is installed (${NPM_VERSION})${NC}"
  else
    echo -e "${RED}✗ npm is not installed. Required for dependencies${NC}"
    exit 1
  fi
  
  # Check verify-config.sh exists
  if [ -f "./scripts/verify-config.sh" ]; then
    echo -e "${GREEN}✓ verify-config.sh script exists${NC}"
  else
    echo -e "${RED}✗ verify-config.sh script not found${NC}"
    exit 1
  fi
  
  # Check webhook-proxy exists
  if [ -d "./webhook-proxy" ]; then
    echo -e "${GREEN}✓ webhook-proxy directory exists${NC}"
  else
    echo -e "${RED}✗ webhook-proxy directory not found${NC}"
    exit 1
  fi
}

# Verify configuration
verify_configuration() {
  echo -e "\n${CYAN}${BOLD}VERIFYING CONFIGURATION${NC}"
  
  # Run verify-config.sh with 'n' as input for the API test prompt
  if echo "n" | ./scripts/verify-config.sh; then
    echo -e "\n${GREEN}✓ Configuration verification passed${NC}"
  else
    echo -e "\n${RED}✗ Configuration verification failed${NC}"
    
    # Ask if user wants to continue despite verification failure
    read -p "Continue anyway? (y/n) " -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      echo -e "${YELLOW}Exiting due to verification failure${NC}"
      exit 1
    fi
  fi
}

# Check if webhook proxy dependencies are installed
check_dependencies() {
  echo -e "\n${CYAN}${BOLD}CHECKING DEPENDENCIES${NC}"
  
  if [ -d "./webhook-proxy/node_modules" ]; then
    echo -e "${GREEN}✓ Webhook proxy dependencies are installed${NC}"
  else
    echo -e "${YELLOW}! Webhook proxy dependencies are not installed. Installing now...${NC}"
    (cd webhook-proxy && npm install)
    
    if [ $? -eq 0 ]; then
      echo -e "${GREEN}✓ Dependencies installed successfully${NC}"
    else
      echo -e "${RED}✗ Failed to install dependencies${NC}"
      exit 1
    fi
  fi
}

# Start webhook proxy server
start_webhook_proxy() {
  echo -e "\n${CYAN}${BOLD}STARTING WEBHOOK PROXY SERVER${NC}"
  
  # Check if server is already running
  if [ -f "webhook-proxy/server.pid" ] && ps -p $(cat webhook-proxy/server.pid 2>/dev/null) > /dev/null; then
    echo -e "${YELLOW}! Webhook proxy server is already running (PID: $(cat webhook-proxy/server.pid))${NC}"
    
    # Ask if user wants to restart it
    read -p "Restart the server? (y/n) " -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      echo -e "${BLUE}Stopping existing server...${NC}"
      kill $(cat webhook-proxy/server.pid) 2>/dev/null
      rm -f webhook-proxy/server.pid
      echo -e "${GREEN}✓ Server stopped${NC}"
    else
      echo -e "${GREEN}✓ Using existing server instance${NC}"
      ALREADY_RUNNING=true
      return 0
    fi
  fi
  
  # Start server
  echo -e "${BLUE}Starting webhook proxy server...${NC}"
  (cd webhook-proxy && npm start > /dev/null 2>&1 &)
  
  # Give it a moment to start
  sleep 2
  
  # Check if server started successfully
  if [ -f "webhook-proxy/server.pid" ] && ps -p $(cat webhook-proxy/server.pid 2>/dev/null) > /dev/null; then
    echo -e "${GREEN}✓ Webhook proxy server started successfully (PID: $(cat webhook-proxy/server.pid))${NC}"
  else
    echo -e "${RED}✗ Webhook proxy server failed to start${NC}"
    echo -e "${YELLOW}Check webhook-proxy/server.log for details${NC}"
    exit 1
  fi
}

# Test server connectivity
test_connectivity() {
  echo -e "\n${CYAN}${BOLD}TESTING SERVER CONNECTIVITY${NC}"
  
  # Get server port (default to 3000 if not found)
  PORT=$(grep "PORT=" webhook-proxy/.env 2>/dev/null | cut -d'=' -f2 || echo "3000")
  
  # Wait briefly to ensure server is fully started
  echo -e "${BLUE}Waiting for server to initialize...${NC}"
  sleep 2
  
  if ! command_exists curl; then
    echo -e "${YELLOW}! curl not installed, skipping connectivity test${NC}"
    return 0
  fi
  
  # Test health endpoint
  echo -e "${BLUE}Testing health endpoint...${NC}"
  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT/health)
  
  if [ "$HTTP_STATUS" == "200" ]; then
    echo -e "${GREEN}✓ Server is healthy (HTTP 200)${NC}"
    
    # Try to get more detailed health info
    HEALTH_INFO=$(curl -s http://localhost:$PORT/health)
    echo -e "${BLUE}Health info: ${HEALTH_INFO}${NC}"
  else
    echo -e "${RED}✗ Server health check failed (HTTP ${HTTP_STATUS})${NC}"
    echo -e "${YELLOW}The server might not be fully initialized or there might be configuration issues${NC}"
  fi
}

# Launch browser with demo
launch_demo() {
  echo -e "\n${CYAN}${BOLD}LAUNCHING DEMO PAGE${NC}"
  
  # Check if demo file exists
  if [ -f "./universal-demo.html" ]; then
    echo -e "${GREEN}✓ Universal demo page found${NC}"
    
    # Ask if user wants to open the demo
    read -p "Open the demo page in your browser? (y/n) " -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      # Try to open the browser based on platform
      if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        open ./universal-demo.html
      elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command_exists xdg-open; then
          xdg-open ./universal-demo.html
        else
          echo -e "${YELLOW}! Could not open browser automatically${NC}"
        fi
      elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
        # Windows
        start ./universal-demo.html
      else
        echo -e "${YELLOW}! Could not open browser automatically${NC}"
      fi
      
      echo -e "${GREEN}✓ Demo page launched${NC}"
      echo -e "${BLUE}To enable event tracking, click the 'Enable Event Tracking' button in the demo${NC}"
    fi
  else
    echo -e "${YELLOW}! Universal demo page not found (./universal-demo.html)${NC}"
  fi
}

# Display environment information
show_environment_info() {
  echo -e "\n${CYAN}${BOLD}ENVIRONMENT INFORMATION${NC}"
  
  # Get server port (default to 3000 if not found)
  PORT=$(grep "PORT=" webhook-proxy/.env 2>/dev/null | cut -d'=' -f2 || echo "3000")
  
  echo -e "${BLUE}Webhook proxy:${NC} http://localhost:${PORT}"
  echo -e "${BLUE}Health endpoint:${NC} http://localhost:${PORT}/health"
  echo -e "${BLUE}Token endpoint:${NC} http://localhost:${PORT}/token"
  echo -e "${BLUE}Events endpoint:${NC} http://localhost:${PORT}/events"
  echo -e "${BLUE}Log file:${NC} webhook-proxy/server.log"
  
  # Get GitHub owner and repo if available
  OWNER=$(grep "GITHUB_OWNER=" webhook-proxy/.env 2>/dev/null | cut -d'=' -f2)
  REPO=$(grep "GITHUB_REPO=" webhook-proxy/.env 2>/dev/null | cut -d'=' -f2)
  
  if [ -n "$OWNER" ] && [ -n "$REPO" ]; then
    echo -e "${BLUE}GitHub repository:${NC} https://github.com/${OWNER}/${REPO}"
    echo -e "${BLUE}GitHub Actions:${NC} https://github.com/${OWNER}/${REPO}/actions"
  fi
}

# Show help for stopping the environment
show_stop_help() {
  echo -e "\n${CYAN}${BOLD}TO STOP THE ENVIRONMENT${NC}"
  echo -e "Run the following command:"
  echo -e "${YELLOW}  kill $(cat webhook-proxy/server.pid 2>/dev/null)${NC}"
  echo -e "Or press Ctrl+C if you keep this terminal window open"
}

# Trap for clean exit
cleanup() {
  # Only clean up if we were the ones who started the server
  if [ "$ALREADY_RUNNING" != "true" ] && [ -f "webhook-proxy/server.pid" ]; then
    echo -e "\n${YELLOW}Stopping webhook proxy server...${NC}"
    kill $(cat webhook-proxy/server.pid) 2>/dev/null || true
    rm -f webhook-proxy/server.pid
    echo -e "${GREEN}✓ Webhook proxy server stopped${NC}"
  fi
  
  echo -e "\n${BLUE}${BOLD}Event tracking environment shutdown complete${NC}"
}

# When in non-interactive mode (for automated scripts), register cleanup
if [ -t 1 ]; then
  # Terminal is interactive, don't register automatic cleanup
  :
else
  # Non-interactive terminal, register cleanup
  trap cleanup EXIT
fi

# Main function
main() {
  check_prerequisites
  verify_configuration
  check_dependencies
  start_webhook_proxy
  test_connectivity
  launch_demo
  show_environment_info
  show_stop_help
  
  # If interactive, ask user if they want to stop server on exit
  if [ -t 1 ]; then
    echo -e "\n${YELLOW}Press Ctrl+C to stop the environment or close this terminal to keep it running${NC}"
    # Wait for user interrupt
    trap cleanup EXIT
    tail -f webhook-proxy/server.log 2>/dev/null || sleep infinity
  fi
}

# Run the script
main
