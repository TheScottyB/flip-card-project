# Flip Card Project

[![Deploy to GitHub Pages](https://github.com/TheScottyB/flip-card-project/actions/workflows/github-pages.yml/badge.svg)](https://github.com/TheScottyB/flip-card-project/actions/workflows/github-pages.yml)

An accessible, responsive flip card implementation with WCAG compliance. This project provides interactive card components with smooth animations and full keyboard, screen reader, and touch support.

## Demo

View the live demos on GitHub Pages:
- [Main Demo](https://thescottyb.github.io/flip-card-project/)
- [Multi-Card Gallery](https://thescottyb.github.io/flip-card-project/multi-card.html)
- [Contact Card Demo](https://thescottyb.github.io/flip-card-project/src/components/contact-card.html)

## Features

- **WCAG 2.1 AA Compliance**: Full screen reader support, keyboard navigation, and focus management
- **Responsive Design**: Works on all screen sizes
- **Multiple Card Variants**: Standard, mini, and tall card formats
- **CSS 3D Transforms**: Smooth flip animations with CSS
- **Touch Device Support**: Works with touch gestures on mobile devices
- **Reduced Motion Support**: Respects user's motion preference settings
- **Browser Compatibility**: Works across all modern browsers with appropriate fallbacks

## Usage

To use the flip card components in your project:

1. Include the required CSS and JavaScript files:
   ```html
   <link rel="stylesheet" href="dist/css/flip-card.min.css">
   <script src="dist/js/flip-card.min.js"></script>
   ```

2. Use the following HTML structure:
   ```html
   <div class="flip-card card-standard">
     <div class="flip-card-inner">
       <div class="flip-card-front">
         <!-- Front content -->
         <button class="flip-trigger">View More</button>
       </div>
       <div class="flip-card-back">
         <!-- Back content -->
         <button class="flip-trigger">Return</button>
       </div>
     </div>
   </div>
   ```

## Getting Started

### Prerequisites
- Node.js and npm

### Installation
1. Clone the repository
   ```bash
   git clone https://github.com/TheScottyB/flip-card-project.git
   cd flip-card-project
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Build the project
   ```bash
   npm run build:prod
   ```

## Development

- `npm run build` - Copy source files to distribution folder
- `npm run minify` - Minify CSS and JavaScript files
- `npm run build:prod` - Build and minify for production

## Testing

This project includes extensive accessibility testing:

- `npm run test` - Run all tests
- `npm run test:a11y` - Run accessibility tests
- `npm run test:report` - Generate HTML report of tests
- `npm run test:ci` - Run tests with coverage in CI environment

## Accessibility Features

- Keyboard navigation (Tab, Enter, Space, Escape)
- ARIA attributes for screen readers
- Focus management between card sides
- Live region announcements for state changes
- Reduced motion support
- Color contrast compliance
- Progressive enhancement

## License

This project is licensed under the ISC License - see the LICENSE file for details.

## Acknowledgments

- Built with a focus on accessibility best practices
- Tested with NVDA, VoiceOver, and various browsers
- Special thanks to the a11y community for guidance and standards