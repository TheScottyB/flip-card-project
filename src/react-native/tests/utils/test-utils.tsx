/**
 * Test utilities for React Native component testing
 */

import React, { ReactElement } from 'react';
import { Animated, Platform } from 'react-native';
import { render, RenderOptions } from '@testing-library/react-native';

/**
 * Mock Animated API for testing
 */
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

/**
 * Mock Platform for testing
 */
export const mockPlatform = (os: 'ios' | 'android') => {
  const originalPlatform = Platform.OS;
  
  beforeAll(() => {
    Platform.OS = os;
  });
  
  afterAll(() => {
    Platform.OS = originalPlatform;
  });
};

/**
 * Mock for Animated.timing
 */
export const mockAnimatedTiming = () => {
  const originalTiming = Animated.timing;
  const mockStart = jest.fn((callback?: () => void) => {
    if (callback) {
      callback();
    }
    return { stop: jest.fn() };
  });
  
  beforeEach(() => {
    Animated.timing = jest.fn(() => ({ start: mockStart }));
  });
  
  afterEach(() => {
    Animated.timing = originalTiming;
  });
  
  return { mockStart };
};

/**
 * Mock for Animated.spring
 */
export const mockAnimatedSpring = () => {
  const originalSpring = Animated.spring;
  const mockStart = jest.fn((callback?: () => void) => {
    if (callback) {
      callback();
    }
    return { stop: jest.fn() };
  });
  
  beforeEach(() => {
    Animated.spring = jest.fn(() => ({ start: mockStart }));
  });
  
  afterEach(() => {
    Animated.spring = originalSpring;
  });
  
  return { mockStart };
};

/**
 * Custom render function with common providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  return render(ui, { ...options });
}

/**
 * Wait for animations to complete
 */
export const waitForAnimation = (ms = 0) => new Promise(resolve => setTimeout(resolve, ms));

