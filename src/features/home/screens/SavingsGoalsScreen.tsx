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
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LIGHT_THEME, SPACING, RADIUS, TYPOGRAPHY, BRAND_COLORS } from '../../../design-system/theme';
import { Button } from '../../../design-system/components/CoreComponents';
import { dataService } from '../../../services/DataService';

interface SavingsGoal {
  id: string;
  name: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  icon: string;
  color: string;
  category: string;
}

const MOCK_GOALS: SavingsGoal[] = [
  {
    id: '1',
    name: 'Vacation Fund',
    description: 'Summer trip to Europe',
    targetAmount: 1000000,
    currentAmount: 650000,
    deadline: '2025-06-30',
    icon: 'airplane',
    color: '#FF6B6B',
    category: 'Travel',
  },
  {
    id: '2',
    name: 'Emergency Fund',
    description: '6 months of expenses',
    targetAmount: 2500000,
    currentAmount: 1850000,
    deadline: '2025-12-31',
    icon: 'shield',
    color: '#4ECDC4',
    category: 'Safety',
  },
  {
    id: '3',
    name: 'New Laptop',
    description: 'MacBook Pro 16"',
    targetAmount: 300000,
    currentAmount: 180000,
    deadline: '2025-03-31',
    icon: 'laptop',
    color: '#95E1D3',
    category: 'Electronics',
  },
  {
    id: '4',
    name: 'Home Renovation',
    description: 'Kitchen remodeling',
    targetAmount: 500000,
    currentAmount: 275000,
    deadline: '2025-09-30',
    icon: 'home-edit',
    color: '#FFB74D',
    category: 'Home',
  },
];

interface CreateGoalModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => void;
}

function CreateGoalModal({ visible, onClose, onCreate }: CreateGoalModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');

  const handleCreate = () => {
    if (!name || !targetAmount || !deadline) {
      Alert.alert('Missing Fields', 'Please fill in all fields');
      return;
    }

    const amount = parseInt(targetAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid target amount');
      return;
    }

    onCreate({
      name,
      description,
      targetAmount: amount,
      deadline,
      icon: 'target',
      color: BRAND_COLORS.navy,
      category: 'Other',
    });

    setName('');
    setDescription('');
    setTargetAmount('');
    setDeadline('');
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
          <Text style={styles.title}>New Savings Goal</Text>

          <Text style={styles.label}>Goal Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Vacation Fund"
            placeholderTextColor={LIGHT_THEME.muted2}
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={styles.input}
            placeholder="What is this for?"
            placeholderTextColor={LIGHT_THEME.muted2}
            value={description}
            onChangeText={setDescription}
          />

          <Text style={styles.label}>Target Amount ($)</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            placeholderTextColor={LIGHT_THEME.muted2}
            keyboardType="number-pad"
            value={targetAmount}
            onChangeText={setTargetAmount}
          />

          <Text style={styles.label}>Target Date</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={LIGHT_THEME.muted2}
            value={deadline}
            onChangeText={setDeadline}
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

export function SavingsGoalsScreen() {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      setLoading(true);
      setGoals(MOCK_GOALS);
    } catch (error) {
      setGoals(MOCK_GOALS);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = (newGoal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => {
    const goal: SavingsGoal = {
      ...newGoal,
      id: Date.now().toString(),
      currentAmount: 0,
    };
    setGoals([...goals, goal]);
    setShowModal(false);
    Alert.alert('Success', `Goal "${goal.name}" created!`);
  };

  const getPercentage = (current: number, target: number) => {
    if (target === 0) return 0;
    return Math.min((current / target) * 100, 100);
  };

  const getDaysRemaining = (deadline: string) => {
    const target = new Date(deadline).getTime();
    const today = new Date().getTime();
    const diff = target - today;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
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
    goalItem: {
      backgroundColor: LIGHT_THEME.panelSolid,
      borderRadius: RADIUS.lg,
      padding: SPACING[3],
      marginBottom: SPACING[3],
      borderWidth: 1,
      borderColor: LIGHT_THEME.stroke,
    },
    goalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: SPACING[2],
      gap: SPACING[2],
    },
    goalIcon: {
      width: 40,
      height: 40,
      borderRadius: RADIUS.md,
      justifyContent: 'center',
      alignItems: 'center',
    },
    goalTitle: {
      fontSize: TYPOGRAPHY.fontSize.body,
      fontWeight: '700',
      color: LIGHT_THEME.text,
    },
    goalDescription: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: LIGHT_THEME.muted,
      marginTop: SPACING[1],
    },
    goalStats: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: SPACING[2],
      marginTop: SPACING[2],
    },
    goalAmount: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: LIGHT_THEME.muted,
    },
    goalDaysRemaining: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      fontWeight: '600',
      color: BRAND_COLORS.green,
    },
    progressBar: {
      height: 8,
      backgroundColor: LIGHT_THEME.panel2,
      borderRadius: RADIUS.sm,
      overflow: 'hidden',
      marginBottom: SPACING[2],
    },
    progressFill: {
      height: '100%',
      borderRadius: RADIUS.sm,
    },
    progressPercentage: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      fontWeight: '600',
      color: LIGHT_THEME.muted2,
      textAlign: 'right',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={BRAND_COLORS.navy} />
      </View>
    );
  }

  const totalGoals = goals.length;
  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);

  const renderGoalItem: ListRenderItem<SavingsGoal> = ({ item }) => {
    const percentage = getPercentage(item.currentAmount, item.targetAmount);
    const daysRemaining = getDaysRemaining(item.deadline);

    return (
      <TouchableOpacity style={styles.goalItem}>
        <View style={styles.goalHeader}>
          <View style={[styles.goalIcon, { backgroundColor: item.color + '20' }]}>
            <MaterialCommunityIcons name={item.icon as any} size={20} color={item.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.goalTitle}>{item.name}</Text>
            <Text style={styles.goalDescription}>{item.description}</Text>
          </View>
        </View>

        <View style={styles.goalStats}>
          <Text style={styles.goalAmount}>
            ${(item.currentAmount / 100).toFixed(2)} / ${(item.targetAmount / 100).toFixed(2)}
          </Text>
          <Text style={styles.goalDaysRemaining}>{daysRemaining} days left</Text>
        </View>

        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${percentage}%`,
                backgroundColor: item.color,
              },
            ]}
          />
        </View>

        <Text style={styles.progressPercentage}>{Math.round(percentage)}% complete</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Savings Goals</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
            <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Saved</Text>
          <Text style={styles.summaryValue}>${(totalSaved / 100).toFixed(2)}</Text>
          <Text style={styles.summarySubtext}>across {totalGoals} goals</Text>
        </View>

        <FlatList
          data={goals}
          renderItem={renderGoalItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      </ScrollView>

      <CreateGoalModal visible={showModal} onClose={() => setShowModal(false)} onCreate={handleCreateGoal} />
    </View>
  );
}
