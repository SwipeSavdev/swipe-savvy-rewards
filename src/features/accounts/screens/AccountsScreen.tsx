import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ListRenderItem,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LIGHT_THEME, SPACING, RADIUS, TYPOGRAPHY, BRAND_COLORS } from '../../../design-system/theme';
import { Card, Button, Badge, IconBox } from '../../../design-system/components/CoreComponents';
import { dataService } from '../../../services/DataService';

interface LinkedBank {
  id: string;
  bank: string;
  account: string;
  status: 'connected' | 'needs-relink';
  icon: string;
}

const LINKED_BANKS: LinkedBank[] = [
  {
    id: '1',
    bank: 'Chase Bank',
    account: '•••• 1920',
    status: 'connected',
    icon: 'bank',
  },
  {
    id: '2',
    bank: 'Wells Fargo',
    account: '•••• 4481',
    status: 'needs-relink',
    icon: 'bank',
  },
];

export function AccountsScreen() {
  const navigation = useNavigation();
  const [selectedCard, setSelectedCard] = useState('default');
  const [linkedBanks, setLinkedBanks] = useState<LinkedBank[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLinkedBanks();
  }, []);

  const loadLinkedBanks = async () => {
    try {
      setLoading(true);
      const banks = await dataService.getLinkedBanks();
      // Transform API response to LinkedBank format with safe property access
      const transformed = banks.map((bank: any) => ({
        id: bank.id || '',
        bank: bank.bankName || bank.name || 'Unknown Bank',
        account: bank.accountNumber || bank.account || 'Unknown',
        status: (bank.status === 'connected' ? 'connected' : 'needs-relink') as 'connected' | 'needs-relink',
        icon: 'bank',
      })) as LinkedBank[];
      setLinkedBanks(transformed);
    } catch (error) {
      console.error('Failed to load linked banks:', error);
      // Fallback to default banks
      setLinkedBanks(LINKED_BANKS);
    } finally {
      setLoading(false);
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
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING[2],
    },
    sectionTitle: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: LIGHT_THEME.muted,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    cardGradient: {
      backgroundColor: BRAND_COLORS.navy,
      borderRadius: RADIUS.xl,
      padding: SPACING[4],
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)',
      marginBottom: SPACING[2],
    },
    cardRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    cardInfo: {
      flex: 1,
      gap: SPACING[1],
    },
    cardLabel: {
      color: 'rgba(255,255,255,0.72)',
      fontSize: TYPOGRAPHY.fontSize.meta,
    },
    cardName: {
      color: 'white',
      fontSize: 18,
      fontWeight: '800',
      letterSpacing: -0.01,
    },
    cardNumber: {
      color: 'rgba(255,255,255,0.72)',
      fontSize: TYPOGRAPHY.fontSize.meta,
      fontFamily: TYPOGRAPHY.fontFamily.mono,
      marginTop: SPACING[2],
    },
    cardActions: {
      marginTop: SPACING[2],
      flexDirection: 'row',
      gap: SPACING[2],
    },
    cardActionButton: {
      flex: 1,
      backgroundColor: 'rgba(255,255,255,0.1)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.14)',
      borderRadius: RADIUS.md,
      paddingVertical: SPACING[2],
      paddingHorizontal: SPACING[3],
    },
    cardActionText: {
      color: 'white',
      fontSize: TYPOGRAPHY.fontSize.body,
      fontWeight: '600',
      textAlign: 'center',
    },
    accountsGrid: {
      gap: SPACING[2],
    },
    accountItem: {
      flex: 1,
      padding: SPACING[3],
      backgroundColor: LIGHT_THEME.panel2,
      borderRadius: RADIUS.lg,
      borderWidth: 1,
      borderColor: LIGHT_THEME.stroke,
    },
    accountLabel: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: LIGHT_THEME.muted,
    },
    accountValue: {
      fontSize: 22,
      fontWeight: '800',
      fontFamily: TYPOGRAPHY.fontFamily.mono,
      marginVertical: SPACING[1],
      color: LIGHT_THEME.text,
    },
    linkedBank: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: SPACING[3],
      backgroundColor: LIGHT_THEME.panel2,
      borderRadius: RADIUS.lg,
      borderWidth: 1,
      borderColor: LIGHT_THEME.stroke,
      marginBottom: SPACING[2],
      gap: SPACING[3],
    },
    linkedBankInfo: {
      flex: 1,
      gap: SPACING[1],
    },
    linkedBankName: {
      fontSize: TYPOGRAPHY.fontSize.body,
      fontWeight: '600',
      color: LIGHT_THEME.text,
    },
    linkedBankAccount: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: LIGHT_THEME.muted,
    },
  });

  const renderLinkedBank: ListRenderItem<LinkedBank> = ({ item }) => (
    <View style={styles.linkedBank}>
      <IconBox icon={<MaterialCommunityIcons name={item.icon as any} size={20} />} />
      <View style={styles.linkedBankInfo}>
        <Text style={styles.linkedBankName}>{item.bank}</Text>
        <Text style={styles.linkedBankAccount}>{item.account} • {item.status === 'connected' ? 'Connected' : 'Needs relink'}</Text>
      </View>
      <Badge
        label={item.status === 'connected' ? 'Connected' : 'Relink'}
        variant={item.status === 'connected' ? 'success' : 'warning'}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Cards Section */}
        <View>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Your cards</Text>
              <Text style={[styles.accountLabel, { marginTop: SPACING[1] }]}>
                Swipe-ready, token-ready
              </Text>
            </View>
            <Button onPress={() => (navigation as any).navigate('Cards')} variant="secondary">
              Manage
            </Button>
          </View>

          {/* Default Card */}
          <View style={styles.cardGradient}>
            <View style={styles.cardRow}>
              <View style={styles.cardInfo}>
                <Text style={styles.cardLabel}>Default • Debit</Text>
                <Text style={styles.cardName}>SwipeSavvy Card</Text>
                <Text style={styles.cardNumber}>•••• 1042</Text>
              </View>
              <Badge label="● Active" />
            </View>
            <View style={styles.cardActions}>
              <View style={styles.cardActionButton}>
                <Text style={styles.cardActionText}>Details</Text>
              </View>
            </View>
          </View>

          {/* Virtual Card */}
          <View style={[styles.cardGradient, { backgroundColor: LIGHT_THEME.panel }]}>
            <View style={styles.cardRow}>
              <View style={styles.cardInfo}>
                <Text style={[styles.cardLabel, { color: LIGHT_THEME.muted }]}>Travel</Text>
                <Text style={[styles.cardName, { color: LIGHT_THEME.text }]}>Virtual Card</Text>
                <Text style={[styles.cardNumber, { color: LIGHT_THEME.muted }]}>•••• 7721</Text>
              </View>
              <Badge label="2% boosts" />
            </View>
          </View>

          <Button onPress={() => (navigation as any).navigate('Cards')} variant="secondary" style={{ width: '100%' }}>
            + Add a card
          </Button>
        </View>

        {/* Accounts Section */}
        <View>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Accounts</Text>
              <Text style={[styles.accountLabel, { marginTop: SPACING[1] }]}>
                DDA + Savings
              </Text>
            </View>
            <Button onPress={() => (navigation as any).navigate('Transfers')} variant="secondary">
              Move
            </Button>
          </View>

          <View style={[styles.accountsGrid, { flexDirection: 'row' }]}>
            <TouchableOpacity 
              style={[styles.accountItem, { backgroundColor: `${BRAND_COLORS.navy}20` }]}
              onPress={() => (navigation as any).navigate('AccountDetail', {
                accountId: '1',
                accountName: 'Checking',
                accountType: 'checking'
              })}
            >
              <Text style={styles.accountLabel}>Checking</Text>
              <Text style={styles.accountValue}>$4,250.25</Text>
              <Text style={styles.accountLabel}>Available</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.accountItem, { backgroundColor: `${BRAND_COLORS.green}20` }]}
              onPress={() => (navigation as any).navigate('AccountDetail', {
                accountId: '2',
                accountName: 'Savings',
                accountType: 'savings'
              })}
            >
              <Text style={styles.accountLabel}>Savings</Text>
              <Text style={styles.accountValue}>$4,500.25</Text>
              <Text style={styles.accountLabel}>Goal: $10,000</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Linked Accounts Section */}
        <View>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Linked accounts</Text>
              <Text style={[styles.accountLabel, { marginTop: SPACING[1] }]}>
                Fund transactions via account linking
              </Text>
            </View>
            <Button onPress={() => Alert.alert('Coming Soon', 'Bank linking coming soon')} variant="secondary">
              Link
            </Button>
          </View>

          <FlatList
            data={linkedBanks}
            renderItem={renderLinkedBank}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ListEmptyComponent={
              loading ? (
                <ActivityIndicator color={BRAND_COLORS.navy} />
              ) : (
                <Text style={styles.accountLabel}>No linked banks yet</Text>
              )
            }
          />
        </View>

        {/* Advanced Features Section */}
        <View>
          <Text style={styles.sectionTitle}>Advanced Features</Text>
          <View style={[styles.accountsGrid, { flexDirection: 'row', gap: SPACING[2] }]}>
            <TouchableOpacity 
              style={[styles.accountItem, { backgroundColor: `${BRAND_COLORS.green}20`, flex: 1 }]}
              onPress={() => (navigation as any).navigate('Budget')}
            >
              <MaterialCommunityIcons name="wallet-outline" size={24} color={BRAND_COLORS.green} />
              <Text style={styles.accountLabel}>Budgets</Text>
              <Text style={[styles.accountLabel, { fontSize: 12 }]}>Set spending limits</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.accountItem, { backgroundColor: `${BRAND_COLORS.yellow}20`, flex: 1 }]}
              onPress={() => (navigation as any).navigate('SpendingAnalysis')}
            >
              <MaterialCommunityIcons name="chart-box-outline" size={24} color={BRAND_COLORS.yellow} />
              <Text style={styles.accountLabel}>Analysis</Text>
              <Text style={[styles.accountLabel, { fontSize: 12 }]}>Spending trends</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT_THEME.bg,
  },
});
