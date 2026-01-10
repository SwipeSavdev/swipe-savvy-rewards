import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../stores/authStore';
import {
  SignupData,
  PersonalInfo,
  AddressInfo,
  IdentityInfo,
  SIGNUP_STEPS,
  US_STATES,
} from '../types/kyc';
import { kycService } from '../services/kycService';

type StepComponent = React.FC<{
  data: SignupData;
  updateData: (updates: Partial<SignupData>) => void;
  errors: Record<string, string>;
}>;

// Step 1: Personal Information
const PersonalInfoStep: StepComponent = ({ data, updateData, errors }) => {
  const updatePersonal = (field: keyof PersonalInfo, value: string) => {
    updateData({ personal: { ...data.personal, [field]: value } });
  };

  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Personal Information</Text>
      <Text style={styles.stepSubtitle}>Let's get to know you</Text>

      <View style={styles.inputRow}>
        <View style={styles.halfInput}>
          <Text style={styles.label}>First Name</Text>
          <TextInput
            style={[styles.input, errors.firstName && styles.inputError]}
            placeholder="John"
            value={data.personal.firstName}
            onChangeText={(v) => updatePersonal('firstName', v)}
            autoCapitalize="words"
          />
          {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
        </View>
        <View style={styles.halfInput}>
          <Text style={styles.label}>Last Name</Text>
          <TextInput
            style={[styles.input, errors.lastName && styles.inputError]}
            placeholder="Doe"
            value={data.personal.lastName}
            onChangeText={(v) => updatePersonal('lastName', v)}
            autoCapitalize="words"
          />
          {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
        </View>
      </View>

      <Text style={styles.label}>Email Address</Text>
      <TextInput
        style={[styles.input, errors.email && styles.inputError]}
        placeholder="john.doe@example.com"
        value={data.personal.email}
        onChangeText={(v) => updatePersonal('email', v)}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

      <Text style={styles.label}>Phone Number</Text>
      <TextInput
        style={[styles.input, errors.phone && styles.inputError]}
        placeholder="(555) 123-4567"
        value={data.personal.phone}
        onChangeText={(v) => updatePersonal('phone', formatPhoneNumber(v))}
        keyboardType="phone-pad"
      />
      {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

      <Text style={styles.label}>Date of Birth</Text>
      <TextInput
        style={[styles.input, errors.dateOfBirth && styles.inputError]}
        placeholder="MM/DD/YYYY"
        value={data.personal.dateOfBirth}
        onChangeText={(v) => updatePersonal('dateOfBirth', formatDateInput(v))}
        keyboardType="number-pad"
        maxLength={10}
      />
      {errors.dateOfBirth && <Text style={styles.errorText}>{errors.dateOfBirth}</Text>}
    </View>
  );
};

// Step 2: Address Information
const AddressStep: StepComponent = ({ data, updateData, errors }) => {
  const [showStatePicker, setShowStatePicker] = useState(false);

  const updateAddress = (field: keyof AddressInfo, value: string) => {
    updateData({ address: { ...data.address, [field]: value } });
  };

  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Residential Address</Text>
      <Text style={styles.stepSubtitle}>Where do you live?</Text>

      <Text style={styles.label}>Street Address</Text>
      <TextInput
        style={[styles.input, errors.street && styles.inputError]}
        placeholder="123 Main Street"
        value={data.address.street}
        onChangeText={(v) => updateAddress('street', v)}
        autoCapitalize="words"
      />
      {errors.street && <Text style={styles.errorText}>{errors.street}</Text>}

      <Text style={styles.label}>Apartment/Unit (Optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="Apt 4B"
        value={data.address.unit}
        onChangeText={(v) => updateAddress('unit', v)}
      />

      <Text style={styles.label}>City</Text>
      <TextInput
        style={[styles.input, errors.city && styles.inputError]}
        placeholder="New York"
        value={data.address.city}
        onChangeText={(v) => updateAddress('city', v)}
        autoCapitalize="words"
      />
      {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}

      <View style={styles.inputRow}>
        <View style={styles.halfInput}>
          <Text style={styles.label}>State</Text>
          <TouchableOpacity
            style={[styles.input, styles.pickerButton, errors.state && styles.inputError]}
            onPress={() => setShowStatePicker(!showStatePicker)}
          >
            <Text style={data.address.state ? styles.pickerText : styles.pickerPlaceholder}>
              {data.address.state || 'Select State'}
            </Text>
            <MaterialCommunityIcons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
          {errors.state && <Text style={styles.errorText}>{errors.state}</Text>}
        </View>
        <View style={styles.halfInput}>
          <Text style={styles.label}>ZIP Code</Text>
          <TextInput
            style={[styles.input, errors.zipCode && styles.inputError]}
            placeholder="10001"
            value={data.address.zipCode}
            onChangeText={(v) => updateAddress('zipCode', v.replace(/\D/g, '').slice(0, 5))}
            keyboardType="number-pad"
            maxLength={5}
          />
          {errors.zipCode && <Text style={styles.errorText}>{errors.zipCode}</Text>}
        </View>
      </View>

      {showStatePicker && (
        <View style={styles.statePickerContainer}>
          <ScrollView style={styles.statePicker} nestedScrollEnabled>
            {US_STATES.map((state) => (
              <TouchableOpacity
                key={state.value}
                style={[
                  styles.stateOption,
                  data.address.state === state.value && styles.stateOptionSelected,
                ]}
                onPress={() => {
                  updateAddress('state', state.value);
                  setShowStatePicker(false);
                }}
              >
                <Text
                  style={[
                    styles.stateOptionText,
                    data.address.state === state.value && styles.stateOptionTextSelected,
                  ]}
                >
                  {state.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

// Step 3: Identity Verification
const IdentityStep: StepComponent = ({ data, updateData, errors }) => {
  const updateIdentity = (field: keyof IdentityInfo, value: string) => {
    updateData({ identity: { ...data.identity, [field]: value } });
  };

  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Identity Verification</Text>
      <Text style={styles.stepSubtitle}>We need to verify your identity</Text>

      <View style={styles.infoBox}>
        <MaterialCommunityIcons name="shield-check" size={24} color="#007AFF" />
        <Text style={styles.infoText}>
          Your information is encrypted and secure. We only use this to verify your identity and
          comply with federal regulations.
        </Text>
      </View>

      <Text style={styles.label}>Social Security Number (Last 4 digits)</Text>
      <TextInput
        style={[styles.input, errors.ssn && styles.inputError]}
        placeholder="XXXX"
        value={data.identity.ssn}
        onChangeText={(v) => updateIdentity('ssn', v.replace(/\D/g, '').slice(0, 4))}
        keyboardType="number-pad"
        maxLength={4}
        secureTextEntry
      />
      {errors.ssn && <Text style={styles.errorText}>{errors.ssn}</Text>}
      <Text style={styles.helperText}>
        We only collect the last 4 digits for initial verification
      </Text>

      <View style={styles.kycTierInfo}>
        <Text style={styles.kycTierTitle}>What you can do with Tier 1:</Text>
        <View style={styles.kycTierItem}>
          <MaterialCommunityIcons name="check-circle" size={18} color="#34C759" />
          <Text style={styles.kycTierText}>Send up to $500/day</Text>
        </View>
        <View style={styles.kycTierItem}>
          <MaterialCommunityIcons name="check-circle" size={18} color="#34C759" />
          <Text style={styles.kycTierText}>Receive unlimited transfers</Text>
        </View>
        <View style={styles.kycTierItem}>
          <MaterialCommunityIcons name="check-circle" size={18} color="#34C759" />
          <Text style={styles.kycTierText}>Earn cashback rewards</Text>
        </View>
        <Text style={styles.kycTierNote}>
          Upgrade to Tier 2 later for higher limits by providing a government ID
        </Text>
      </View>
    </View>
  );
};

// Step 4: Password & Terms
const SecurityStep: StepComponent = ({ data, updateData, errors }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    updateData({ password: value });
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Secure Your Account</Text>
      <Text style={styles.stepSubtitle}>Create a strong password</Text>

      <Text style={styles.label}>Password</Text>
      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, styles.passwordInput, errors.password && styles.inputError]}
          placeholder="Create a password"
          value={password}
          onChangeText={handlePasswordChange}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setShowPassword(!showPassword)}
        >
          <MaterialCommunityIcons
            name={showPassword ? 'eye-off' : 'eye'}
            size={22}
            color="#666"
          />
        </TouchableOpacity>
      </View>
      {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

      {password.length > 0 && (
        <View style={styles.strengthContainer}>
          <View style={styles.strengthBar}>
            <View
              style={[
                styles.strengthFill,
                {
                  width: `${passwordStrength.score * 25}%`,
                  backgroundColor: passwordStrength.color,
                },
              ]}
            />
          </View>
          <Text style={[styles.strengthText, { color: passwordStrength.color }]}>
            {passwordStrength.label}
          </Text>
        </View>
      )}

      <Text style={styles.label}>Confirm Password</Text>
      <TextInput
        style={[styles.input, errors.confirmPassword && styles.inputError]}
        placeholder="Re-enter your password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry={!showPassword}
        autoCapitalize="none"
      />
      {confirmPassword && password !== confirmPassword && (
        <Text style={styles.errorText}>Passwords do not match</Text>
      )}

      <View style={styles.termsContainer}>
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => updateData({ acceptedTerms: !data.acceptedTerms })}
        >
          <MaterialCommunityIcons
            name={data.acceptedTerms ? 'checkbox-marked' : 'checkbox-blank-outline'}
            size={24}
            color={data.acceptedTerms ? '#007AFF' : '#666'}
          />
        </TouchableOpacity>
        <Text style={styles.termsText}>
          I agree to the{' '}
          <Text style={styles.link}>Terms of Service</Text>
          {' '}and{' '}
          <Text style={styles.link}>Privacy Policy</Text>
        </Text>
      </View>
      {errors.acceptedTerms && <Text style={styles.errorText}>{errors.acceptedTerms}</Text>}

      <View style={styles.termsContainer}>
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => updateData({ acceptedPrivacy: !data.acceptedPrivacy })}
        >
          <MaterialCommunityIcons
            name={data.acceptedPrivacy ? 'checkbox-marked' : 'checkbox-blank-outline'}
            size={24}
            color={data.acceptedPrivacy ? '#007AFF' : '#666'}
          />
        </TouchableOpacity>
        <Text style={styles.termsText}>
          I consent to electronic communications and disclosures
        </Text>
      </View>
    </View>
  );
};

// Helper functions
function formatPhoneNumber(value: string): string {
  const cleaned = value.replace(/\D/g, '').slice(0, 10);
  if (cleaned.length >= 6) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length >= 3) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
  }
  return cleaned;
}

function formatDateInput(value: string): string {
  const cleaned = value.replace(/\D/g, '').slice(0, 8);
  if (cleaned.length >= 4) {
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4)}`;
  } else if (cleaned.length >= 2) {
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
  }
  return cleaned;
}

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score: 1, label: 'Weak', color: '#FF3B30' };
  if (score <= 2) return { score: 2, label: 'Fair', color: '#FF9500' };
  if (score <= 3) return { score: 3, label: 'Good', color: '#FFCC00' };
  return { score: 4, label: 'Strong', color: '#34C759' };
}

// Main Signup Screen Component
export function SignupScreen() {
  const navigation = useNavigation();
  const signup = useAuthStore((state) => state.signup);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [signupData, setSignupData] = useState<SignupData>({
    personal: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
    },
    address: {
      street: '',
      unit: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US',
    },
    identity: {
      ssn: '',
    },
    password: '',
    acceptedTerms: false,
    acceptedPrivacy: false,
  });

  const updateData = useCallback((updates: Partial<SignupData>) => {
    setSignupData((prev) => ({ ...prev, ...updates }));
    setErrors({});
  }, []);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!signupData.personal.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!signupData.personal.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!signupData.personal.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupData.personal.email)) {
        newErrors.email = 'Please enter a valid email';
      }
      if (!signupData.personal.phone.trim()) {
        newErrors.phone = 'Phone number is required';
      } else if (signupData.personal.phone.replace(/\D/g, '').length !== 10) {
        newErrors.phone = 'Please enter a valid 10-digit phone number';
      }
      if (!signupData.personal.dateOfBirth.trim()) {
        newErrors.dateOfBirth = 'Date of birth is required';
      } else {
        const age = calculateAge(signupData.personal.dateOfBirth);
        if (age < 18) newErrors.dateOfBirth = 'You must be 18 or older to sign up';
      }
    }

    if (step === 2) {
      if (!signupData.address.street.trim()) newErrors.street = 'Street address is required';
      if (!signupData.address.city.trim()) newErrors.city = 'City is required';
      if (!signupData.address.state) newErrors.state = 'State is required';
      if (!signupData.address.zipCode.trim()) {
        newErrors.zipCode = 'ZIP code is required';
      } else if (signupData.address.zipCode.length !== 5) {
        newErrors.zipCode = 'Please enter a valid 5-digit ZIP code';
      }
    }

    if (step === 3) {
      if (!signupData.identity.ssn.trim()) {
        newErrors.ssn = 'SSN is required';
      } else if (signupData.identity.ssn.length !== 4) {
        newErrors.ssn = 'Please enter the last 4 digits of your SSN';
      }
    }

    if (step === 4) {
      if (!signupData.password) {
        newErrors.password = 'Password is required';
      } else if (signupData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
      if (!signupData.acceptedTerms) {
        newErrors.acceptedTerms = 'You must accept the Terms of Service';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateStep(currentStep)) return;

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step - submit signup
      await handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // Call KYC verification stub service
      const kycResult = await kycService.verifyKYC(signupData);

      if (kycResult.success) {
        // Signup via auth store
        await signup(signupData, kycResult);
        Alert.alert(
          'Welcome to SwipeSavvy!',
          `Your account has been created with ${kycResult.tier === 'tier1' ? 'Tier 1' : 'Tier 2'} status.`,
          [{ text: 'Get Started', style: 'default' }]
        );
      } else {
        Alert.alert('Verification Failed', kycResult.message || 'Please check your information and try again.');
      }
    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    const stepProps = { data: signupData, updateData, errors };

    switch (currentStep) {
      case 1:
        return <PersonalInfoStep {...stepProps} />;
      case 2:
        return <AddressStep {...stepProps} />;
      case 3:
        return <IdentityStep {...stepProps} />;
      case 4:
        return <SecurityStep {...stepProps} />;
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        {SIGNUP_STEPS.map((step, index) => (
          <React.Fragment key={step.id}>
            <View
              style={[
                styles.progressDot,
                currentStep >= step.id && styles.progressDotActive,
                currentStep > step.id && styles.progressDotComplete,
              ]}
            >
              {currentStep > step.id ? (
                <MaterialCommunityIcons name="check" size={14} color="#FFF" />
              ) : (
                <Text style={[styles.progressNumber, currentStep >= step.id && styles.progressNumberActive]}>
                  {step.id}
                </Text>
              )}
            </View>
            {index < SIGNUP_STEPS.length - 1 && (
              <View style={[styles.progressLine, currentStep > step.id && styles.progressLineActive]} />
            )}
          </React.Fragment>
        ))}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderStep()}
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <MaterialCommunityIcons name="arrow-left" size={20} color="#007AFF" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.nextButton, isLoading && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Text style={styles.nextButtonText}>
                {currentStep === 4 ? 'Create Account' : 'Continue'}
              </Text>
              {currentStep < 4 && (
                <MaterialCommunityIcons name="arrow-right" size={20} color="#FFF" />
              )}
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

function calculateAge(dateString: string): number {
  const parts = dateString.split('/');
  if (parts.length !== 3) return 0;
  const birthDate = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  scrollView: {
    flex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 40,
    backgroundColor: '#F8F9FA',
  },
  progressDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressDotActive: {
    backgroundColor: '#007AFF',
  },
  progressDotComplete: {
    backgroundColor: '#34C759',
  },
  progressNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
  },
  progressNumberActive: {
    color: '#FFF',
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E5E5E5',
    marginHorizontal: 4,
  },
  progressLineActive: {
    backgroundColor: '#34C759',
  },
  stepContent: {
    padding: 24,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#F8F9FA',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },
  helperText: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 16,
    color: '#1C1C1E',
  },
  pickerPlaceholder: {
    fontSize: 16,
    color: '#999',
  },
  statePickerContainer: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    overflow: 'hidden',
  },
  statePicker: {
    maxHeight: 200,
  },
  stateOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  stateOptionSelected: {
    backgroundColor: '#007AFF10',
  },
  stateOptionText: {
    fontSize: 16,
    color: '#1C1C1E',
  },
  stateOptionTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#007AFF10',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#007AFF',
    lineHeight: 20,
  },
  kycTierInfo: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  kycTierTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  kycTierItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  kycTierText: {
    fontSize: 14,
    color: '#1C1C1E',
  },
  kycTierNote: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 14,
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 12,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E5E5E5',
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '600',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 20,
    gap: 12,
  },
  checkbox: {
    marginTop: -2,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  link: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 4,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  nextButtonDisabled: {
    opacity: 0.6,
  },
  nextButtonText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
  },
});
