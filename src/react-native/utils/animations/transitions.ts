/**
 * Transition Animation Utilities
 * 
 * A collection of standard transition animations for React Native
 */

import { Animated, Easing, EasingFunction } from 'react-native';
import theme from '../../config/theme';
import constants from '../../config/constants';

/**
 * Base animation configuration
 */
export interface TransitionConfig {
  duration?: number;
  delay?: number;
  easing?: EasingFunction;
  useNativeDriver?: boolean;
  onComplete?: () => void;
}

/**
 * Fade animation configuration
 */
export interface FadeConfig extends TransitionConfig {
  from?: number;
  to?: number;
}

/**
 * Scale animation configuration
 */
export interface ScaleConfig extends TransitionConfig {
  from?: number;
  to?: number;
}

/**
 * Slide animation configuration
 */
export interface SlideConfig extends TransitionConfig {
  from?: number;
  to?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}

/**
 * Default configuration for transitions
 */
const defaultConfig: TransitionConfig = {
  duration: 300,
  delay: 0,
  easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  useNativeDriver: true,
};

/**
 * Helper to process animation config and handle callback
 */
const processConfig = (
  animation: Animated.CompositeAnimation,
  config?: TransitionConfig
): Animated.CompositeAnimation => {
  if (!config?.onComplete) {
    return animation;
  }
  
  return Animated.sequence([
    animation,
    Animated.delay(0),
    Animated.timing(new Animated.Value(0), {
      toValue: 0,
      duration: 0,
      useNativeDriver: true,
    }),
  ]);
};

/**
 * Creates a fade animation
 * 
 * @param value The Animated.Value to animate
 * @param config Animation configuration
 * @returns An Animated.CompositeAnimation that can be started
 */
export const createFadeAnimation = (
  value: Animated.Value,
  config?: FadeConfig
): Animated.CompositeAnimation => {
  const mergedConfig = {
    ...defaultConfig,
    duration: theme.animations.fade.duration,
    ...config,
  };
  
  const { from = 0, to = 1, onComplete, ...timingConfig } = mergedConfig;
  
  // Reset value to starting point
  value.setValue(from);
  
  const animation = Animated.timing(
    value,
    {
      toValue: to,
      ...timingConfig,
    }
  );
  
  return processConfig(animation, { onComplete });
};

/**
 * Creates a scale animation
 * 
 * @param value The Animated.Value to animate
 * @param config Animation configuration
 * @returns An Animated.CompositeAnimation that can be started
 */
export const createScaleAnimation = (
  value: Animated.Value,
  config?: ScaleConfig
): Animated.CompositeAnimation => {
  const mergedConfig = {
    ...defaultConfig,
    duration: theme.animations.scale.duration,
    ...config,
  };
  
  const { 
    from = theme.animations.scale.min, 
    to = theme.animations.scale.max, 
    onComplete,
    ...timingConfig
  } = mergedConfig;
  
  // Reset value to starting point
  value.setValue(from);
  
  const animation = Animated.timing(
    value,
    {
      toValue: to,
      ...timingConfig,
    }
  );
  
  return processConfig(animation, { onComplete });
};

/**
 * Creates a slide animation
 * 
 * @param value The Animated.Value to animate
 * @param config Animation configuration
 * @returns An Animated.CompositeAnimation that can be started
 */
export const createSlideAnimation = (
  value: Animated.Value,
  config?: SlideConfig
): Animated.CompositeAnimation => {
  const mergedConfig = {
    ...defaultConfig,
    ...config,
  };
  
  const { 
    from = 100, 
    to = 0, 
    direction = 'up',
    onComplete,
    ...timingConfig
  } = mergedConfig;
  
  // Reset value to starting point
  value.setValue(from);
  
  const animation = Animated.timing(
    value,
    {
      toValue: to,
      ...timingConfig,
    }
  );
  
  return processConfig(animation, { onComplete });
};

/**
 * Creates a fade-in animation
 * 
 * @param value The Animated.Value to animate
 * @param config Animation configuration
 * @returns An Animated.CompositeAnimation that can be started
 */
export const fadeIn = (
  value: Animated.Value,
  config?: TransitionConfig
): Animated.CompositeAnimation => {
  return createFadeAnimation(value, { from: 0, to: 1, ...config });
};

/**
 * Creates a fade-out animation
 * 
 * @param value The Animated.Value to animate
 * @param config Animation configuration
 * @returns An Animated.CompositeAnimation that can be started
 */
export const fadeOut = (
  value: Animated.Value,
  config?: TransitionConfig
): Animated.CompositeAnimation => {
  return createFadeAnimation(value, { from: 1, to: 0, ...config });
};

/**
 * Creates a scale-in animation
 * 
 * @param value The Animated.Value to animate
 * @param config Animation configuration
 * @returns An Animated.CompositeAnimation that can be started
 */
export const scaleIn = (
  value: Animated.Value,
  config?: TransitionConfig
): Animated.CompositeAnimation => {
  return createScaleAnimation(value, { from: 0.8, to: 1, ...config });
};

/**
 * Creates a scale-out animation
 * 
 * @param value The Animated.Value to animate
 * @param config Animation configuration
 * @returns An Animated.CompositeAnimation that can be started
 */
export const scaleOut = (
  value: Animated.Value,
  config?: TransitionConfig
): Animated.CompositeAnimation => {
  return createScaleAnimation(value, { from: 1, to: 0.8, ...config });
};

/**
 * Creates a fade-in and scale-in combined animation
 * 
 * @param fadeValue The Animated.Value for fade
 * @param scaleValue The Animated.Value for scale
 * @param config Animation configuration
 * @returns An Animated.CompositeAnimation that can be started
 */
export const fadeInScale = (
  fadeValue: Animated.Value,
  scaleValue: Animated.Value,
  config?: TransitionConfig
): Animated.CompositeAnimation => {
  const fadeAnimation = createFadeAnimation(fadeValue, { from: 0, to: 1, ...config });
  const scaleAnimation = createScaleAnimation(scaleValue, { from: 0.8, to: 1, ...config });
  
  return Animated.parallel([fadeAnimation, scaleAnimation]);
};

export default {
  createFadeAnimation,
  createScaleAnimation,
  createSlideAnimation,
  fadeIn,
  fadeOut,
  scaleIn,
  scaleOut,
  fadeInScale,
};

