import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@contexts/ThemeContext';
import { CustomerVerification } from '../types/support';

interface CustomerVerificationProps {
  onVerificationComplete: (verification: CustomerVerification) => void;
  onCancel: () => void;
}

export function CustomerVerificationModal({
  onVerificationComplete,
  onCancel,
}: CustomerVerificationProps) {
  const { colors } = useTheme();
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Email, 2: Verification Code, 3: Security
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailSubmit = useCallback(async () => {
    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      // Call API to send verification code
      // await sendVerificationCode(email);
      setStep(2);
      setError('');
    } catch (err) {
      setError('Failed to send verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [email]);

  const handleCodeSubmit = useCallback(async () => {
    if (verificationCode.length !== 6) {
      setError('Verification code must be 6 digits');
      return;
    }

    setIsLoading(true);
    try {
      // Verify the code with backend
      // const verified = await verifyCode(email, verificationCode);
      setStep(3);
      setError('');
    } catch (err) {
      setError('Invalid verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [email, verificationCode]);

  const handleSecurityVerification = useCallback(async () => {
    if (securityAnswer.trim().length === 0) {
      setError('Please answer the security question');
      return;
    }

    setIsLoading(true);
    try {
      // Verify security answer and complete verification
      const verification: CustomerVerification = {
        customerId: '', // Would be returned from API
        email,
        phone,
        verificationMethod: 'email',
        isVerified: true,
        verifiedAt: new Date(),
      };
      onVerificationComplete(verification);
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [email, phone, securityAnswer, onVerificationComplete]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    content: {
      padding: 20,
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 24,
    },
    headerIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.brand + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    headerText: {
      flex: 1,
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      color: colors.muted,
    },
    form: {
      flex: 1,
    },
    formGroup: {
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.stroke,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 14,
      color: colors.text,
      backgroundColor: colors.panel2,
    },
    errorText: {
      fontSize: 12,
      color: colors.danger,
      marginTop: 6,
    },
    infoBox: {
      backgroundColor: colors.brand + '10',
      borderLeftWidth: 4,
      borderLeftColor: colors.brand,
      padding: 12,
      borderRadius: 6,
      marginBottom: 16,
    },
    infoText: {
      fontSize: 13,
      color: colors.text,
      lineHeight: 20,
    },
    stepIndicator: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 24,
    },
    step: {
      flex: 1,
      height: 4,
      backgroundColor: colors.stroke,
      marginHorizontal: 4,
      borderRadius: 2,
    },
    stepActive: {
      backgroundColor: colors.brand,
    },
    footer: {
      flexDirection: 'row',
      gap: 12,
      paddingTop: 20,
      borderTopWidth: 1,
      borderTopColor: colors.stroke,
    },
    button: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    primaryButton: {
      backgroundColor: colors.brand,
    },
    secondaryButton: {
      backgroundColor: colors.stroke,
    },
    buttonText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    secondaryButtonText: {
      color: colors.text,
    },
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Step Indicator */}
        <View style={styles.stepIndicator}>
          <View style={[styles.step, step >= 1 && styles.stepActive]} />
          <View style={[styles.step, step >= 2 && styles.stepActive]} />
          <View style={[styles.step, step >= 3 && styles.stepActive]} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <MaterialCommunityIcons name="shield-check" size={24} color={colors.brand} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>Verify Your Identity</Text>
            <Text style={styles.subtitle}>
              {step === 1 && 'Step 1 of 3: Email Verification'}
              {step === 2 && 'Step 2 of 3: Enter Code'}
              {step === 3 && 'Step 3 of 3: Security Question'}
            </Text>
          </View>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            We need to verify your identity to connect you with our support team. Your information is secure and encrypted.
          </Text>
        </View>

        {/* Step 1: Email */}
        {step === 1 && (
          <View style={styles.form}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your registered email"
                placeholderTextColor={colors.muted}
                value={email}
                onChangeText={setEmail}
                editable={!isLoading}
                keyboardType="email-address"
              />
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>
        )}

        {/* Step 2: Verification Code */}
        {step === 2 && (
          <View style={styles.form}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Verification Code</Text>
              <Text style={styles.subtitle} numberOfLines={2}>
                Enter the 6-digit code sent to {email}
              </Text>
            </View>
            <View style={styles.formGroup}>
              <TextInput
                style={styles.input}
                placeholder="000000"
                placeholderTextColor={colors.muted}
                value={verificationCode}
                onChangeText={setVerificationCode}
                editable={!isLoading}
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>
        )}

        {/* Step 3: Security Question */}
        {step === 3 && (
          <View style={styles.form}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Security Question</Text>
              <Text style={styles.subtitle} numberOfLines={2}>
                What is the name of your first pet?
              </Text>
            </View>
            <View style={styles.formGroup}>
              <TextInput
                style={styles.input}
                placeholder="Enter your answer"
                placeholderTextColor={colors.muted}
                value={securityAnswer}
                onChangeText={setSecurityAnswer}
                editable={!isLoading}
              />
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>
        )}
      </ScrollView>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={onCancel}
          disabled={isLoading}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>
            {step === 1 ? 'Cancel' : 'Back'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={
            step === 1
              ? handleEmailSubmit
              : step === 2
                ? handleCodeSubmit
                : handleSecurityVerification
          }
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.buttonText}>
              {step === 3 ? 'Verify & Continue' : 'Next'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
