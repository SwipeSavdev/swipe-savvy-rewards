import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  FlatList,
  ListRenderItem,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LIGHT_THEME, SPACING, RADIUS, TYPOGRAPHY, BRAND_COLORS } from '../../../design-system/theme';
import { Card, Button } from '../../../design-system/components/CoreComponents';
import { dataService } from '../../../services/DataService';

interface Cause {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  impact: string;
}

const CAUSES: Cause[] = [
  {
    id: '1',
    name: 'Food Relief',
    description: 'Support local food banks',
    icon: 'food',
    color: '#FF6B6B',
    impact: '100 pts = 1 meal',
  },
  {
    id: '2',
    name: 'Education',
    description: 'Fund scholarships',
    icon: 'school',
    color: '#4ECDC4',
    impact: '500 pts = 1 scholarship',
  },
  {
    id: '3',
    name: 'Environment',
    description: 'Climate action projects',
    icon: 'leaf',
    color: '#95E1D3',
    impact: '200 pts = 1 tree planted',
  },
  {
    id: '4',
    name: 'Healthcare',
    description: 'Medical assistance programs',
    icon: 'hospital-box',
    color: '#F38181',
    impact: '300 pts = medical supplies',
  },
];

export function RewardsDonateScreen() {
  const navigation = useNavigation();
  const [availablePoints, setAvailablePoints] = useState(12450);
  const [selectedCause, setSelectedCause] = useState<Cause | null>(null);
  const [donationAmount, setDonationAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPoints();
  }, []);

  const loadPoints = async () => {
    try {
      setLoading(true);
      const data = await dataService.getRewardsPoints();
      setAvailablePoints(data.available);
    } catch (error) {
      console.error('Failed to load points:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDonate = async () => {
    if (!selectedCause) {
      Alert.alert('Error', 'Please select a cause');
      return;
    }

    if (!donationAmount || isNaN(Number(donationAmount))) {
      Alert.alert('Error', 'Please enter a valid donation amount');
      return;
    }

    const amount = Number(donationAmount);
    if (amount > availablePoints) {
      Alert.alert('Error', `You only have ${availablePoints} points available`);
      return;
    }

    if (amount <= 0) {
      Alert.alert('Error', 'Donation amount must be greater than 0');
      return;
    }

    try {
      setSubmitting(true);
      const result = await dataService.donatePoints(amount);

      if (result.success) {
        Alert.alert(
          'Thank You!',
          `You've donated ${amount} points to ${selectedCause.name}.\n\nYour contribution will make a difference!`,
          [
            {
              text: 'Done',
              onPress: () => {
                navigation.goBack();
              },
            },
          ]
        );
        setAvailablePoints(result.newBalance);
      }
    } catch (error) {
      console.error('Failed to donate:', error);
      Alert.alert('Error', 'Failed to process donation. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderCauseItem: ListRenderItem<Cause> = ({ item }) => (
    <TouchableOpacity
      onPress={() => setSelectedCause(item)}
      activeOpacity={0.7}
    >
      <Card
        style={{
          padding: SPACING[4],
          borderWidth: 2,
          borderColor: selectedCause?.id === item.id ? BRAND_COLORS.navy : 'transparent',
          backgroundColor: selectedCause?.id === item.id ? BRAND_COLORS.navy + '10' : undefined,
        }}
      >
        <View style={styles.causeContent}>
          <View
            style={[
              styles.causeIcon,
              { backgroundColor: item.color + '20' },
            ]}
          >
            <MaterialCommunityIcons
              name={item.icon as any}
              size={28}
              color={item.color}
            />
          </View>
          <View style={styles.causeInfo}>
            <Text style={styles.causeName}>{item.name}</Text>
            <Text style={styles.causeDescription}>{item.description}</Text>
            <Text style={styles.causeImpact}>{item.impact}</Text>
          </View>
          {selectedCause?.id === item.id && (
            <Ionicons
              name="checkmark-circle"
              size={24}
              color={BRAND_COLORS.navy}
            />
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: LIGHT_THEME.bg,
    },
    contentContainer: {
      padding: SPACING[4],
      paddingBottom: SPACING[10],
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    pointsCard: {
      marginBottom: SPACING[3],
      padding: SPACING[4],
      backgroundColor: BRAND_COLORS.yellow,
    },
    pointsText: {
      color: LIGHT_THEME.text,
      fontSize: TYPOGRAPHY.fontSize.meta,
      marginBottom: SPACING[2],
    },
    pointsValue: {
      color: LIGHT_THEME.text,
      fontSize: 28,
      fontWeight: '800',
    },
    sectionTitle: {
      fontSize: TYPOGRAPHY.fontSize.h2,
      fontWeight: '600',
      color: LIGHT_THEME.text,
      marginVertical: SPACING[3],
    },
    causesContainer: {
      gap: SPACING[3],
      marginBottom: SPACING[4],
    },
    causeCard: {
      padding: SPACING[3],
      borderWidth: 2,
      borderColor: 'transparent',
    },
    causeCardSelected: {
      borderColor: BRAND_COLORS.navy,
      backgroundColor: BRAND_COLORS.navy + '10',
    },
    causeContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING[3],
    },
    causeIcon: {
      width: 60,
      height: 60,
      borderRadius: RADIUS.md,
      justifyContent: 'center',
      alignItems: 'center',
    },
    causeInfo: {
      flex: 1,
    },
    causeName: {
      fontSize: TYPOGRAPHY.fontSize.body,
      fontWeight: '600',
      color: LIGHT_THEME.text,
      marginBottom: SPACING[1],
    },
    causeDescription: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: LIGHT_THEME.muted,
      marginBottom: SPACING[1],
    },
    causeImpact: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: BRAND_COLORS.navy,
      fontWeight: '500',
    },
    donationSection: {
      marginTop: SPACING[3],
      paddingTop: SPACING[3],
      borderTopWidth: 1,
      borderTopColor: LIGHT_THEME.stroke,
    },
    label: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      fontWeight: '600',
      color: LIGHT_THEME.text,
      marginBottom: SPACING[2],
    },
    input: {
      borderWidth: 1,
      borderColor: LIGHT_THEME.stroke,
      borderRadius: RADIUS.md,
      paddingHorizontal: SPACING[3],
      paddingVertical: SPACING[2],
      marginBottom: SPACING[3],
      color: LIGHT_THEME.text,
      fontSize: TYPOGRAPHY.fontSize.body,
    },
    amountButtons: {
      flexDirection: 'row',
      gap: SPACING[2],
      marginBottom: SPACING[3],
      flexWrap: 'wrap',
    },
    amountButton: {
      borderWidth: 1,
      borderColor: LIGHT_THEME.stroke,
      borderRadius: RADIUS.md,
      paddingHorizontal: SPACING[3],
      paddingVertical: SPACING[2],
      flex: 1,
      minWidth: '45%',
      alignItems: 'center',
    },
    amountButtonActive: {
      backgroundColor: BRAND_COLORS.navy,
      borderColor: BRAND_COLORS.navy,
    },
    amountButtonText: {
      color: LIGHT_THEME.text,
      fontWeight: '600',
    },
    amountButtonTextActive: {
      color: 'white',
    },
  });

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={BRAND_COLORS.navy} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Card style={styles.pointsCard}>
          <Text style={styles.pointsText}>Available Points</Text>
          <Text style={styles.pointsValue}>{availablePoints.toLocaleString()}</Text>
        </Card>

        <Text style={styles.sectionTitle}>Select a Cause</Text>
        <View style={styles.causesContainer}>
          <FlatList
            scrollEnabled={false}
            data={CAUSES}
            renderItem={renderCauseItem}
            keyExtractor={(item: Cause) => item.id}
          />
        </View>

        {selectedCause && (
          <View style={styles.donationSection}>
            <Text style={styles.sectionTitle}>Donation Amount</Text>

            <Text style={styles.label}>Quick Amount Selection</Text>
            <View style={styles.amountButtons}>
              {[100, 250, 500, 1000].map((amount) => (
                <TouchableOpacity
                  key={amount}
                  style={[
                    styles.amountButton,
                    donationAmount === String(amount) && styles.amountButtonActive,
                  ]}
                  onPress={() => setDonationAmount(String(amount))}
                >
                  <Text
                    style={[
                      styles.amountButtonText,
                      donationAmount === String(amount) && styles.amountButtonTextActive,
                    ]}
                  >
                    {amount}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Or Enter Custom Amount</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter points to donate"
              placeholderTextColor={LIGHT_THEME.muted}
              value={donationAmount}
              onChangeText={setDonationAmount}
              keyboardType="numeric"
            />

            <Button
              onPress={handleDonate}
              disabled={submitting || !donationAmount}
            >
              {submitting ? 'Processing...' : 'Donate Points'}
            </Button>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
