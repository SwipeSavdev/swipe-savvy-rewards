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

interface Boost {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  percent: string;
  active?: boolean;
}

const BOOSTS: Boost[] = [
  {
    id: '1',
    title: '2× points on Fuel',
    subtitle: 'Activate • valid this week',
    icon: 'gas-cylinder',
    percent: '+2%',
    active: true,
  },
  {
    id: '2',
    title: 'Local cafés',
    subtitle: '+150 pts per visit',
    icon: 'coffee',
    percent: '+150',
    active: false,
  },
];

export function RewardsScreen() {
  const navigation = useNavigation();
  const [availablePoints, setAvailablePoints] = useState(12450);
  const [boosts, setBoosts] = useState<Boost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRewardsData();
  }, []);

  const loadRewardsData = async () => {
    try {
      setLoading(true);
      
      // Load points from backend
      try {
        const pointsData = await dataService.getRewardsPoints();
        setAvailablePoints(pointsData?.available || 12450);
      } catch (pointsError) {
        // Silently fall back to default points
        setAvailablePoints(12450);
      }

      // Load boosts from backend
      try {
        const boostsData = await dataService.getBoosts();
        
        // Ensure boosts data is an array
        if (!Array.isArray(boostsData)) {
          setBoosts(BOOSTS);
          return;
        }
        
        // Map boosts with safe property access
        const formattedBoosts: Boost[] = boostsData.map((boost: any) => ({
          id: boost?.id || '',
          title: boost?.title || '',
          subtitle: boost?.subtitle || '',
          icon: boost?.icon || 'star',
          percent: boost?.percent || '',
          active: boost?.active || false,
        }));
        setBoosts(formattedBoosts);
      } catch (boostsError) {
        // Silently use mock data on error
        setBoosts(BOOSTS);
      }
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
    },
    pointsCard: {
      backgroundColor: BRAND_COLORS.yellow,
      borderRadius: RADIUS.xl,
      padding: SPACING[4],
      borderWidth: 0,
    },
    pointsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    pointsLeft: {
      flex: 1,
    },
    pointsLabel: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: 'rgba(19,33,54,0.72)',
      marginBottom: SPACING[1],
    },
    pointsValue: {
      fontSize: 26,
      fontWeight: '800',
      fontFamily: TYPOGRAPHY.fontFamily.mono,
      color: BRAND_COLORS.deep,
    },
    pointsSubtext: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: 'rgba(19,33,54,0.62)',
      marginTop: SPACING[1],
    },
    donateButton: {
      backgroundColor: 'rgba(255,255,255,0.55)',
      borderRadius: RADIUS.lg,
      paddingVertical: SPACING[2],
      paddingHorizontal: SPACING[3],
    },
    donateButtonText: {
      color: BRAND_COLORS.deep,
      fontWeight: '700',
      fontSize: TYPOGRAPHY.fontSize.body,
    },
    tierRow: {
      marginTop: SPACING[2],
      flexDirection: 'row',
      gap: SPACING[2],
      alignItems: 'center',
    },
    tierLabel: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: 'rgba(19,33,54,0.65)',
    },
    tierProgress: {
      flex: 1,
      height: 8,
      backgroundColor: 'rgba(19,33,54,0.15)',
      borderRadius: RADIUS.pill,
      overflow: 'hidden',
    },
    tierProgressBar: {
      height: '100%',
      width: '68%',
      backgroundColor: BRAND_COLORS.navy,
      borderRadius: RADIUS.pill,
    },
    sectionTitle: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: LIGHT_THEME.muted,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: SPACING[2],
    },
    boostItem: {
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
    boostInfo: {
      flex: 1,
      gap: SPACING[1],
    },
    boostTitle: {
      fontSize: TYPOGRAPHY.fontSize.body,
      fontWeight: '600',
      color: LIGHT_THEME.text,
    },
    boostSubtitle: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: LIGHT_THEME.muted,
    },
    impactGrid: {
      gap: SPACING[2],
      flexDirection: 'row',
    },
    impactCard: {
      flex: 1,
      padding: SPACING[2],
      backgroundColor: LIGHT_THEME.panel2,
      borderRadius: RADIUS.lg,
      borderWidth: 1,
      borderColor: LIGHT_THEME.stroke,
      alignItems: 'center',
    },
    impactLabel: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: LIGHT_THEME.muted,
      marginBottom: SPACING[1],
    },
    impactValue: {
      fontSize: 18,
      fontWeight: '800',
      fontFamily: TYPOGRAPHY.fontFamily.mono,
      color: LIGHT_THEME.text,
      marginVertical: SPACING[1],
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING[2],
    },
  });

  const renderBoost: ListRenderItem<Boost> = ({ item }) => (
    <View style={styles.boostItem}>
      <IconBox icon={<MaterialCommunityIcons name={item.icon as any} size={20} />} variant="green" />
      <View style={styles.boostInfo}>
        <Text style={styles.boostTitle}>{item.title}</Text>
        <Text style={styles.boostSubtitle}>{item.subtitle}</Text>
      </View>
      <Badge label={item.percent} variant={item.active ? 'success' : 'default'} />
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Points Card */}
        <View style={styles.pointsCard}>
          <View style={styles.pointsRow}>
            <View style={styles.pointsLeft}>
              <Text style={styles.pointsLabel}>Available points</Text>
              <Text style={styles.pointsValue}>{availablePoints.toLocaleString()}</Text>
              <Text style={styles.pointsSubtext}>Est. value ${(availablePoints / 100).toFixed(2)}</Text>
            </View>
            <TouchableOpacity
              style={styles.donateButton}
              onPress={() => (navigation as any).navigate('RewardsDonate')}
            >
              <Text style={styles.donateButtonText}>Donate</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tierRow}>
            <Text style={styles.tierLabel}>Tier progress: Silver</Text>
            <View style={styles.tierProgress}>
              <View style={styles.tierProgressBar} />
            </View>
          </View>
        </View>

        {/* Boosts Section */}
        <View>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.sectionTitle}>Boosts for you</Text>
              <Text style={[styles.pointsLabel, { marginBottom: 0, marginTop: -SPACING[2] }]}>
                Earn more without clutter
              </Text>
            </View>
            <Button onPress={() => Alert.alert('Challenges', 'Boost challenges coming soon')} variant="secondary">
              Challenges
            </Button>
          </View>

          <FlatList
            data={boosts}
            renderItem={renderBoost}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ListEmptyComponent={
              loading ? (
                <ActivityIndicator color={BRAND_COLORS.navy} />
              ) : (
                <Text style={styles.pointsLabel}>No boosts available</Text>
              )
            }
          />
        </View>

        {/* Impact Section */}
        <Card padding={SPACING[4]}>
          <Text style={styles.sectionTitle}>Impact snapshot</Text>
          <Text style={[styles.pointsLabel, { marginBottom: SPACING[2] }]}>
            Donation capability built-in
          </Text>

          <View style={styles.impactGrid}>
            <View style={styles.impactCard}>
              <Text style={styles.impactLabel}>You donated</Text>
              <Text style={styles.impactValue}>3,200</Text>
              <Text style={styles.impactLabel}>pts total</Text>
            </View>
            <View style={styles.impactCard}>
              <Text style={styles.impactLabel}>Rank</Text>
              <Text style={styles.impactValue}>#42</Text>
              <Text style={styles.impactLabel}>this month</Text>
            </View>
            <View style={styles.impactCard}>
              <Text style={styles.impactLabel}>Streak</Text>
              <Text style={styles.impactValue}>4</Text>
              <Text style={styles.impactLabel}>weeks</Text>
            </View>
          </View>
        </Card>

        <Button
          onPress={() => (navigation as any).navigate('Leaderboard')}
          variant="secondary"
          style={{ width: '100%' }}
        >
          View Community
        </Button>
      </ScrollView>
    </View>
  );
}
