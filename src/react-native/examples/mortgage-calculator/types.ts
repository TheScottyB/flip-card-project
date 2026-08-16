/**
 * Types for the Mortgage Calculator example
 */

/**
 * Input values for mortgage calculation
 */
export interface MortgageInput {
  principal: string;
  interestRate: string;
  loanTerm: string;
  downPayment: string;
}

/**
 * Calculated mortgage results
 */
export interface MortgageResult {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  principalAmount: number;
  downPaymentAmount?: number;
}

/**
 * Props for the mortgage form component
 */
export interface MortgageFormProps {
  values: MortgageInput;
  error: string;
  onChangeInput: (field: keyof MortgageInput, value: string) => void;
  onCalculate: () => void;
}

/**
 * Props for the mortgage results component
 */
export interface MortgageResultsProps {
  result: MortgageResult;
  onReset: () => void;
}

