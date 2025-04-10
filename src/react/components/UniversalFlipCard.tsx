import React, { Component, createRef } from 'react';
import type { UniversalFlipCardProps, DeviceCapabilities, VoiceCommands } from '../types';

/**
 * Class-based React component implementing the UniversalFlipCard with enhanced features
 * 
 * @example
 * ```tsx
 * <UniversalFlipCard 
 *   frontContent={<div>Front content</div>}
 *   backContent={<div>Back content</div>}
 *   enableVoiceControl={true}
 *   disableAutoFocus={false}
 *   enableHover={true}
 * />
 * ```
 */
export class UniversalFlipCard extends Component<UniversalFlipCardProps, { isFlipped: boolean }> {
  // Default props
  static defaultProps = {
    frontTriggerText: 'View Details',
    backTriggerText: 'Back',
    frontTriggerAriaLabel: 'View more details',
    backTriggerAriaLabel: 'Return to front',
    announceToScreenReader: true,
    enableHover: true,
    disableAutoFocus: false,
    enableVoiceControl: false,
    voiceCommands: {
      flip: ['flip', 'turn', 'rotate'],
      flipBack: ['back', 'return', 'front']
    }
  };

  // Private properties
  private cardRef = createRef<HTMLDivElement>();
  private frontSideRef = createRef<HTMLDivElement>();
  private backSideRef = createRef<HTMLDivElement>();
  private frontTriggerId: string;
  private backTriggerId: string;
  private announcerId: string;
  private capabilities: DeviceCapabilities;
  private recognition: any; // SpeechRecognition instance

  constructor(props: UniversalFlipCardProps) {
    super(props);
    
    this.state = {
      isFlipped: props.initialFlipped || false
    };
    
    // Generate unique IDs
    const uuid = Math.random().toString(36).substring(2, 9);
    this.frontTriggerId = `front-trigger-${uuid}`;
    this.backTriggerId = `back-trigger-${uuid}`;
    this.announcerId = `card-announcer-${uuid}`;
    
    // Initialize device capabilities (will be properly set in componentDidMount)
    this.capabilities = {
      touch: false,
      pointer: false,
      hover: false,
      reducedMotion: false,
      darkMode: false
    };
  }

  componentDidMount() {
    // Detect device capabilities
    this.detectCapabilities();
    
    // Initialize voice control if enabled
    if (this.props.enableVoiceControl) {
      this.setupVoiceControl();
    }
    
    // Apply hover setting
    if (this.cardRef.current) {
      this.cardRef.current.setAttribute('data-disable-hover', 
        (!this.props.enableHover).toString());
    }
    
    // Create screen reader announcer if it doesn't exist
    if (!document.getElementById(this.announcerId)) {
      const announcer = document.createElement('div');
      announcer.id = this.announcerId;
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.className = 'sr-only';
      document.body.appendChild(announcer);
    }
  }

  componentWillUnmount() {
    // Clean up voice recognition if enabled
    if (this.recognition) {
      this.recognition.stop();
    }
    
    // Remove announcer element
    const announcer = document.getElementById(this.announcerId);
    if (announcer) {
      document.body.removeChild(announcer);
    }
  }
  
  /**
   * Detect device capabilities
   */
  private detectCapabilities() {
    this.capabilities = {
      touch: 'ontouchstart' in window,
      pointer: window.matchMedia('(pointer: fine)').matches,
      hover: window.matchMedia('(hover: hover)').matches,
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches
    };
    
    // Set primary input method as data attribute
    if (this.cardRef.current) {
      if (this.capabilities.touch && !this.capabilities.pointer) {
        this.cardRef.current.setAttribute('data-input-method', 'touch');
      } else if (this.capabilities.pointer) {
        this.cardRef.current.setAttribute('data-input-method', 'mouse');
      } else {
        this.cardRef.current.setAttribute('data-input-method', 'keyboard');
      }
    }
  }

  /**
   * Set up voice control
   */
  private setupVoiceControl() {
    // Check if Web Speech API is supported
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('UniversalFlipCard: Web Speech API is not supported in this browser');
      return;
    }
    
    // Create speech recognition instance
    const SpeechRecognition = (window as any).SpeechRecognition || 
                             (window as any).webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    
    // Configure speech recognition
    this.recognition.continuous = true;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-US';
    
    // Set up result handler
    this.recognition.onresult = (event: any) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript.trim().toLowerCase();
      
      // Process voice commands
      this.processVoiceCommand(transcript);
    };
    
    // Handle errors
    this.recognition.onerror = (event: any) => {
      console.warn('UniversalFlipCard: Speech recognition error', event.error);
    };
    
    // Restart if it stops
    this.recognition.onend = () => {
      if (this.props.enableVoiceControl) {
        this.recognition.start();
      }
    };
    
    // Start recognition
    try {
      this.recognition.start();
      
      // Add visual indicator for voice control
      this.addVoiceControlIndicator();
      
      // Set input method to voice
      if (this.cardRef.current) {
        this.cardRef.current.setAttribute('data-input-method', 'voice');
      }
    } catch (err) {
      console.error('UniversalFlipCard: Failed to start speech recognition', err);
    }
  }

  /**
   * Process voice commands
   */
  private processVoiceCommand(transcript: string) {
    const commands = this.props.voiceCommands as VoiceCommands;
    
    // Check for flip commands
    const hasFlipCommand = commands.flip.some(cmd => 
      transcript.includes(cmd));
    
    // Check for flip back commands
    const hasFlipBackCommand = commands.flipBack.some(cmd => 
      transcript.includes(cmd));
    
    // Execute the command
    if (!this.state.isFlipped && hasFlipCommand) {
      this.flipCard(true);
      this.announceToScreenReader('Card flipped by voice command');
    } else if (this.state.isFlipped && hasFlipBackCommand) {
      this.flipCard(false);
      this.announceToScreenReader('Card flipped back by voice command');
    }
  }

  /**
   * Add a visual indicator for voice control
   */
  private addVoiceControlIndicator() {
    // Create indicator if it doesn't exist
    if (!document.getElementById('voice-control-indicator')) {
      const indicator = document.createElement('div');
      indicator.id = 'voice-control-indicator';
      indicator.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: rgba(59, 130, 246, 0.9);
        color: white;
        padding: 8px 12px;
        border-radius: 20px;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 8px;
        z-index: 1000;
      `;
      
      // Add microphone icon and text
      indicator.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 15.5C14.21 15.5 16 13.71 16 11.5V6C16 3.79 14.21 2 12 2C9.79 2 8 3.79 8 6V11.5C8 13.71 9.79 15.5 12 15.5Z" fill="white"/>
          <path d="M4.03 12.03C3.87 12.03 3.7 12 3.54 11.92C3.15 11.73 2.97 11.3 3.16 10.91C3.5 10.07 4 9.32 4.63 8.69C5.28 8.04 6.05 7.52 6.9 7.13C7.29 6.95 7.72 7.13 7.9 7.52C8.08 7.91 7.91 8.34 7.52 8.52C6.86 8.83 6.24 9.26 5.73 9.77C5.23 10.27 4.81 10.88 4.5 11.54C4.37 11.85 4.2 12.03 4.03 12.03Z" fill="white"/>
          <path d="M19.97 12.03C19.8 12.03 19.63 11.96 19.5 11.82C19.31 11.67 19.2 11.43 19.2 11.19C19.19 10.94 19.28 10.7 19.45 10.53C19.95 10.03 20.36 9.42 20.65 8.76C20.83 8.37 21.26 8.19 21.65 8.37C22.04 8.55 22.22 8.98 22.04 9.37C21.66 10.22 21.13 10.98 20.48 11.63C20.34 11.77 20.2 11.88 20.02 11.95C20.02 11.96 20 11.96 19.99 11.97C19.98 11.97 19.97 11.97 19.96 11.97C19.96 11.97 19.97 11.97 19.96 11.97C19.96 11.97 19.97 12.03 19.97 12.03Z" fill="white"/>
          <path d="M12 19.75C9.48 19.75 7.12 18.8 5.36 17.04C4.98 16.66 4.98 16.03 5.36 15.65C5.74 15.27 6.37 15.27 6.75 15.65C10.3 19.2 16.32 18.5 19.05 15.77C19.43 15.39 20.06 15.39 20.44 15.77C20.82 16.15 20.82 16.78 20.44 17.16C18.81 18.79 16.54 19.75 14.12 19.75C13.38 19.75 12.68 19.67 12 19.52" fill="white"/>
          <path d="M12 22C11.59 22 11.25 21.66 11.25 21.25V19.5C11.25 19.09 11.59 18.75 12 18.75C12.41 18.75 12.75 19.09 12.75 19.5V21.25C12.75 21.66 12.41 22 12 22Z" fill="white"/>
        </svg>
        Voice Control Active
      `;
      
      document.body.appendChild(indicator);
    }
  }

  /**
   * Flip the card
   */
  flipCard = (shouldFlip: boolean) => {
    // Only proceed if we're changing state
    if (shouldFlip === this.state.isFlipped) return;
    
    // Update state
    this.setState({ isFlipped: shouldFlip }, () => {
      // Call onFlip callback if provided
      if (this.props.onFlip) {
        this.props.onFlip(shouldFlip);
      }
      
      // Announce to screen readers
      const cardTitle = this.getCardTitle();
      const message = shouldFlip
        ? (this.props.frontToBackAnnouncement || `${cardTitle} card flipped to back side`)
        : (this.props.backToFrontAnnouncement || `${cardTitle} card flipped to front side`);
      
      if (this.props.announceToScreenReader) {
        this.announceToScreenReader(message);
      }
      
      // Manage focus
      if (!this.props.disableAutoFocus) {
        this.manageFocus(shouldFlip);
      }
      
      // Dispatch event
      if (this.cardRef.current) {
        this.cardRef.current.dispatchEvent(new CustomEvent('cardFlip', {
          bubbles: true,
          detail: { isFlipped: shouldFlip }
        }));
      }
    });
  };

  /**
   * Toggle flip state
   */
  toggleFlip = () => {
    this.flipCard(!this.state.isFlipped);
  };

  /**
   * Handle keyboard events
   */
  handleKeyDown = (e: React.KeyboardEvent) => {
    // Skip if we're on an interactive element that handles its own keys
    if ((e.target as HTMLElement).tagName === 'BUTTON') {
      return;
    }
    
    // Enter or Space to flip
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.toggleFlip();
    }
    
    // Escape to flip back
    if (e.key === 'Escape' && this.state.isFlipped) {
      e.preventDefault();
      this.flipCard(false);
    }
  };

  /**
   * Handle click on card (for touch devices)
   */
  handleCardClick = (e: React.MouseEvent) => {
    // Only flip if not clicking a button/link
    if (!(e.target as HTMLElement).closest('button, a, input, select, textarea')) {
      this.toggleFlip();
    }
  };

  /**
   * Announce a message to screen readers
   */
  announceToScreenReader(message: string) {
    const announcer = document.getElementById(this.announcerId);
    if (announcer) {
      announcer.textContent = message;
    }
  }

  /**
   * Get the card title for announcements
   */
  getCardTitle(): string {
    // Try to find a heading in the card
    if (this.cardRef.current) {
      const heading = this.cardRef.current.querySelector('h2, h3, h4');
      if (heading) return heading.textContent || '';
      
      // Use aria-label if available
      if (this.cardRef.current.hasAttribute('aria-label')) {
        return this.cardRef.current.getAttribute('aria-label') || '';
      }
    }
    
    // Fallback
    return 'Flip';
  }

  /**
   * Manage focus when the card flips
   */
  manageFocus(isFlipped: boolean) {
    // Wait for the animation to complete
    setTimeout(() => {
      if (isFlipped && this.backSideRef.current) {
        // Focus on the first focusable element in the back side
        const backFocusable = this.getFirstFocusableElement(this.backSideRef.current);
        if (backFocusable) {
          backFocusable.focus();
        } else {
          this.backSideRef.current.setAttribute('tabindex', '-1');
          this.backSideRef.current.focus();
        }
      } else if (!isFlipped && this.frontSideRef.current) {
        // Focus on the first focusable element in the front side
        const frontFocusable = this.getFirstFocusableElement(this.frontSideRef.current);
        if (frontFocusable) {
          frontFocusable.focus();
        } else {
          this.frontSideRef.current.setAttribute('tabindex', '-1');
          this.frontSideRef.current.focus();
        }
      }
    }, 100);
  }

  /**
   * Get the first focusable element within a container
   */
  getFirstFocusableElement(container: HTMLElement): HTMLElement | null {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    return focusableElements.length ? focusableElements[0] as HTMLElement : null;
  }

  render() {
    const { 
      id,
      className = '',
      frontTriggerText,
      backTriggerText,
      frontTriggerAriaLabel,
      backTriggerAriaLabel,
      frontContent,
      backContent
    } = this.props;
    
    const { isFlipped } = this.state;
    
    // Generate unique IDs if not provided
    const cardId = id || `universal-card-${Math.random().toString(36).substring(2, 9)}`;
    const frontId = `${cardId}-front`;
    const backId = `${cardId}-back`;
    
    // Determine if touch-based device
    const isTouchDevice = this.capabilities?.touch && !this.capabilities?.pointer;
    
    return (
      <div
        id={cardId}
        ref={this.cardRef}
        className={`universal-card ${isFlipped ? 'flipped' : ''} ${className}`}
        tabIndex={0}
        aria-label="Interactive flip card. Press Enter to flip."
        onKeyDown={this.handleKeyDown}
        onClick={isTouchDevice ? this.handleCardClick : undefined}
      >
        <div className="universal-card-inner">
          {/* Front side */}
          <div
            id={frontId}
            ref={this.frontSideRef}
            className="universal-card-front"
            role="region"
            aria-label="Card front"
            aria-hidden={isFlipped ? 'true' : 'false'}
          >
            {/* Front content */}
            {frontContent}
            
            {/* Front trigger button */}
            <button
              id={this.frontTriggerId}
              className="flip-trigger"
              onClick={() => this.flipCard(true)}
              aria-pressed={isFlipped}
              aria-expanded={isFlipped}
              aria-controls={backId}
              aria-label={frontTriggerAriaLabel}
            >
              {frontTriggerText}
            </button>
          </div>
          
          {/* Back side */}
          <div
            id={backId}
            ref={this.backSideRef}
            className="universal-card-back"
            role="region"
            aria-label="Card back"
            aria-hidden={isFlipped ? 'false' : 'true'}
          >
            {/* Back content */}
            {backContent}
            
            {/* Back trigger button */}
            <button
              id={this.backTriggerId}
              className="flip-trigger"
              onClick={() => this.flipCard(false)}
              aria-pressed={!isFlipped}
              aria-expanded={!isFlipped}
              aria-controls={frontId}
              aria-label={backTriggerAriaLabel}
            >
              {backTriggerText}
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default UniversalFlipCard;