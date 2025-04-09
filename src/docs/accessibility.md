# Accessibility Guidelines for Flip Card Components

## Overview
The Flip Card components are built with accessibility as a priority to ensure they are usable by everyone, including people with disabilities. This document outlines the accessibility features implemented and guidelines for maintaining accessibility when extending the components.

## Implemented Accessibility Features

### Keyboard Navigation
- All interactive elements are focusable with the Tab key
- Enter/Space keys trigger flip actions
- Escape key returns cards to front state
- Focus is properly managed during card transitions

### Screen Reader Support
- ARIA attributes used to communicate state changes:
  - `aria-expanded` indicates when a card is flipped
  - `aria-pressed` indicates button state
  - `aria-controls` establishes relationships between buttons and card faces
- Live regions announce card state changes
- Proper heading hierarchy for structured content
- Descriptive button labels with clear purpose

### User Preferences
- Respects `prefers-reduced-motion` for users who prefer minimal animation
- High contrast colors used for text and important elements
- Adequate text size and spacing for readability

### Focus Management
- Focus trap within flipped cards to improve navigation
- Visible focus indicators for keyboard users
- Focus properly returns to triggering elements when appropriate

## Accessibility Checklist

When extending or modifying flip card components, ensure the following:

- [ ] All interactive elements are keyboard accessible
- [ ] Cards can be flipped using keyboard alone
- [ ] ARIA attributes are properly set and updated
- [ ] Color contrast meets WCAG AA standard (4.5:1 for normal text)
- [ ] Text remains readable when zoomed to 200%
- [ ] Animations respect reduced motion preferences
- [ ] Screen reader announcements are clear and descriptive
- [ ] Focus states are visible and logical
- [ ] Cards function even when CSS or JavaScript partially fails

## Testing Accessibility

The project includes automated accessibility tests using:
- Axe for automated WCAG testing
- Puppeteer for simulating keyboard interactions
- Jest for test automation

To run the accessibility tests:
```
npm run test:a11y
```

For a complete accessibility audit report:
```
npm run test:report
```

## Resources for Learning More
- [WAI-ARIA Authoring Practices](https://www.w3.org/TR/wai-aria-practices/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Inclusive Components](https://inclusive-components.design/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)