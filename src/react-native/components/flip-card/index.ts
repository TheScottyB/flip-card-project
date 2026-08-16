/**
 * FlipCard Component Index
 * 
 * Exports the FlipCard component and its related utilities
 */

import FlipCard from './FlipCard';
import { 
  FlipCardContext,
  FlipCardProvider,
  useFlipCard,
  useFlipCardState,
  useFlipCardActions,
} from './context';
import type {
  FlipCardProps,
  FlipCardRef,
  CardSideProps,
  FlipCardAnimationConfig,
  FlipCardContextProps,
  FlipCardGestureHandlers,
  FlipState,
  FlipEventHandler,
  FlipCardStyleProps,
  CardSideStyleProps,
} from './types';

export {
  FlipCard,
  FlipCardContext,
  FlipCardProvider,
  useFlipCard,
  useFlipCardState,
  useFlipCardActions,
};

// Export types
export type {
  FlipCardProps,
  FlipCardRef,
  CardSideProps,
  FlipCardAnimationConfig,
  FlipCardContextProps,
  FlipCardGestureHandlers,
  FlipState,
  FlipEventHandler,
  FlipCardStyleProps,
  CardSideStyleProps,
};

export default FlipCard;

