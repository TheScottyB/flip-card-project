/**
 * Theme configuration for React Native components
 * 
 * This file contains all the theme-related constants and settings
 * for the React Native implementation of flip cards and related components.
 */

import { Platform, Dimensions, PlatformOSType } from 'react-native';

// Get screen dimensions for responsive sizing
const { width, height } = Dimensions.get('window');

// Type definitions for theme objects
export interface ColorPalette {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  text: string;
  textLight: string;
  textInverse: string;
  background: string;
  backgroundLight: string;
  backgroundDark: string;
  surface: string;
  surfaceLight: string;
  border: string;
  borderLight: string;
  transparent: string;
  white: string;
  black: string;
}

export interface TypographyScale {
  fontFamily: {
    regular: string;
    medium: string;
    bold: string;
  };
  fontSize: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  lineHeight: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  fontWeight: {
    regular: string;
    medium: string;
    semiBold: string;
    bold: string;
  };
}

export interface SpacingScale {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

export interface CardTheme {
  width: number;
  aspectRatio: number;
  borderRadius: number;
  padding: SpacingScale;
  shadow: {
    ios: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
    };
    android: {
      elevation: number;
    };
  };
  colors: {
    front: string;
    back: string;
  };
}

export interface AnimationConstants {
  flip: {
    friction: number;
    tension: number;
    speed: number;
    bounciness: number;
    duration: number;
  };
  fade: {
    duration: number;
  };
  scale: {
    duration: number;
    min: number;
    max: number;
  };
}

// Color Palette
export const colors: ColorPalette = {
  primary: '#2c3e50',        // Dark blue (used for primary buttons/headers)
  primaryLight: '#3a5876',
  primaryDark: '#1a2530',
  secondary: '#3498db',      // Lighter blue (used for secondary buttons)
  secondaryLight: '#5dade2',
  secondaryDark: '#2874a6',
  success: '#2ecc71',
  warning: '#f39c12',
  error: '#e74c3c',
  info: '#3498db',
  text: '#2c3e50',          // Primary text color
  textLight: '#555555',     // Secondary text color
  textInverse: '#ffffff',
  background: '#ffffff',    // Primary background
  backgroundLight: '#f8f8f8', // Secondary background
  backgroundDark: '#f0f0f0',
  surface: '#ffffff',
  surfaceLight: '#f9f9f9',
  border: '#dddddd',
  borderLight: '#eeeeee',
  transparent: 'transparent',
  white: '#ffffff',
  black: '#000000',
};

// Typography
export const typography: TypographyScale = {
  fontFamily: {
    regular: Platform.select({
      ios: 'System',
      android: 'Roboto',
      default: 'System',
    }),
    medium: Platform.select({
      ios: 'System',
      android: 'Roboto-Medium',
      default: 'System',
    }),
    bold: Platform.select({
      ios: 'System',
      android: 'Roboto-Bold',
      default: 'System',
    }),
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
  },
  lineHeight: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
    xxl: 36,
  },
  fontWeight: {
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
  },
};

// Spacing
export const spacing: SpacingScale = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Card theme
export const cardTheme: CardTheme = {
  width: width * 0.85,
  aspectRatio: 1.5,
  borderRadius: 16,
  padding: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
  shadow: {
    ios: {
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    android: {
      elevation: 5,
    },
  },
  colors: {
    front: colors.background,
    back: colors.backgroundLight,
  },
};

// Animation constants
export const animations: AnimationConstants = {
  flip: {
    friction: 6,
    tension: 12,
    speed: 14,
    bounciness: 0,
    duration: 400,
  },
  fade: {
    duration: 300,
  },
  scale: {
    duration: 300,
    min: 0.95,
    max: 1,
  },
};

// Helper function to apply platform-specific styles
export const platformSpecific = <T,>(ios: T, android: T): T => {
  return Platform.select({ ios, android }) as T;
};

// Helper function to apply responsive sizing based on screen width
export const responsiveSize = (size: number, factor: number = 1): number => {
  const baseWidth = 375; // iPhone 8 width as base
  return (width / baseWidth) * size * factor;
};

// Export combined theme
export const theme = {
  colors,
  typography,
  spacing,
  cardTheme,
  animations,
  platformSpecific,
  responsiveSize,
};

export default theme;

