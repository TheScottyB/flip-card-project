# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability within the Flip Card Project, please send an email to security@example.com. All security vulnerabilities will be promptly addressed.

Please include the following information in your report:

- Type of vulnerability
- Steps to reproduce the issue
- Affected versions
- Potential impact

## Security Measures

The Flip Card Project implements several security measures:

1. **Event Data Anonymization**: All user interaction data can be anonymized by setting the `anonymizeData` option to `true`.
2. **Rate Limiting**: The webhook proxy implements rate limiting to prevent abuse.
3. **CORS Protection**: The webhook proxy restricts origins to prevent unauthorized access.
4. **JWT Authentication**: All communication with GitHub uses JWT-authenticated requests.

## Best Practices for Users

When implementing the Flip Card components:

1. Always serve your pages over HTTPS
2. Keep all dependencies updated
3. Set the `anonymizeData` option to `true` if collecting user interaction data
4. Protect any private keys used for GitHub App authentication