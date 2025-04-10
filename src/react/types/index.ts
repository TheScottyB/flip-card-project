/**
 * Type definitions for React Flip Card components
 */

/**
 * Base props for all flip card components
 */
export interface FlipCardBaseProps {
  /** Optional ID for the card element */
  id?: string;
  /** Custom class name to apply to the card container */
  className?: string;
  /** Whether the card is flipped initially */
  initialFlipped?: boolean;
  /** Custom text for the front flip trigger button */
  frontTriggerText?: string;
  /** Custom text for the back flip trigger button */
  backTriggerText?: string;
  /** Custom aria-label for the front flip trigger */
  frontTriggerAriaLabel?: string;
  /** Custom aria-label for the back flip trigger */
  backTriggerAriaLabel?: string;
  /** Whether to announce to screen readers when flipping */
  announceToScreenReader?: boolean;
  /** Custom message to announce when flipping to back */
  frontToBackAnnouncement?: string;
  /** Custom message to announce when flipping to front */
  backToFrontAnnouncement?: string;
  /** React children for the front side */
  frontContent: React.ReactNode;
  /** React children for the back side */
  backContent: React.ReactNode;
  /** Callback when card is flipped */
  onFlip?: (isFlipped: boolean) => void;
}

/**
 * Props for the functional FlipCard component
 */
export interface FlipCardProps extends FlipCardBaseProps {
  /** Card size variant */
  variant?: 'standard' | 'mini' | 'tall';
}

/**
 * Device capability information for UniversalFlipCard
 */
export interface DeviceCapabilities {
  touch: boolean;
  pointer: boolean;
  hover: boolean;
  reducedMotion: boolean;
  darkMode: boolean;
}

/**
 * Voice command options for UniversalFlipCard
 */
export interface VoiceCommands {
  flip: string[];
  flipBack: string[];
}

/**
 * Props for the class-based UniversalFlipCard component
 */
export interface UniversalFlipCardProps extends FlipCardBaseProps {
  /** Whether to enable hover effects */
  enableHover?: boolean;
  /** Whether to automatically focus the first focusable element after flipping */
  disableAutoFocus?: boolean;
  /** Whether to enable voice control */
  enableVoiceControl?: boolean;
  /** Custom voice commands */
  voiceCommands?: VoiceCommands;
}

/**
 * Return type for the useFlipCard hook
 */
export interface UseFlipCardReturn {
  /** Whether the card is currently flipped */
  isFlipped: boolean;
  /** Function to flip the card to a specific state */
  flipCard: (shouldFlip: boolean) => void;
  /** Function to toggle the flip state */
  toggleFlip: () => void;
  /** Binding props for the card container */
  containerProps: {
    className: string;
    tabIndex: 0;
    onKeyDown: (e: React.KeyboardEvent) => void;
  };
  /** Binding props for the front trigger button */
  frontTriggerProps: {
    onClick: () => void;
    'aria-pressed': boolean;
    'aria-expanded': boolean;
  };
  /** Binding props for the back trigger button */
  backTriggerProps: {
    onClick: () => void;
    'aria-pressed': boolean;
    'aria-expanded': boolean;
  };
}