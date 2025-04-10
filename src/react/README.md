# React Flip Card Components

A comprehensive React component library for creating accessible, interactive flip cards with TypeScript support.

## Features

- **TypeScript Support**: Fully typed components with comprehensive type definitions
- **Two Implementation Options**:
  - Functional component with hooks (`FlipCard`)
  - Class-based component with advanced features (`UniversalFlipCard`)
- **Custom Hook**: `useFlipCard` for building custom implementations
- **Accessibility**: WCAG 2.1 AA compliant with proper ARIA attributes
- **Device Adaptation**: Automatically adapts to touch, mouse, and keyboard inputs
- **Voice Control**: Optional voice command support (UniversalFlipCard only)
- **User Preferences**: Respects reduced motion and color scheme preferences

## Installation

```bash
npm install @your-org/flip-card-react
```

## Usage

### Functional Component

```tsx
import { FlipCard } from '@your-org/flip-card-react';

const MyComponent = () => (
  <FlipCard
    frontTriggerText="View Details"
    backTriggerText="Back"
    frontContent={
      <div>
        <h2>Front Content</h2>
        <p>This is the front of the card</p>
      </div>
    }
    backContent={
      <div>
        <h2>Back Content</h2>
        <p>This is the back of the card</p>
      </div>
    }
    onFlip={(isFlipped) => console.log('Card flipped:', isFlipped)}
  />
);
```

### Class-Based Component (Universal)

```tsx
import { UniversalFlipCard } from '@your-org/flip-card-react';

const MyComponent = () => (
  <UniversalFlipCard
    frontTriggerText="Show More"
    backTriggerText="Return"
    enableVoiceControl={true}
    voiceCommands={{
      flip: ['flip', 'turn', 'show more'],
      flipBack: ['back', 'return', 'hide']
    }}
    frontContent={<div>Front content...</div>}
    backContent={<div>Back content...</div>}
  />
);
```

### Custom Hook

```tsx
import { useFlipCard } from '@your-org/flip-card-react';

const MyCustomCard = () => {
  const {
    isFlipped,
    flipCard,
    toggleFlip,
    containerProps,
    frontTriggerProps,
    backTriggerProps
  } = useFlipCard(false);
  
  return (
    <div {...containerProps}>
      <div className="flip-card-inner">
        <div className="flip-card-front">
          {/* Your front content */}
          <button {...frontTriggerProps}>Show More</button>
        </div>
        <div className="flip-card-back">
          {/* Your back content */}
          <button {...backTriggerProps}>Back</button>
        </div>
      </div>
    </div>
  );
};
```

## Component Props

### FlipCard Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | Auto-generated | Optional ID for the card element |
| `className` | `string` | `''` | Custom classes to apply to the card |
| `variant` | `'standard' \| 'mini' \| 'tall'` | `'standard'` | Card size variant |
| `initialFlipped` | `boolean` | `false` | Whether the card starts flipped |
| `frontTriggerText` | `string` | `'View Details'` | Text for the front trigger button |
| `backTriggerText` | `string` | `'Back'` | Text for the back trigger button |
| `frontTriggerAriaLabel` | `string` | `'View more details'` | Aria-label for front trigger |
| `backTriggerAriaLabel` | `string` | `'Return to front'` | Aria-label for back trigger |
| `announceToScreenReader` | `boolean` | `true` | Whether to announce state changes |
| `frontToBackAnnouncement` | `string` | Auto-generated | Custom announcement when flipping to back |
| `backToFrontAnnouncement` | `string` | Auto-generated | Custom announcement when flipping to front |
| `frontContent` | `React.ReactNode` | Required | Content for the front side |
| `backContent` | `React.ReactNode` | Required | Content for the back side |
| `onFlip` | `(isFlipped: boolean) => void` | - | Callback when card is flipped |

### UniversalFlipCard Props

Includes all FlipCard props plus:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `enableHover` | `boolean` | `true` | Whether to enable hover effects |
| `disableAutoFocus` | `boolean` | `false` | Whether to disable auto-focus |
| `enableVoiceControl` | `boolean` | `false` | Whether to enable voice controls |
| `voiceCommands` | `{ flip: string[], flipBack: string[] }` | Default commands | Custom voice commands |

## TypeScript Support

The package includes comprehensive TypeScript definitions for all components, props, and hooks.

```tsx
import { 
  FlipCardProps, 
  UniversalFlipCardProps, 
  UseFlipCardReturn,
  DeviceCapabilities,
  VoiceCommands 
} from '@your-org/flip-card-react';
```

## CSS Dependencies

These components require the flip-card CSS files to be included in your project:

```html
<link rel="stylesheet" href="flip-card.min.css">
<link rel="stylesheet" href="universal-flip-card.min.css">
```

Or import them in your JavaScript/TypeScript file:

```js
import '@your-org/flip-card-react/dist/css/flip-card.min.css';
import '@your-org/flip-card-react/dist/css/universal-flip-card.min.css';
```

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- IE11 with appropriate polyfills

## Accessibility Features

- Full keyboard navigation (Tab, Enter, Space, Escape)
- ARIA attributes for screen readers
- Focus management between card states
- Live region announcements for state changes
- Reduced motion support
- Color contrast compliance

## License

ISC