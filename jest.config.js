module.exports = {
  testMatch: ['**/*.test.js'],
  testTimeout: 30000,
  verbose: true,
  testEnvironment: 'node',
  setupFilesAfterEnv: [],
  reporters: [
    'default',
    ['./node_modules/jest-html-reporter', {
      pageTitle: 'Flip Card Accessibility Test Report',
      outputPath: './test-report/accessibility-report.html',
      includeFailureMsg: true
    }]
  ]
};

