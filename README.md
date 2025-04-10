# Flip Card Project

[![Deploy to GitHub Pages](https://github.com/TheScottyB/flip-card-project/actions/workflows/github-pages.yml/badge.svg)](https://github.com/TheScottyB/flip-card-project/actions/workflows/github-pages.yml)

An accessible, responsive flip card implementation with WCAG 2.1 AA compliance. This project provides interactive card components with smooth animations and full keyboard, screen reader, and touch support.

## Demo Cards

View the live demos on GitHub Pages:
- [Main Demo](https://thescottyb.github.io/flip-card-project/) - Standard flip card implementation
- [Multi-Card Gallery](https://thescottyb.github.io/flip-card-project/multi-card.html) - Multiple card variants
- [Contact Card](https://thescottyb.github.io/flip-card-project/src/components/contact-card.html) - Real-world contact information card example
- [Loan Card](https://thescottyb.github.io/flip-card-project/src/components/loan-cards.html) - Financial product card example

## Features

- **WCAG 2.1 AA Compliance**: Full screen reader support, keyboard navigation, and focus management
- **Responsive Design**: Works on all screen sizes
- **Multiple Card Variants**: Standard, mini, and tall card formats
- **CSS 3D Transforms**: Smooth flip animations with CSS
- **Event-Driven Architecture**: Analytics and optimization system based on user interactions
- **GitHub-Based Backend**: Serverless infrastructure using GitHub Apps and Actions
- **Touch Device Support**: Works with touch gestures on mobile devices
- **Reduced Motion Support**: Respects user's motion preference settings
- **Browser Compatibility**: Works across all modern browsers with appropriate fallbacks

## Quick Start

### For Users
To view and interact with the flip cards:
1. Visit our [GitHub Pages site](https://thescottyb.github.io/flip-card-project/)
2. Use keyboard navigation (Tab, Enter, Space, Escape) or mouse/touch to interact with cards
3. Try the different card variations in the [Multi-Card Gallery](https://thescottyb.github.io/flip-card-project/multi-card.html)

### For Developers
To use the flip card components in your project:

1. Include the required CSS and JavaScript files:
   ```html
   <link rel="stylesheet" href="https://thescottyb.github.io/flip-card-project/dist/css/flip-card.min.css">
   <script src="https://thescottyb.github.io/flip-card-project/dist/js/flip-card.min.js"></script>
   ```

2. Use the following HTML structure:
   ```html
   <div class="flip-card card-standard">
     <div class="flip-card-inner">
       <div class="flip-card-front">
         <!-- Front content -->
         <button class="flip-trigger" aria-pressed="false" aria-controls="back-1">View More</button>
       </div>
       <div class="flip-card-back" id="back-1">
         <!-- Back content -->
         <button class="flip-trigger" aria-pressed="true" aria-controls="front-1">Return</button>
       </div>
     </div>
   </div>
   ```

## Local Development

### Prerequisites
- Node.js (v16+) and npm

### Setup
1. Clone the repository
   ```bash
   git clone https://github.com/TheScottyB/flip-card-project.git
   cd flip-card-project
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npm run dev
   ```
   This will build the project and start a local server at http://localhost:8080

### Development Commands
- `npm run dev` - Build and start local development server
- `npm run start` - Start the local server without rebuilding
- `npm run build` - Build the project for development
- `npm run build:prod` - Build and minify for production
- `npm test` - Run all tests
- `npm run test:a11y` - Run accessibility tests
- `npm run test:report` - Generate HTML test report

## Project Structure

- `/src/styles/` - CSS source files
- `/src/js/` - JavaScript source files
- `/src/components/` - HTML and React components 
- `/src/tests/` - Test files
- `/dist/` - Distribution files (compiled CSS/JS)
- `/react-components/` - React-specific components
- `/webhook-proxy/` - Server for GitHub App integration
- `/.github/workflows/` - GitHub Actions automation

## Event-Driven Architecture

The project includes an event-driven, multi-agent architecture for analytics and optimization:

- **Client-Side Tracking**: JavaScript module for collecting interaction data
- **Webhook Proxy Server**: Express server for handling GitHub API integration
- **GitHub App Integration**: Authentication and API access 
- **Multi-Agent Workflows**: GitHub Actions workflows for processing and optimization

Documentation:
- [Event-Driven Architecture Overview](EVENT-DRIVEN-ARCHITECTURE.md) - System design
- [Event Tracking Quick Start](EVENT-TRACKING-QUICKSTART.md) - Setup instructions
- [GitHub App Setup](GITHUB-APP-SETUP.md) - Detailed configuration

## Accessibility Features

- Keyboard navigation (Tab, Enter, Space, Escape)
- ARIA attributes for screen readers
- Focus management between card sides
- Live region announcements for state changes
- Reduced motion support
- Color contrast compliance (WCAG 2.1 AA)
- Progressive enhancement

## Deployment

This project uses GitHub Pages for deployment with continuous integration. All changes to the main branch are automatically deployed.

### Branch Structure

This repository uses a single branch workflow:

- `main` - Primary development branch and deployment source
  
All development work, fixes, and new features should be pushed directly to the `main` branch, which will automatically trigger the GitHub Pages deployment workflow.

### Environment Configuration

The GitHub Pages environment is configured to deploy from the `main` branch. This configuration was set up using the GitHub CLI:

```bash
# Set the default branch to main
gh repo edit --default-branch main

# Configure GitHub Pages to deploy from main branch
gh api --method PUT repos/OWNER/REPO/pages \
  --input - <<< '{
  "source": {
    "branch": "main",
    "path": "/"
  }
}'

# Add main branch to allowed deployment branches
gh api --method POST repos/OWNER/REPO/environments/github-pages/deployment-branch-policies \
  --input - <<< '{
  "name": "main"
}'
```

Replace `OWNER` and `REPO` with your GitHub username and repository name.

### Continuous Integration

The GitHub Actions workflow will:
1. Build the project
2. Run accessibility tests
3. Generate test reports
4. Deploy to GitHub Pages automatically

You can view deployment status in the **Actions** tab of the repository.

## Contributing

Contributions are welcome! Please ensure all code adheres to our accessibility standards and passes the existing tests.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes and run tests
4. Submit a pull request

## License

This project is licensed under the ISC License - see the LICENSE file for details.

## Acknowledgments

- Built with a focus on accessibility best practices
- Tested with NVDA, VoiceOver, and various browsers
- Special thanks to the a11y community for guidance and standards