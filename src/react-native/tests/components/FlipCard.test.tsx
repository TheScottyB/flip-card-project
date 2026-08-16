/**
 * Tests for FlipCard component
 */

import React, { createRef } from 'react';
import { Animated, Text, TouchableOpacity } from 'react-native';
import { render, fireEvent, act } from '@testing-library/react-native';
import FlipCard, { 
  FlipCardRef, 
  useFlipCard, 
  useFlipCardState, 
  useFlipCardActions 
} from '../../components/flip-card';
import { 
  mockAnimatedSpring, 
  mockPlatform, 
  waitForAnimation 
} from '../utils/test-utils';
import { 
  frontCardProps, 
  backCardProps, 
  testIDs 
} from '../fixtures/flip-card';

// Create a test component that uses the FlipCard context hooks
const TestHookComponent = ({ testID = 'test-hook' }) => {
  const { isFlipped } = useFlipCardState();
  const { toggle } = useFlipCardActions();
  
  return (
    <TouchableOpacity testID={testID} onPress={toggle}>
      <Text>{isFlipped ? 'Flipped' : 'Not Flipped'}</Text>
    </TouchableOpacity>
  );
};

describe('FlipCard', () => {
  // Mock animated spring for all tests
  const { mockStart } = mockAnimatedSpring();
  
  // Basic rendering tests
  describe('rendering', () => {
    it('renders correctly with default props', () => {
      const { getByTestId } = render(
        <FlipCard
          front={{ ...frontCardProps, testID: testIDs.frontCard }}
          back={{ ...backCardProps, testID: testIDs.backCard }}
          testID={testIDs.flipCard}
        />
      );
      
      expect(getByTestId(testIDs.flipCard)).toBeTruthy();
      expect(getByTestId(testIDs.frontCard)).toBeTruthy();
    });
    
    it('renders with controlled flipped state', () => {
      const { getByTestId, rerender } = render(
        <FlipCard
          front={{ ...frontCardProps, testID: testIDs.frontCard }}
          back={{ ...backCardProps, testID: testIDs.backCard }}
          flipped={false}
          testID={testIDs.flipCard}
        />
      );
      
      // Should show front card when flipped=false
      expect(getByTestId(testIDs.frontCard)).toBeTruthy();
      
      // Rerender with flipped=true
      rerender(
        <FlipCard
          front={{ ...frontCardProps, testID: testIDs.frontCard }}
          back={{ ...backCardProps, testID: testIDs.backCard }}
          flipped={true}
          testID={testIDs.flipCard}
        />
      );
      
      // Animation should have started
      expect(mockStart).toHaveBeenCalled();
    });
    
    it('respects initialSide prop', () => {
      const { getByTestId } = render(
        <FlipCard
          front={{ ...frontCardProps, testID: testIDs.frontCard }}
          back={{ ...backCardProps, testID: testIDs.backCard }}
          initialSide="back"
          testID={testIDs.flipCard}
        />
      );
      
      // Animation should reflect back side is showing
      expect(mockStart).toHaveBeenCalled();
    });
  });
  
  // Animation tests
  describe('animations', () => {
    it('animates when flipped prop changes', () => {
      const { rerender } = render(
        <FlipCard
          front={frontCardProps}
          back={backCardProps}
          flipped={false}
        />
      );
      
      mockStart.mockClear();
      
      rerender(
        <FlipCard
          front={frontCardProps}
          back={backCardProps}
          flipped={true}
        />
      );
      
      expect(mockStart).toHaveBeenCalled();
    });
    
    it('respects animation config', () => {
      render(
        <FlipCard
          front={frontCardProps}
          back={backCardProps}
          animationConfig={{
            friction: 10,
            tension: 20,
            speed: 30,
            bounciness: 0,
          }}
        />
      );
      
      // Check that Animated.spring was called with the right config
      expect(Animated.spring).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          friction: 10,
          tension: 20,
          speed: 30,
          bounciness: 0,
        })
      );
    });
  });
  
  // Context hook tests
  describe('context hooks', () => {
    it('provides context to children', async () => {
      const { getByTestId } = render(
        <FlipCard
          front={frontCardProps}
          back={backCardProps}
        >
          <TestHookComponent />
        </FlipCard>
      );
      
      const hookComponent = getByTestId('test-hook');
      expect(hookComponent).toBeTruthy();
      
      // Initial state should be "Not Flipped"
      expect(hookComponent).toHaveTextContent('Not Flipped');
      
      // Trigger the toggle
      fireEvent.press(hookComponent);
      
      // Wait for animation to complete
      await waitForAnimation();
      
      // State should now be "Flipped"
      expect(hookComponent).toHaveTextContent('Flipped');
    });
  });
  
  // Ref methods tests
  describe('ref methods', () => {
    it('exposes flip method via ref', async () => {
      const ref = createRef<FlipCardRef>();
      
      render(
        <FlipCard
          front={frontCardProps}
          back={backCardProps}
          ref={ref}
        />
      );
      
      // Ref should be defined
      expect(ref.current).toBeDefined();
      
      // Call the flip method
      act(() => {
        ref.current?.flip();
      });
      
      // Wait for animation to complete
      await waitForAnimation();
      
      // Check if isFlipped returns true
      expect(ref.current?.isFlipped()).toBe(true);
    });
  });
  
  // Platform specific tests
  describe('platform specific behavior', () => {
    describe('iOS', () => {
      mockPlatform('ios');
      
      it('applies correct iOS styles', () => {
        const { getByTestId } = render(
          <FlipCard
            front={{ ...frontCardProps, testID: testIDs.frontCard }}
            back={backCardProps}
            platformStyle={{
              ios: { borderRadius: 20 },
              android: { borderRadius: 10 },
            }}
          />
        );
        
        const frontCard = getByTestId(testIDs.frontCard);
        expect(frontCard.props.style).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ borderRadius: 20 })
          ])
        );
      });
    });
    
    describe('Android', () => {
      mockPlatform('android');
      
      it('applies correct Android styles', () => {
        const { getByTestId } = render(
          <FlipCard
            front={{ ...frontCardProps, testID: testIDs.frontCard }}
            back={backCardProps}
            platformStyle={{
              ios: { borderRadius: 20 },
              android: { borderRadius: 10 },
            }}
          />
        );
        
        const frontCard = getByTestId(testIDs.frontCard);
        expect(frontCard.props.style).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ borderRadius: 10 })
          ])
        );
      });
    });
  });
});

