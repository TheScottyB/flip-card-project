/**
 * Mortgage Calculator for Flip Card Project
 * Handles real-time calculation and display of mortgage payments
 * WCAG 2.1 AA compliant with appropriate ARIA and keyboard support
 */

(function() {
  'use strict';

  // Constants
  const CURRENCY_FORMAT = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // DOM Elements
  const calculatorInputs = document.querySelectorAll('.calculator-input');
  const announcer = document.getElementById('screen-reader-announcer');
  
  // Card types and their respective result elements
  const cardTypes = [
    { type: 'home-start', resultId: 'payment-result-home' },
    { type: 'va-loans', resultId: 'payment-result-va' },
    { type: 'conventional', resultId: 'payment-result-conv' }
  ];
  
  /**
   * Calculate monthly mortgage payment
   * Formula: M = P [ i(1 + i)^n ] / [ (1 + i)^n - 1]
   * Where:
   * M = monthly payment
   * P = principal (loan amount)
   * i = monthly interest rate (annual rate / 12 / 100)
   * n = number of payments (term in years * 12)
   */
  function calculateMonthlyPayment(loanAmount, downPaymentPercent, interestRate, termYears) {
    // Input validation
    loanAmount = parseFloat(loanAmount) || 0;
    downPaymentPercent = parseFloat(downPaymentPercent) || 0;
    interestRate = parseFloat(interestRate) || 0;
    termYears = parseInt(termYears) || 30;
    
    if (loanAmount <= 0 || interestRate <= 0 || termYears <= 0) {
      return 0;
    }
    
    // Calculate loan amount after down payment
    const principal = loanAmount * (1 - (downPaymentPercent / 100));
    
    // Convert annual interest rate to monthly decimal rate
    const monthlyRate = interestRate / 12 / 100;
    
    // Calculate total number of payments
    const numberOfPayments = termYears * 12;
    
    // Calculate monthly payment
    if (monthlyRate === 0) {
      return principal / numberOfPayments;
    }
    
    const compoundedRate = Math.pow(1 + monthlyRate, numberOfPayments);
    const monthlyPayment = principal * (monthlyRate * compoundedRate) / (compoundedRate - 1);
    
    return monthlyPayment;
  }
  
  /**
   * Format number as currency
   */
  function formatCurrency(value) {
    return CURRENCY_FORMAT.format(value);
  }
  
  /**
   * Validate input values and apply constraints
   */
  function validateInput(input) {
    const min = parseFloat(input.getAttribute('min')) || 0;
    const max = parseFloat(input.getAttribute('max')) || Infinity;
    const step = parseFloat(input.getAttribute('step')) || 1;
    let value = parseFloat(input.value) || 0;
    
    // Apply min/max constraints
    value = Math.max(min, Math.min(max, value));
    
    // Round to nearest step if needed
    if (step !== 1) {
      value = Math.round(value / step) * step;
    }
    
    // Update input if value changed
    if (value !== parseFloat(input.value)) {
      input.value = value;
    }
    
    return value;
  }
  
  /**
   * Update the payment result for a specific card type
   */
  function updatePaymentResult(cardType) {
    // Get all inputs for this card type
    const loanAmountInput = document.getElementById(`loan-amount-${cardType}`);
    const downPaymentInput = document.getElementById(`down-payment-${cardType}`);
    const interestRateInput = document.getElementById(`interest-rate-${cardType}`);
    const loanTermInput = document.getElementById(`loan-term-${cardType}`);
    
    // Get result display element
    const resultElement = document.getElementById(`payment-result-${cardType}`);
    
    if (!loanAmountInput || !downPaymentInput || !interestRateInput || !loanTermInput || !resultElement) {
      console.error(`Missing elements for card type: ${cardType}`);
      return;
    }
    
    // Validate inputs
    const loanAmount = validateInput(loanAmountInput);
    const downPayment = validateInput(downPaymentInput);
    const interestRate = validateInput(interestRateInput);
    const loanTerm = parseInt(loanTermInput.value) || 30;
    
    // Calculate monthly payment
    const monthlyPayment = calculateMonthlyPayment(loanAmount, downPayment, interestRate, loanTerm);
    
    // Update result display
    resultElement.textContent = formatCurrency(monthlyPayment);
    
    // Announce change to screen readers if element exists
    if (announcer) {
      announcer.textContent = `Estimated monthly payment updated to ${formatCurrency(monthlyPayment)}`;
    }
  }
  
  /**
   * Initialize event listeners for inputs
   */
  function initCalculator() {
    calculatorInputs.forEach(input => {
      // Get the card type from data attribute
      const cardType = input.getAttribute('data-card-type');
      
      if (!cardType) {
        console.error('Calculator input missing data-card-type attribute');
        return;
      }
      
      // Set up input event listeners
      input.addEventListener('input', () => {
        updatePaymentResult(cardType);
      });
      
      // Set up focus/blur event listeners for proper feedback
      input.addEventListener('focus', () => {
        input.setAttribute('aria-live', 'polite');
      });
      
      input.addEventListener('blur', () => {
        // Validate on blur
        validateInput(input);
        updatePaymentResult(cardType);
        input.removeAttribute('aria-live');
      });
      
      // Handle keyboard navigation
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          updatePaymentResult(cardType);
        }
      });
    });
    
    // Initialize all calculators
    cardTypes.forEach(card => {
      updatePaymentResult(card.type);
    });
  }
  
  // Initialize when DOM is fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCalculator);
  } else {
    initCalculator();
  }
  
  // Make functions available globally (for potential future use)
  window.mortgageCalculator = {
    calculate: calculateMonthlyPayment,
    update: updatePaymentResult,
    validate: validateInput,
    format: formatCurrency
  };
})();

