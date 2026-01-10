import { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LIGHT_THEME, SPACING, RADIUS, TYPOGRAPHY, BRAND_COLORS } from '../../../design-system/theme';
import { Card, Button } from '../../../design-system/components/CoreComponents';
import { dataService } from '../../../services/DataService';

interface Recipient {
  id: string;
  name: string;
  handle: string;
  avatar: string;
}

interface FundingAccount {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit';
  balance: number;
  lastFour?: string;
}

const RECENT_RECIPIENTS: Recipient[] = [
  { id: '1', name: 'Jordan', handle: '@jordan', avatar: 'JO' },
  { id: '2', name: 'Emma', handle: '@emma', avatar: 'EM' },
  { id: '3', name: 'Bank', handle: 'ACH', avatar: 'BA' },
];

const DEFAULT_FUNDING_ACCOUNTS: FundingAccount[] = [
  { id: '1', name: 'Checking', type: 'checking', balance: 2847.52, lastFour: '4521' },
  { id: '2', name: 'Savings', type: 'savings', balance: 15420, lastFour: '8832' },
  { id: '3', name: 'Credit Card', type: 'credit', balance: 5000, lastFour: '1234' },
];

// Fee calculation utility
function calculateTransferFee(
  amount: number,
  fundingType: 'checking' | 'savings' | 'credit',
  transferType: 'send' | 'request'
): { fee: number; arrival: string; arrivalDays: string } {
  // Request transfers are always free and instant
  if (transferType === 'request') {
    return { fee: 0, arrival: 'Instant', arrivalDays: 'When accepted' };
  }

  // Fee structure based on funding source
  switch (fundingType) {
    case 'checking':
      return { fee: 0, arrival: 'Instant', arrivalDays: 'Within minutes' };
    case 'savings':
      return { fee: 0.5, arrival: '1-2 days', arrivalDays: '1-2 business days' };
    case 'credit': {
      // Credit card transfers typically have higher fees
      const creditFee = Math.max(2.99, amount * 0.029); // 2.9% or $2.99 min
      return { fee: Number(creditFee.toFixed(2)), arrival: 'Instant', arrivalDays: 'Within minutes' };
    }
    default:
      return { fee: 0, arrival: 'Instant', arrivalDays: 'Within minutes' };
  }
}

export function TransfersScreen() {
  const [isSend, setIsSend] = useState(true);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('$50.00');
  const [selectedAccount, setSelectedAccount] = useState<FundingAccount>(DEFAULT_FUNDING_ACCOUNTS[0]);
  const [memo, setMemo] = useState('');
  const [fundingAccounts] = useState<FundingAccount[]>(DEFAULT_FUNDING_ACCOUNTS);
  const [submitting, setSubmitting] = useState(false);
  const [showAccountPicker, setShowAccountPicker] = useState(false);

  // Calculate fee and arrival time dynamically
  const { fee, arrival, arrivalDays } = useMemo(() => {
    const amountNumber = Number.parseFloat(amount.replace(/[$,]/g, '')) || 0;
    return calculateTransferFee(amountNumber, selectedAccount.type, isSend ? 'send' : 'request');
  }, [amount, selectedAccount.type, isSend]);

  const handleSubmitTransfer = async () => {
    // Validate form
    if (!recipient || !amount || amount === '$0.00') {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      
      // Parse amount (remove $ and commas)
      const amountNumber = Number.parseFloat(amount.replace(/[$,]/g, ''));

      // Submit transfer to backend
      const result = await dataService.submitTransfer({
        recipientId: recipient,
        recipientName: recipient, // In real app, would fetch name from recipient data
        amount: amountNumber,
        currency: 'USD',
        fundingSourceId: selectedAccount.id,
        memo: memo || undefined,
        type: isSend ? 'send' : 'request',
      });

      // Show success message
      Alert.alert(
        'Success',
        `${isSend ? 'Transfer' : 'Request'} of ${amount} to ${recipient} submitted successfully!\n\nTransfer ID: ${result.transferId}\nFee: $${fee.toFixed(2)}\nArrival: ${arrival}`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setRecipient('');
              setAmount('$50.00');
              setMemo('');
              setSelectedAccount(DEFAULT_FUNDING_ACCOUNTS[0]);
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
    // Modal styles
    modalOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: SPACING[4],
    },
    modalContent: {
      backgroundColor: LIGHT_THEME.bg,
      borderRadius: RADIUS.lg,
      padding: SPACING[4],
      width: '100%',
      maxWidth: 400,
    },
    modalTitle: {
      fontSize: TYPOGRAPHY.fontSize.h3,
      fontWeight: '700',
      color: LIGHT_THEME.text,
      marginBottom: SPACING[3],
      textAlign: 'center',
    },
    accountOption: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: SPACING[3],
      paddingHorizontal: SPACING[3],
      borderRadius: RADIUS.md,
      borderWidth: 1,
      borderColor: LIGHT_THEME.stroke,
      marginBottom: SPACING[2],
    },
    accountOptionSelected: {
      borderColor: BRAND_COLORS.green,
      backgroundColor: BRAND_COLORS.green + '10',
    },
    accountName: {
      fontSize: TYPOGRAPHY.fontSize.body,
      fontWeight: '600',
      color: LIGHT_THEME.text,
    },
    accountDetails: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: LIGHT_THEME.muted,
      marginTop: 2,
    },
    modalClose: {
      marginTop: SPACING[2],
      paddingVertical: SPACING[2],
      alignItems: 'center',
    },
    modalCloseText: {
      fontSize: TYPOGRAPHY.fontSize.body,
      color: LIGHT_THEME.muted,
      fontWeight: '600',
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
                {selectedAccount.name} (...{selectedAccount.lastFour})
              </Text>
              <Text style={[styles.label, { marginBottom: 0, fontSize: 11 }]}>
                Balance: ${selectedAccount.balance.toLocaleString()}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.select}
              onPress={() => setShowAccountPicker(true)}
            >
              <Text style={styles.selectText}>Change</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.feeRow}>
            <View style={[styles.feeBadge, fee > 0 && { backgroundColor: '#FFF3CD', borderColor: '#FFEEBA' }]}>
              <Text style={[styles.feeBadgeText, fee > 0 && { color: '#856404' }]}>
                Fee: ${fee.toFixed(2)}
              </Text>
            </View>
            <View style={styles.feeBadge}>
              <Text style={styles.feeBadgeText}>Arrival: {arrival}</Text>
            </View>
          </View>
          {Boolean(arrivalDays) && (
            <Text style={[styles.label, { marginTop: SPACING[1], fontSize: 11 }]}>
              {arrivalDays}
            </Text>
          )}
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

      {/* Account Picker Modal */}
      {showAccountPicker && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Funding Source</Text>
            {fundingAccounts.map((account) => (
              <TouchableOpacity
                key={account.id}
                style={[
                  styles.accountOption,
                  selectedAccount.id === account.id && styles.accountOptionSelected,
                ]}
                onPress={() => {
                  setSelectedAccount(account);
                  setShowAccountPicker(false);
                }}
              >
                <View>
                  <Text style={styles.accountName}>{account.name}</Text>
                  <Text style={styles.accountDetails}>
                    ...{account.lastFour} • ${account.balance.toLocaleString()}
                  </Text>
                </View>
                {selectedAccount.id === account.id && (
                  <Text style={{ color: BRAND_COLORS.green, fontWeight: '700' }}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setShowAccountPicker(false)}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
