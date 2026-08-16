/**
 * Application constants
 * 
 * This file contains global constants and configuration values
 * used throughout the application.
 */

import { Dimensions } from 'react-native';

// Device dimensions
const { width, height } = Dimensions.get('window');

// Environment settings
export const IS_DEV = __DEV__;

// Feature flags
export const FEATURES = {
  ENABLE_LOGGING: true,
  ENABLE_ANIMATIONS: true,
  ENABLE_HAPTICS: true,
};

// Card dimensions
export const CARD = {
  DEFAULT_WIDTH: width * 0.85,
  DEFAULT_HEIGHT: width * 0.85 * 1.5,
  DEFAULT_RADIUS: 16,
};

// Animation timings
export const ANIMATION = {
  FLIP_DURATION: 400,
  FADE_DURATION: 300,
  TRANSITION_DURATION: 500,
};

// Form validation
export const VALIDATION = {
  MIN_LOAN_AMOUNT: 1000,
  MAX_LOAN_AMOUNT: 10000000,
  MIN_INTEREST_RATE: 0.1,
  MAX_INTEREST_RATE: 30,
  MIN_LOAN_TERM: 1,
  MAX_LOAN_TERM: 50,
};

// Mortgage calculator
export const MORTGAGE = {
  DEFAULT_TERM: 30,
  DEFAULT_INTEREST: 4.5,
  SAMPLE_PRINCIPAL: 250000,
};

// Default values
export const DEFAULTS = {
  CARD_FLIP_DIRECTION: 'horizontal',
  INITIAL_CARD_SIDE: 'front',
};

export default {
  IS_DEV,
  FEATURES,
  CARD,
  ANIMATION,
  VALIDATION,
  MORTGAGE,
  DEFAULTS,
};

