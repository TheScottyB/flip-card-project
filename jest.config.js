/** 
 * Jest configuration for Flip Card Project
 * Used primarily for accessibility testing with Puppeteer and Axe
 */
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.js'],
  transform: {
    '^.+\\.jsx?$': 'babel-jest'
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  
  // Test files pattern
  testMatch: [
    "**/src/tests/**/*.test.js",
    "**/tests/**/*.test.js"
  ],
  
  // Test coverage
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    "src/js/**/*.js",
    "!**/node_modules/**",
    "!**/dist/**"
  ],
  
  // Set timeout for tests (puppeteer needs more time)
  testTimeout: 30000,
  
  // HTML reporter configuration for visual test reports
  reporters: [
    "default",
    [
      "./node_modules/jest-html-reporter",
      {
        pageTitle: "Flip Card Accessibility Test Report",
        outputPath: "./test-report/index.html",
        includeFailureMsg: true,
        includeSuiteFailure: true,
        includeConsoleLog: true,
        theme: "lightTheme"
      }
    ]
  ],
  
  // Verbose output with additional details
  verbose: true
};