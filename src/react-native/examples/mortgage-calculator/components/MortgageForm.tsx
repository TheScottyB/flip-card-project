import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MortgageFormProps } from '../types';
import { styles } from '../styles';

/**
 * MortgageForm component - front side of the flip card
 * Handles input for mortgage calculation
 */
const MortgageForm: React.FC<MortgageFormProps> = ({
  values,
  error,
  onChangeInput,
  onCalculate,
}) => {
  /**
   * Handle text input changes
   */
  const handleInputChange = (field: keyof typeof values, value: string) => {
    // Only allow numbers and a single decimal point
    const validatedValue = value.replace(/[^0-9.]/g, '');
    
    // Prevent multiple decimal points
    if (
      validatedValue.split('.').length > 2 ||
      (validatedValue.endsWith('.') && validatedValue.indexOf('.') !== validatedValue.length - 1)
    ) {
      return;
    }
    
    onChangeInput(field, validatedValue);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <Text style={styles.title}>Mortgage Calculator</Text>
        <Text style={styles.subtitle}>Enter your mortgage details</Text>
        
        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : null}
        
        {/* Principal Amount */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Principal Amount ($)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 250000"
            keyboardType="decimal-pad"
            value={values.principal}
            onChangeText={(value) => handleInputChange('principal', value)}
          />
        </View>
        
        {/* Interest Rate */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Interest Rate (%)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 4.5"
            keyboardType="decimal-pad"
            value={values.interestRate}
            onChangeText={(value) => handleInputChange('interestRate', value)}
          />
        </View>
        
        {/* Loan Term */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Loan Term (years)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 30"
            keyboardType="number-pad"
            value={values.loanTerm}
            onChangeText={(value) => handleInputChange('loanTerm', value)}
          />
        </View>
        
        {/* Down Payment (Optional) */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Down Payment ($) - Optional</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 50000"
            keyboardType="decimal-pad"
            value={values.downPayment}
            onChangeText={(value) => handleInputChange('downPayment', value)}
          />
        </View>
        
        <TouchableOpacity 
          style={styles.calculateButton} 
          onPress={onCalculate}
          accessibilityLabel="Calculate mortgage payments"
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>Calculate</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default MortgageForm;

