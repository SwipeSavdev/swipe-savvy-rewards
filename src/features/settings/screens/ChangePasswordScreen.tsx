/**
 * ChangePasswordScreen - Update account password
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../../design-system/theme';
import { useTheme } from '../../../contexts/ThemeContext';
import { Button } from '../../../design-system/components/CoreComponents';
import { useAuthStore } from '../../auth/stores/authStore';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.swipesavvy.com/api/v1';

export function ChangePasswordScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { accessToken } = useAuthStore();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to change password');
      }

      Alert.alert('Success', 'Password changed successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to change password');
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
      padding: SPACING[4],
      gap: SPACING[4],
    },
    description: {
      fontSize: TYPOGRAPHY.fontSize.body,
      color: colors.muted,
      lineHeight: 22,
    },
    inputGroup: {
      gap: SPACING[2],
    },
    label: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      fontWeight: '600',
      color: colors.text,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.panel2,
      borderRadius: RADIUS.lg,
      borderWidth: 1,
      borderColor: colors.stroke,
      paddingHorizontal: SPACING[3],
    },
    input: {
      flex: 1,
      paddingVertical: SPACING[3],
      fontSize: TYPOGRAPHY.fontSize.body,
      color: colors.text,
    },
    requirements: {
      backgroundColor: colors.panel2,
      padding: SPACING[3],
      borderRadius: RADIUS.lg,
      gap: SPACING[2],
    },
    requirementTitle: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      fontWeight: '600',
      color: colors.text,
    },
    requirementItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING[2],
    },
    requirementText: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: colors.muted,
    },
  });

  const isPasswordValid = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.description}>
          Create a strong password that you haven't used before. Your password must be at least 8
          characters long.
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Current Password</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter current password"
              placeholderTextColor={colors.muted}
              secureTextEntry={!showCurrent}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              autoCapitalize="none"
            />
            <MaterialCommunityIcons
              name={showCurrent ? 'eye-off' : 'eye'}
              size={20}
              color={colors.muted}
              onPress={() => setShowCurrent(!showCurrent)}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>New Password</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter new password"
              placeholderTextColor={colors.muted}
              secureTextEntry={!showNew}
              value={newPassword}
              onChangeText={setNewPassword}
              autoCapitalize="none"
            />
            <MaterialCommunityIcons
              name={showNew ? 'eye-off' : 'eye'}
              size={20}
              color={colors.muted}
              onPress={() => setShowNew(!showNew)}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirm New Password</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Confirm new password"
              placeholderTextColor={colors.muted}
              secureTextEntry={!showConfirm}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              autoCapitalize="none"
            />
            <MaterialCommunityIcons
              name={showConfirm ? 'eye-off' : 'eye'}
              size={20}
              color={colors.muted}
              onPress={() => setShowConfirm(!showConfirm)}
            />
          </View>
        </View>

        <View style={styles.requirements}>
          <Text style={styles.requirementTitle}>Password Requirements</Text>
          <View style={styles.requirementItem}>
            <MaterialCommunityIcons
              name={isPasswordValid ? 'check-circle' : 'circle-outline'}
              size={16}
              color={isPasswordValid ? colors.success : colors.muted}
            />
            <Text style={styles.requirementText}>At least 8 characters</Text>
          </View>
          <View style={styles.requirementItem}>
            <MaterialCommunityIcons
              name={hasUppercase ? 'check-circle' : 'circle-outline'}
              size={16}
              color={hasUppercase ? colors.success : colors.muted}
            />
            <Text style={styles.requirementText}>One uppercase letter</Text>
          </View>
          <View style={styles.requirementItem}>
            <MaterialCommunityIcons
              name={hasNumber ? 'check-circle' : 'circle-outline'}
              size={16}
              color={hasNumber ? colors.success : colors.muted}
            />
            <Text style={styles.requirementText}>One number</Text>
          </View>
        </View>

        <Button onPress={handleChangePassword} disabled={loading}>
          {loading ? 'Updating...' : 'Update Password'}
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
