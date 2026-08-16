/**
 * Utility functions for mortgage calculations
 */

import { MortgageInput, MortgageResult } from './types';

/**
 * Parse and validate numeric input
 * 
 * @param value The string value to parse
 * @param allowZero Whether to allow zero as a valid value
 * @returns Parsed number or null if invalid
 */
export const parseInputValue = (value: string, allowZero: boolean = false): number | null => {
  if (!value) return null;
  
  const parsed = parseFloat(value);
  
  if (isNaN(parsed)) return null;
  if (!allowZero && parsed <= 0) return null;
  if (allowZero && parsed < 0) return null;
  
  return parsed;
};

/**
 * Calculate mortgage payment details based on input values
 * 
 * @param input The mortgage input parameters
 * @returns Calculated mortgage results or null if invalid inputs
 */
export const calculateMortgage = (input: MortgageInput): MortgageResult | null => {
  try {
    // Convert inputs to numbers
    const principalAmount = parseInputValue(input.principal) as number;
    const downPaymentAmount = parseInputValue(input.downPayment, true) || 0;
    const rate = parseInputValue(input.interestRate) as number / 100 / 12; // Monthly interest rate
    const term = parseInputValue(input.loanTerm) as number * 12; // Total number of payments
    
    // Validation already done in validateMortgageInput
    
    const p = principalAmount - downPaymentAmount;
    
    // Calculate monthly payment using mortgage formula: M = P[r(1+r)^n]/[(1+r)^n-1]
    const monthlyAmount = p * (rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1);
    
    if (isNaN(monthlyAmount) || !isFinite(monthlyAmount)) {
      throw new Error('Calculation error. Please check your inputs.');
    }
    
    const roundedMonthly = Math.round(monthlyAmount * 100) / 100;
    const totalPayment = Math.round((roundedMonthly * term) * 100) / 100;
    const totalInterest = Math.round((roundedMonthly * term - p) * 100) / 100;
    
    return {
      monthlyPayment: roundedMonthly,
      totalPayment,
      totalInterest,
      principalAmount,
      downPaymentAmount: downPaymentAmount > 0 ? downPaymentAmount : undefined,
    };
  } catch (error) {
    console.error('Mortgage calculation error:', error);
    return null;
  }
};

/**
 * Format a number as currency
 * 
 * @param value The number to format
 * @returns Formatted currency string
 */
export const formatCurrency = (value: number): string => {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

/**
 * Validate mortgage input values
 * 
 * @param input The mortgage input parameters
 * @returns Error message or empty string if valid
 */
export const validateMortgageInput = (input: MortgageInput): string => {
  if (!input.principal) {
    return 'Please enter principal amount';
  }
  if (!input.interestRate) {
    return 'Please enter interest rate';
  }
  if (!input.loanTerm) {
    return 'Please enter loan term';
  }

  const principalAmount = parseInputValue(input.principal);
  const downPaymentAmount = parseInputValue(input.downPayment, true) || 0;
  const rate = parseInputValue(input.interestRate);
  const term = parseInputValue(input.loanTerm);

  if (!principalAmount || principalAmount <= 0) {
    return 'Principal must be a positive number';
  }
  if (!rate || rate <= 0) {
    return 'Interest rate must be a positive number';
  }
  if (!term || term <= 0) {
    return 'Loan term must be a positive number';
  }
  if (downPaymentAmount < 0) {
    return 'Down payment must be a non-negative number';
  }
  if (downPaymentAmount >= principalAmount) {
    return 'Down payment must be less than principal amount';
  }

  return '';
};

