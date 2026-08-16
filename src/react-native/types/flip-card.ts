import { ReactNode } from 'react';
import { StyleProp, ViewStyle } from 'react-native';

/**
 * Properties for the FlipCard component
 */
export interface FlipCardProps {
  /**
   * Content to display on the front of the card
   */
  frontContent: ReactNode;
  
  /**
   * Content to display on the back of the card
   */
  backContent: ReactNode;
  
  /**
   * Width of the card
   */
  cardWidth?: number;
  
  /**
   * Height of the card
   */
  cardHeight?: number;
  
  /**
   * Callback function called when the card is flipped
   */
  onFlip?: (isFlipped: boolean) => void;
  
  /**
   * Initial side of the card to show
   */
  initialSide?: 'front' | 'back';
  
  /**
   * Direction of the flip animation
   */
  flipDirection?: 'horizontal' | 'vertical';
  
  /**
   * Custom styles for the card container
   */
  cardStyle?: StyleProp<ViewStyle>;
  
  /**
   * Custom styles for the front card
   */
  frontCardStyle?: StyleProp<ViewStyle>;
  
  /**
   * Custom styles for the back card
   */
  backCardStyle?: StyleProp<ViewStyle>;
}

