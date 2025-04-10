# Contributing to the Flip Card Project

Thank you for your interest in contributing to the Flip Card Project! This document provides guidelines and instructions for contributing.

## Code of Conduct

Please be respectful and considerate of others when contributing to this project. We strive to maintain a welcoming and inclusive environment for everyone.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Install dependencies**:
   ```bash
   npm install
   cd webhook-proxy && npm install && cd ..
   ```
4. **Start the development server**:
   ```bash
   npm run dev
   ```

## Development Workflow

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**:
   - Follow the code style guidelines in [CLAUDE.md](CLAUDE.md)
   - Make sure your code is accessible (WCAG 2.1 AA compliant)
   - Add appropriate JSDoc comments
   - Update documentation if needed

3. **Run tests**:
   ```bash
   npm test
   npm run test:a11y
   ```

4. **Push your changes**:
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a pull request** against the `main` branch

## Project Structure

The project is organized as follows:

- `/src/core/` - Core vanilla JavaScript implementations
- `/src/react/` - React components (TypeScript)
- `/src/styles/` - CSS stylesheets
- `/src/templates/` - HTML examples
- `/src/tests/` - Unit, integration, and accessibility tests

See [src/README.md](src/README.md) for more details.

## Testing

- **Unit tests**: `npm test`
- **Accessibility tests**: `npm run test:a11y`
- **Manual testing**: Test across browsers and devices
- **Event tracking tests**: `npm run test:events`

## Accessibility Requirements

All contributions must meet WCAG 2.1 AA standards:

- Keyboard navigable
- Screen reader announcements
- Proper ARIA attributes
- Sufficient color contrast
- Support for prefers-reduced-motion

## Pull Request Process

1. Update the README.md with details of changes if applicable
2. Update the documentation if needed
3. Add appropriate tests for your changes
4. Your PR will be reviewed by maintainers
5. Address any requested changes
6. Once approved, your PR will be merged

## Questions?

If you have any questions, please open an issue or start a discussion on the repository.

Thank you for contributing!