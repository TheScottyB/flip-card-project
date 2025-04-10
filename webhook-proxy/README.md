# Webhook Proxy Server for Flip Card Agent

This proxy server serves as a bridge between the Universal Flip Card client-side tracking system and the GitHub API. It handles authentication, token generation, and securely forwards events to trigger GitHub Actions workflows.

## Setup

1. Create a GitHub App (as described in the main setup script)
2. Configure the `.env` file with your GitHub App credentials
3. Install dependencies and start the server

```bash
npm install
npm start
```

## Key Endpoints

- `/token` - Generates authentication tokens for client-side use
- `/events` - Receives and forwards events to GitHub repository dispatch API
- `/health` - Health check endpoint

## Environment Variables

See `.env.example` for required environment variables.

## Security Features

- JWT token-based authentication
- Configurable rate limiting
- CORS protection with allowed origins
- Short-lived tokens
- Private key kept secure on server

## Testing

1. Start the webhook proxy server
2. Open the Universal Flip Card demo page
3. Enable event tracking using the control panel
4. Interact with the flip card
5. Check the console logs and server logs to confirm event transmission