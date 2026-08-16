/**
 * FlipCard Context
 * 
 * React Context and hooks for FlipCard component
 */

import React, { createContext, useContext, useCallback } from 'react';
import { FlipCardContextProps } from './types';
import { FlipDirection } from '../../utils/animations/flip-animations';

/**
 * Default values for the FlipCardContext
 * These values are used when a component is not wrapped in a FlipCardProvider
 */
const defaultContextValue: FlipCardContextProps = {
  isFlipped: false,
  isFlipping: false,
  flipCard: () => {
    console.warn('FlipCard context used outside of FlipCardProvider');
  },
  flipDirection: 'horizontal',
};

/**
 * FlipCard Context
 */
export const FlipCardContext = createContext<FlipCardContextProps>(defaultContextValue);

/**
 * Error message for when a hook is used outside of a FlipCardProvider
 */
const CONTEXT_ERROR_MESSAGE = 'FlipCard hooks must be used within a FlipCardProvider';

/**
 * Hook to access the FlipCard context
 * @returns The FlipCard context
 * @throws Error if used outside of a FlipCardProvider
 */
export const useFlipCard = (): FlipCardContextProps => {
  const context = useContext(FlipCardContext);
  
  if (context === defaultContextValue) {
    throw new Error(CONTEXT_ERROR_MESSAGE);
  }
  
  return context;
};

/**
 * Hook to access just the state of the FlipCard
 * @returns The state of the FlipCard (isFlipped, isFlipping, flipDirection)
 * @throws Error if used outside of a FlipCardProvider
 */
export const useFlipCardState = (): Pick<FlipCardContextProps, 'isFlipped' | 'isFlipping' | 'flipDirection'> => {
  const { isFlipped, isFlipping, flipDirection } = useFlipCard();
  return { isFlipped, isFlipping, flipDirection };
};

/**
 * Hook to access just the actions of the FlipCard
 * @returns The flipCard function
 * @throws Error if used outside of a FlipCardProvider
 */
export const useFlipCardActions = (): { 
  flipCard: (toFlipped?: boolean) => void;
  flipToFront: () => void;
  flipToBack: () => void;
  toggle: () => void;
} => {
  const { flipCard, isFlipped } = useFlipCard();
  
  const flipToFront = useCallback(() => {
    flipCard(false);
  }, [flipCard]);
  
  const flipToBack = useCallback(() => {
    flipCard(true);
  }, [flipCard]);
  
  const toggle = useCallback(() => {
    flipCard(!isFlipped);
  }, [flipCard, isFlipped]);
  
  return { flipCard, flipToFront, flipToBack, toggle };
};

/**
 * Props for the FlipCardProvider component
 */
export interface FlipCardProviderProps {
  children: React.ReactNode;
  isFlipped: boolean;
  isFlipping: boolean;
  flipCard: (toFlipped?: boolean) => void;
  flipDirection: FlipDirection;
}

/**
 * Provider component for the FlipCard context
 */
export const FlipCardProvider: React.FC<FlipCardProviderProps> = ({
  children,
  isFlipped,
  isFlipping,
  flipCard,
  flipDirection,
}) => {
  return (
    <FlipCardContext.Provider
      value={{
        isFlipped,
        isFlipping,
        flipCard,
        flipDirection,
      }}
    >
      {children}
    </FlipCardContext.Provider>
  );
};

export default {
  FlipCardContext,
  FlipCardProvider,
  useFlipCard,
  useFlipCardState,
  useFlipCardActions,
};

