/**
 * Test fixtures for FlipCard tests
 */

import { CardSideProps } from '../../components/flip-card';

/**
 * Sample front card content
 */
export const frontContent = {
  title: 'Front Content',
  content: 'This is the front of the card',
};

/**
 * Sample back card content
 */
export const backContent = {
  title: 'Back Content',
  content: 'This is the back of the card',
};

/**
 * Default front card props
 */
export const frontCardProps: CardSideProps = {
  content: frontContent.content,
  title: frontContent.title,
  variant: 'default',
};

/**
 * Default back card props
 */
export const backCardProps: CardSideProps = {
  content: backContent.content,
  title: backContent.title,
  variant: 'secondary',
};

/**
 * Default flip card test IDs
 */
export const testIDs = {
  flipCard: 'flip-card',
  frontCard: 'front-card',
  backCard: 'back-card',
  frontContent: 'front-content',
  backContent: 'back-content',
  flipButton: 'flip-button',
};

/**
 * Animation timing for tests
 */
export const animationTiming = {
  short: 10,
  medium: 50,
  long: 100,
};

