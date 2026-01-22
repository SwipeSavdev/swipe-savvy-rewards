import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../stores/authStore';
import { AuthStackParamList } from '../../../app/navigation/AuthStack';
import { BRAND_COLORS, LIGHT_THEME, SPACING, RADIUS } from '../../../design-system/theme';

type LoginNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export function LoginScreen() {
  const navigation = useNavigation<LoginNavigationProp>();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, clearError } = useAuthStore();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) return;
    clearError();
    try {
      const result = await login(email, password);

      if (result?.verification_required && result.user) {
        // In dev mode, show the OTP code if available
        const devOtpMessage = result.dev_otp_code
          ? `\n\nDev OTP Code: ${result.dev_otp_code}`
          : '';
        Alert.alert(
          'Verify Your Identity',
          `A verification code has been sent to your email (${result.user.email}).${devOtpMessage}`,
          [
            {
              text: 'Continue',
              onPress: () => navigation.navigate('VerifyAccount', {
                email: result.user.email,
                phone: result.user.phone || '',
                userId: result.user.id,
              }),
            },
          ]
        );
      }
    } catch {
      // Error is already set in the store
    }
  };

  const handleSignup = () => {
    clearError();
    navigation.navigate('Signup');
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Reset Password',
      'Enter your email to reset your password',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: () => Alert.alert('Success', 'Check your email for reset instructions'),
        },
      ]
    );
  };

  return (
    <View style={[styles.safeContainer, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={LIGHT_THEME.bg} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header Section */}
          <View style={styles.headerSection}>
            <View style={styles.logoContainer}>
              <View style={styles.logoBadge}>
                <MaterialCommunityIcons name="credit-card-check" size={40} color={BRAND_COLORS.navy} />
              </View>
            </View>
            <Text style={styles.brandName}>SwipeSavvy</Text>
            <Text style={styles.tagline}>Manage your rewards smarter</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            {/* Error Message */}
            {Boolean(error) && (
              <View style={styles.errorContainer}>
                <MaterialCommunityIcons name="alert-circle" size={16} color="#D94F44" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons name="email-outline" size={20} color={BRAND_COLORS.ashGrey} />
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor={BRAND_COLORS.ashGrey}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons name="lock-outline" size={20} color={BRAND_COLORS.ashGrey} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={BRAND_COLORS.ashGrey}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!isLoading}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <MaterialCommunityIcons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={BRAND_COLORS.ashGrey}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password Link */}
            <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPasswordContainer}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Sign In Button */}
            <TouchableOpacity
              style={[styles.signInButton, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={styles.signInButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Don't have an account?</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity style={styles.signUpButton} onPress={handleSignup}>
              <Text style={styles.signUpButtonText}>Create New Account</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footerSection}>
            <Text style={styles.footerText}>
              By signing in, you agree to our{' '}
              <Text style={styles.footerLink}>Terms of Service</Text> and{' '}
              <Text style={styles.footerLink}>Privacy Policy</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: LIGHT_THEME.bg,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
    justifyContent: 'space-between',
  },
  headerSection: {
    alignItems: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  logoContainer: {
    marginBottom: SPACING.lg,
  },
  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.xl,
    backgroundColor: LIGHT_THEME.panel,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: LIGHT_THEME.stroke,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  brandName: {
    fontSize: 28,
    fontWeight: '700',
    color: BRAND_COLORS.deep,
    marginBottom: SPACING.xs,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 14,
    color: BRAND_COLORS.ashGrey,
    fontWeight: '500',
  },
  formSection: {
    backgroundColor: LIGHT_THEME.panel,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: LIGHT_THEME.stroke,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  errorContainer: {
    flexDirection: 'row',
    backgroundColor: LIGHT_THEME.dangerBg,
    borderLeftWidth: 4,
    borderLeftColor: LIGHT_THEME.danger,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    alignItems: 'center',
  },
  errorText: {
    color: LIGHT_THEME.danger,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: SPACING.md,
    flex: 1,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: BRAND_COLORS.deep,
    marginBottom: SPACING.xs,
    letterSpacing: 0.2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: LIGHT_THEME.stroke,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: LIGHT_THEME.bg,
    height: 52,
  },
  input: {
    flex: 1,
    marginHorizontal: SPACING.sm,
    fontSize: 16,
    fontWeight: '500',
    color: BRAND_COLORS.deep,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  forgotPasswordText: {
    color: BRAND_COLORS.navy,
    fontSize: 13,
    fontWeight: '600',
  },
  signInButton: {
    height: 52,
    backgroundColor: BRAND_COLORS.navy,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    shadowColor: BRAND_COLORS.navy,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: LIGHT_THEME.stroke,
  },
  dividerText: {
    marginHorizontal: SPACING.md,
    color: BRAND_COLORS.ashGrey,
    fontSize: 13,
    fontWeight: '500',
  },
  signUpButton: {
    height: 52,
    borderWidth: 1.5,
    borderColor: BRAND_COLORS.navy,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: LIGHT_THEME.infoBg,
  },
  signUpButtonText: {
    color: BRAND_COLORS.navy,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  footerSection: {
    marginTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  footerText: {
    fontSize: 12,
    color: BRAND_COLORS.ashGrey,
    textAlign: 'center',
    lineHeight: 18,
    letterSpacing: 0.2,
  },
  footerLink: {
    color: BRAND_COLORS.navy,
    fontWeight: '600',
  },
});
