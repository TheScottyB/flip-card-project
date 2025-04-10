/**
 * Integration Tests for Mortgage Calculator
 * Tests the integration of the calculator with flip card components
 */

// Setup for integration tests
const setupIntegrationDOM = () => {
  document.body.innerHTML = `
    <!-- Screen reader announcer -->
    <div id="screen-reader-announcer" aria-live="polite" aria-atomic="true"></div>
    
    <!-- Flip Card Integration Test Elements -->
    <div class="flip-card card-standard" data-testid="test-card">
      <div class="flip-card-inner">
        <div class="flip-card-front">
          <div id="calculator-container">
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
          </div>
          <button class="flip-trigger" aria-pressed="false" aria-controls="back-card">View Details</button>
        </div>
        <div class="flip-card-back" id="back-card">
          <div class="back-content">
            <h3>Loan Details</h3>
            <p>This shows additional details about the loan.</p>
          </div>
          <button class="flip-trigger" aria-pressed="true" aria-controls="front-card">Back to Calculator</button>
        </div>
      </div>
    </div>
    
    <!-- Multiple Card Test -->
    <div class="multi-card-container">
      <!-- Card 1 -->
      <div class="flip-card card-mini" data-testid="card-1">
        <div class="flip-card-inner">
          <div class="flip-card-front">
            <div id="calculator-container-1">
              <div class="mortgage-calculator" data-testid="calculator-1">
                <input type="number" id="loan-amount-card1" class="calculator-input calc-loan-amount" 
                       value="250000" min="10000" max="2000000" step="5000" data-card-type="card1">
                <div id="payment-result-card1" aria-live="polite">$0.00</div>
              </div>
            </div>
            <button class="flip-trigger" aria-pressed="false" aria-controls="card1-back">Details</button>
          </div>
          <div class="flip-card-back" id="card1-back">
            <div class="back-content">
              <h3>Card 1 Details</h3>
            </div>
            <button class="flip-trigger" aria-pressed="true" aria-controls="card1-front">Back</button>
          </div>
        </div>
      </div>
      
      <!-- Card 2 -->
      <div class="flip-card card-mini" data-testid="card-2">
        <div class="flip-card-inner">
          <div class="flip-card-front" id="card2-front">
            <div id="calculator-container-2">
              <div class="mortgage-calculator" data-testid="calculator-2">
                <input type="number" id="loan-amount-card2" class="calculator-input calc-loan-amount" 
                       value="350000" min="10000" max="2000000" step="5000" data-card-type="card2">
                <div id="payment-result-card2" aria-live="polite">$0.00</div>
              </div>
            </div>
            <button class="flip-trigger" aria-pressed="false" aria-controls="card2-back">Details</button>
          </div>
          <div class="flip-card-back" id="card2-back">
            <div class="back-content">
              <h3>Card 2 Details</h3>
            </div>
            <button class="flip-trigger" aria-pressed="true" aria-controls="card2-front">Back</button>
          </div>
        </div>
      </div>
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
    
    if (!loanAmountInput || !resultElement) {
      console.error(`Missing elements for card type: ${cardType}`);
      return 0;
    }
    
    // Validate inputs
    const loanAmount = mortgageCalculator.validateInput(loanAmountInput);
    
    // If specific inputs don't exist (for mini cards), use defaults
    const downPayment = downPaymentInput ? mortgageCalculator.validateInput(downPaymentInput) : 20;
    const interestRate = interestRateInput ? mortgageCalculator.validateInput(interestRateInput) : 6;
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
  }
};

// Mock flip card functionality
const flipCard = {
  flip: (cardId, isFlipped) => {
    const card = document.querySelector(`[data-testid="${cardId}"]`);
    if (!card) return false;
    
    const frontTrigger = card.querySelector('.flip-card-front .flip-trigger');
    const backTrigger = card.querySelector('.flip-card-back .flip-trigger');
    
    if (frontTrigger) frontTrigger.setAttribute('aria-pressed', isFlipped);
    if (backTrigger) backTrigger.setAttribute('aria-pressed', !isFlipped);
    
    // Apply flipped class to inner container
    const innerCard = card.querySelector('.flip-card-inner');
    if (innerCard) {
      if (isFlipped) {
        innerCard.classList.add('flipped');
      } else {
        innerCard.classList.remove('flipped');
      }
    }
    
    return true;
  },
  
  isFlipped: (cardId) => {
    const card = document.querySelector(`[data-testid="${cardId}"]`);
    if (!card) return false;
    
    const innerCard = card.querySelector('.flip-card-inner');
    return innerCard && innerCard.classList.contains('flipped');
  }
};

// Make objects available globally for tests
global.mortgageCalculator = mortgageCalculator;
global.flipCard = flipCard;

describe('Mortgage Calculator - Integration Tests', () => {
  beforeEach(() => {
    setupIntegrationDOM();
    
    // Set up event listeners
    const flipTriggers = document.querySelectorAll('.flip-trigger');
    flipTriggers.forEach(trigger => {
      const cardElement = trigger.closest('[data-testid]');
      if (!cardElement) return;
      
      const cardId = cardElement.getAttribute('data-testid');
      const isInBackSide = trigger.closest('.flip-card-back') !== null;
      
      trigger.addEventListener('click', () => {
        flipCard.flip(cardId, !isInBackSide);
      });
    });
  });
  
  afterEach(() => {
    document.body.innerHTML = '';
  });
  
  describe('Card Flip State Preservation', () => {
    test('Calculator state persists through card flip', () => {
      // Get calculator inputs and result
      const loanInput = document.getElementById('loan-amount-test');
      const resultElement = document.getElementById('payment-result-test');
      
      // Update input and calculate
      const originalValue = loanInput.value;
      loanInput.value = '400000';
      mortgageCalculator.updatePaymentResult('test');
      const updatedResult = resultElement.textContent;
      
      // Flip card
      const frontTrigger = document.querySelector('[data-testid="test-card"] .flip-card-front .flip-trigger');
      simulateEvent(frontTrigger, 'click');
      
      // Verify card is flipped
      expect(flipCard.isFlipped('test-card')).toBe(true);
      
      // Flip back
      const backTrigger = document.querySelector('[data-testid="test-card"] .flip-card-back .flip-trigger');
      simulateEvent(backTrigger, 'click');
      
      // Verify card is un-flipped
      expect(flipCard.isFlipped('test-card')).toBe(false);
      
      // Verify calculator state preserved
      expect(loanInput.value).toBe('400000');
      expect(resultElement.textContent).toBe(updatedResult);
    });
  });

  describe('Multiple Calculator Instances', () => {
    test('Each calculator operates independently', () => {
      const calc1Result = document.getElementById('payment-result-card1');
      const calc2Result = document.getElementById('payment-result-card2');
      
      // Update first calculator
      const loanInput1 = document.getElementById('loan-amount-card1');
      loanInput1.value = '500000';
      mortgageCalculator.updatePaymentResult('card1');
      
      // Update second calculator
      const loanInput2 = document.getElementById('loan-amount-card2');
      loanInput2.value = '400000';
      mortgageCalculator.updatePaymentResult('card2');
      
      // Verify calculations are independent
      expect(calc1Result.textContent).not.toBe(calc2Result.textContent);
    });
    
    test('Card flipping does not affect other cards', () => {
      // Flip first card
      const trigger1 = document.querySelector('[data-testid="card-1"] .flip-card-front .flip-trigger');
      simulateEvent(trigger1, 'click');
      
      // Verify only first card is flipped
      expect(flipCard.isFlipped('card-1')).toBe(true);
      expect(flipCard.isFlipped('card-2')).toBe(false);
      expect(flipCard.isFlipped('test-card')).toBe(false);
    });
  });
  
  describe('Error Handling', () => {
    test('Handles missing card elements gracefully', () => {
      // Try to flip non-existent card
      const result = flipCard.flip('non-existent-card', true);
      
      // Should return false, not throw error
      expect(result).toBe(false);
    });
    
    test('Handles missing calculator inputs gracefully', () => {
      // Remove loan input
      const loanInput = document.getElementById('loan-amount-test');
      if (loanInput.parentNode) {
        loanInput.parentNode.removeChild(loanInput);
      }
      
      // Should handle gracefully and return 0
      const result = mortgageCalculator.updatePaymentResult('test');
      expect(result).toBe(0);
    });
  });
  
  describe('Accessibility Integration', () => {
    test('ARIA attributes are updated correctly during card flip', () => {
      // Get trigger buttons
      const frontTrigger = document.querySelector('[data-testid="test-card"] .flip-card-front .flip-trigger');
      const backTrigger = document.querySelector('[data-testid="test-card"] .flip-card-back .flip-trigger');
      
      // Check initial state
      expect(frontTrigger.getAttribute('aria-pressed')).toBe('false');
      expect(backTrigger.getAttribute('aria-pressed')).toBe('true');
      
      // Flip card
      simulateEvent(frontTrigger, 'click');
      
      // Check updated state
      expect(frontTrigger.getAttribute('aria-pressed')).toBe('true');
      expect(backTrigger.getAttribute('aria-pressed')).toBe('false');
      
      // Flip back
      simulateEvent(backTrigger, 'click');
      
      // Check restored state
      expect(frontTrigger.getAttribute('aria-pressed')).toBe('false');
      expect(backTrigger.getAttribute('aria-pressed')).toBe('true');
    });
    
    test('Screen reader announcements are made when payment changes', () => {
      // Get screen reader announcer
      const announcer = document.getElementById('screen-reader-announcer');
      
      // Update calculator
      const loanInput = document.getElementById('loan-amount-test');
      loanInput.value = '450000';
      mortgageCalculator.updatePaymentResult('test');
      
      // Check that announcement was made
      expect(announcer.textContent).toContain('Estimated monthly payment updated to');
      expect(announcer.textContent).toContain('$');
    });
  });
  
  describe('Calculator Persistence', () => {
    test('Calculator values persist after multiple card flips', () => {
      // Get calculator inputs and result
      const loanInput = document.getElementById('loan-amount-test');
      const resultElement = document.getElementById('payment-result-test');
      
      // Update inputs
      loanInput.value = '500000';
      mortgageCalculator.updatePaymentResult('test');
      const updatedResult = resultElement.textContent;
      
      // Perform multiple flips
      for (let i = 0; i < 3; i++) {
        // Flip to back
        const frontTrigger = document.querySelector('[data-testid="test-card"] .flip-card-front .flip-trigger');
        simulateEvent(frontTrigger, 'click');
        
        // Flip to front
        const backTrigger = document.querySelector('[data-testid="test-card"] .flip-card-back .flip-trigger');
        simulateEvent(backTrigger, 'click');
      }
      
      // Verify calculator state preserved
      expect(loanInput.value).toBe('500000');
      expect(resultElement.textContent).toBe(updatedResult);
    });
  });
});