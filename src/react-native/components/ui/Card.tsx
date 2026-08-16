/**
 * Card Component
 * 
 * A customizable card component with shadow, animation, and platform-specific styling
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import theme from '../../config/theme';
import { CardProps, ShadowStyle } from '../../types/ui';
import { Transitions } from '../../utils/animations';

/**
 * Get shadow style based on intensity
 */
const getShadowStyle = (intensity: number = 1): ShadowStyle => {
  const baseStyle: ShadowStyle = {
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  };

  // Scale shadow based on intensity (1-5)
  const clampedIntensity = Math.max(1, Math.min(5, intensity));
  
  return {
    shadowColor: baseStyle.shadowColor,
    shadowOffset: { 
      width: baseStyle.shadowOffset.width, 
      height: baseStyle.shadowOffset.height * clampedIntensity 
    },
    shadowOpacity: baseStyle.shadowOpacity + (0.05 * (clampedIntensity - 1)),
    shadowRadius: baseStyle.shadowRadius * clampedIntensity,
    elevation: baseStyle.elevation * clampedIntensity,
  };
};

/**
 * Get background color based on variant
 */
const getBackgroundColor = (variant: CardProps['variant'], backgroundColor?: string): string => {
  if (backgroundColor) return backgroundColor;
  
  switch (variant) {
    case 'primary':
      return theme.colors.primary;
    case 'secondary':
      return theme.colors.secondary;
    case 'outline':
    case 'subtle':
      return theme.colors.transparent;
    default:
      return theme.colors.surface;
  }
};

/**
 * Get border style based on variant
 */
const getBorderStyle = (
  variant: CardProps['variant'], 
  borderWidth?: number,
  borderColor?: string
): { borderWidth: number; borderColor: string } => {
  let width = borderWidth ?? 0;
  let color = borderColor ?? theme.colors.border;
  
  if (variant === 'outline' && borderWidth === undefined) {
    width = 1;
    color = borderColor ?? theme.colors.border;
  }
  
  return { borderWidth: width, borderColor: color };
};

/**
 * Calculate padding value
 */
const getPadding = (padding?: number | { horizontal?: number; vertical?: number }) => {
  if (padding === undefined) {
    return {
      paddingHorizontal: theme.cardTheme.padding.md,
      paddingVertical: theme.cardTheme.padding.md,
    };
  }
  
  if (typeof padding === 'number') {
    return {
      paddingHorizontal: padding,
      paddingVertical: padding,
    };
  }
  
  return {
    paddingHorizontal: padding.horizontal ?? theme.cardTheme.padding.md,
    paddingVertical: padding.vertical ?? theme.cardTheme.padding.md,
  };
};

/**
 * Card Component
 */
const Card: React.FC<CardProps> = ({
  children,
  title,
  titleStyle,
  variant = 'default',
  borderRadius = theme.cardTheme.borderRadius,
  padding,
  shadow = true,
  shadowIntensity = 1,
  shadowProps,
  backgroundColor,
  borderWidth,
  borderColor,
  style,
  contentContainerStyle,
  onPress,
  onLongPress,
  disabled = false,
  disablePressed = false,
  animated = false,
  animationDelay = 0,
  animationDuration,
  customAnimation,
  onAnimationComplete,
  testID,
  accessibilityLabel,
  accessibilityHint,
}) => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(animated ? 0 : 1)).current;
  const scaleAnim = useRef(new Animated.Value(animated ? 0.9 : 1)).current;
  
  // Calculate padding
  const paddingStyle = getPadding(padding);
  
  // Get shadow style
  const shadowStyle = shadow ? getShadowStyle(shadowIntensity) : {};
  
  // Get platform-specific shadow props
  const platformShadowProps = shadowProps 
    ? theme.platformSpecific(shadowProps.ios, shadowProps.android) 
    : {};
  
  // Get background color
  const bgColor = getBackgroundColor(variant, backgroundColor);
  
  // Get border style
  const { borderWidth: bWidth, borderColor: bColor } = getBorderStyle(
    variant,
    borderWidth,
    borderColor
  );

  // Animate component on mount if animated prop is true
  useEffect(() => {
    if (animated) {
      if (customAnimation) {
        customAnimation(fadeAnim).start(onAnimationComplete);
      } else {
        Transitions.fadeInScale(
          fadeAnim, 
          scaleAnim, 
          { 
            duration: animationDuration || theme.animations.fade.duration,
            delay: animationDelay,
            onComplete: onAnimationComplete,
          }
        ).start();
      }
    }
  }, []);
  
  // Card style
  const cardStyle: StyleProp<ViewStyle> = [
    styles.card,
    {
      borderRadius,
      backgroundColor: bgColor,
      borderWidth: bWidth,
      borderColor: bColor,
      ...paddingStyle,
      ...shadowStyle,
      ...platformShadowProps,
    },
    style,
  ];
  
  // Animated style
  const animatedStyle = {
    opacity: fadeAnim,
    transform: [{ scale: scaleAnim }],
  };

  // Render as touchable if onPress is provided
  if (onPress || onLongPress) {
    return (
      <Animated.View style={animatedStyle} testID={testID}>
        <TouchableOpacity
          style={cardStyle}
          onPress={onPress}
          onLongPress={onLongPress}
          disabled={disabled}
          activeOpacity={disablePressed ? 1 : 0.8}
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={accessibilityHint}
          accessibilityRole="button"
        >
          {title && <Text style={[styles.title, titleStyle]}>{title}</Text>}
          <View style={[styles.contentContainer, contentContainerStyle]}>
            {children}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // Render as a simple view
  return (
    <Animated.View 
      style={[cardStyle, animatedStyle]}
      testID={testID}
      accessible={!!accessibilityLabel}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
    >
      {title && <Text style={[styles.title, titleStyle]}>{title}</Text>}
      <View style={[styles.contentContainer, contentContainerStyle]}>
        {children}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.cardTheme.borderRadius,
    backgroundColor: theme.colors.surface,
    overflow: 'hidden',
  },
  title: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  contentContainer: {
    width: '100%',
  },
});

export default Card;

