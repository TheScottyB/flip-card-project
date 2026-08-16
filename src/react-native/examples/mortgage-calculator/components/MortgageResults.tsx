import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { MortgageResultsProps } from '../types';
import { styles } from '../styles';
import { formatCurrency } from '../utils';

/**
 * MortgageResults component - back side of the flip card
 */
const MortgageResults: React.FC<MortgageResultsProps> = ({
  result,
  onReset,
}) => {
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Calculation Results</Text>
      <Text style={styles.subtitle}>Here's your mortgage breakdown</Text>
      
      <View style={styles.resultContainer}>
        <Text style={styles.resultLabel}>Monthly Payment:</Text>
        <Text style={styles.resultValue}>${formatCurrency(result.monthlyPayment)}</Text>
      </View>
      
      <View style={styles.resultContainer}>
        <Text style={styles.resultLabel}>Total Payment:</Text>
        <Text style={styles.resultValue}>${formatCurrency(result.totalPayment)}</Text>
      </View>
      
      <View style={styles.resultContainer}>
        <Text style={styles.resultLabel}>Total Interest:</Text>
        <Text style={styles.resultValue}>${formatCurrency(result.totalInterest)}</Text>
      </View>
      
      <View style={styles.resultContainer}>
        <Text style={styles.resultLabel}>Principal Amount:</Text>
        <Text style={styles.resultValue}>${formatCurrency(result.principalAmount)}</Text>
      </View>
      
      {result.downPaymentAmount !== undefined && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultLabel}>Down Payment:</Text>
          <Text style={styles.resultValue}>${formatCurrency(result.downPaymentAmount)}</Text>
        </View>
      )}
      
      <TouchableOpacity 
        style={styles.resetButton} 
        onPress={onReset}
      >
        <Text style={styles.buttonText}>New Calculation</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default MortgageResults;

