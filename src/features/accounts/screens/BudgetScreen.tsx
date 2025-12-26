import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  FlatList,
  ListRenderItem,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LIGHT_THEME, SPACING, RADIUS, TYPOGRAPHY, BRAND_COLORS } from '../../../design-system/theme';
import { Button, Card } from '../../../design-system/components/CoreComponents';
import { dataService } from '../../../services/DataService';

interface Budget {
  id: string;
  name: string;
  category: string;
  limit: number;
  spent: number;
  icon: string;
  color: string;
}

const MOCK_BUDGETS: Budget[] = [
  {
    id: '1',
    name: 'Groceries',
    category: 'Food',
    limit: 50000,
    spent: 32150,
    icon: 'cart',
    color: BRAND_COLORS.green,
  },
  {
    id: '2',
    name: 'Entertainment',
    category: 'Entertainment',
    limit: 30000,
    spent: 24500,
    icon: 'movie',
    color: '#FF6B6B',
  },
  {
    id: '3',
    name: 'Dining Out',
    category: 'Food',
    limit: 40000,
    spent: 38900,
    icon: 'silverware-fork-knife',
    color: '#FFB74D',
  },
  {
    id: '4',
    name: 'Utilities',
    category: 'Bills',
    limit: 25000,
    spent: 22100,
    icon: 'flash',
    color: '#FFB74D',
  },
  {
    id: '5',
    name: 'Shopping',
    category: 'Shopping',
    limit: 60000,
    spent: 45300,
    icon: 'shopping-bag',
    color: '#FF6B6B',
  },
];

interface CreateBudgetModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (budget: Omit<Budget, 'id' | 'spent'>) => void;
}

function CreateBudgetModal({ visible, onClose, onCreate }: CreateBudgetModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Food');
  const [limit, setLimit] = useState('');

  const handleCreate = () => {
    if (!name || !limit) {
      Alert.alert('Missing Fields', 'Please fill in all fields');
      return;
    }

    const limitAmount = parseInt(limit);
    if (isNaN(limitAmount) || limitAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid budget limit');
      return;
    }

    onCreate({
      name,
      category,
      limit: limitAmount,
      icon: 'tag',
      color: BRAND_COLORS.navy,
    });

    setName('');
    setCategory('Food');
    setLimit('');
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modal: {
      backgroundColor: LIGHT_THEME.bg,
      borderTopLeftRadius: RADIUS.xl,
      borderTopRightRadius: RADIUS.xl,
      paddingHorizontal: SPACING[4],
      paddingTop: SPACING[4],
      paddingBottom: SPACING[6],
    },
    title: {
      fontSize: TYPOGRAPHY.fontSize.h2,
      fontWeight: '700',
      color: LIGHT_THEME.text,
      marginBottom: SPACING[4],
    },
    input: {
      borderWidth: 1,
      borderColor: LIGHT_THEME.stroke,
      borderRadius: RADIUS.lg,
      paddingHorizontal: SPACING[3],
      paddingVertical: SPACING[3],
      fontSize: TYPOGRAPHY.fontSize.body,
      color: LIGHT_THEME.text,
      marginBottom: SPACING[3],
      backgroundColor: LIGHT_THEME.panelSolid,
    },
    label: {
      fontSize: TYPOGRAPHY.fontSize.body,
      fontWeight: '600',
      color: LIGHT_THEME.text,
      marginBottom: SPACING[2],
    },
    buttonGroup: {
      flexDirection: 'row',
      gap: SPACING[3],
      marginTop: SPACING[4],
    },
  });

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.container}>
        <View style={styles.modal}>
          <Text style={styles.title}>New Budget</Text>

          <Text style={styles.label}>Budget Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Groceries"
            placeholderTextColor={LIGHT_THEME.muted2}
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Category</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Food"
            placeholderTextColor={LIGHT_THEME.muted2}
            value={category}
            onChangeText={setCategory}
          />

          <Text style={styles.label}>Monthly Limit ($)</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            placeholderTextColor={LIGHT_THEME.muted2}
            keyboardType="number-pad"
            value={limit}
            onChangeText={setLimit}
          />

          <View style={styles.buttonGroup}>
            <Button variant="secondary" onPress={onClose} style={{ flex: 1 }}>
              Cancel
            </Button>
            <Button variant="primary" onPress={handleCreate} style={{ flex: 1 }}>
              Create
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function BudgetScreen() {
  const navigation = useNavigation();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadBudgets();
  }, []);

  const loadBudgets = async () => {
    try {
      setLoading(true);
      // In a real app, this would fetch from API
      setBudgets(MOCK_BUDGETS);
    } catch (error) {
      setBudgets(MOCK_BUDGETS);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBudget = (newBudget: Omit<Budget, 'id' | 'spent'>) => {
    const budget: Budget = {
      ...newBudget,
      id: Date.now().toString(),
      spent: 0,
    };
    setBudgets([...budgets, budget]);
    setShowModal(false);
    Alert.alert('Success', `Budget "${budget.name}" created!`);
  };

  const getPercentage = (spent: number, limit: number) => {
    if (limit === 0) return 0;
    return Math.min((spent / limit) * 100, 100);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: LIGHT_THEME.bg,
    },
    contentContainer: {
      paddingVertical: SPACING[4],
      paddingHorizontal: SPACING[4],
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING[4],
    },
    title: {
      fontSize: TYPOGRAPHY.fontSize.h2,
      fontWeight: '700',
      color: LIGHT_THEME.text,
    },
    addButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: BRAND_COLORS.navy,
      justifyContent: 'center',
      alignItems: 'center',
    },
    summaryCard: {
      backgroundColor: LIGHT_THEME.panelSolid,
      borderRadius: RADIUS.lg,
      padding: SPACING[4],
      marginBottom: SPACING[4],
      borderWidth: 1,
      borderColor: LIGHT_THEME.stroke,
    },
    summaryLabel: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: LIGHT_THEME.muted,
      marginBottom: SPACING[2],
    },
    summaryValue: {
      fontSize: 28,
      fontWeight: '800',
      color: LIGHT_THEME.text,
    },
    summarySubtext: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: LIGHT_THEME.muted2,
      marginTop: SPACING[1],
    },
    budgetItem: {
      backgroundColor: LIGHT_THEME.panelSolid,
      borderRadius: RADIUS.lg,
      padding: SPACING[3],
      marginBottom: SPACING[3],
      borderWidth: 1,
      borderColor: LIGHT_THEME.stroke,
      gap: SPACING[2],
    },
    budgetHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    budgetIcon: {
      width: 40,
      height: 40,
      borderRadius: RADIUS.md,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: SPACING[2],
    },
    budgetInfo: {
      flex: 1,
    },
    budgetName: {
      fontSize: TYPOGRAPHY.fontSize.body,
      fontWeight: '700',
      color: LIGHT_THEME.text,
    },
    budgetCategory: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: LIGHT_THEME.muted,
      marginTop: SPACING[1],
    },
    budgetAmount: {
      fontSize: TYPOGRAPHY.fontSize.body,
      fontWeight: '600',
      color: LIGHT_THEME.text,
    },
    progressBar: {
      height: 8,
      backgroundColor: LIGHT_THEME.panel2,
      borderRadius: RADIUS.sm,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: RADIUS.sm,
    },
    budgetStats: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: SPACING[2],
    },
    budgetStat: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: LIGHT_THEME.muted2,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return '#FF6B6B';
    if (percentage >= 80) return BRAND_COLORS.yellow;
    return BRAND_COLORS.green;
  };

  const renderBudgetItem: ListRenderItem<Budget> = ({ item }) => {
    const percentage = getPercentage(item.spent, item.limit);
    const remaining = item.limit - item.spent;

    return (
      <TouchableOpacity
        style={styles.budgetItem}
        onPress={() => (navigation as any).navigate('BudgetDetail', { budgetId: item.id })}
      >
        <View style={styles.budgetHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <View style={[styles.budgetIcon, { backgroundColor: item.color + '20' }]}>
              <MaterialCommunityIcons name={item.icon as any} size={20} color={item.color} />
            </View>
            <View style={styles.budgetInfo}>
              <Text style={styles.budgetName}>{item.name}</Text>
              <Text style={styles.budgetCategory}>{item.category}</Text>
            </View>
          </View>
          <Text style={styles.budgetAmount}>${(remaining / 100).toFixed(2)}</Text>
        </View>

        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${percentage}%`,
                backgroundColor: getProgressColor(percentage),
              },
            ]}
          />
        </View>

        <View style={styles.budgetStats}>
          <Text style={styles.budgetStat}>
            ${(item.spent / 100).toFixed(2)} of ${(item.limit / 100).toFixed(2)}
          </Text>
          <Text style={[styles.budgetStat, { color: getProgressColor(percentage) }]}>
            {Math.round(percentage)}%
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={BRAND_COLORS.navy} />
      </View>
    );
  }

  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const totalLimit = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalRemaining = totalLimit - totalSpent;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Budgets</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
            <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Remaining</Text>
          <Text style={styles.summaryValue}>${(totalRemaining / 100).toFixed(2)}</Text>
          <Text style={styles.summarySubtext}>
            of ${(totalLimit / 100).toFixed(2)} budget across {budgets.length} categories
          </Text>
        </View>

        <FlatList
          data={budgets}
          renderItem={renderBudgetItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      </ScrollView>

      <CreateBudgetModal visible={showModal} onClose={() => setShowModal(false)} onCreate={handleCreateBudget} />
    </View>
  );
}
