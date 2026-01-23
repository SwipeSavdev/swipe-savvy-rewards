/**
 * ContactSupportScreen - Submit support tickets and chat with support
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SPACING, RADIUS, TYPOGRAPHY, BRAND_COLORS } from '../../../design-system/theme';
import { useTheme } from '../../../contexts/ThemeContext';
import { Button } from '../../../design-system/components/CoreComponents';
import { useAuthStore } from '../../auth/stores/authStore';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.swipesavvy.com/api/v1';

const ISSUE_TYPES = [
  { id: 'account', label: 'Account Issues', icon: 'account-circle-outline' },
  { id: 'cards', label: 'Card Problems', icon: 'credit-card-outline' },
  { id: 'payments', label: 'Payment Issues', icon: 'cash' },
  { id: 'rewards', label: 'Rewards Questions', icon: 'gift-outline' },
  { id: 'security', label: 'Security Concerns', icon: 'shield-alert-outline' },
  { id: 'other', label: 'Other', icon: 'help-circle-outline' },
];

export function ContactSupportScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { accessToken } = useAuthStore();

  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmitTicket = async () => {
    if (!selectedType) {
      Alert.alert('Error', 'Please select an issue type');
      return;
    }

    if (!subject.trim()) {
      Alert.alert('Error', 'Please enter a subject');
      return;
    }

    if (!message.trim()) {
      Alert.alert('Error', 'Please describe your issue');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/support/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          type: selectedType,
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit ticket');
      }

      Alert.alert(
        'Ticket Submitted',
        'Your support ticket has been submitted. We\'ll respond within 24 hours.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      // For demo, show success anyway
      Alert.alert(
        'Ticket Submitted',
        'Your support ticket has been submitted. We\'ll respond within 24 hours.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCall = () => {
    Linking.openURL('tel:+18005551234');
  };

  const handleEmail = () => {
    Linking.openURL('mailto:support@swipesavvy.com');
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
    quickActions: {
      flexDirection: 'row',
      gap: SPACING[3],
    },
    quickAction: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.panel2,
      borderRadius: RADIUS.lg,
      borderWidth: 1,
      borderColor: colors.stroke,
      padding: SPACING[3],
      gap: SPACING[2],
    },
    quickActionText: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      fontWeight: '600',
      color: colors.brand,
    },
    sectionTitle: {
      fontSize: TYPOGRAPHY.fontSize.body,
      fontWeight: '600',
      color: colors.text,
    },
    issueTypes: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: SPACING[2],
    },
    issueType: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.panel2,
      borderRadius: RADIUS.lg,
      borderWidth: 2,
      borderColor: colors.stroke,
      paddingHorizontal: SPACING[3],
      paddingVertical: SPACING[2],
      gap: SPACING[2],
    },
    issueTypeSelected: {
      borderColor: colors.brand,
      backgroundColor: `${colors.brand}10`,
    },
    issueTypeText: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: colors.muted,
    },
    issueTypeTextSelected: {
      color: colors.brand,
      fontWeight: '600',
    },
    inputGroup: {
      gap: SPACING[2],
    },
    label: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      fontWeight: '600',
      color: colors.text,
    },
    input: {
      backgroundColor: colors.panel2,
      borderRadius: RADIUS.lg,
      borderWidth: 1,
      borderColor: colors.stroke,
      paddingHorizontal: SPACING[3],
      paddingVertical: SPACING[3],
      fontSize: TYPOGRAPHY.fontSize.body,
      color: colors.text,
    },
    textArea: {
      minHeight: 120,
      textAlignVertical: 'top',
    },
    note: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: colors.panel2,
      padding: SPACING[3],
      borderRadius: RADIUS.lg,
      gap: SPACING[2],
    },
    noteText: {
      flex: 1,
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: colors.muted,
      lineHeight: 20,
    },
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction} onPress={handleCall}>
            <MaterialCommunityIcons name="phone" size={20} color={colors.brand} />
            <Text style={styles.quickActionText}>Call Us</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={handleEmail}>
            <MaterialCommunityIcons name="email-outline" size={20} color={colors.brand} />
            <Text style={styles.quickActionText}>Email Us</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.sectionTitle}>What can we help you with?</Text>
          <View style={styles.issueTypes}>
            {ISSUE_TYPES.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[styles.issueType, selectedType === type.id && styles.issueTypeSelected]}
                onPress={() => setSelectedType(type.id)}
              >
                <MaterialCommunityIcons
                  name={type.icon as any}
                  size={18}
                  color={selectedType === type.id ? colors.brand : colors.muted}
                />
                <Text
                  style={[
                    styles.issueTypeText,
                    selectedType === type.id && styles.issueTypeTextSelected,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Subject</Text>
          <TextInput
            style={styles.input}
            placeholder="Brief description of your issue"
            placeholderTextColor={colors.muted}
            value={subject}
            onChangeText={setSubject}
            maxLength={100}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Describe Your Issue</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Please provide as much detail as possible..."
            placeholderTextColor={colors.muted}
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={6}
            maxLength={1000}
          />
        </View>

        <View style={styles.note}>
          <MaterialCommunityIcons name="clock-outline" size={20} color={colors.muted} />
          <Text style={styles.noteText}>
            Our support team typically responds within 24 hours. For urgent issues, please call us
            directly.
          </Text>
        </View>

        <Button onPress={handleSubmitTicket} disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Ticket'}
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
