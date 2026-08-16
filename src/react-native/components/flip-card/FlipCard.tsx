/**
 * FlipCard Component
 * 
 * A card component that can be flipped to reveal content on the back
 */

import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { FlipCardProps, FlipCardRef } from './types';
import { Card } from '../ui';
import { 
  FlipAnimations, 
  FlipDirection, 
} from '../../utils/animations';
import theme from '../../config/theme';
import constants from '../../config/constants';
import { FlipCardProvider } from './context';

/**
 * FlipCard Component
 * 
 * A card component that flips to reveal content on the back side.
 * Supports both controlled and uncontrolled usage.
 */
const FlipCard = forwardRef<FlipCardRef, FlipCardProps>((
  {
    front,
    back,
    width = theme.cardTheme.width,
    height = width * theme.cardTheme.aspectRatio,
    flipped: controlledFlipped,
    initialSide = 'front',
    flipDirection = 'horizontal',
    isFlipping: controlledIsFlipping,
    disableFlip = false,
    animationConfig,
    onFlip,
    onFlipStart,
    onFlipEnd,
    platformStyle,
    containerStyle,
    style,
    testID,
    accessibilityLabel,
    accessibilityHint,
  }, 
  ref
) => {
  // Whether the component is controlled externally
  const isControlled = controlledFlipped !== undefined;
  
  // Local state for uncontrolled component
  const [flippedState, setFlippedState] = useState(initialSide === 'back');
  const [isFlippingState, setIsFlippingState] = useState(false);
  
  // Determine the actual flipped state
  const isFlipped = isControlled ? controlledFlipped : flippedState;
  const isFlipping = controlledIsFlipping !== undefined ? controlledIsFlipping : isFlippingState;
  
  // Animation value
  const flipAnimation = useRef(new Animated.Value(isFlipped ? 1 : 0)).current;
  
  // Get interpolations for front and back
  const { 
    frontInterpolate, 
    backInterpolate, 
    frontAnimatedStyle, 
    backAnimatedStyle,
  } = FlipAnimations.createFlipInterpolations(flipAnimation, flipDirection);
  
  // Update animation value when controlled prop changes
  useEffect(() => {
    if (isControlled) {
      flipCard(controlledFlipped);
    }
  }, [controlledFlipped]);
  
  // Handle the flip
  const flipCard = (toFlipped: boolean) => {
    if (disableFlip || isFlipping) return;
    
    // Set flipping state
    setIsFlippingState(true);
    
    // Call onFlipStart callback
    if (onFlipStart) {
      onFlipStart(toFlipped);
    }
    
    // Set up animation configuration
    const config = {
      friction: animationConfig?.friction || theme.animations.flip.friction,
      tension: animationConfig?.tension || theme.animations.flip.tension,
      speed: animationConfig?.speed || theme.animations.flip.speed,
      bounciness: animationConfig?.bounciness || theme.animations.flip.bounciness,
      duration: animationConfig?.duration || constants.ANIMATION.FLIP_DURATION,
      onComplete: () => {
        setIsFlippingState(false);
        if (onFlipEnd) {
          onFlipEnd(toFlipped);
        }
      },
    };
    
    // Create and start animation
    const animation = animationConfig?.useTiming
      ? FlipAnimations.createTimingFlipAnimation(flipAnimation, toFlipped ? 1 : 0, config)
      : FlipAnimations.createFlipAnimation(flipAnimation, toFlipped ? 1 : 0, config);
      
    animation.start();
    
    // Update state if not controlled
    if (!isControlled) {
      setFlippedState(toFlipped);
    }
    
    // Call onFlip callback
    if (onFlip) {
      onFlip(toFlipped);
    }
  };
  
  // Toggle the flip state
  const toggleFlip = () => {
    flipCard(!isFlipped);
  };
  
  // Platform-specific styles
  const platformSpecificStyle = platformStyle
    ? theme.platformSpecific(platformStyle.ios, platformStyle.android)
    : {};
    
  // Expose imperative methods via ref
  useImperativeHandle(ref, () => ({
    flip: (toFlipped?: boolean) => {
      flipCard(toFlipped !== undefined ? toFlipped : !isFlipped);
    },
    isFlipped: () => isFlipped,
    isFlipping: () => isFlipping,
  }));
  
  return (
    <FlipCardProvider
      isFlipped={isFlipped}
      isFlipping={isFlipping}
      flipCard={flipCard}
      flipDirection={flipDirection}
    >
      <View 
        style={[
          styles.container, 
          { width, height },
          containerStyle,
          platformSpecificStyle,
        ]}
        testID={testID}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
      >
        {/* Back Side */}
        <Animated.View 
          style={[
            styles.cardContainer,
            { width, height, zIndex: isFlipped ? 1 : 0 },
            backAnimatedStyle,
          ]}
          pointerEvents={isFlipped ? 'auto' : 'none'}
        >
          <Card
            {...back}
            style={[
              back.style,
              styles.backCard,
              FlipAnimations.backfaceVisibilityStyle,
            ]}
            onPress={disableFlip ? back.onPress : (back.onPress || toggleFlip)}
          >
            {back.content}
          </Card>
        </Animated.View>
        
        {/* Front Side */}
        <Animated.View 
          style={[
            styles.cardContainer,
            { width, height, zIndex: isFlipped ? 0 : 1 },
            frontAnimatedStyle,
          ]}
          pointerEvents={isFlipped ? 'none' : 'auto'}
        >
          <Card
            {...front}
            style={[
              front.style,
              styles.frontCard,
              FlipAnimations.backfaceVisibilityStyle,
            ]}
            onPress={disableFlip ? front.onPress : (front.onPress || toggleFlip)}
          >
            {front.content}
          </Card>
        </Animated.View>
      </View>
    </FlipCardProvider>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  frontCard: {
    backfaceVisibility: 'hidden',
  },
  backCard: {
    backfaceVisibility: 'hidden',
  },
});

// Add display name for debugging
FlipCard.displayName = 'FlipCard';

export default FlipCard;

