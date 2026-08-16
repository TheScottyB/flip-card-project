/**
 * Flip Animation Utilities
 * 
 * A collection of utilities for creating flip card animations in React Native
 */

import { Animated, EasingFunction, Easing } from 'react-native';
import theme from '../../config/theme';
import constants from '../../config/constants';

/**
 * Flip directions
 */
export type FlipDirection = 'horizontal' | 'vertical';

/**
 * Flip axis based on direction
 */
export const FlipAxis = {
  horizontal: 'rotateY',
  vertical: 'rotateX',
} as const;

/**
 * Animation config for flip animations
 */
export interface FlipAnimationConfig {
  duration?: number;
  friction?: number;
  tension?: number;
  speed?: number;
  bounciness?: number;
  useNativeDriver?: boolean;
  easing?: EasingFunction;
  onComplete?: () => void;
}

/**
 * Default animation config
 */
const defaultFlipConfig: FlipAnimationConfig = {
  friction: theme.animations.flip.friction,
  tension: theme.animations.flip.tension,
  speed: theme.animations.flip.speed,
  bounciness: theme.animations.flip.bounciness,
  useNativeDriver: true,
};

/**
 * Creates a flip animation
 * 
 * @param flipAnimation The Animated.Value to animate
 * @param toValue The target value (0 or 1)
 * @param config Animation configuration
 * @returns An Animated.CompositeAnimation that can be started
 */
export const createFlipAnimation = (
  flipAnimation: Animated.Value,
  toValue: number,
  config?: FlipAnimationConfig
): Animated.CompositeAnimation => {
  // Merge default config with provided config
  const animConfig = {
    ...defaultFlipConfig,
    ...config,
  };
  
  // Extract callback to run after animation
  const { onComplete, ...springConfig } = animConfig;
  
  // Create spring animation
  const animation = Animated.spring(
    flipAnimation,
    {
      toValue,
      ...springConfig,
    }
  );
  
  // If callback provided, use sequence with delay to ensure animation completes
  if (onComplete) {
    return Animated.sequence([
      animation,
      Animated.delay(0), // This ensures the animation completes before calling onComplete
      Animated.timing(new Animated.Value(0), {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      }),
    ]);
  }
  
  return animation;
};

/**
 * Creates a timing-based flip animation
 * 
 * @param flipAnimation The Animated.Value to animate
 * @param toValue The target value (0 or 1)
 * @param config Animation configuration
 * @returns An Animated.CompositeAnimation that can be started
 */
export const createTimingFlipAnimation = (
  flipAnimation: Animated.Value,
  toValue: number,
  config?: FlipAnimationConfig
): Animated.CompositeAnimation => {
  // Default duration from constants
  const duration = config?.duration || constants.ANIMATION.FLIP_DURATION;
  
  // Extract callback to run after animation
  const { onComplete, ...timingConfig } = config || {};
  
  // Create timing animation
  const animation = Animated.timing(
    flipAnimation,
    {
      toValue,
      duration,
      easing: config?.easing || Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: true,
      ...timingConfig,
    }
  );
  
  // If callback provided, use sequence with delay to ensure animation completes
  if (onComplete) {
    return Animated.sequence([
      animation,
      Animated.delay(0),
      Animated.timing(new Animated.Value(0), {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      }),
    ]);
  }
  
  return animation;
};

/**
 * Creates interpolation functions for front and back of a flip card
 * 
 * @param flipAnimation The Animated.Value controlling the flip
 * @param direction The direction of the flip ('horizontal' or 'vertical')
 * @returns Object with front and back interpolation functions
 */
export const createFlipInterpolations = (
  flipAnimation: Animated.Value,
  direction: FlipDirection = 'horizontal'
) => {
  const axis = FlipAxis[direction];
  const rotationDirection = direction === 'vertical' ? '-' : '';
  
  // Create front interpolation
  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [`0deg`, `${rotationDirection}180deg`],
    extrapolate: 'clamp',
  });
  
  // Create back interpolation
  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [`${rotationDirection}180deg`, `0deg`],
    extrapolate: 'clamp',
  });
  
  // Return interpolations and transform styles
  return {
    frontInterpolate,
    backInterpolate,
    frontAnimatedStyle: {
      transform: [
        { perspective: 1000 },
        { [axis]: frontInterpolate },
      ],
    },
    backAnimatedStyle: {
      transform: [
        { perspective: 1000 },
        { [axis]: backInterpolate },
      ],
    },
  };
};

/**
 * Creates a complete flip card controller
 * 
 * @param initialFlipped Whether the card should start flipped (defaults to false)
 * @param direction The direction of the flip ('horizontal' or 'vertical')
 * @returns A controller object with methods and values to manage the flip animation
 */
export const useFlipCardController = (
  initialFlipped: boolean = false,
  direction: FlipDirection = 'horizontal'
) => {
  // Create animation value
  const flipAnimation = new Animated.Value(initialFlipped ? 1 : 0);
  
  // Get interpolations
  const interpolations = createFlipInterpolations(flipAnimation, direction);
  
  // Create controller object
  return {
    flipAnimation,
    isFlipped: initialFlipped,
    ...interpolations,
    flip: (toFlipped: boolean, config?: FlipAnimationConfig) => {
      return createFlipAnimation(
        flipAnimation,
        toFlipped ? 1 : 0,
        config
      );
    },
  };
};

/**
 * Helper to apply platform-specific backface visibility styles
 */
export const backfaceVisibilityStyle = theme.platformSpecific(
  { backfaceVisibility: 'hidden' },
  { backfaceVisibility: 'hidden', opacity: 1 }
);

export default {
  createFlipAnimation,
  createTimingFlipAnimation,
  createFlipInterpolations,
  useFlipCardController,
  backfaceVisibilityStyle,
};

