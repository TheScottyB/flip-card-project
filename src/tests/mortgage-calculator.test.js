/**
 * Comprehensive Mortgage Calculator Test Suite
 * Tests functionality, accessibility, and integration with card system
 */

// Setup complete DOM test environment with all calculator variants
const setupCompleteDOM = () => {
  document.body.innerHTML = `
    <!-- Screen reader announcer -->
    <div id="screen-reader-announcer" aria-live="polite" aria-atomic="true"></div>
    
    <!-- Home Start Calculator -->
    <div class="mortgage-calculator" data-testid="home-start-calculator">
      <div class="calculator-header">
        <h3 id="calculator-title-home">Payment Calculator</h3>
      </div>
      <div class="calculator-inputs">
        <div class="input-group">
          <label for="loan-amount-home-start">Loan Amount ($)</label>
          <input type="number" id="loan-amount-home-start" class="calculator-input calc-loan-amount" 
                value="250000" min="10000" max="2000000" step="5000" data-card-type="home-start"
                aria-describedby="amount-hint-home-start">
          <div id="amount-hint-home-start" class="hint-text">Enter amount between $10,000 and $2,000,000</div>
        </div>
        <div class="input-group">
          <label for="down-payment-home-start">Down Payment (%)</label>
          <input type="number" id="down-payment-home-start" class="calculator-input calc-down-payment" 
                value="3.5" min="0" max="50" step="0.5" data-card-type="home-start">
        </div>
        <div class="input-group">
          <label for="interest-rate-home-start">Interest Rate (%)</label>
          <input type="number" id="interest-rate-home-start" class="calculator-input calc-interest-rate" 
                value="6.25" min="0.1" max="15" step="0.125" data-card-type="home-start">
        </div>
        <div class="input-group">
          <label for="loan-term-home-start">Loan Term (years)</label>
          <select id="loan-term-home-start" class="calculator-input calc-loan-term" data-card-type="home-start">
            <option value="30">30 years</option>
            <option value="20">20 years</option>
            <option value="15">15 years</option>
            <option value="10">10 years</option>
          </select>
        </div>
      </div>
      <div class="calculation-result">
        <div class="result-label">Estimated Monthly Payment (P&I)</div>
        <div id="payment-result-home-start" class="payment-result" aria-live="polite" aria-atomic="true">$1,538.67</div>
        <p class="result-note">Principal and interest only. Taxes and insurance not included.</p>
      </div>
    </div>
    
    <!-- VA Loans Calculator -->
    <div class="mortgage-calculator" data-testid="va-loans-calculator">
      <div class="calculator-header">
        <h3 id="calculator-title-va">Payment Calculator</h3>
      </div>
      <div class="calculator-inputs">
        <div class="input-group">
          <label for="loan-amount-va-loans">Loan Amount ($)</label>
          <input type="number" id="loan-amount-va-loans" class="calculator-input calc-loan-amount" 
                value="300000" min="10000" max="2000000" step="5000" data-card-type="va-loans"
                aria-describedby="amount-hint-va">
          <div id="amount-hint-va" class="hint-text">Enter amount between $10,000 and $2,000,000</div>
        </div>
        <div class="input-group">
          <label for="down-payment-va-loans">Down Payment (%)</label>
          <input type="number" id="down-payment-va-loans" class="calculator-input calc-down-payment" 
                value="0" min="0" max="50" step="0.5" data-card-type="va-loans">
        </div>
        <div class="input-group">
          <label for="interest-rate-va-loans">Interest Rate (%)</label>
          <input type="number" id="interest-rate-va-loans" class="calculator-input calc-interest-rate" 
                value="5.75" min="0.1" max="15" step="0.125" data-card-type="va-loans">
        </div>
        <div class="input-group">
          <label for="loan-term-va-loans">Loan Term (years)</label>
          <select id="loan-term-va-loans" class="calculator-input calc-loan-term" data-card-type="va-loans">
            <option value="30">30 years</option>
            <option value="20">20 years</option>
            <option value="15">15 years</option>
            <option value="10">10 years</option>
          </select>
        </div>
      </div>
      <div class="calculation-result">
        <div class="result-label">Estimated Monthly Payment (P&I)</div>
        <div id="payment-result-va-loans" class="payment-result" aria-live="polite" aria-atomic="true">$1,751.24</div>
        <p class="result-note">Principal and interest only. Taxes and insurance not included.</p>
      </div>
    </div>
    
    <!-- Conventional Loans Calculator -->
    <div class="mortgage-calculator" data-testid="conventional-calculator">
      <div class="calculator-header">
        <h3 id="calculator-title-conv">Payment Calculator</h3>
      </div>
      <div class="calculator-inputs">
        <div class="input-group">
          <label for="loan-amount-conventional">Loan Amount ($)</label>
          <input type="number" id="loan-amount-conventional" class="calculator-input calc-loan-amount" 
                value="350000" min="10000" max="2000000" step="5000" data-card-type="conventional"
                aria-describedby="amount-hint-conv">
          <div id="amount-hint-conv" class="hint-text">Enter amount between $10,000 and $2,000,000</div>
        </div>
        <div class="input-group">
          <label for="down-payment-conventional">Down Payment (%)</label>
          <input type="number" id="down-payment-conventional" class="calculator-input calc-down-payment" 
                value="20" min="3" max="50" step="0.5" data-card-type="conventional">
        </div>
        <div class="input-group">
          <label for="interest-rate-conventional">Interest Rate (%)</label>
          <input type="number" id="interest-rate-conventional" class="calculator-input calc-interest-rate" 
                value="6.0" min="0.1" max="15" step="0.125" data-card-type="conventional">
        </div>
        <div class="input-group">
          <label for="loan-term-conventional">Loan Term (years)</label>
          <select id="loan-term-conventional" class="calculator-input calc-loan-term" data-card-type="conventional">
            <option value="30">30 years</option>
            <option value="20">20 years</option>
            <option value="15">15 years</option>
            <option value="10">10 years</option>
          </select>
        </div>
      </div>
      <div class="calculation-result">
        <div class="result-label">Estimated Monthly Payment (P&I)</div>
        <div id="payment-result-conventional" class="payment-result" aria-live="polite" aria-atomic="true">$1,678.43</div>
        <p class="result-note">Principal and interest only. Taxes and insurance not included.</p>
      </div>
    </div>
    
    <!-- Flip Card Integration Test Elements -->
    <div class="flip-card card-standard" data-testid="va-loans-card">
      <div class="flip-card-inner">
        <div class="flip-card-front">
          <!-- VA calculator is embedded here -->
          <div id="va-calculator-container"></div>
          <button class="flip-trigger" aria-pressed="false">View More</button>
        </div>
        <div class="flip-card-back">
          <button class="flip-trigger" aria-pressed="true">Return</button>
        </div>
      </div>
    </div>
    
    <!-- Error Test Cases -->
    <div class="mortgage-calculator" data-testid="error-test-calculator">
      <input type="number" id="loan-amount-error" class="calculator-input calc-loan-amount" 
             value="-5000" min="10000" max="2000000" step="5000" data-card-type="error-test">
      <input type="text" id="interest-rate-error" class="calculator-input calc-interest-rate" 
             value="not-a-number" min="0.1" max="15" step="0.125" data-card-type="error-test">
      <div id="payment-result-error-test" aria-live="polite">$0.00</div>
    </div>
  `;
};

// Set up smaller DOM for specific tests
const setupMinimalDOM = () => {
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

// Mock the mortgage calculator functionality
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

// Helper function to simulate events
const simulateEvent = (element, eventName, options = {}) => {
  const event = new Event(eventName, { bubbles: true, ...options });
  element.dispatchEvent(event);
};

// Helper function to simulate keyboard events
const simulateKeyEvent = (element, eventName, key) => {
  const event = new KeyboardEvent(eventName, { 
    bubbles: true,
    key,
    code: key
  });
  element.dispatchEvent(event);
};

// Make calculator available globally for tests
window.mortgageCalculator = mortgageCalculator;

// ====================================================================================
// 6. Error Handling Tests
// ====================================================================================
describe('Mortgage Calculator - Error Handling', () => {
  beforeEach(() => {
    setupCompleteDOM();
  });
  
  afterEach(() => {
    document.body.innerHTML = '';    test('Handles non-numeric inputs gracefully', () => {
      const loanInput = document.getElementById('loan-amount-test');
      const interestInput = document.getElementById('interest-rate-test');
      const downPaymentInput = document.getElementById('down-payment-test');
      
      // Set all inputs to non-numeric values
      loanInput.value = 'invalid';
      interestInput.value = 'abc';
      downPaymentInput.value = 'xyz';
      
      // Validate all inputs
      mortgageCalculator.validateInput(loanInput);
      mortgageCalculator.validateInput(interestInput);
      mortgageCalculator.validateInput(downPaymentInput);
      
      // All should be constrained to valid values
      expect(parseFloat(loanInput.value)).toBe(10000); // min loan amount
      expect(parseFloat(interestInput.value)).toBe(0.1); // min interest rate
      expect(parseFloat(downPaymentInput.value)).toBe(0); // min down payment
    });
 {
    test('Handles missing DOM elements gracefully', () => {
      // Get result before removing elements
      const originalResult = document.getElementById('payment-result-error-test').textContent;
      
      // Remove one of the required inputs
      const interestInput = document.getElementById('interest-rate-error');
      if (interestInput && interestInput.parentNode) {
        interestInput.parentNode.removeChild(interestInput);
      }
      
      // Attempt to calculate with missing element
      const result = mortgageCalculator.updatePaymentResult('error-test');
      
      // Should handle gracefully
      expect(result).toBe(0);
    });
    
    test('Handles malformed inputs without crashing', () => {
      const errorResult = document.getElementById('payment-result-error-test');
      
      // Attempt to calculate with malformed inputs (already set in DOM setup)
      mortgageCalculator.updatePaymentResult('error-test');
      
      // Should show $0 for invalid inputs
      expect(errorResult.textContent).toBe('$0.00');
    });
    });
  });
-error');
      if (interestInput && interestInput.parentNode) {
        interestInput.parentNode.removeChild(interestInput);
      }
      
      // Attempt to calculate with missing element
      const result = mortgageCalculator.updatePaymentResult('error-test');
      
      // Should handle gracefully
      expect(result).toBe(0);
    });
    
    test('Handles malformed inputs without crashing', () => {
      const errorResult = document.getElementById('payment-result-error-test');
      
      // Attempt to calculate with malformed inputs (already set in DOM setup)
      mortgageCalculator.updatePaymentResult('error-test');
      
      // Should show $0 for invalid inputs
      expect(errorResult.textContent).toBe('$0.00');
    });
  });
      const interestInput = document.getElementById('interest-rate-test');
      interestInput.value = 'abc';
      
      const validatedValue = mortgageCalculator.validateInput(interestInput);
      expect(validatedValue).toBe(0.1); // Should default to min
    });
    
    test('Handles non-numeric down payment', () => {
      const downPaymentInput = document.getElementById('down-payment-test');
      downPaymentInput.value = 'xyz';
      
      const validatedValue = mortgageCalculator.validateInput(downPaymentInput);
      expect(validatedValue).toBe(0); // Should default to min
    });
  });
});

// ====================================================================================
// 3. UI Interaction Tests
// ====================================================================================
describe('Mortgage Calculator - UI Interactions', () => {
  beforeEach(() => {
    setupMinimalDOM();
    
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
  
  describe('Event Handling', () => {
    test('Blur event triggers validation and update', () => {
      const interestInput = document.getElementById('interest-rate-test');
      interestInput.value = '7.2'; // Not a multiple of 0.125
      
      simulateEvent(interestInput, 'blur');
      
      // Should validate to 7.25
      expect(interestInput.value).toBe('7.25');
      expect(window.mortgageCalculator.update).toHaveBeenCalledTimes(1);
    });
    
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
      // Expected payment around $1,530
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
  });
});

// ====================================================================================
// 4. Accessibility Tests
// ====================================================================================
describe('Mortgage Calculator - Accessibility', () => {
  beforeEach(() => {
    setupCompleteDOM();
  });
  
  afterEach(() => {
    document.body.innerHTML = '';
  });
  
  describe('ARIA Attributes', () => {
    test('Result elements have appropriate ARIA attributes', () => {
      const resultElements = document.querySelectorAll('.payment-result');
      
      resultElements.forEach(element => {
        expect(element.hasAttribute('aria-live')).toBe(true);
        expect(element.getAttribute('aria-live')).toBe('polite');
        expect(element.hasAttribute('aria-atomic')).toBe(true);
      });
    });
    
    test('Input elements have appropriate labels', () => {
      const inputElements = document.querySelectorAll('input.calculator-input');
      
      inputElements.forEach(input => {
        const inputId = input.getAttribute('id');
        const label = document.querySelector(`label[for="${inputId}"]`);
        expect(label).not.toBeNull();
      });
    });
    
    test('Inputs with hints have aria-describedby attributes', () => {
      const loanAmountInputs = document.querySelectorAll('.calc-loan-amount');
      
      loanAmountInputs.forEach(input => {
        expect(input.hasAttribute('aria-describedby')).toBe(true);
        const hintId = input.getAttribute('aria-describedby');
        const hintElement = document.getElementById(hintId);
        expect(hintElement).not.toBeNull();
      });
    });
  });
  
  describe('Screen Reader Announcements', () => {
    test('Screen reader announcer exists', () => {
      const announcer = document.getElementById('screen-reader-announcer');
      expect(announcer).not.toBeNull();
      expect(announcer.getAttribute('aria-live')).toBe('polite');
      expect(announcer.getAttribute('aria-atomic')).toBe('true');
    });
    
    test('Payment updates are announced to screen readers', () => {
      const announcer = document.getElementById('screen-reader-announcer');
      
      // Simulate payment update
      mortgageCalculator.updatePaymentResult('home-start');
      
      expect(announcer.textContent).not.toBe('');
      expect(announcer.textContent).toContain('Estimated monthly payment updated to');
      expect(announcer.textContent).toContain('$');
    });
  });
  
  describe('Keyboard Navigation', () => {
    test('Flip card trigger buttons have aria-pressed attributes', () => {
      const triggerButtons = document.querySelectorAll('.flip-trigger');
      
      triggerButtons.forEach(button => {
        expect(button.hasAttribute('aria-pressed')).toBe(true);
      });
    });
    
    test('Form elements have appropriate tab order', () => {
      // This would require a more complex test with document.activeElement tracking
      // For now we'll just verify tabindex is not set (natural tab order)
      const formElements = document.querySelectorAll('.calculator-input, .flip-trigger');
      
      formElements.forEach(element => {
        expect(element.getAttribute('tabindex')).toBe(null);
      });
    });
  });
});

// ====================================================================================
// 5. Integration Tests
// ====================================================================================
describe('Mortgage Calculator - Integration Tests', () => {
  beforeEach(() => {
    setupCompleteDOM();
    
    // Mock flip card functionality
    window.flipCard = {
      flip: jest.fn(),
      onFlip: jest.fn()
    };
    
    // Add flip card event listeners
    const flipTriggers = document.querySelectorAll('.flip-trigger');
    flipTriggers.forEach(trigger => {
      trigger.addEventListener('click', () => {
        const isFlipped = trigger.getAttribute('aria-pressed') === 'true';
        const newState = !isFlipped;
        window.flipCard.flip(newState);
      });
    });
  });
  
  afterEach(() => {
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });
  
  describe('Card Flip Integration', () => {
    test('Calculator state persists through card flip', () => {
      // Set up mocked flip behavior
      window.flipCard.flip.mockImplementation(isFlipped => {
        const triggers = document.querySelectorAll('.flip-trigger');
        triggers.forEach(trigger => {
          trigger.setAttribute('aria-pressed', isFlipped.toString());
        });
        
        if (window.flipCard.onFlip) {
          window.flipCard.onFlip(isFlipped);
        }
      });
      
      // Get VA calculator inputs and result
      const loanInput = document.getElementById('loan-amount-va-loans');
      const resultElement = document.getElementById('payment-result-va-loans');
      const initialResult = resultElement.textContent;
      
      // Update input
      loanInput.value = '400000';
      mortgageCalculator.updatePaymentResult('va-loans');
      const updatedResult = resultElement.textContent;
      
      // Flip card
      const frontTrigger = document.querySelector('.flip-card-front .flip-trigger');
      simulateEvent(frontTrigger, 'click');
      
      // Flip back
      const backTrigger = document.querySelector('.flip-card-back .flip-trigger');
      simulateEvent(backTrigger, 'click');
      
      // Check if result is preserved
      expect(resultElement.textContent).toBe(updatedResult);
      expect(resultElement.textContent).not.toBe(initialResult);
      expect(window.flipCard.flip).toHaveBeenCalledTimes(2);
    });
  });
  
  describe('Multiple Calculator Instances', () => {
    test('Each calculator instance operates independently', () => {
      // Get result elements for different calculator types
      const homeStartResult = document.getElementById('payment-result-home-start');
      const vaLoansResult = document.getElementById('payment-result-va-loans');
      const conventionalResult = document.getElementById('payment-result-conventional');
      
      // Update one calculator
      const homeStartLoanInput = document.getElementById('loan-amount-home-start');
      homeStartLoanInput.value = '500000';
      mortgageCalculator.updatePaymentResult('home-start');
      
      // Only the updated calculator should change
      const updatedHomeStartResult = homeStartResult.textContent;
      expect(updatedHomeStartResult).not.toBe('$1,538.67');
      expect(vaLoansResult.textContent).toBe('$1,751.24');
      expect(conventionalResult.textContent).toBe('$1,678.43');
    });
    
    test('Different loan types use their specific preset values', () => {
      // Store initial results
      const homeStartResult = document.getElementById('payment-result-home-start').textContent;
      const vaLoansResult = document.getElementById('payment-result-va-loans').textContent;
      const conventionalResult = document.getElementById('payment-result-conventional').textContent;
      
      // All calculators should have different results based on their presets
      expect(homeStartResult).not.toBe(vaLoansResult);
      expect(vaLoansResult).not.toBe(conventionalResult);
      expect(conventionalResult).not.toBe(homeStartResult);
    });
  });
});

// ====================================================================================
// 6. Error Handling Tests
// ====================================================================================
describe('Mortgage Calculator - Error Handling', () => {
  beforeEach(() => {
    setupCompleteDOM();
  });
  
  afterEach(() => {
    document.body.innerHTML = '';
  });
  
  describe('Invalid Input Handling', () => {
    test('Handles missing DOM elements gracefully', () => {
      // Get result before removing elements
      const payment1 = mortgageCalculator.calculateMonthlyPayment(300000, 0, 6, 30);
      expect(payment1).toBeCloseTo(1798.65, 0);
      
      // 3.5% down payment (FHA typical)
      const payment2 = mortgageCalculator.calculateMonthlyPayment(300000, 3.5, 6, 30);
      expect(payment2).toBeCloseTo(1735.70, 0);
      
      // 20% down payment (conventional typical)
      const payment3 = mortgageCalculator.calculateMonthlyPayment(300000, 20, 6, 30);
      expect(payment3).toBeCloseTo(1439.00, 0);
    });
    
    test('Calculates correctly with different loan terms', () => {
      // Base loan of $300,000 with 20% down at 6% interest
      
      // 15-year term
      const payment15yr = mortgageCalculator.calculateMonthlyPayment(300000, 20, 6, 15);
      expect(payment15yr).toBeCloseTo(2029.00, 0);
      
      // 20-year term
      const payment20yr = mortgageCalculator.calculateMonthlyPayment(300000, 20, 6, 20);
      expect(payment20yr).toBeCloseTo(1719.00, 0);
      
      // 30-year term
      const payment30yr = mortgageCalculator.calculateMonthlyPayment(300000, 20, 6, 30);
      expect(payment30yr).toBeCloseTo(1439.00, 0);
    });
    
    test('Calculates correctly with different interest rates', () => {
      // Base loan of $300,000 with 20% down, 30-year term
      
      // 3% interest rate
      const lowRatePayment = mortgageCalculator.calculateMonthlyPayment(300000, 20, 3, 30);
      
      // 6% interest rate
      const midRatePayment = mortgageCalculator.calculateMonthlyPayment(300000, 20, 6, 30);
      
      // 9% interest rate
      const highRatePayment = mortgageCalculator.calculateMonthlyPayment(300000, 20, 9, 30);
      
      // Higher interest rates should result in higher payments
      expect(lowRatePayment).toBeLessThan(midRatePayment);
      expect(midRatePayment).toBeLessThan(highRatePayment);
    });
  });
  
  // Test edge cases and error handling
  describe('Edge Cases and Error Handling', () => {
    test('Handles very low and very high loan amounts', () => {
      // Very low loan amount (minimum allowed)
      const lowLoanPayment = mortgageCalculator.calculateMonthlyPayment(10000, 20, 6, 30);
      expect(lowLoanPayment).toBeGreaterThan(0);
      
      // Very high loan amount
      const highLoanPayment = mortgageCalculator.calculateMonthlyPayment(2000000, 20, 6, 30);
      expect(highLoanPayment).toBeGreaterThan(0);
    });
    
    test('Handles extreme interest rates', () => {
      // Very low interest rate (near zero)
      const lowInterestPayment = mortgageCalculator.calculateMonthlyPayment(300000, 20, 0.1, 30);
      
      // Very high interest rate (maximum allowed)
      const highInterestPayment = mortgageCalculator.calculateMonthlyPayment(300000, 20, 15, 30);
      
      expect(lowInterestPayment).toBeGreaterThan(0);
      expect(highInterestPayment).toBeGreaterThan(0);
      expect(highInterestPayment).toBeGreaterThan(lowInterestPayment);
    });
    
    test('Returns 0 for invalid inputs', () => {
      // Zero loan amount
      expect(mortgageCalculator.calculateMonthlyPayment(0, 20, 6, 30)).toBe(0);
      
      // Zero interest rate
      expect(mortgageCalculator.calculateMonthlyPayment(300000, 20, 0, 30)).toBe(0);
      
      // Zero loan term
      expect(mortgageCalculator.calculateMonthlyPayment(300000, 20, 6, 0)).toBe(0);
      
      // Negative values
      expect(mortgageCalculator.calculateMonthlyPayment(-300000, 20, 6, 30)).toBe(0);
      expect(mortgageCalculator.calculateMonthlyPayment(300000, 20, -6, 30)).toBe(0);
      expect(mortgageCalculator.calculateMonthlyPayment(300000, 20, 6, -30)).toBe(0);
    });
    
    test('Handles special case with 100% down payment', () => {
      const payment = mortgageCalculator.calculateMonthlyPayment(300000, 100, 6, 30);
      expect(payment).toBe(0);
    });
  });
  
  // Test different loan types (presets)
  describe('Loan Type Presets', () => {
    test('FHA loan (Home Start) preset calculation', () => {
      // Typical FHA: 3.5% down, higher interest rate
      const payment = mortgageCalculator.calculateMonthlyPayment(250000, 3.5, 6.25, 30);
      expect(payment).toBeCloseTo(1478.01, 0);
    });
    
    test('VA loan preset calculation', () => {
      // Typical VA: 0% down, slightly lower interest rate
      const payment = mortgageCalculator.calculateMonthlyPayment(300000, 0, 5.75, 30);
      expect(payment).toBeCloseTo(1751.23, 0);
    });
    
    test('Conventional loan preset calculation', () => {
      // Typical Conventional: 20% down, standard interest rate
      const payment = mortgageCalculator.calculateMonthlyPayment(350000, 20, 6, 30);
      expect(payment).toBeCloseTo(1678.43, 0);
    });
  });
  
  // Test currency formatting
  describe('Currency Formatting', () => {
    test('Formats whole numbers correctly', () => {
      expect(mortgageCalculator.formatCurrency(1500)).toBe('$1,500.00');
    });
    
    test('Formats decimal values correctly', () => {
      expect(mortgageCalculator.formatCurrency(1234.56)).toBe('$1,234.56');
    });
    
    test('Handles rounding correctly', () => {
      expect(mortgageCalculator.formatCurrency(1234.567)).toBe('$1,234.57');
      expect(mortgageCalculator.formatCurrency(1234.561)).toBe('$1,234.56');
    });
    
    test('Formats large numbers with proper commas', () => {
      expect(mortgageCalculator.formatCurrency(1234567.89)).toBe('$1,234,567.89');
    });
    
    test('Handles zero properly', () => {
      expect(mortgageCalculator.formatCurrency(0)).toBe('$0.00');
    });
  });
});

// ====================================================================================
// 2. Input Validation Tests
// ====================================================================================
describe('Mortgage Calculator - Input Validation', () => {
  beforeEach(() => {
    setupMinimalDOM();
  });
  
  afterEach(() => {
    document.body.innerHTML = '';
  });
  
  describe('Numeric Input Constraints', () => {
    test('Enforces minimum loan amount', () => {
      const loanInput = document.getElementById('loan-amount-test');
      loanInput.value = '5000'; // Below min (10000)
      
      const validatedValue = mortgageCalculator.validateInput(loanInput);
      expect(validatedValue).toBe(10000);
      expect(loanInput.value).toBe('10000');
    });
    
    test('Enforces maximum loan amount', () => {
      const loanInput = document.getElementById('loan-amount-test');
      loanInput.value = '2500000'; // Above max (2000000)
      
      const validatedValue = mortgageCalculator.validateInput(loanInput);
      expect(validatedValue).toBe(2000000);
      expect(loanInput.value).toBe('2000000');
    });
    
    test('Constrains down payment to valid range', () => {
      const downPaymentInput = document.getElementById('down-payment-test');
      
      // Test below minimum
      downPaymentInput.value = '-5';
      mortgageCalculator.validateInput(downPaymentInput);
      expect(parseFloat(downPaymentInput.value)).toBe(0);
      
      // Test above maximum
      downPaymentInput.value = '55';
      mortgageCalculator.validateInput(downPaymentInput);
      expect(parseFloat(downPaymentInput.value)).toBe(50);
    });
    
    test('Constrains interest rate to valid range', () => {
      const interestInput = document.getElementById('interest-rate-test');
      
      // Test below minimum
      interestInput.value = '0.05';
      mortgageCalculator.validateInput(interestInput);
      expect(parseFloat(interestInput.value)).toBe(0.1);
      
      // Test above maximum
      interestInput.value = '16';
      mortgageCalculator.validateInput(interestInput);
      expect(parseFloat(interestInput.value)).toBe(15);
    });
  });
  
  describe('Input Step Validation', () => {
    test('Rounds interest rate to nearest step', () => {
      const interestInput = document.getElementById('interest-rate-test');
      
      // Should round to nearest 0.125
      interestInput.value = '5.32';
      mortgageCalculator.validateInput(interestInput);
      expect(parseFloat(interestInput.value)).toBe(5.375);
      
      interestInput.value = '6.06';
      mortgageCalculator.validateInput(interestInput);
      expect(parseFloat(interestInput.value)).toBe(6.0);
    });
    
    test('Rounds loan amount to nearest step', () => {
      const loanInput = document.getElementById('loan-amount-test');
      
      // Should round to nearest 5000
      loanInput.value = '287500';
      mortgageCalculator.validateInput(loanInput);
      expect(parseFloat(loanInput.value)).toBe(285000);
      
      loanInput.value = '342600';
      mortgageCalculator.validateInput(loanInput);
      expect(parseFloat(loanInput.value)).toBe(345000);
    });
    
    test('Rounds down payment to nearest step', () => {
      const downPaymentInput = document.getElementById('down-payment-test');
      
      // Should round to nearest 0.5
      downPaymentInput.value = '3.7';
      mortgageCalculator.validateInput(downPaymentInput);
      expect(parseFloat(downPaymentInput.value)).toBe(3.5);
      
      downPaymentInput.value = '12.3';
      mortgageCalculator.validateInput(downPaymentInput);
      expect(parseFloat(downPaymentInput.value)).toBe(12.5);
    });
  });
  
  describe('Non-Numeric Input Handling', () => {
    test('Handles non-numeric loan amount', () => {
      const loanInput = document.getElementById('loan-amount-test');
      loanInput.value = 'invalid';
      
      const validatedValue = mortgageCalculator.validateInput(loanInput);
      expect(validatedValue).toBe(10000); // Should default to min
    });
    
    test('Handles non-

