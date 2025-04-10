# GitHub App Configuration Tests

This directory contains automated tests for verifying the GitHub App configuration and the webhook proxy server.

## Available Tests

### Configuration Verification Tests

Tests the functionality of the `verify-config.sh` script by creating a mock test environment and verifying that it correctly identifies and reports configuration issues.

```bash
npm run test:config
```

This test suite verifies:
- Detection of valid configurations
- Detection of missing private key
- Detection of incorrect private key path
- Detection of missing GitHub App ID
- Auto-correction of incorrect permissions

### Integration Tests (Mock Mode)

Tests the integration flow in a mock mode that simulates interactions with the webhook proxy server and GitHub API.

```bash
npm run test:events
```

This test suite verifies:
- Server startup (simulated)
- Health endpoint (simulated)
- Token generation (simulated)
- Event submission (simulated)

## How The Tests Work

### Configuration Verification Tests

1. **Isolated Test Environment**: 
   - Creates a temporary directory with a complete mock configuration 
   - Sets up mock files (.github/app/private-key.pem, webhook-proxy/.env, etc.)
   - Each test runs in this isolated environment

2. **Test Cases**:
   - **Valid Configuration**: Tests that a properly configured environment passes verification
   - **Missing Private Key**: Removes the private key file and verifies detection
   - **Incorrect Key Path**: Modifies the key path in .env and verifies detection
   - **Missing App ID**: Tests detection of a missing GitHub App ID
   - **Permissions Fixing**: Tests that incorrect permissions (644) are automatically fixed to 600

3. **Cleanup**:
   - Automatically removes the test environment after completion

### Integration Tests (Mock Mode)

1. **Prerequisites Check**:
   - Verifies that required tools and files exist (Node.js, curl, etc.)

2. **Mock Environment**:
   - Instead of actually calling the webhook proxy, it simulates the calls
   - Creates a mock server.pid file to simulate a running server
   - Simulates API responses for health, token, and event endpoints

3. **Test Flow**:
   - Verifies the mock proxy server "startup"
   - Tests health endpoint simulation
   - Tests token generation simulation
   - Demonstrates the payload that would be sent to the events endpoint

4. **Benefits of Mock Mode**:
   - Can run without an actual GitHub App configuration
   - No network dependencies
   - Fast execution
   - Doesn't require actual server startup

## Running Tests

To run all GitHub App configuration tests:

```bash
npm run test:config && npm run test:events
```

To verify your actual configuration (not a test):

```bash
npm run verify
```

## Adding New Tests

To add new test cases to the configuration verification suite:
1. Open `test/scripts/test-verify-config.sh`
2. Add a new test function following the existing pattern
3. Add your new test function to the `run_all_tests` function

To add new integration test cases:
1. Open `test/scripts/test-integration.sh`
2. Add a new test function following the existing pattern
3. Add your new test function to the `run_e2e_test` function

## Real vs. Mock Testing

The test suite provides two approaches:

1. **Mock Testing** (what we're doing): Creates a controlled environment to test the functionality of scripts and tools without requiring real credentials or network connectivity.

2. **Real Testing** (through `npm run verify`): Tests your actual configuration against the real environment, requiring proper setup of GitHub App credentials and environment.

For continuous integration purposes, the mock tests are ideal as they don't require sensitive credentials to be present.
