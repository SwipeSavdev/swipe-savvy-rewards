import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  ListRenderItem,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LIGHT_THEME, SPACING, RADIUS, TYPOGRAPHY, BRAND_COLORS } from '../../../design-system/theme';
import { Card, Button, Badge, IconBox, Avatar } from '../../../design-system/components/CoreComponents';
import { dataService } from '../../../services/DataService';

interface Recipient {
  id: string;
  name: string;
  handle: string;
  avatar: string;
}

const RECENT_RECIPIENTS: Recipient[] = [
  { id: '1', name: 'Jordan', handle: '@jordan', avatar: 'JO' },
  { id: '2', name: 'Emma', handle: '@emma', avatar: 'EM' },
  { id: '3', name: 'Bank', handle: 'ACH', avatar: 'BA' },
];

export function TransfersScreen() {
  const navigation = useNavigation();
  const [isSend, setIsSend] = useState(true);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('$50.00');
  const [fundingSource, setFundingSource] = useState('Checking');
  const [memo, setMemo] = useState('');
  const [recipients, setRecipients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load recent recipients on mount
  useEffect(() => {
    loadRecipients();
  }, []);

  const loadRecipients = async () => {
    try {
      setLoading(true);
      const data = await dataService.getRecentRecipients();
      // Map recipients to ensure proper format
      const formattedRecipients: Recipient[] = data.map((recipient: any) => ({
        id: recipient.id || '',
        name: recipient.name || 'Unknown',
        handle: recipient.handle || recipient.username || '',
        avatar: recipient.avatar || recipient.initials || 'U',
      }));
      setRecipients(formattedRecipients);
    } catch (error) {
      console.error('Failed to load recipients:', error);
      setRecipients(RECENT_RECIPIENTS);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitTransfer = async () => {
    // Validate form
    if (!recipient || !amount || amount === '$0.00') {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      
      // Parse amount (remove $ and commas)
      const amountNumber = parseFloat(amount.replace(/[$,]/g, ''));

      // Submit transfer to backend
      const result = await dataService.submitTransfer({
        recipientId: recipient,
        recipientName: recipient, // In real app, would fetch name from recipient data
        amount: amountNumber,
        currency: 'USD',
        fundingSourceId: fundingSource,
        memo: memo || undefined,
        type: isSend ? 'send' : 'request',
      });

      // Show success message
      Alert.alert(
        'Success',
        `${isSend ? 'Transfer' : 'Request'} of ${amount} to ${recipient} submitted successfully!\n\nTransfer ID: ${result.transferId}`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setRecipient('');
              setAmount('$50.00');
              setMemo('');
              setFundingSource('Checking');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Transfer submission failed:', error);
      Alert.alert(
        'Transfer Failed',
        error instanceof Error ? error.message : 'An error occurred while submitting the transfer'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: LIGHT_THEME.bg,
    },
    contentContainer: {
      paddingVertical: SPACING[4],
      paddingHorizontal: SPACING[4],
      gap: SPACING[4],
      paddingTop: 80,
    },
    toggleContainer: {
      flexDirection: 'row',
      borderRadius: RADIUS.pill,
      borderWidth: 1,
      borderColor: LIGHT_THEME.stroke,
      backgroundColor: LIGHT_THEME.panel2,
      padding: SPACING[1],
      gap: SPACING[1],
    },
    toggleButton: {
      flex: 1,
      paddingVertical: SPACING[2],
      paddingHorizontal: SPACING[3],
      borderRadius: RADIUS.pill,
      alignItems: 'center',
    },
    toggleButtonActive: {
      backgroundColor: BRAND_COLORS.navy,
    },
    toggleText: {
      fontSize: TYPOGRAPHY.fontSize.body,
      color: LIGHT_THEME.muted,
      fontWeight: '600',
    },
    toggleTextActive: {
      color: 'white',
    },
    sectionLabel: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: LIGHT_THEME.muted,
      fontWeight: '600',
    },
    recipientRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: SPACING[2],
    },
    recipientChips: {
      flexDirection: 'row',
      gap: SPACING[2],
      marginTop: SPACING[2],
      flexWrap: 'wrap',
    },
    recipientChip: {
      paddingVertical: SPACING[1],
      paddingHorizontal: SPACING[2],
      backgroundColor: LIGHT_THEME.panel2,
      borderRadius: RADIUS.pill,
      borderWidth: 1,
      borderColor: LIGHT_THEME.stroke,
    },
    recipientChipText: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: LIGHT_THEME.text,
      fontWeight: '600',
    },
    amountInput: {
      fontSize: 22,
      fontWeight: '800',
      fontFamily: TYPOGRAPHY.fontFamily.mono,
      color: LIGHT_THEME.text,
      marginTop: SPACING[2],
      paddingVertical: SPACING[2],
      borderBottomWidth: 1,
      borderBottomColor: LIGHT_THEME.stroke,
    },
    divider: {
      height: 1,
      backgroundColor: LIGHT_THEME.stroke,
      marginVertical: SPACING[2],
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginVertical: SPACING[2],
    },
    label: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: LIGHT_THEME.muted,
      marginBottom: SPACING[1],
    },
    select: {
      paddingVertical: SPACING[2],
      paddingHorizontal: SPACING[2],
      backgroundColor: LIGHT_THEME.panel2,
      borderRadius: RADIUS.md,
      borderWidth: 1,
      borderColor: LIGHT_THEME.stroke,
    },
    selectText: {
      fontSize: TYPOGRAPHY.fontSize.body,
      fontWeight: '600',
    },
    feeRow: {
      marginTop: SPACING[2],
      gap: SPACING[2],
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    feeBadge: {
      paddingVertical: SPACING[1],
      paddingHorizontal: SPACING[2],
      backgroundColor: LIGHT_THEME.panel2,
      borderRadius: RADIUS.pill,
      borderWidth: 1,
      borderColor: LIGHT_THEME.stroke,
    },
    feeBadgeText: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: LIGHT_THEME.text,
      fontWeight: '600',
    },
    input: {
      paddingVertical: SPACING[2],
      paddingHorizontal: SPACING[2],
      backgroundColor: LIGHT_THEME.panel2,
      borderRadius: RADIUS.md,
      borderWidth: 1,
      borderColor: LIGHT_THEME.stroke,
      fontSize: TYPOGRAPHY.fontSize.body,
      color: LIGHT_THEME.text,
      marginTop: SPACING[2],
    },
    disclaimer: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: LIGHT_THEME.muted,
      marginTop: SPACING[2],
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Send/Request Toggle */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, isSend && styles.toggleButtonActive]}
            onPress={() => setIsSend(true)}
          >
            <Text style={[styles.toggleText, isSend && styles.toggleTextActive]}>Send</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, !isSend && styles.toggleButtonActive]}
            onPress={() => setIsSend(false)}
          >
            <Text style={[styles.toggleText, !isSend && styles.toggleTextActive]}>Request</Text>
          </TouchableOpacity>
        </View>

        {/* Recipient Section */}
        <Card padding={SPACING[4]}>
          <View style={styles.recipientRow}>
            <View>
              <Text style={styles.sectionLabel}>Recipient</Text>
              <Text style={[styles.label, { marginBottom: 0 }]}>People, bank, or username</Text>
            </View>
            <Button onPress={() => Alert.alert('Coming Soon', 'Contacts picker coming soon')} variant="secondary">
              Contacts
            </Button>
          </View>

          <View style={styles.recipientChips}>
            {RECENT_RECIPIENTS.map((r) => (
              <TouchableOpacity key={r.id} style={styles.recipientChip}>
                <Text style={styles.recipientChipText}>
                  <Text style={{ fontWeight: '700' }}>{r.name}</Text> • {r.handle}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Amount & Funding */}
        <Card padding={SPACING[4]}>
          <Text style={styles.label}>Amount</Text>
          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholder="$0.00"
          />

          <View style={styles.divider} />

          <View style={styles.row}>
            <View>
              <Text style={styles.label}>From</Text>
              <Text style={[styles.label, { marginBottom: 0, color: LIGHT_THEME.text, fontWeight: '600' }]}>
                Funding source
              </Text>
            </View>
            <TouchableOpacity style={styles.select}>
              <Text style={styles.selectText}>{fundingSource}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.feeRow}>
            <View style={styles.feeBadge}>
              <Text style={styles.feeBadgeText}>Fee: $0.00</Text>
            </View>
            <View style={styles.feeBadge}>
              <Text style={styles.feeBadgeText}>Arrival: Instant</Text>
            </View>
          </View>
        </Card>

        {/* Message Section */}
        <Card padding={SPACING[4]}>
          <Text style={styles.sectionLabel}>Message</Text>
          <Text style={[styles.label, { marginBottom: 0, marginTop: SPACING[1] }]}>Optional note</Text>
          <TextInput
            style={styles.input}
            value={memo}
            onChangeText={setMemo}
            placeholder="What's it for?"
          />
        </Card>

        <Button
          onPress={handleSubmitTransfer}
          variant="primary"
          style={{ width: '100%', paddingVertical: SPACING[3] }}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="white" />
          ) : (
            'Review & confirm'
          )}
        </Button>

        <Text style={styles.disclaimer}>
          Agentic AI can prepare actions, but money movement always requires confirmation.
        </Text>
      </ScrollView>
    </View>
  );
}
