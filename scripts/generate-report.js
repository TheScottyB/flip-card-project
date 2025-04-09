/**
 * Accessibility Test Report Generator
 * Generates an HTML report from Jest test results
 */

const fs = require('fs');
const path = require('path');

// Input/output paths
const INPUT_FILE = path.join(__dirname, '../test-report/test-results.json');
const OUTPUT_FILE = path.join(__dirname, '../test-report/index.html');

// Create directories if they don't exist
if (!fs.existsSync(path.dirname(OUTPUT_FILE))) {
  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
}

// Read test results
let results;
try {
  results = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));
} catch (error) {
  // Create sample data if file doesn't exist (for development)
  console.warn('Test results file not found, using sample data');
  results = {
    numPassedTests: 36,
    numFailedTests: 4,
    numTotalTests: 40,
    testResults: [
      {
        assertionResults: [
          {
            title: 'Keyboard: Can navigate with Tab key',
            status: 'passed',
            failureMessages: []
          },
          {
            title: 'Screen Reader: Card announces state changes',
            status: 'failed',
            failureMessages: ['Expected card to announce state change but got silence']
          }
        ]
      }
    ]
  };
}

// Process results
const testResults = results.testResults;
const numPassedTests = results.numPassedTests;
const numFailedTests = results.numFailedTests;
const numTotalTests = results.numTotalTests;
const passPercent = Math.round((numPassedTests / numTotalTests) * 100) || 0;

// Group tests by category
const categories = {};
testResults.forEach(suite => {
  suite.assertionResults.forEach(test => {
    // Extract category from test title
    const titleParts = test.title.split(':');
    const category = titleParts.length > 1 ? titleParts[0].trim() : 'Other';
    
    if (!categories[category]) {
      categories[category] = {
        passed: 0,
        failed: 0,
        total: 0,
        tests: []
      };
    }
    
    categories[category].total++;
    
    if (test.status === 'passed') {
      categories[category].passed++;
    } else {
      categories[category].failed++;
    }
    
    categories[category].tests.push({
      title: titleParts.length > 1 ? titleParts.slice(1).join(':').trim() : test.title,
      status: test.status,
      failureMessages: test.failureMessages || []
    });
  });
});

// Helper function to escape HTML special characters
function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Generate HTML report
const generateHTML = () => {
  let categoryHTML = '';
  
  Object.keys(categories).forEach(category => {
    const cat = categories[category];
    const catPercent = Math.round((cat.passed / cat.total) * 100) || 0;
    
    categoryHTML += `
      <div class="category">
        <h3>${category} <span class="badge ${catPercent === 100 ?
