import { StyleSheet, Dimensions, Platform, ViewStyle, TextStyle } from 'react-native';

// Get screen dimensions for responsive sizing
const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;
const CARD_HEIGHT = CARD_WIDTH * 1.5;

// Color constants
const COLORS = {
  primary: '#2c3e50',
  secondary: '#3498db',
  text: '#2c3e50',
  textLight: '#555',
  border: '#ddd',
  borderLight: '#eee',
  background: '#fff',
  backgroundLight: '#f8f8f8',
  error: 'red',
  white: '#fff'
};

/**
 * Type definitions for style objects
 */
interface StyleTypes {
  container: ViewStyle;
  card: ViewStyle;
  frontCard: ViewStyle;
  backCard: ViewStyle;
  title: TextStyle;
  subtitle: TextStyle;
  inputContainer: ViewStyle;
  label: TextStyle;
  input: ViewStyle;
  calculateButton: ViewStyle;
  resetButton: ViewStyle;
  buttonText: TextStyle;
  resultContainer: ViewStyle;
  resultLabel: TextStyle;
  resultValue: TextStyle;
  errorText: TextStyle;
}

/**
 * Shared styles for the mortgage calculator components
 */
export const styles = StyleSheet.create<StyleTypes>({
  // Container styles
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  
  // Card styles
  card: {
    borderRadius: 16,
    padding: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  frontCard: {
    backgroundColor: COLORS.background,
  },
  backCard: {
    backgroundColor: COLORS.backgroundLight,
  },
  
  // Text styles
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    marginBottom: 24,
    textAlign: 'center',
  },
  
  // Form styles
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: '600',
    color: COLORS.text,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  
  // Button styles
  calculateButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 24,
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Results styles
  resultContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  resultLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  resultValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  
  // Error message
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    marginTop: 8,
    marginBottom: 8,
    textAlign: 'center',
  },
};

// Export dimensions for components to use
export const cardDimensions = {
  width: CARD_WIDTH,
  height: CARD_HEIGHT,
};

