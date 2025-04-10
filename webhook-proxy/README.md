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

### Credential Security Configuration

#### Private Key Handling
- **Location**: The GitHub App private key is stored at `../.github/app/private-key.pem` relative to the webhook-proxy directory
- **File Permissions**: The private key should have 600 permissions (`-rw-------`), allowing access only to the owner
- **Never commit**: The private key should never be committed to the repository (the `.github/app/` directory is included in `.gitignore`)

#### Environment Variable Configuration
- Sensitive credentials are stored in the `.env` file (which is excluded from git)
- The `GITHUB_APP_PRIVATE_KEY_PATH` variable points to the private key location
- All security-related environment variables should be kept confidential
- For production deployments, consider using environment variables or a secure secret management solution instead of `.env` files

#### Git Ignore Patterns
- Both `.github/app/` and `webhook-proxy/.env` are included in `.gitignore`
- Always verify these patterns remain in place when making changes to the repository

#### Best Practices for Credential Handling
- Regularly rotate the GitHub App private key
- Use the most restrictive file permissions possible
- Consider key rotation schedules for long-running deployments
- For production environments, use environment variables or secret management services
- Never hardcode credentials in application code
- Restrict access to the machine/environment where credentials are stored

## Testing

1. Start the webhook proxy server
2. Open the Universal Flip Card demo page
3. Enable event tracking using the control panel
4. Interact with the flip card
5. Check the console logs and server logs to confirm event transmission