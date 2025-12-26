import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  FlatList,
  ListRenderItem,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LIGHT_THEME, SPACING, RADIUS, TYPOGRAPHY, BRAND_COLORS } from '../../../design-system/theme';
import { Card, Badge, Avatar } from '../../../design-system/components/CoreComponents';
import { dataService } from '../../../services/DataService';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar: string;
  points: number;
  donated: number;
  tier: string;
}

export function LeaderboardScreen() {
  const navigation = useNavigation();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'weekly' | 'monthly' | 'allTime'>('weekly');

  useEffect(() => {
    loadLeaderboard();
  }, [filter]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await dataService.getCommunityLeaderboard();
      
      // If empty, use mock data
      if (!data || data.length === 0) {
        const mockData: LeaderboardEntry[] = [
          {
            rank: 1,
            userId: '1',
            name: 'Alex Chen',
            avatar: 'AC',
            points: 15420,
            donated: 5000,
            tier: 'Platinum',
          },
          {
            rank: 2,
            userId: '2',
            name: 'Jordan Smith',
            avatar: 'JS',
            points: 12850,
            donated: 3500,
            tier: 'Gold',
          },
          {
            rank: 3,
            userId: '3',
            name: 'Emma Davis',
            avatar: 'ED',
            points: 11200,
            donated: 2800,
            tier: 'Gold',
          },
          {
            rank: 4,
            userId: '4',
            name: 'Michael Brown',
            avatar: 'MB',
            points: 9850,
            donated: 2000,
            tier: 'Silver',
          },
          {
            rank: 5,
            userId: '5',
            name: 'Sarah Wilson',
            avatar: 'SW',
            points: 8500,
            donated: 1500,
            tier: 'Silver',
          },
          {
            rank: 6,
            userId: '6',
            name: 'David Lee',
            avatar: 'DL',
            points: 7200,
            donated: 1000,
            tier: 'Silver',
          },
          {
            rank: 7,
            userId: '7',
            name: 'Lisa Anderson',
            avatar: 'LA',
            points: 6500,
            donated: 800,
            tier: 'Bronze',
          },
          {
            rank: 8,
            userId: '8',
            name: 'James Martin',
            avatar: 'JM',
            points: 5800,
            donated: 500,
            tier: 'Bronze',
          },
        ];
        setLeaderboardData(mockData);
      } else {
        setLeaderboardData(data);
      }
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
      Alert.alert('Error', 'Failed to load leaderboard data');
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tier: string): string => {
    switch (tier) {
      case 'Platinum':
        return '#E5E4E2';
      case 'Gold':
        return '#FFD700';
      case 'Silver':
        return '#C0C0C0';
      case 'Bronze':
        return '#CD7F32';
      default:
        return LIGHT_THEME.stroke;
    }
  };

  const getRankMedal = (rank: number): string => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return '';
    }
  };

  const renderLeaderboardItem: ListRenderItem<LeaderboardEntry> = ({ item }) => {
    const tierColor = getTierColor(item.tier);
    const medal = getRankMedal(item.rank);

    return (
      <Card style={styles.entryCard}>
        <View style={styles.entryContent}>
          <View style={styles.rankSection}>
            {medal ? (
              <Text style={styles.medal}>{medal}</Text>
            ) : (
              <Text style={styles.rankNumber}>#{item.rank}</Text>
            )}
          </View>

          <View style={styles.userInfo}>
            <Avatar
              initials={item.avatar}
              size={40}
            />
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{item.name}</Text>
              <View style={styles.tierBadge}>
                <View
                  style={[
                    styles.tierDot,
                    { backgroundColor: tierColor },
                  ]}
                />
                <Text style={styles.tierLabel}>{item.tier}</Text>
              </View>
            </View>
          </View>

          <View style={styles.statsSection}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Points</Text>
              <Text style={styles.statValue}>
                {(item.points / 1000).toFixed(1)}K
              </Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Donated</Text>
              <Text style={styles.statValue}>
                {(item.donated / 1000).toFixed(1)}K
              </Text>
            </View>
          </View>
        </View>
      </Card>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: LIGHT_THEME.bg,
    },
    contentContainer: {
      paddingBottom: SPACING[10],
    },
    header: {
      paddingHorizontal: SPACING[4],
      paddingVertical: SPACING[4],
      backgroundColor: BRAND_COLORS.navy,
    },
    headerTitle: {
      fontSize: TYPOGRAPHY.fontSize.h2,
      fontWeight: '700',
      color: 'white',
      marginBottom: SPACING[2],
    },
    headerSubtitle: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: 'rgba(255, 255, 255, 0.9)',
    },
    filterSection: {
      flexDirection: 'row',
      paddingHorizontal: SPACING[4],
      paddingVertical: SPACING[3],
      gap: SPACING[2],
    },
    filterButton: {
      flex: 1,
      paddingHorizontal: SPACING[3],
      paddingVertical: SPACING[2],
      borderRadius: RADIUS.md,
      borderWidth: 1,
      borderColor: LIGHT_THEME.stroke,
      alignItems: 'center',
    },
    filterButtonActive: {
      backgroundColor: BRAND_COLORS.navy,
      borderColor: BRAND_COLORS.navy,
    },
    filterButtonText: {
      color: LIGHT_THEME.text,
      fontWeight: '600',
      fontSize: TYPOGRAPHY.fontSize.meta,
    },
    filterButtonTextActive: {
      color: 'white',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    listContainer: {
      paddingHorizontal: SPACING[4],
      paddingTop: SPACING[3],
    },
    entryCard: {
      marginBottom: SPACING[3],
      padding: SPACING[3],
    },
    entryContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING[3],
    },
    rankSection: {
      width: 45,
      alignItems: 'center',
      justifyContent: 'center',
    },
    medal: {
      fontSize: 28,
    },
    rankNumber: {
      fontSize: TYPOGRAPHY.fontSize.h3,
      fontWeight: '700',
      color: BRAND_COLORS.navy,
    },
    userInfo: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING[3],
    },
    userDetails: {
      flex: 1,
    },
    userName: {
      fontSize: TYPOGRAPHY.fontSize.body,
      fontWeight: '600',
      color: LIGHT_THEME.text,
      marginBottom: SPACING[1],
    },
    tierBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING[1],
    },
    tierDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    tierLabel: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: LIGHT_THEME.muted,
      fontWeight: '500',
    },
    statsSection: {
      flexDirection: 'row',
      gap: SPACING[4],
    },
    stat: {
      alignItems: 'flex-end',
    },
    statLabel: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: LIGHT_THEME.muted,
      marginBottom: SPACING[1],
    },
    statValue: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      fontWeight: '600',
      color: LIGHT_THEME.text,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Community Leaderboard</Text>
        <Text style={styles.headerSubtitle}>
          Compete with friends and earn rewards
        </Text>
      </View>

      <View style={styles.filterSection}>
        {['weekly', 'monthly', 'allTime'].map((period) => (
          <TouchableOpacity
            key={period}
            style={[
              styles.filterButton,
              filter === period && styles.filterButtonActive,
            ]}
            onPress={() => setFilter(period as any)}
          >
            <Text
              style={[
                styles.filterButtonText,
                filter === period && styles.filterButtonTextActive,
              ]}
            >
              {period === 'allTime' ? 'All Time' : period.charAt(0).toUpperCase() + period.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={[styles.container, styles.loadingContainer]}>
          <ActivityIndicator size="large" color={BRAND_COLORS.navy} />
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.listContainer}
          data={leaderboardData}
          renderItem={renderLeaderboardItem}
          keyExtractor={(item) => item.userId}
        />
      )}
    </View>
  );
}
