# Event-Driven Multi-Agent Architecture Documentation

This directory contains documentation for the event-driven, multi-agent architecture that powers the Universal Flip Card analytics and optimization system.

## Key Components

1. [System Architecture Overview](../../EVENT-DRIVEN-ARCHITECTURE.md) - High-level explanation of the multi-agent system
2. [Quick Start Guide](../../EVENT-TRACKING-QUICKSTART.md) - Step-by-step guide to set up the system
3. [GitHub App Setup](../../GITHUB-APP-SETUP.md) - Detailed instructions for GitHub App configuration
4. [Client-Side Tracking](../../src/js/card-event-tracker.js) - JavaScript code that collects interaction data
5. [Webhook Proxy Server](../../webhook-proxy/server.js) - Server that handles GitHub API integration
6. [Data Processing Agent](../../.github/workflows/data-processing-agent.yml) - GitHub Actions workflow for analyzing data
7. [Card Optimization Agent](../../.github/workflows/card-optimization-agent.yml) - GitHub Actions workflow for generating optimized card configurations

## Setup Process

To set up the event-driven architecture:

1. Create a GitHub App using the [setup script](../../scripts/setup-github-app.sh)
2. Configure the webhook proxy server with your GitHub App credentials
3. Start the webhook proxy server to receive events
4. Enable event tracking in the Universal Flip Card demo
5. View GitHub Actions workflows as they process incoming data

## Architecture Diagram

```
┌──────────────────┐     ┌────────────────────┐     ┌───────────────────┐
│                  │     │                    │     │                   │
│  Client-Side JS  │────▶│   GitHub App       │────▶│  GitHub Actions   │
│  Event Listeners │     │   Webhook Receiver │     │  Processing Agents│
│                  │     │                    │     │                   │
└──────────────────┘     └────────────────────┘     └───────────────────┘
```

For detailed setup instructions, refer to the [Quick Start Guide](../../EVENT-TRACKING-QUICKSTART.md).