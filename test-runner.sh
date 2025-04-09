#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if required tools are installed
check_requirements() {
  echo -e "${BLUE}Checking requirements...${NC}"
  
  # Check for Node.js
  if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Please install Node.js to continue.${NC}"
    exit 1
  fi
  
  # Check for npm
  if ! command -v npm &> /dev/null; then
    echo -e "${RED}npm is not installed. Please install npm to continue.${NC}"
    exit 1
  fi
  
  # Check if dependencies are installed
  if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
    if [ $? -ne 0 ]; then
      echo -e "${RED}Failed to install dependencies. Please check your npm configuration.${NC}"
      exit 1
    fi
  fi
  
  echo -e "${GREEN}All requirements are met.${NC}"
}

# Create test report directory if it doesn't exist
mkdir -p test-report

echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}  Running Flip Card A11y Test Suite    ${NC}"
echo -e "${BLUE}=======================================${NC}"

# Check requirements
check_requirements

# Run the tests with HTML report generation
echo -e "${BLUE}Running accessibility tests with HTML reports...${NC}"
npm run test:report

# Check if tests passed
TEST_EXIT_CODE=$?
if [ $TEST_EXIT_CODE -eq 0 ]; then
  TEST_STATUS="${GREEN}PASSED${NC}"
else
  TEST_STATUS="${RED}FAILED (Exit code: $TEST_EXIT_CODE)${NC}"
fi

# Check if HTML report was generated
HTML_REPORT="./test-report/test-report.html"
if [ -f "$HTML_REPORT" ]; then
  REPORT_STATUS="${GREEN}Generated${NC}"
  REPORT_PATH="$HTML_REPORT"
else
  # Try alternative paths
  ALTERNATE_REPORT="./jest-html-report/test-report.html"
  if [ -f "$ALTERNATE_REPORT" ]; then
    REPORT_STATUS="${GREEN}Generated in alternate location${NC}"
    REPORT_PATH="$ALTERNATE_REPORT"
  else
    REPORT_STATUS="${RED}Not found${NC}"
    REPORT_PATH="N/A"
  fi
fi

# Display summary
echo -e "\n${BLUE}=======================================${NC}"
echo -e "${BLUE}           Test Summary                ${NC}"
echo -e "${BLUE}=======================================${NC}"
echo -e "Test Status: ${TEST_STATUS}"
echo -e "HTML Report: ${REPORT_STATUS}"
echo -e "Report Path: ${BLUE}${REPORT_PATH}${NC}"
echo -e "${BLUE}=======================================${NC}"

# Open the report if available
if [ -f "$REPORT_PATH" ]; then
  echo -e "${YELLOW}Would you like to open the HTML report now? (y/n)${NC}"
  read -r answer
  if [[ "$answer" =~ ^[Yy]$ ]]; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
      open "$REPORT_PATH"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
      xdg-open "$REPORT_PATH"
    elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
      start "$REPORT_PATH"
    else
      echo -e "${YELLOW}Couldn't automatically open the report. Please open it manually at: ${REPORT_PATH}${NC}"
    fi
  fi
fi
SUMMARY_FILE="test-report/summary.html"
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
REPORT_TITLE="Flip Card Accessibility Test Report - ${TIMESTAMP}"

cat > ${SUMMARY_FILE} << EOF
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${REPORT_TITLE}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      margin: 0;
      padding: 20px;
      color: #333;
    }
    h1 {
      color: #2c3e50;
      border-bottom: 2px solid #eee;
      padding-bottom: 10px;
    }
    .summary {
      background-color: #f9f9f9;
      border-left: 4px solid #2980b9;
      padding: 15px;
      margin: 20px 0;
    }
    .pass {
      color: #27ae60;
      font-weight: bold;
    }
    .fail {
      color: #e74c3c;
      font-weight: bold;
    }
    .report-section {
      margin: 30px 0;
    }
    h2 {
      color: #3498db;
    }
    pre {
      background: #f8f8f8;
      border: 1px solid #ddd;
      border-left: 3px solid #3498db;
      color: #444;
      page-break-inside: avoid;
      font-family: monospace;
      font-size: 15px;
      line-height: 1.6;
      margin-bottom: 1.6em;
      max-width: 100%;
      overflow: auto;
      padding: 1em 1.5em;
      display: block;
      word-wrap: break-word;
    }
    .footer {
      margin-top: 40px;
      font-size: 0.9em;
      color: #7f8c8d;
      text-align: center;
    }
  </style>
</head>
<body>
  <h1>${REPORT_TITLE}</h1>
  
  <div class="summary">
    <p>Tests Status: <span class="$([ "$TEST_STATUS" == "${GREEN}PASSED${NC}" ] && echo "pass" || echo "fail")">
      $([ "$TEST_STATUS" == "${GREEN}PASSED${NC}" ] && echo "PASSED" || echo "FAILED")
    </span></p>
    <p>Timestamp: ${TIMESTAMP}</p>
  </div>

  <div class="report-section">
    <h2>Test Files</h2>
    <ul>
      <li><a href="accessibility-report.html">Detailed Test Results</a></li>
      <li><a href="axe-results.json">Axe Core Analysis</a></li>
    </ul>
  </div>

  <div class="report-section">
    <h2>Key Accessibility Features Tested</h2>
    <ul>
      <li>ARIA live regions for status updates</li>
      <li>Proper button ARIA attributes (aria-pressed, aria-expanded)</li>
      <li>Keyboard accessibility (Tab, Enter, Escape)</li>
      <li>Focus management</li>
      <li>Semantic HTML structure</li>
    </ul>
  </div>

  <div class="footer">
    <p>Generated automatically by Flip Card A11y Test Runner</p>
  </div>
</body>
</html>
EOF

# Display summary
echo -e "\n${BLUE}=======================================${NC}"
echo -e "${BLUE}           Test Summary                ${NC}"
echo -e "${BLUE}=======================================${NC}"
echo -e "Test status: ${TEST_STATUS}"
echo -e "Report generated: ${BLUE}test-report/summary.html${NC}"
echo -e "Detailed report: ${BLUE}test-report/accessibility-report.html${NC}"
echo -e "AxeCORE results: ${BLUE}test-report/axe-results.json${NC}"
echo -e "${BLUE}=======================================${NC}"

# Make the file executable
chmod +x test-runner.sh

echo -e "\nRun tests with: ${YELLOW}./test-runner.sh${NC}"

