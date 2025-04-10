# Universal Flip Card Component

An adaptive, device-agnostic flip card component that provides optimal user experience across all devices while maintaining full feature parity.

## Key Features

- **Every Device First** approach (not just mobile-first)
- Works with any input method (touch, mouse, keyboard, voice)
- Adapts to device capabilities without reducing features
- Uses modern CSS (Container Queries, feature queries, etc.)
- Fully accessible with ARIA support and screen reader announcements
- Respects user preferences (reduced motion, color scheme, etc.)

## Live Demo

Try the [Universal Flip Card Demo](universal-demo.html) to see the component in action and test it with different device simulations.

## Getting Started

### 1. Include the Required Files

```html
<link rel="stylesheet" href="src/styles/universal-flip-card.css">
<script src="src/js/universal-flip-card.js"></script>
```

### 2. Create the HTML Structure

```html
<div class="universal-card" tabindex="0" aria-label="Product card">
  <div class="universal-card-inner">
    <!-- Front Side -->
    <div class="universal-card-front">
      <div class="card-content">
        <h2>Card Title</h2>
        <p>Front side content goes here...</p>
        <button class="flip-trigger">View Details</button>
      </div>
    </div>
    
    <!-- Back Side -->
    <div class="universal-card-back">
      <div class="card-content">
        <h2>Card Details</h2>
        <p>Back side content goes here...</p>
        <button class="flip-trigger">Go Back</button>
      </div>
    </div>
  </div>
</div>
```

### 3. Initialize the Card

The cards will be automatically initialized on page load. For custom configuration:

```javascript
// Single card
const card = new UniversalFlipCard('#my-card', {
  enableHover: true,
  announceToScreenReader: true
});

// All cards
const cards = UniversalFlipCard.initAll();
```

## Core Design Principles

### 1. Every Device First

This component adapts to device capabilities rather than screen sizes. It provides optimized experiences for different input methods while maintaining the same features.

### 2. Capability Detection

The component detects device capabilities like touch support, pointer precision, and hover ability to provide the best experience for the current device.

### 3. Responsive Content

Content layout adapts using Container Queries, ensuring optimal presentation regardless of the card's size.

### 4. User Preference Respect

The component respects user preferences like reduced motion, color scheme (light/dark), and high contrast settings.

### 5. Full Accessibility

Complete keyboard navigation, ARIA attributes, and screen reader announcements ensure accessibility for all users.

## Advanced Customization

### CSS Custom Properties

Customize the card appearance with these CSS custom properties:

```css
:root {
  --card-max-width: 400px;
  --card-height: clamp(320px, 60vh, 450px);
  --card-border-radius: 1rem;
  --flip-duration: 0.6s;
  --flip-timing-function: cubic-bezier(0.175, 0.885, 0.32, 1.275);
  --card-bg-front: #ffffff;
  --card-bg-back: #ffffff;
  --card-shadow: 0 5px 15px rgba(0,0,0,0.1);
  --card-focus-ring: 0 0 0 3px rgba(59, 130, 246, 0.5);
  --card-padding: 1.5rem;
  --touch-target-size: 44px;
}
```

### JavaScript Options

```javascript
const card = new UniversalFlipCard('#my-card', {
  enableHover: true,           // Enable/disable hover flipping
  announceToScreenReader: true, // Enable/disable screen reader announcements
  disableAutoFocus: false,      // Disable automatic focus management
  customFrontTriggerLabel: "View details", // Custom ARIA label for front trigger
  customBackTriggerLabel: "Return to front"  // Custom ARIA label for back trigger
});
```

### Methods

```javascript
// Programmatically flip the card
card.flip(true);  // Flip to back
card.flip(false); // Flip to front

// Change input method simulation
card.setInputMethod('touch'); // Options: 'touch', 'mouse', 'keyboard'

// Toggle hover behavior
card.setHoverEnabled(false);
```

### Events

```javascript
card.addEventListener('cardFlip', (e) => {
  console.log('Card flipped:', e.detail.isFlipped);
});
```

## Browser Support

The component is designed for modern browsers that support:
- CSS Grid and Flexbox
- CSS Custom Properties
- Container Queries (or uses fallback layout)
- 3D transforms

Legacy browsers receive a functional but simplified experience.

## License

MIT License