import { Animated, Easing } from 'react-native';

/**
 * Utility functions for animations
 */

/**
 * Spring animation configuration with sensible defaults
 */
export const springConfig = {
  friction: 6,      // Lower friction means more springy/bouncy
  tension: 12,      // Controls the speed/force
  speed: 14,        // Overall speed of the animation
  bounciness: 0,    // Amount of bounce (0 = no bounce)
  useNativeDriver: true,
};

/**
 * Timing animation configuration with sensible defaults
 */
export const timingConfig = {
  duration: 400,
  easing: Easing.bezier(0.25, 0.1, 0.25, 1), // Standard easing curve
  useNativeDriver: true,
};

/**
 * Creates a flip animation using Animated.spring
 * @param flipAnimation The Animated.Value to animate
 * @param isFlipped Current flipped state
 * @param onComplete Optional callback when animation completes
 */
export const createFlipAnimation = (
  flipAnimation: Animated.Value,
  isFlipped: boolean,
  onComplete?: () => void
): Animated.CompositeAnimation => {
  return Animated.spring(
    flipAnimation,
    {
      toValue: isFlipped ? 0 : 1,
      ...springConfig,
    }
  );
};

/**
 * Creates a fade animation using Animated.timing
 * @param fadeAnimation The Animated.Value to animate
 * @param toValue Target value (0 = transparent, 1 = opaque)
 */
export const createFadeAnimation = (
  fadeAnimation: Animated.Value,
  toValue: number
): Animated.CompositeAnimation => {
  return Animated.timing(
    fadeAnimation,
    {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }
  );
};

