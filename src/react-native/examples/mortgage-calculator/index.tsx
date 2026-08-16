import React, { useState, useEffect, useRef } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import FlipCard from '../../components/flip-card';
import MortgageForm from './components/MortgageForm';
import MortgageResults from './components/MortgageResults';
import { MortgageInput, MortgageResult } from './types';
import { styles, cardDimensions } from './styles';
import { calculateMortgage, validateMortgageInput } from './utils';
import { createFlipAnimation } from '../../utils/animation-helpers';

/**
 * MortgageCalculator component - Example implementation of FlipCard
 * 
 * This component showcases how to use the FlipCard component to create
 * a mortgage calculator with a flip animation between input and results.
 */
const MortgageCalculator: React.FC = () => {
  // Input state
  const [input, setInput] = useState<MortgageInput>({
    principal: '',
    interestRate: '',
    loanTerm: '',
    downPayment: '',
  });
  
  // Result and error states
  const [result, setResult] = useState<MortgageResult | null>(null);
  const [error, setError] = useState<string>('');
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  
  // Cleanup timeout references
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  /**
   * Handle input changes
   */
  const handleInputChange = (field: keyof MortgageInput, value: string): void => {
    setInput({
      ...input,
      [field]: value,
    });
    
    // Clear any existing errors when the user makes changes
    if (error) {
      setError('');
    }
  };
  
  /**
   * Calculate mortgage results
   */
  const handleCalculate = (): void => {
    // Validate input
    const validationError = validateMortgageInput(input);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    // Calculate results
    const calculatedResult = calculateMortgage(input);
    if (!calculatedResult) {
      setError('Calculation error. Please check your inputs.');
      return;
    }
    
    // Set result and flip card
    setResult(calculatedResult);
    setError('');
    setIsFlipped(true);
  };
  
  /**
   * Reset calculator and flip back
   */
  const handleReset = (): void => {
    setIsFlipped(false);
    
    // Clear form after flip animation completes
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setInput({
        principal: '',
        interestRate: '',
        loanTerm: '',
        downPayment: '',
      });
      setError('');
    }, 600);
  };
  
  /**
   * Handle flip state change
   */
  const handleFlip = (flipped: boolean): void => {
    setIsFlipped(flipped);
  };
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View>
        <FlipCard
          frontContent={
            <MortgageForm
              values={input}
              error={error}
              onChangeInput={handleInputChange}
              onCalculate={handleCalculate}
            />
          }
          backContent={
            <MortgageResults
              result={result || {
                monthlyPayment: 0,
                totalPayment: 0,
                totalInterest: 0,
                principalAmount: 0,
              }}
              onReset={handleReset}
            />
          }
          cardWidth={cardDimensions.width}
          cardHeight={cardDimensions.height}
          initialSide={isFlipped ? 'back' : 'front'}
          onFlip={handleFlip}
          frontCardStyle={styles.frontCard}
          backCardStyle={styles.backCard}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

export default MortgageCalculator;

