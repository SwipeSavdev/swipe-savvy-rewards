import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@contexts/ThemeContext';
import { SupportTicket, TicketStatus, SupportCategory } from '../types/support';
import { supportTicketService } from '../services/SupportTicketService';

interface SupportTicketsScreenProps {
  customerId: string;
  onTicketPress?: (ticket: SupportTicket) => void;
}

export function SupportTicketsScreen({ customerId, onTicketPress }: SupportTicketsScreenProps) {
  const { colors } = useTheme();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'open' | 'resolved'>('open');

  const fetchTickets = useCallback(async () => {
    try {
      const data = await supportTicketService.getCustomerTickets(customerId);
      setTickets(data);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setIsLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchTickets();
    setIsRefreshing(false);
  }, [fetchTickets]);

  const getCategoryLabel = (category: SupportCategory): string => {
    const labels: Record<SupportCategory, string> = {
      app_error: 'App Error',
      banking_issue: 'Banking Issue',
      account_access: 'Account Access',
      transaction_error: 'Transaction Error',
      feature_question: 'Feature Question',
      security_concern: 'Security',
      other: 'Other',
    };
    return labels[category];
  };

  const getStatusColor = (status: TicketStatus): string => {
    switch (status) {
      case 'open':
        return colors.brand;
      case 'in_progress':
        return '#FF9800';
      case 'waiting_customer':
        return '#2196F3';
      case 'resolved':
        return colors.success;
      case 'closed':
        return colors.muted;
      default:
        return colors.text;
    }
  };

  const getStatusIcon = (status: TicketStatus): keyof typeof MaterialCommunityIcons.glyphMap => {
    switch (status) {
      case 'open':
        return 'alert-circle-outline';
      case 'in_progress':
        return 'progress-clock';
      case 'waiting_customer':
        return 'clock-outline';
      case 'resolved':
        return 'check-circle';
      case 'closed':
        return 'check-all';
      default:
        return 'help-circle-outline';
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    if (activeTab === 'open') {
      return ['open', 'in_progress', 'waiting_customer'].includes(ticket.status);
    }
    return ['resolved', 'closed'].includes(ticket.status);
  });

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    header: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.stroke,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 12,
    },
    tabContainer: {
      flexDirection: 'row',
      gap: 8,
    },
    tab: {
      flex: 1,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 8,
      backgroundColor: colors.panel2,
      justifyContent: 'center',
      alignItems: 'center',
    },
    tabActive: {
      backgroundColor: colors.brand,
    },
    tabText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
    },
    tabTextActive: {
      color: '#FFFFFF',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
    },
    emptyIcon: {
      marginBottom: 12,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    emptyText: {
      fontSize: 13,
      color: colors.muted,
      textAlign: 'center',
    },
    ticketCard: {
      backgroundColor: colors.panel2,
      marginHorizontal: 16,
      marginVertical: 8,
      borderRadius: 12,
      padding: 12,
      borderLeftWidth: 4,
    },
    ticketHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    ticketNumber: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.muted,
    },
    ticketStatus: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    statusLabel: {
      fontSize: 12,
      fontWeight: '600',
      textTransform: 'capitalize',
    },
    ticketTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
      paddingRight: 12,
    },
    ticketFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    category: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.brand + '20',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    categoryText: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.brand,
    },
    date: {
      fontSize: 11,
      color: colors.muted,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.brand} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Tabs */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Support Tickets</Text>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'open' && styles.tabActive]}
            onPress={() => setActiveTab('open')}
          >
            <Text style={[styles.tabText, activeTab === 'open' && styles.tabTextActive]}>
              Open ({tickets.filter((t) => ['open', 'in_progress', 'waiting_customer'].includes(t.status)).length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'resolved' && styles.tabActive]}
            onPress={() => setActiveTab('resolved')}
          >
            <Text style={[styles.tabText, activeTab === 'resolved' && styles.tabTextActive]}>
              Resolved ({tickets.filter((t) => ['resolved', 'closed'].includes(t.status)).length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tickets List */}
      <FlatList
        data={filteredTickets}
        renderItem={({ item: ticket }) => (
          <TouchableOpacity onPress={() => onTicketPress?.(ticket)}>
            <View style={[styles.ticketCard, { borderLeftColor: getStatusColor(ticket.status) }]}>
              {/* Header */}
              <View style={styles.ticketHeader}>
                <Text style={styles.ticketNumber}>#{ticket.ticketNumber}</Text>
                <View style={styles.ticketStatus}>
                  <MaterialCommunityIcons
                    name={getStatusIcon(ticket.status)}
                    size={16}
                    color={getStatusColor(ticket.status)}
                  />
                  <Text style={[styles.statusLabel, { color: getStatusColor(ticket.status) }]}>
                    {ticket.status.replace(/_/g, ' ')}
                  </Text>
                </View>
              </View>

              {/* Title */}
              <Text style={styles.ticketTitle} numberOfLines={2}>
                {ticket.subject}
              </Text>

              {/* Footer */}
              <View style={styles.ticketFooter}>
                <View style={styles.category}>
                  <MaterialCommunityIcons name="tag" size={12} color={colors.brand} />
                  <Text style={styles.categoryText}>{getCategoryLabel(ticket.category)}</Text>
                </View>
                <Text style={styles.date}>
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name={activeTab === 'open' ? 'inbox-outline' : 'check-all'}
              size={48}
              color={colors.muted}
              style={styles.emptyIcon}
            />
            <Text style={styles.emptyTitle}>
              {activeTab === 'open' ? 'No Open Tickets' : 'No Resolved Tickets'}
            </Text>
            <Text style={styles.emptyText}>
              {activeTab === 'open'
                ? 'You don\'t have any open support tickets.'
                : 'Your resolved tickets will appear here.'}
            </Text>
          </View>
        }
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
        contentContainerStyle={{ flexGrow: 1 }}
      />
    </View>
  );
}
