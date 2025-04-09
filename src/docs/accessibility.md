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