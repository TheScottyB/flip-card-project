/**
 * UI Interaction Tests for Mortgage Calculator
 * Tests the user interface interactions and event handling
 */

// Setup for UI tests
const setupTestDOM = () => {
  document.body.innerHTML = `
    <div id="screen-reader-announcer" aria-live="polite" aria-atomic="true"></div>
    <div class="mortgage-calculator" data-testid="test-calculator">
      <input type="number" id="loan-amount-test" class="calculator-input calc-loan-amount" 
             value="300000" min="10000" max="2000000" step="5000" data-card-type="test">
      <input type="number" id="down-payment-test" class="calculator-input calc-down-payment" 
             value="10" min="0" max="50" step="0.5" data-card-type="test">
      <input type="number" id="interest-rate-test" class="calculator-input calc-interest-rate" 
             value="5.5" min="0.1" max="15" step="0.125" data-card-type="test">
      <select id="loan-term-test" class="calculator-input calc-loan-term" data-card-type="test">
        <option value="30">30 years</option>
        <option value="15">15 years</option>
      </select>
      <div id="payment-result-test" aria-live="polite">$0.00</div>
    </div>
  `;
};

// Mock the mortgage calculator functionality for UI tests
const mortgageCalculator = {
  calculateMonthlyPayment: (loanAmount, downPaymentPercent, interestRate, termYears) => {
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
  },
  
  formatCurrency: (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  },
  
  validateInput: (input) => {
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
  },
  
  updatePaymentResult: (cardType) => {
    // Get all inputs for this card type
    const loanAmountInput = document.getElementById(`loan-amount-${cardType}`);
    const downPaymentInput = document.getElementById(`down-payment-${cardType}`);
    const interestRateInput = document.getElementById(`interest-rate-${cardType}`);
    const loanTermInput = document.getElementById(`loan-term-${cardType}`);
    
    // Get result display element
    const resultElement = document.getElementById(`payment-result-${cardType}`);
    
    if (!loanAmountInput || !downPaymentInput || !interestRateInput || !loanTermInput || !resultElement) {
      console.error(`Missing elements for card type: ${cardType}`);
      return 0;
    }
    
    // Validate inputs
    const loanAmount = mortgageCalculator.validateInput(loanAmountInput);
    const downPayment = mortgageCalculator.validateInput(downPaymentInput);
    const interestRate = mortgageCalculator.validateInput(interestRateInput);
    const loanTerm = parseInt(loanTermInput.value) || 30;
    
    // Calculate monthly payment
    const monthlyPayment = mortgageCalculator.calculateMonthlyPayment(
      loanAmount, downPayment, interestRate, loanTerm
    );
    
    // Update result display
    resultElement.textContent = mortgageCalculator.formatCurrency(monthlyPayment);
    
    // Announce change to screen readers
    const announcer = document.getElementById('screen-reader-announcer');
    if (announcer) {
      announcer.textContent = `Estimated monthly payment updated to ${mortgageCalculator.formatCurrency(monthlyPayment)}`;
    }
    
    return monthlyPayment;
  }
};

// Make calculator available globally for tests
global.mortgageCalculator = mortgageCalculator;

describe('Mortgage Calculator - UI Interactions', () => {
  beforeEach(() => {
    setupTestDOM();
    
    // Mock update function
    window.mortgageCalculator = {
      ...mortgageCalculator,
      update: jest.fn()
    };
    
    // Set up event listeners
    const inputs = document.querySelectorAll('.calculator-input');
    inputs.forEach(input => {
      const cardType = input.getAttribute('data-card-type');
      
      input.addEventListener('input', () => {
        window.mortgageCalculator.update(cardType);
      });
      
      input.addEventListener('blur', () => {
        mortgageCalculator.validateInput(input);
        window.mortgageCalculator.update(cardType);
      });
      
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          window.mortgageCalculator.update(cardType);
        }
      });
    });
  });
  
  afterEach(() => {
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });
  
  describe('Real-time Updates', () => {
    test('Updates payment when loan amount changes', () => {
      const loanInput = document.getElementById('loan-amount-test');
      loanInput.value = '350000';
      
      simulateEvent(loanInput, 'input');
      
      expect(window.mortgageCalculator.update).toHaveBeenCalledWith('test');
      expect(window.mortgageCalculator.update).toHaveBeenCalledTimes(1);
    });
    
    test('Updates payment when down payment changes', () => {
      const downPaymentInput = document.getElementById('down-payment-test');
      downPaymentInput.value = '15';
      
      simulateEvent(downPaymentInput, 'input');
      
      expect(window.mortgageCalculator.update).toHaveBeenCalledWith('test');
      expect(window.mortgageCalculator.update).toHaveBeenCalledTimes(1);
    });
    
    test('Updates payment when interest rate changes', () => {
      const interestInput = document.getElementById('interest-rate-test');
      interestInput.value = '4.5';
      
      simulateEvent(interestInput, 'input');
      
      expect(window.mortgageCalculator.update).toHaveBeenCalledWith('test');
      expect(window.mortgageCalculator.update).toHaveBeenCalledTimes(1);
    });
    
    test('Updates payment when loan term changes', () => {
      const termSelect = document.getElementById('loan-term-test');
      termSelect.value = '15';
      
      simulateEvent(termSelect, 'input');
      
      expect(window.mortgageCalculator.update).toHaveBeenCalledWith('test');
      expect(window.mortgageCalculator.update).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('Input Validation', () => {
    test('Validates input on blur event', () => {
      const interestInput = document.getElementById('interest-rate-test');
      interestInput.value = '7.2'; // Not a multiple of 0.125
      
      simulateEvent(interestInput, 'blur');
      
      // Should validate to 7.25
      expect(interestInput.value).toBe('7.25');
      expect(window.mortgageCalculator.update).toHaveBeenCalledTimes(1);
    });
    
    test('Caps inputs at maximum values', () => {
      const loanInput = document.getElementById('loan-amount-test');
      loanInput.value = '3000000'; // Above max of 2000000
      
      simulateEvent(loanInput, 'blur');
      
      expect(loanInput.value).toBe('2000000');
      expect(window.mortgageCalculator.update).toHaveBeenCalledTimes(1);
    });
    
    test('Enforces minimum input values', () => {
      const loanInput = document.getElementById('loan-amount-test');
      loanInput.value = '5000'; // Below min of 10000
      
      simulateEvent(loanInput, 'blur');
      
      expect(loanInput.value).toBe('10000');
      expect(window.mortgageCalculator.update).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('Event Handling', () => {
    test('Enter key triggers update', () => {
      const loanInput = document.getElementById('loan-amount-test');
      loanInput.value = '400000';
      
      simulateKeyEvent(loanInput, 'keydown', 'Enter');
      
      expect(window.mortgageCalculator.update).toHaveBeenCalledTimes(1);
    });
    
    test('Arrow keys do not trigger updates', () => {
      const loanInput = document.getElementById('loan-amount-test');
      
      simulateKeyEvent(loanInput, 'keydown', 'ArrowUp');
      simulateKeyEvent(loanInput, 'keydown', 'ArrowDown');
      
      expect(window.mortgageCalculator.update).not.toHaveBeenCalled();
    });
    
    test('Blur event triggers validation', () => {
      const downPaymentInput = document.getElementById('down-payment-test');
      downPaymentInput.value = '51'; // Above max of 50
      
      simulateEvent(downPaymentInput, 'blur');
      
      expect(downPaymentInput.value).toBe('50');
    });
  });
  
  describe('Form State Management', () => {
    test('Calculator updates with initial values', () => {
      // Set up explicit implementation for update to actually calculate
      window.mortgageCalculator.update.mockImplementation(cardType => {
        return mortgageCalculator.updatePaymentResult(cardType);
      });
      
      const resultElement = document.getElementById('payment-result-test');
      window.mortgageCalculator.update('test');
      
      // Initial values: $300,000, 10% down, 5.5% rate, 30 year term
      expect(resultElement.textContent).toContain('$');
      expect(window.mortgageCalculator.update).toHaveBeenCalledTimes(1);
    });
    
    test('Multiple input changes result in multiple updates', () => {
      const loanInput = document.getElementById('loan-amount-test');
      const downPaymentInput = document.getElementById('down-payment-test');
      const interestInput = document.getElementById('interest-rate-test');
      
      // Change multiple inputs in sequence
      loanInput.value = '400000';
      simulateEvent(loanInput, 'input');
      
      downPaymentInput.value = '20';
      simulateEvent(downPaymentInput, 'input');
      
      interestInput.value = '6';
      simulateEvent(interestInput, 'input');
      
      expect(window.mortgageCalculator.update).toHaveBeenCalledTimes(3);
    });
    
    test('Non-numeric inputs are handled gracefully', () => {
      const loanInput = document.getElementById('loan-amount-test');
      loanInput.value = 'invalid';
      
      simulateEvent(loanInput, 'blur');
      
      // Should default to min value
      expect(loanInput.value).toBe('10000');
      expect(window.mortgageCalculator.update).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('Error Handling', () => {
    test('Handles missing DOM elements gracefully', () => {
      // Remove an essential input
      const interestInput = document.getElementById('interest-rate-test');
      interestInput.parentNode.removeChild(interestInput);
      
      // Should not throw error
      const result = mortgageCalculator.updatePaymentResult('test');
      expect(result).toBe(0);
    });
    
    test('Handles extreme values without crashing', () => {
      const loanInput = document.getElementById('loan-amount-test');
      loanInput.value = Number.MAX_SAFE_INTEGER.toString();
      
      // Should not throw error
      expect(() => {
        mortgageCalculator.validateInput(loanInput);
      }).not.toThrow();
      
      // Should cap at maximum
      expect(loanInput.value).toBe('2000000');
    });
  });
});

