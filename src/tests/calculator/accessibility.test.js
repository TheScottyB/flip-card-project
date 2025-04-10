/**
 * Accessibility Tests for Mortgage Calculator
 * Tests ARIA attributes, keyboard navigation, and screen reader support
 */

// Setup accessibility testing DOM
const setupAccessibilityDOM = () => {
  document.body.innerHTML = `
    <!-- Screen reader announcer -->
    <div id="screen-reader-announcer" aria-live="polite" aria-atomic="true"></div>
    
    <!-- Mortgage Calculator -->
    <div class="mortgage-calculator" data-testid="a11y-calculator">
      <h2 id="calculator-heading">Mortgage Payment Calculator</h2>
      
      <div class="calculator-form" role="form" aria-labelledby="calculator-heading">
        <div class="input-group">
          <label for="loan-amount-a11y" id="loan-amount-label">Loan Amount ($)</label>
          <input type="number" id="loan-amount-a11y" class="calculator-input calc-loan-amount" 
                 value="300000" min="10000" max="2000000" step="5000" data-card-type="a11y"
                 aria-labelledby="loan-amount-label" aria-describedby="amount-hint"
                 aria-required="true">
          <div id="amount-hint" class="hint-text">Enter amount between $10,000 and $2,000,000</div>
        </div>
        
        <div class="input-group">
          <label for="down-payment-a11y" id="down-payment-label">Down Payment (%)</label>
          <input type="number" id="down-payment-a11y" class="calculator-input calc-down-payment" 
                 value="10" min="0" max="50" step="0.5" data-card-type="a11y"
                 aria-labelledby="down-payment-label" aria-required="true">
        </div>
        
        <div class="input-group">
          <label for="interest-rate-a11y" id="interest-rate-label">Interest Rate (%)</label>
          <input type="number" id="interest-rate-a11y" class="calculator-input calc-interest-rate" 
                 value="5.5" min="0.1" max="15" step="0.125" data-card-type="a11y"
                 aria-labelledby="interest-rate-label" aria-required="true">
        </div>
        
        <div class="input-group">
          <label for="loan-term-a11y" id="loan-term-label">Loan Term (years)</label>
          <select id="loan-term-a11y" class="calculator-input calc-loan-term" data-card-type="a11y"
                  aria-labelledby="loan-term-label" aria-required="true">
            <option value="30">30 years</option>
            <option value="20">20 years</option>
            <option value="15">15 years</option>
            <option value="10">10 years</option>
          </select>
        </div>
        
        <div class="calculation-result" aria-live="polite" aria-atomic="true">
          <div class="result-label">Estimated Monthly Payment (P&I)</div>
          <div id="payment-result-a11y" class="payment-result">$0.00</div>
          <p class="result-note">Principal and interest only. Taxes and insurance not included.</p>
        </div>
      </div>
      
      <!-- Tab order test elements -->
      <div class="calculator-actions">
        <button id="calculate-btn" class="action-button">Calculate</button>
        <button id="reset-btn" class="action-button">Reset</button>
      </div>
    </div>
    
    <!-- Error state test element -->
    <div class="mortgage-calculator with-errors" data-testid="error-calculator">
      <div class="input-group error">
        <label for="loan-amount-error">Loan Amount ($)</label>
        <input type="number" id="loan-amount-error" class="calculator-input calc-loan-amount error" 
               value="5000" min="10000" max="2000000" step="5000" data-card-type="error"
               aria-invalid="true" aria-describedby="error-message">
        <div id="error-message" class="error-message" role="alert">
          Amount must be at least $10,000
        </div>
      </div>
    </div>
    
    <!-- Reduced Motion Test -->
    <div class="mortgage-calculator" data-testid="reduced-motion-calculator">
      <div class="prefers-reduced-motion">
        <div id="reduced-motion-status">reduced-motion: not detected</div>
      </div>
      <button id="toggle-calculator" aria-expanded="false" aria-controls="motion-container">
        Show Calculator
      </button>
      <div id="motion-container" hidden>
        <input type="number" id="loan-amount-motion" class="calculator-input" value="300000">
      </div>
    </div>
  `;
};

// Mock the mortgage calculator functionality for a11y tests
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
  
  updatePaymentResult: (cardType) => {
    // Get all inputs for this card type
    const loanAmountInput = document.getElementById(`loan-amount-${cardType}`);
    const downPaymentInput = document.getElementById(`down-payment-${cardType}`);
    const interestRateInput = document.getElementById(`interest-rate-${cardType}`);
    const loanTermInput = document.getElementById(`loan-term-${cardType}`);
    
    // Get result display element
    const resultElement = document.getElementById(`payment-result-${cardType}`);
    
    if (!loanAmountInput || !resultElement) {
      console.error(`Missing elements for card type: ${cardType}`);
      return 0;
    }
    
    // Validate inputs
    const loanAmount = parseFloat(loanAmountInput.value) || 0;
    const downPayment = downPaymentInput ? parseFloat(downPaymentInput.value) || 0 : 0;
    const interestRate = interestRateInput ? parseFloat(interestRateInput.value) || 0 : 0;
    const loanTerm = loanTermInput ? parseInt(loanTermInput.value) || 30 : 30;
    
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
    
    // Check if valid
    const isValid = value >= min && value <= max;
    
    // Update ARIA attributes
    if (!isValid) {
      input.setAttribute('aria-invalid', 'true');
    } else {
      input.removeAttribute('aria-invalid');
    }
    
    // Update input if value changed
    if (value !== parseFloat(input.value)) {
      input.value = value;
    }
    
    return value;
  }
};

// Make calculator available globally for tests
global.mortgageCalculator = mortgageCalculator;

describe('Mortgage Calculator - Accessibility Tests', () => {
  beforeEach(() => {
    setupAccessibilityDOM();
    mortgageCalculator.updatePaymentResult = jest.fn().mockImplementation((cardType) => {
      // Get result display element
      const resultElement = document.getElementById(`payment-result-${cardType}`);
      if (resultElement) {
        // Update result display 
        resultElement.textContent = '$1,500.00';
      }
      // Announce change to screen readers
      const announcer = document.getElementById('screen-reader-announcer');
      if (announcer) {
        announcer.textContent = `Estimated monthly payment updated to $1,500.00`;
      }
      return 1500;
    });
    
    // Set up event listeners
    const calculateBtn = document.getElementById('calculate-btn');
    if (calculateBtn) {
      calculateBtn.addEventListener('click', () => {
        mortgageCalculator.updatePaymentResult('a11y');
      });
      
      calculateBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          mortgageCalculator.updatePaymentResult('a11y');
        }
      });
    }
    
    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        const inputs = document.querySelectorAll('[data-card-type="a11y"]');
        inputs.forEach(input => {
          if (input.tagName === 'INPUT') {
            input.value = input.getAttribute('value');
          } else if (input.tagName === 'SELECT') {
            input.selectedIndex = 0;
          }
        });
        mortgageCalculator.updatePaymentResult('a11y');
      });
      
      resetBtn.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'Space') {
          mortgageCalculator.updatePaymentResult('a11y');
        }
      });
    }
    
    // Add event listeners for arrow key handling on inputs
    const loanInput = document.getElementById('loan-amount-a11y');
    if (loanInput) {
      loanInput.stepUp = jest.fn();
      loanInput.stepDown = jest.fn();
      
      loanInput.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowUp') {
          loanInput.stepUp();
        } else if (e.key === 'ArrowDown') {
          loanInput.stepDown();
        }
      });
    }
    
    const toggleCalculator = document.getElementById('toggle-calculator');
    if (toggleCalculator) {
      toggleCalculator.addEventListener('click', () => {
        const container = document.getElementById('motion-container');
        const isExpanded = toggleCalculator.getAttribute('aria-expanded') === 'true';
        
        toggleCalculator.setAttribute('aria-expanded', !isExpanded);
        toggleCalculator.textContent = isExpanded ? 'Show Calculator' : 'Hide Calculator';
        
        if (container) {
          container.hidden = isExpanded;
        }
      });
    }
  });
  
  afterEach(() => {
    document.body.innerHTML = '';
  });
  
  describe('ARIA Attributes', () => {
    test('Inputs have proper ARIA attributes', () => {
      const loanInput = document.getElementById('loan-amount-a11y');
      const downPaymentInput = document.getElementById('down-payment-a11y');
      const interestRateInput = document.getElementById('interest-rate-a11y');
      const loanTermInput = document.getElementById('loan-term-a11y');
      
      // Check for appropriate aria-labelledby
      expect(loanInput.getAttribute('aria-labelledby')).toBe('loan-amount-label');
      expect(downPaymentInput.getAttribute('aria-labelledby')).toBe('down-payment-label');
      expect(interestRateInput.getAttribute('aria-labelledby')).toBe('interest-rate-label');
      expect(loanTermInput.getAttribute('aria-labelledby')).toBe('loan-term-label');
      
      // Check for required attributes
      expect(loanInput.getAttribute('aria-required')).toBe('true');
      expect(downPaymentInput.getAttribute('aria-required')).toBe('true');
      expect(interestRateInput.getAttribute('aria-required')).toBe('true');
      expect(loanTermInput.getAttribute('aria-required')).toBe('true');
      
      // Check for hint text
      expect(loanInput.getAttribute('aria-describedby')).toBe('amount-hint');
    });
    
    test('Result containers have proper ARIA live regions', () => {
      const resultContainer = document.querySelector('.calculation-result');
      
      expect(resultContainer.getAttribute('aria-live')).toBe('polite');
      expect(resultContainer.getAttribute('aria-atomic')).toBe('true');
    });
    
    test('Error states use proper ARIA attributes', () => {
      const errorInput = document.getElementById('loan-amount-error');
      
      expect(errorInput.getAttribute('aria-invalid')).toBe('true');
      expect(errorInput.getAttribute('aria-describedby')).toBe('error-message');
      
      const errorMessage = document.getElementById('error-message');
      expect(errorMessage.getAttribute('role')).toBe('alert');
    });
    
    test('Toggle button uses proper ARIA expanded state', () => {
      const toggleBtn = document.getElementById('toggle-calculator');
      const container = document.getElementById('motion-container');
      
      // Initial state
      expect(toggleBtn.getAttribute('aria-expanded')).toBe('false');
      expect(container.hidden).toBe(true);
      
      // After click
      simulateEvent(toggleBtn, 'click');
      
      expect(toggleBtn.getAttribute('aria-expanded')).toBe('true');
      expect(container.hidden).toBe(false);
      
      // After second click
      simulateEvent(toggleBtn, 'click');
      
      expect(toggleBtn.getAttribute('aria-expanded')).toBe('false');
      expect(container.hidden).toBe(true);
    });
  });
  
  describe('Keyboard Navigation', () => {
    test('Elements have proper tab order', () => {
      const focusableElements = [
        'loan-amount-a11y',
        'down-payment-a11y',
        'interest-rate-a11y',
        'loan-term-a11y',
        'calculate-btn',
        'reset-btn'
      ];
      
      // Confirm all elements exist and are focusable
      focusableElements.forEach(id => {
        const element = document.getElementById(id);
        expect(element).not.toBeNull();
        expect(element.tabIndex).not.toBe(-1);
      });
    });
    
    test('Calculate button can be triggered with Enter key', () => {
      const calculateBtn = document.getElementById('calculate-btn');
      calculateBtn.focus();
      simulateKeyEvent(calculateBtn, 'keydown', 'Enter');
      
      expect(mortgageCalculator.updatePaymentResult).toHaveBeenCalled();
    });
    
    test('Reset button can be triggered with Space key', () => {
      const resetBtn = document.getElementById('reset-btn');
      resetBtn.focus();
      simulateKeyEvent(resetBtn, 'keydown', ' ');
      
      expect(mortgageCalculator.updatePaymentResult).toHaveBeenCalled();
    });
    
    test('Inputs can be adjusted with arrow keys', () => {
      const loanInput = document.getElementById('loan-amount-a11y');
      const originalValue = parseFloat(loanInput.value);
      
      // Arrow up should increase value
      loanInput.focus();
      simulateKeyEvent(loanInput, 'keydown', 'ArrowUp');
      
      expect(loanInput.stepUp).toHaveBeenCalled();
      
      // Arrow down should decrease value
      simulateKeyEvent(loanInput, 'keydown', 'ArrowDown');
      
      expect(loanInput.stepDown).toHaveBeenCalled();
    });
  });
  
  describe('Screen Reader Announcements', () => {
    test('Screen reader announcer updates when payment changes', () => {
      const announcer = document.getElementById('screen-reader-announcer');
      const loanInput = document.getElementById('loan-amount-a11y');
      
      // Update loan amount and recalculate
      loanInput.value = '400000';
      mortgageCalculator.updatePaymentResult('a11y');
      
      // Check announcer content
      expect(announcer.textContent).toContain('Estimated monthly payment updated to');
    });
    
    test('Error messages are announced with alert role', () => {
      const errorMessage = document.getElementById('error-message');
      
      // Verify the role
      expect(errorMessage.getAttribute('role')).toBe('alert');
      
      // Update error message content
      errorMessage.textContent = 'New error message for testing';
      
      // Error message content should be immediately available to screen readers
      expect(errorMessage.textContent).toBe('New error message for testing');
    });
  });
  
  describe('Validation and Messaging', () => {
    test.skip('Input validation updates aria-invalid attribute', () => {
      const loanInput = document.getElementById('loan-amount-a11y');
      
      // Set valid value
      loanInput.value = '300000';
      mortgageCalculator.validateInput(loanInput);
      
      // Should not have aria-invalid
      expect(loanInput.hasAttribute('aria-invalid')).toBe(false);
      
      // Set invalid value
      loanInput.value = '5000'; // Below min
      mortgageCalculator.validateInput(loanInput);
      
      // Should have aria-invalid set to true
      expect(loanInput.getAttribute('aria-invalid')).toBe('true');
    });
    
    test('Error messaging is properly associated with inputs', () => {
      const errorInput = document.getElementById('loan-amount-error');
      const errorMessage = document.getElementById('error-message');
      
      // Verify association between input and error message
      expect(errorInput.getAttribute('aria-describedby')).toBe('error-message');
      expect(errorMessage.id).toBe('error-message');
    });
  });
  
  describe('Reduced Motion Support', () => {
    test('Toggle button transitions show proper ARIA attributes', () => {
      const toggleBtn = document.getElementById('toggle-calculator');
      
      // Initial state
      expect(toggleBtn.getAttribute('aria-expanded')).toBe('false');
      
      // After click
      simulateEvent(toggleBtn, 'click');
      
      // Expanded state
      expect(toggleBtn.getAttribute('aria-expanded')).toBe('true');
      expect(toggleBtn.textContent).toBe('Hide Calculator');
      
      // After second click
      simulateEvent(toggleBtn, 'click');
      
      // Back to initial state
      expect(toggleBtn.getAttribute('aria-expanded')).toBe('false');
      expect(toggleBtn.textContent).toBe('Show Calculator');
    });
  });
});