/**
 * UI Component Types
 * 
 * Type definitions for UI components
 */

import { ReactNode } from 'react';
import { 
  ViewStyle, 
  TextStyle, 
  ImageStyle,
  StyleProp,
  GestureResponderEvent,
  ViewProps,
} from 'react-native';
import { Animated } from 'react-native';

/**
 * Component variants
 */
export type Variant = 'default' | 'primary' | 'secondary' | 'outline' | 'subtle';

/**
 * Component sizes
 */
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Component status types
 */
export type Status = 'idle' | 'loading' | 'success' | 'error';

/**
 * Supported platform-specific property
 */
export interface PlatformSpecificProps<T> {
  ios?: T;
  android?: T;
}

/**
 * Base component props shared by all UI components
 */
export interface BaseComponentProps {
  /** Style applied to the component */
  style?: StyleProp<ViewStyle>;
  /** Optional testID for testing */
  testID?: string;
  /** Optional accessibility label */
  accessibilityLabel?: string;
  /** Optional accessibility hint */
  accessibilityHint?: string;
}

/**
 * Animation props for components that support animations
 */
export interface AnimatableProps {
  /** Whether to animate the component when it mounts */
  animated?: boolean;
  /** Animation delay in ms */
  animationDelay?: number;
  /** Animation duration in ms */
  animationDuration?: number;
  /** Custom animation to apply */
  customAnimation?: (value: Animated.Value) => Animated.CompositeAnimation;
  /** Callback fired when animation completes */
  onAnimationComplete?: () => void;
}

/**
 * Card component props
 */
export interface CardProps extends BaseComponentProps, AnimatableProps {
  /** Content of the card */
  children: ReactNode;
  /** Optional card title */
  title?: string;
  /** Title style */
  titleStyle?: StyleProp<TextStyle>;
  /** Card variant */
  variant?: Variant;
  /** Card border radius */
  borderRadius?: number;
  /** Card padding */
  padding?: number | { horizontal?: number; vertical?: number };
  /** Whether the card has a shadow */
  shadow?: boolean;
  /** Shadow intensity (1-5) */
  shadowIntensity?: number;
  /** Platform-specific shadow props */
  shadowProps?: PlatformSpecificProps<ViewStyle>;
  /** Background color */
  backgroundColor?: string;
  /** Border width */
  borderWidth?: number;
  /** Border color */
  borderColor?: string;
  /** Content container style */
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Callback fired when card is pressed */
  onPress?: (event: GestureResponderEvent) => void;
  /** Callback fired when card is long pressed */
  onLongPress?: (event: GestureResponderEvent) => void;
  /** Whether the card is disabled */
  disabled?: boolean;
  /** Disables the pressed effect */
  disablePressed?: boolean;
}

/**
 * Shadow style props based on intensity level
 */
export interface ShadowStyle {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

/**
 * Typed style object for UI components
 */
export type UIStyle<T> = {
  [K in keyof T]: K extends 'style' ? StyleProp<ViewStyle> :
    K extends 'titleStyle' | 'textStyle' | 'labelStyle' ? StyleProp<TextStyle> :
    K extends 'imageStyle' ? StyleProp<ImageStyle> :
    T[K];
};

