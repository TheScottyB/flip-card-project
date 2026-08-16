# React Native Components Migration Plan

This document outlines the plan for migrating components, utilities, and resources from the original Expo Mortgage Calculator project to the new flip-card-project structure.

## 1. Directory Structure

Create the following directory structure to organize resources and components:

```
/src/react-native/
  /assets/
    /fonts/
    /images/
  /utils/
    /animations/
    /calculations/
    /testing/
  /tests/
    /components/
    /integration/
    /fixtures/
  /config/
    - theme.ts
    - constants.ts
  /components/         (already exists)
    /flip-card/        (already exists)
    /ui/
      - Button.tsx
      - Input.tsx
      - Card.tsx
  /examples/           (already exists)
    /mortgage-calculator/ (already exists)
```

## 2. Components to Migrate

### 2.1 Core Components

| Component | Source Location | Destination | Adjustments Needed |
|-----------|----------------|-------------|-------------------|
| FlipCard | `/Users/scottybe/Desktop/expo-sb/project/MortgageCalculator/src/components/MortgageFlipCard` | `/src/react-native/components/flip-card` | ✅ Already migrated |
| MortgageCalculator | `/Users/scottybe/Desktop/expo-sb/project/MortgageCalculator/src/App.js` | `/src/react-native/examples/mortgage-calculator` | ✅ Already migrated |

### 2.2 UI Components

| Component | Source Location | Destination | Adjustments Needed |
|-----------|----------------|-------------|-------------------|
| Button | N/A (Extract from MortgageFlipCard) | `/src/react-native/components/ui/Button.tsx` | Create a reusable Button component based on the existing styles |
| Input | N/A (Extract from MortgageFlipCard) | `/src/react-native/components/ui/Input.tsx` | Create a reusable Input component with validation |
| Card | N/A (Extract from MortgageFlipCard) | `/src/react-native/components/ui/Card.tsx` | Create a basic Card component (non-animated) |

## 3. Utilities to Migrate

### 3.1 Animation Utilities

| Utility | Source Location | Destination | Adjustments Needed |
|---------|----------------|-------------|-------------------|
| Animation Helpers | `/Users/scottybe/Desktop/expo-sb/project/MortgageCalculator/src/components/MortgageFlipCard/index.tsx` (extract from component) | `/src/react-native/utils/animations/flip-animations.ts` | Extract animation logic into reusable functions |
| Transition Helpers | N/A (create new) | `/src/react-native/utils/animations/transitions.ts` | Create standard transitions for components |

### 3.2 Calculation Utilities

| Utility | Source Location | Destination | Adjustments Needed |
|---------|----------------|-------------|-------------------|
| Mortgage Calculations | `/Users/scottybe/Desktop/expo-sb/project/MortgageCalculator/src/components/MortgageFlipCard/index.tsx` (extract from component) | `/src/react-native/utils/calculations/mortgage.ts` | ✅ Already migrated to examples/mortgage-calculator/utils.ts |
| Number Formatting | N/A (extract from existing) | `/src/react-native/utils/calculations/formatting.ts` | Create standardized number formatting utilities |

### 3.3 Testing Utilities

| Utility | Source Location | Destination | Adjustments Needed |
|---------|----------------|-------------|-------------------|
| Component Test Helpers | N/A (create new) | `/src/react-native/utils/testing/component-helpers.ts` | Create test utilities for components |
| Mock Data | N/A (create new) | `/src/react-native/tests/fixtures/mortgage-data.ts` | Create sample data for tests |

## 4. Assets to Migrate

### 4.1 Themes and Styles

| Asset | Source Location | Destination | Adjustments Needed |
|-------|----------------|-------------|-------------------|
| Theme Constants | `/Users/scottybe/Desktop/expo-sb/project/MortgageCalculator/src/components/MortgageFlipCard/index.tsx` (extract style constants) | `/src/react-native/config/theme.ts` | Create standardized theme with colors, spacing, and typography |
| Style Utils | N/A (create new) | `/src/react-native/utils/styles.ts` | Create utilities for style management |

### 4.2 Resources

| Asset | Source Location | Destination | Adjustments Needed |
|-------|----------------|-------------|-------------------|
| Images | `/Users/scottybe/Desktop/expo-sb/project/MortgageCalculator/assets` (if any) | `/src/react-native/assets/images` | Update import paths |
| Fonts | `/Users/scottybe/Desktop/expo-sb/project/MortgageCalculator/assets` (if any) | `/src/react-native/assets/fonts` | Update font loading code |

## 5. Tests to Migrate

### 5.1 Component Tests

| Test | Source Location | Destination | Adjustments Needed |
|------|----------------|-------------|-------------------|
| FlipCard Tests | N/A (create new) | `/src/react-native/tests/components/FlipCard.test.tsx` | Create tests for the FlipCard component |
| MortgageCalculator Tests | N/A (create new) | `/src/react-native/tests/components/MortgageCalculator.test.tsx` | Create tests for the MortgageCalculator component |

### 5.2 Integration Tests

| Test | Source Location | Destination | Adjustments Needed |
|------|----------------|-------------|-------------------|
| Form Submission | N/A (create new) | `/src/react-native/tests/integration/mortgage-form-submission.test.tsx` | Test form validation and submission |
| Card Flip Animation | N/A (create new) | `/src/react-native/tests/integration/flip-card-animation.test.tsx` | Test card flip animations |

## 6. Migration Execution Plan

### 6.1 Phase 1: Setup (Completed)

- ✅ Create core directory structure
- ✅ Migrate FlipCard component
- ✅ Migrate MortgageCalculator example

### 6.2 Phase 2: Utilities and Config

1. Create theme and constants files
2. Extract animation utilities
3. Move/create calculation utilities
4. Create testing utilities

### 6.3 Phase 3: UI Components

1. Extract reusable Button component
2. Extract reusable Input component
3. Create Card component

### 6.4 Phase 4: Assets

1. Copy and organize images
2. Copy and organize fonts
3. Update asset references

### 6.5 Phase 5: Tests

1. Create component tests
2. Create integration tests
3. Set up test fixtures

## 7. Dependencies to Update

- React Native version consistency
- TypeScript configuration
- Test framework setup (Jest)
- Animation libraries (if any)

## 8. Final Validation

- Ensure all components render correctly
- Verify animations work on iOS and Android
- Run all tests
- Check performance metrics

## Notes

- Keep backwards compatibility where possible
- Document API changes
- Use TypeScript throughout for better maintainability
- Follow the established style guide and component patterns

