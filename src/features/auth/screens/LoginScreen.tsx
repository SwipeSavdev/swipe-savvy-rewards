import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '../stores/authStore';
import { AuthStackParamList } from '../../../app/navigation/AuthStack';

type LoginNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export function LoginScreen() {
  const navigation = useNavigation<LoginNavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, clearError } = useAuthStore();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) return;
    clearError();
    await login(email, password);
  };

  const handleSignup = () => {
    clearError();
    navigation.navigate('Signup');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to SwipeSavvy</Text>
      <Text style={styles.subtitle}>Sign in to manage your finances</Text>

      {Boolean(error) && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        editable={!isLoading}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!isLoading}
      />

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>Sign In</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.forgotPassword}>
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.dividerLine} />
      </View>

      <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
        <Text style={styles.signupButtonText}>Create New Account</Text>
      </TouchableOpacity>

      <Text style={styles.footerText}>
        By signing in, you agree to our Terms of Service and Privacy Policy
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#FFF',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#1C1C1E',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  errorContainer: {
    backgroundColor: '#FF3B3010',
    borderWidth: 1,
    borderColor: '#FF3B30',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#F8F9FA',
  },
  button: {
    height: 50,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  forgotPassword: {
    marginTop: 16,
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: '#007AFF',
    fontSize: 14,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E5E5',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#999',
    fontSize: 14,
  },
  signupButton: {
    height: 50,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupButtonText: {
    color: '#007AFF',
    fontSize: 18,
    fontWeight: '600',
  },
  footerText: {
    marginTop: 24,
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
  },
});
