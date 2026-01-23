/**
 * TransactionPinScreen - Manage 4-digit transaction PIN
 */

import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../../design-system/theme';
import { useTheme } from '../../../contexts/ThemeContext';
import { Button } from '../../../design-system/components/CoreComponents';
import { useAuthStore } from '../../auth/stores/authStore';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.swipesavvy.com/api/v1';

export function TransactionPinScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { accessToken } = useAuthStore();

  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasPin, setHasPin] = useState(true); // Assume user has PIN

  const currentPinRef = useRef<TextInput>(null);
  const newPinRef = useRef<TextInput>(null);
  const confirmPinRef = useRef<TextInput>(null);

  const handleSetPin = async () => {
    if (hasPin && currentPin.length !== 4) {
      Alert.alert('Error', 'Please enter your current PIN');
      return;
    }

    if (newPin.length !== 4) {
      Alert.alert('Error', 'PIN must be 4 digits');
      return;
    }

    if (newPin !== confirmPin) {
      Alert.alert('Error', 'PINs do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/set-pin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          current_pin: hasPin ? currentPin : undefined,
          new_pin: newPin,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to set PIN');
      }

      Alert.alert('Success', 'Transaction PIN updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to set PIN');
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    content: {
      flex: 1,
      padding: SPACING[4],
      gap: SPACING[6],
    },
    description: {
      fontSize: TYPOGRAPHY.fontSize.body,
      color: colors.muted,
      lineHeight: 22,
      textAlign: 'center',
    },
    pinSection: {
      gap: SPACING[4],
    },
    label: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
    },
    pinContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: SPACING[3],
    },
    pinInput: {
      width: 50,
      height: 60,
      backgroundColor: colors.panel2,
      borderRadius: RADIUS.lg,
      borderWidth: 2,
      borderColor: colors.stroke,
      fontSize: 24,
      fontWeight: '700',
      textAlign: 'center',
      color: colors.text,
    },
    pinInputFocused: {
      borderColor: colors.brand,
    },
    note: {
      backgroundColor: colors.panel2,
      padding: SPACING[3],
      borderRadius: RADIUS.lg,
      marginTop: SPACING[4],
    },
    noteText: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: colors.muted,
      textAlign: 'center',
    },
  });

  const renderPinInput = (
    value: string,
    onChange: (text: string) => void,
    nextRef?: React.RefObject<TextInput>
  ) => {
    return (
      <TextInput
        style={[styles.pinInput, value.length > 0 && styles.pinInputFocused]}
        value={value}
        onChangeText={(text) => {
          const filtered = text.replace(/[^0-9]/g, '').slice(0, 4);
          onChange(filtered);
          if (filtered.length === 4 && nextRef?.current) {
            nextRef.current.focus();
          }
        }}
        keyboardType="number-pad"
        maxLength={4}
        secureTextEntry
        textContentType="oneTimeCode"
      />
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.description}>
          Your transaction PIN is used to authorize payments and transfers. Keep it secure and don't
          share it with anyone.
        </Text>

        <View style={styles.pinSection}>
          {hasPin && (
            <>
              <Text style={styles.label}>Current PIN</Text>
              <View style={styles.pinContainer}>
                {renderPinInput(currentPin, setCurrentPin, newPinRef)}
              </View>
            </>
          )}

          <Text style={styles.label}>New PIN</Text>
          <View style={styles.pinContainer}>
            {renderPinInput(newPin, setNewPin, confirmPinRef)}
          </View>

          <Text style={styles.label}>Confirm New PIN</Text>
          <View style={styles.pinContainer}>
            {renderPinInput(confirmPin, setConfirmPin)}
          </View>
        </View>

        <Button onPress={handleSetPin} disabled={loading}>
          {loading ? 'Saving...' : (hasPin ? 'Update PIN' : 'Set PIN')}
        </Button>

        <View style={styles.note}>
          <Text style={styles.noteText}>
            Your PIN will be required for all transactions above $50 or when sending money to new
            recipients.
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
