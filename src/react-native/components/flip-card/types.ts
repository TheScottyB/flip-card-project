/**
 * FlipCard Component Types
 * 
 * Type definitions for the FlipCard component
 */

import { ReactNode } from 'react';
import { 
  StyleProp, 
  ViewStyle, 
  TextStyle,
  GestureResponderEvent,
} from 'react-native';
import { 
  BaseComponentProps, 
  CardProps,
  PlatformSpecificProps,
} from '../../types/ui';
import { FlipDirection } from '../../utils/animations/flip-animations';

/**
 * FlipCard animation configuration
 */
export interface FlipCardAnimationConfig {
  /** Animation duration in ms */
  duration?: number;
  /** Animation friction (for spring animations) */
  friction?: number;
  /** Animation tension (for spring animations) */
  tension?: number;
  /** Animation speed (for spring animations) */
  speed?: number;
  /** Animation bounciness (for spring animations) */
  bounciness?: number;
  /** Whether to use Animated.timing instead of Animated.spring */
  useTiming?: boolean;
}

/**
 * Configuration for one side of the FlipCard
 */
export interface CardSideProps extends Omit<CardProps, 'children'> {
  /** Content for this side of the card */
  content: ReactNode;
  /** Additional styles for the card container */
  containerStyle?: StyleProp<ViewStyle>;
}

/**
 * Event handler for flip actions
 */
export type FlipEventHandler = (isFlipped: boolean) => void;

/**
 * Card flip state
 */
export type FlipState = 'front' | 'back';

/**
 * Props for the FlipCard component
 */
export interface FlipCardProps extends BaseComponentProps {
  /** Front side card props and content */
  front: CardSideProps;
  /** Back side card props and content */
  back: CardSideProps;
  /** Width of the card */
  width?: number;
  /** Height of the card */
  height?: number;
  /** Whether the card is flipped - use this for controlled component */
  flipped?: boolean;
  /** Initial side to show ('front' or 'back') - for uncontrolled component */
  initialSide?: FlipState;
  /** Direction of the flip animation */
  flipDirection?: FlipDirection;
  /** Whether the card is currently flipping - for controlled animation state */
  isFlipping?: boolean;
  /** Whether the flip is disabled */
  disableFlip?: boolean;
  /** Animation configuration */
  animationConfig?: FlipCardAnimationConfig;
  /** Called when card is flipped */
  onFlip?: FlipEventHandler;
  /** Called when flip animation starts */
  onFlipStart?: FlipEventHandler;
  /** Called when flip animation ends */
  onFlipEnd?: FlipEventHandler;
  /** Platform-specific style */
  platformStyle?: PlatformSpecificProps<ViewStyle>;
  /** Container style */
  containerStyle?: StyleProp<ViewStyle>;
}

/**
 * Flip card ref methods and properties
 */
export interface FlipCardRef {
  /** Flip the card programmatically */
  flip: (toFlipped?: boolean) => void;
  /** Get current flip state */
  isFlipped: () => boolean;
  /** Get whether card is currently flipping */
  isFlipping: () => boolean;
}

/**
 * Animation result for flip interpolations
 */
export interface FlipAnimationResult {
  /** Interpolation for front side */
  frontInterpolate: Animated.AnimatedInterpolation<string>;
  /** Interpolation for back side */
  backInterpolate: Animated.AnimatedInterpolation<string>;
  /** Animation style for front side */
  frontAnimatedStyle: {
    transform: Array<{[key: string]: any}>;
  };
  /** Animation style for back side */
  backAnimatedStyle: {
    transform: Array<{[key: string]: any}>;
  };
}

/**
 * Gesture handler types for flip card
 */
export interface FlipCardGestureHandlers {
  /** Handler for tap gesture */
  onTap?: () => void;
  /** Handler for swipe gesture */
  onSwipe?: (direction: 'left' | 'right' | 'up' | 'down') => void;
  /** Handler for press in */
  onPressIn?: (event: GestureResponderEvent) => void;
  /** Handler for press out */
  onPressOut?: (event: GestureResponderEvent) => void;
  /** Handler for long press */
  onLongPress?: (event: GestureResponderEvent) => void;
  /** Whether to disable gesture handling */
  disableGestures?: boolean;
}

/**
 * FlipCard context for providing card state to children
 */
export interface FlipCardContextProps {
  /** Whether the card is currently flipped */
  isFlipped: boolean;
  /** Whether the card is currently animating */
  isFlipping: boolean;
  /** Function to flip the card */
  flipCard: (toFlipped?: boolean) => void;
  /** Direction of the flip */
  flipDirection: FlipDirection;
}

/**
 * Style utilities for flip card
 */
export type FlipCardStyleProps = {
  /** Container style for the flip card */
  containerStyle?: StyleProp<ViewStyle>;
  /** Style for the front card */
  frontCardStyle?: StyleProp<ViewStyle>;
  /** Style for the back card */
  backCardStyle?: StyleProp<ViewStyle>;
  /** Style for content containers */
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Text style for the front card */
  frontTextStyle?: StyleProp<TextStyle>;
  /** Text style for the back card */
  backTextStyle?: StyleProp<TextStyle>;
};

/**
 * Card side style utility type
 */
export type CardSideStyleProps = Pick<
  FlipCardStyleProps,
  'containerStyle' | 'contentContainerStyle'
> & {
  /** Style for this specific card side */
  cardStyle?: StyleProp<ViewStyle>;
  /** Text style for this specific card side */
  textStyle?: StyleProp<TextStyle>;
};

// These types need to be imported from React Native's Animated module
// Adding proper type imports at the top of the file
import { Animated } from 'react-native';

