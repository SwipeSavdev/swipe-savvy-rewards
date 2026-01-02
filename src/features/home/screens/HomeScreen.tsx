import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    ListRenderItem,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { BrandHeader } from '../../../components/BrandHeader';
import { useTheme } from '../../../contexts/ThemeContext';
import { Button, Card, IconBox } from '../../../design-system/components/CoreComponents';
import { BRAND_COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../../design-system/theme';
import { Account, dataService, Transaction as DataServiceTransaction } from '../../../services/DataService';
import { useAuthStore } from '../../auth/stores/authStore';

interface Transaction {
  id: string;
  title: string;
  subtitle: string;
  amount: string;
  isNegative: boolean;
  points?: string;
  icon: string;
  color: 'default' | 'green' | 'yellow';
}

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    title: 'Amazon',
    subtitle: 'Card purchase • +120 pts',
    amount: '-$45.99',
    isNegative: true,
    icon: 'shopping-bag',
    color: 'default',
  },
  {
    id: '2',
    title: 'Top-up',
    subtitle: 'Linked bank • Instant',
    amount: '+$200.00',
    isNegative: false,
    points: '+200 pts',
    icon: 'arrow-down',
    color: 'green',
  },
  {
    id: '3',
    title: 'Donation',
    subtitle: 'Food Relief • 1,000 pts',
    amount: '—',
    isNegative: false,
    icon: 'heart',
    color: 'yellow',
  },
];

export function HomeScreen() {
  const navigation = useNavigation();
  const user = useAuthStore((state) => state.user);
  const { colors } = useTheme();
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState('$4,250.25');
  const [savings, setSavings] = useState('$4,500.25');

  // Load data on screen mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch accounts
      const accountsData = await dataService.getAccounts();
      setAccounts(accountsData);
      
      // Update balance display
      if (accountsData.length > 0) {
        const checkingAccount = accountsData.find(a => a.type === 'checking');
        const savingsAccount = accountsData.find(a => a.type === 'savings');
        
        if (checkingAccount) {
          setBalance(`$${checkingAccount.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
        }
        if (savingsAccount) {
          setSavings(`$${savingsAccount.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
        }
      }

      // Fetch recent transactions
      const transactionsData = await dataService.getTransactions(5);
      // Map DataService transactions to local Transaction format
      const mappedTransactions: Transaction[] = transactionsData.map((tx: DataServiceTransaction) => {
        const isNegative = tx.type === 'payment';
        const amountNum = typeof tx.amount === 'number' ? tx.amount : parseFloat(String(tx.amount || 0));
        const amount = `${isNegative ? '-' : '+'}$${Math.abs(amountNum).toFixed(2)}`;
        
        return {
          id: tx.id || '',
          title: tx.title || 'Transaction',
          subtitle: `${tx.description || tx.type || 'transaction'} • ${isNegative ? '-' : '+'}0 pts`,
          amount: amount,
          isNegative: isNegative,
          icon: 'shopping-bag',
          color: isNegative ? 'default' : 'green',
        };
      });
      setTransactions(mappedTransactions);
    } catch (error) {
      console.error('Failed to load home data:', error);
      // Uses mock data from DataService on error
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    contentContainer: {
      paddingVertical: SPACING[4],
      paddingHorizontal: SPACING[4],
      gap: SPACING[4],
      paddingBottom: SPACING[8],
      paddingTop: 80,
    },
    balanceCard: {
      backgroundColor: BRAND_COLORS.navy,
      borderRadius: RADIUS.xl,
      padding: SPACING[4],
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)',
    },
    balanceText: {
      color: 'rgba(255,255,255,0.72)',
      fontSize: TYPOGRAPHY.fontSize.meta,
      marginBottom: SPACING[1],
    },
    balanceAmount: {
      color: 'white',
      fontSize: 26,
      fontWeight: '800',
      fontFamily: TYPOGRAPHY.fontFamily.mono,
      marginBottom: SPACING[1],
    },
    savingsText: {
      color: 'rgba(255,255,255,0.72)',
      fontSize: TYPOGRAPHY.fontSize.meta,
    },
    balanceButtonRow: {
      marginTop: SPACING[3],
      gap: SPACING[2],
      flexDirection: 'row',
    },
    sendButton: {
      flex: 1,
      backgroundColor: 'white',
      borderRadius: RADIUS.lg,
      paddingVertical: SPACING[2],
      paddingHorizontal: SPACING[3],
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SPACING[2],
    },
    sendButtonText: {
      color: BRAND_COLORS.navy,
      fontWeight: '700',
      fontSize: TYPOGRAPHY.fontSize.body,
    },
    pointsCard: {
      padding: SPACING[4],
    },
    pointsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    pointsLeft: {
      flex: 1,
      gap: SPACING[2],
    },
    pointsLabel: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: colors.muted,
    },
    pointsValue: {
      fontSize: 26,
      fontWeight: '800',
      fontFamily: TYPOGRAPHY.fontFamily.mono,
      color: colors.text,
    },
    pointsRight: {
      alignItems: 'flex-end',
      gap: SPACING[1],
    },
    tierProgress: {
      width: 130,
      height: 10,
      backgroundColor: 'rgba(35,83,147,0.15)',
      borderRadius: RADIUS.pill,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.stroke,
      marginVertical: SPACING[1],
    },
    tierProgressBar: {
      height: '100%',
      width: '68%',
      backgroundColor: BRAND_COLORS.yellow,
      borderRadius: RADIUS.pill,
    },
    quickActionsHeader: {
      marginTop: SPACING[2],
      marginBottom: SPACING[3],
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: SPACING[2],
    },
    quickActionsTitle: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: colors.muted,
      fontWeight: '600',
    },
    quickActionsGrid: {
      gap: SPACING[3],
      marginTop: SPACING[2],
    },
    actionRow: {
      flexDirection: 'row',
      gap: SPACING[3],
    },
    actionItem: {
      flex: 1,
      padding: SPACING[3],
      backgroundColor: colors.panel2,
      borderRadius: RADIUS.lg,
      borderWidth: 1,
      borderColor: colors.stroke,
      gap: SPACING[2],
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionText: {
      fontSize: TYPOGRAPHY.fontSize.body,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
    },
    actionSubtext: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: colors.muted,
      textAlign: 'center',
    },
    activityHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: SPACING[2],
    },
    activityTitle: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: colors.muted,
      fontWeight: '600',
    },
    transactionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: SPACING[3],
      backgroundColor: colors.panel2,
      borderRadius: RADIUS.lg,
      borderWidth: 1,
      borderColor: colors.stroke,
      marginBottom: SPACING[2],
      gap: SPACING[3],
    },
    transactionContent: {
      flex: 1,
      gap: SPACING[1],
    },
    transactionTitle: {
      fontSize: TYPOGRAPHY.fontSize.body,
      fontWeight: '600',
      color: colors.text,
    },
    transactionSubtitle: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: colors.muted,
    },
    transactionAmount: {
      fontSize: TYPOGRAPHY.fontSize.body,
      fontWeight: '700',
      fontFamily: TYPOGRAPHY.fontFamily.mono,
    },
    floatingActionButton: {
      position: 'absolute',
      bottom: SPACING[6],
      right: SPACING[4],
      width: 56,
      height: 56,
      borderRadius: RADIUS.lg,
      backgroundColor: BRAND_COLORS.green,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 4,
    },
  });

  const renderTransactionItem: ListRenderItem<Transaction> = ({ item }) => (
    <View style={styles.transactionItem}>
      <IconBox icon={<MaterialCommunityIcons name={item.icon as any} size={20} />} variant={item.color} />
      <View style={styles.transactionContent}>
        <Text style={styles.transactionTitle}>{item.title}</Text>
        <Text style={styles.transactionSubtitle}>{item.subtitle}</Text>
      </View>
      <Text
        style={[
          styles.transactionAmount,
          {
            color: item.isNegative ? colors.danger : colors.success,
          },
        ]}
      >
        {item.amount}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Brand Header */}
        <BrandHeader variant="full" size="small" style={{ marginBottom: SPACING[2] }} />

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceText}>Available (Checking)</Text>
          <Text style={styles.balanceAmount}>$4,250.25</Text>
          <Text style={styles.balanceText}>Savings $4,500.25</Text>

          <View style={styles.balanceButtonRow}>
            <TouchableOpacity
              style={styles.sendButton}
              onPress={() => (navigation as any).navigate('Transfers')}
            >
              <Text style={styles.sendButtonText}>Send</Text>
              <MaterialCommunityIcons name="arrow-top-right" size={18} color={BRAND_COLORS.navy} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Points Card */}
        <Card padding={SPACING[4]}>
          <View style={styles.pointsRow}>
            <View style={styles.pointsLeft}>
              <Text style={styles.pointsLabel}>Points</Text>
              <Text style={styles.pointsValue}>12,450</Text>
              <Text style={styles.pointsLabel}>Impact donated: 3,200 pts</Text>
            </View>
            <View style={styles.pointsRight}>
              <Text style={styles.pointsLabel}>Next tier: Silver</Text>
              <View style={styles.tierProgress}>
                <View style={styles.tierProgressBar} />
              </View>
              <Text style={styles.pointsLabel}>1,150 pts to go</Text>
            </View>
          </View>
        </Card>

        {/* Quick Actions Header */}
        <View style={styles.quickActionsHeader}>
          <View>
            <Text style={styles.quickActionsTitle}>Quick actions</Text>
            <Text style={styles.pointsLabel}>One tap, always aligned</Text>
          </View>
          <Button onPress={() => (navigation as any).navigate('RewardsDonate')} variant="ghost">
            Donate
          </Button>
        </View>

        {/* Quick Actions Grid */}
        <View style={styles.quickActionsGrid}>
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => (navigation as any).navigate('Transfers')}
            >
              <IconBox
                icon={<MaterialCommunityIcons name="send" size={20} color={BRAND_COLORS.navy} />}
              />
              <Text style={styles.actionText}>Send</Text>
              <Text style={styles.actionSubtext}>To people or bank</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => (navigation as any).navigate('Transfers')}
            >
              <IconBox
                icon={<MaterialCommunityIcons name="arrow-up" size={20} color={BRAND_COLORS.deep} />}
                variant="deep"
              />
              <Text style={styles.actionText}>Request</Text>
              <Text style={styles.actionSubtext}>Split & collect</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => (navigation as any).navigate('Accounts')}
            >
              <IconBox
                icon={<MaterialCommunityIcons name="qrcode-scan" size={20} color={BRAND_COLORS.yellow} />}
                variant="yellow"
              />
              <Text style={styles.actionText}>Scan/Pay</Text>
              <Text style={styles.actionSubtext}>Fast checkout</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => (navigation as any).navigate('Rewards')}
            >
              <IconBox
                icon={<MaterialCommunityIcons name="star" size={20} color={BRAND_COLORS.green} />}
                variant="green"
              />
              <Text style={styles.actionText}>Rewards</Text>
              <Text style={styles.actionSubtext}>Boosts & tiers</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => (navigation as any).navigate('Accounts')}
            >
              <IconBox
                icon={<MaterialCommunityIcons name="credit-card-plus" size={20} color={BRAND_COLORS.navy} />}
                variant="default"
              />
              <Text style={styles.actionText}>Cards</Text>
              <Text style={styles.actionSubtext}>Manage cards</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => (navigation as any).navigate('Accounts')}
            >
              <IconBox
                icon={<MaterialCommunityIcons name="chart-line" size={20} color={BRAND_COLORS.green} />}
                variant="green"
              />
              <Text style={styles.actionText}>Analytics</Text>
              <Text style={styles.actionSubtext}>Spending trends</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => (navigation as any).navigate('Accounts')}
            >
              <IconBox
                icon={<MaterialCommunityIcons name="target" size={20} color={BRAND_COLORS.yellow} />}
                variant="yellow"
              />
              <Text style={styles.actionText}>Goals</Text>
              <Text style={styles.actionSubtext}>Savings targets</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={transactions}
            renderItem={renderTransactionItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ListEmptyComponent={
              loading ? (
                <ActivityIndicator color={BRAND_COLORS.navy} />
              ) : (
                <Text style={styles.pointsLabel}>No transactions yet</Text>
              )
            }
          />
        </View>
      </ScrollView>
    </View>
  );
}
