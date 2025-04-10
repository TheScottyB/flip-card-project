# Developer Tools for Event Tracking

This directory contains tools to enhance the developer experience when working with the Flip Card Event Tracking system.

## Available Tools

### Event Simulator

A command-line interactive tool that generates and sends simulated events to test the webhook proxy and GitHub integration.

```bash
npm run simulate
```

Features:
- Generate single or multiple event sessions
- Continuous event generation
- Customizable event types and device profiles
- Interactive menu-driven interface

### Event Dashboard

A web-based dashboard for monitoring and managing the event tracking system.

```bash
npm run dashboard
```

Features:
- Visual display of event statistics
- Real-time event monitoring
- Interactive charts for event visualization
- Tools for generating test events
- Server status and controls
- Configuration interface

## Installation

These tools use the same dependencies as the main project and webhook proxy. No additional installation is needed.

## Usage with Launch Script

For a complete environment setup that includes these tools, use the launch script:

```bash
npm run launch
```

The launch script will set up the environment and provide instructions for accessing these tools.

## When to Use These Tools

- **During Development**: Use the simulator to generate events without needing to manually interact with cards
- **For Testing**: Verify that events are being properly tracked and forwarded to GitHub
- **For Debugging**: Use the dashboard to monitor events and check server status
- **For Configuration**: Visual interface for adjusting proxy settings

## Configuration

Both tools read from and can modify the webhook proxy's `.env` file. Any changes made through these tools will be reflected in the actual configuration.

## Note on Mock Data

The dashboard initially displays mock data to demonstrate its capabilities. Once connected to a running webhook proxy server, it will display real data from your event tracking system.
