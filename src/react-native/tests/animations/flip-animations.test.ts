/**
 * Tests for flip animation utilities
 */

import { Animated } from 'react-native';
import { 
  createFlipAnimation, 
  createFlipInterpolations, 
  FlipDirection,
} from '../../utils/animations/flip-animations';
import { mockAnimatedSpring } from '../utils/test-utils';

describe('Flip Animation Utilities', () => {
  // Mock Animated.spring
  const { mockStart } = mockAnimatedSpring();
  
  describe('createFlipAnimation', () => {
    it('creates a flip animation with default config', () => {
      // Create a test Animated.Value
      const animation = new Animated.Value(0);
      
      // Create the flip animation
      const flipAnimation = createFlipAnimation(animation, 1);
      
      // Start the animation
      flipAnimation.start();
      
      // Check that Animated.spring was called correctly
      expect(Animated.spring).toHaveBeenCalledWith(
        animation,
        expect.objectContaining({
          toValue: 1,
          useNativeDriver: true,
        })
      );
      
      // Check that start was called
      expect(mockStart).toHaveBeenCalled();
    });
    
    it('handles the callback properly', () => {
      // Create a test Animated.Value
      const animation = new Animated.Value(0);
      
      // Create a mock callback
      const callback = jest.fn();
      
      // Create the flip animation with callback
      const flipAnimation = createFlipAnimation(animation, 1, {
        onComplete: callback,
      });
      
      // Start the animation
      flipAnimation.start();
      
      // Check that the callback was called
      expect(callback).toHaveBeenCalled();
    });
  });
  
  describe('createFlipInterpolations', () => {
    it('creates correct interpolations for horizontal direction', () => {
      // Create a test Animated.Value
      const animation = new Animated.Value(0);
      
      // Create the interpolations
      const interpolations = createFlipInterpolations(animation, 'horizontal');
      
      // Check front and back interpolations
      expect(interpolations.frontInterpolate).toBeDefined();
      expect(interpolations.backInterpolate).toBeDefined();
      
      // Check animation styles
      expect(interpolations.frontAnimatedStyle).toEqual({
        transform: [
          { perspective: 1000 },
          { rotateY: interpolations.frontInterpolate },
        ],
      });
      
      expect(interpolations.backAnimatedStyle).toEqual({
        transform: [
          { perspective: 1000 },
          { rotateY: interpolations.backInterpolate },
        ],
      });
    });
    
    it('creates correct interpolations for vertical direction', () => {
      // Create a test Animated.Value
      const animation = new Animated.Value(0);
      
      // Create the interpolations
      const interpolations = createFlipInterpolations(animation, 'vertical');
      
      // Check front and back interpol

