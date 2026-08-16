# React Native Flip Card Implementation

This directory contains the React Native implementation of the flip card component, along with examples and utilities.

## Directory Structure

- `/components/flip-card/` - Core flip card component implementation
- `/examples/mortgage-calculator/` - Example mortgage calculator application using the flip card
- `/types/` - Shared TypeScript definitions
- `/utils/` - Shared utilities and helper functions

## Getting Started

To use the flip card component in your React Native project:

1. Import the FlipCard component:
   ```tsx
   import { FlipCard } from './components/flip-card';
   ```

2. Use it in your component:
   ```tsx
   <FlipCard
     frontContent={<YourFrontComponent />}
     backContent={<YourBackComponent />}
   />
   ```

See the examples directory for more detailed usage examples.

