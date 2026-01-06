import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAIChat } from '../../../packages/ai-sdk/src/hooks/useAIChat';
import { useAuthStore } from '../../auth/stores/authStore';
import { ChatInput } from '../components/ChatInput';
import { ChatMessage } from '../components/ChatMessage';
import { CustomerVerificationModal } from '../components/CustomerVerificationModal';
import { QuickActions } from '../components/QuickActions';
import { TypingIndicator } from '../components/TypingIndicator';
import {
    getEscalationMessage,
    handleAIToHumanHandoff,
    shouldOfferEscalation,
} from '../services/AITransferHandler';
import { CustomerVerification } from '../types/support';

interface ChatScreenProps {
  isModal?: boolean;
  sessionId?: string;
}

interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function ChatScreen({ isModal = false, sessionId = 'default' }: ChatScreenProps) {
  const { colors } = useTheme();
  const user = useAuthStore((state) => state.user);
  const { messages, isLoading, currentResponse, sendMessage, contextLoaded } = useAIChat({
    sessionId,
    onError: (error) => {
      console.error('Chat error:', error);
    },
  });

  const flatListRef = useRef<FlatList>(null);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [showVerification, setShowVerification] = useState(false);
  const [transferring, setTransferring] = useState(false);
  const [showEscalationOffer, setShowEscalationOffer] = useState(false);

  useEffect(() => {
    if (messages.length > 0) {
      setShowQuickActions(false);
    }
  }, [messages]);

  useEffect(() => {
    // Check if we should offer escalation
    if (messages.length > 5 && !transferring) {
      const formattedMessages = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      if (shouldOfferEscalation(formattedMessages)) {
        setShowEscalationOffer(true);
      }
    }
  }, [messages, transferring]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages, currentResponse]);

  const handleSend = (message: string) => {
    sendMessage(message);
  };

  const handleVerificationComplete = useCallback(
    async (verification: CustomerVerification) => {
      setShowVerification(false);
      setTransferring(true);

      try {
        const formattedMessages: AIMessage[] = messages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          timestamp: new Date(),
        }));

        // Handle the transfer to human agent
        const result = await handleAIToHumanHandoff(
          user?.id || 'unknown',
          'conversation-' + Date.now(),
          formattedMessages,
          false,
        );

        // Show confirmation message
        sendMessage(
          `Great! I've created support ticket #${result.ticketNumber}. A support agent will be with you shortly to help resolve your issue.`,
        );
      } catch (error) {
        console.error('Failed to handle escalation:', error);
        sendMessage(
          'I apologize, but I was unable to connect you with a support agent. Please try again later or contact support directly.',
        );
      } finally {
        setTransferring(false);
      }
    },
    [messages, user?.id, sendMessage],
  );

  const handleEscalation = useCallback(async () => {
    setShowEscalationOffer(false);
    const formattedMessages = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // Determine category and priority
    const analysis = (() => {
      const text = formattedMessages.map((m) => m.content).join(' ').toLowerCase();
      if (text.includes('error') || text.includes('bug'))
        return { category: 'app_error', priority: 'medium' };
      if (text.includes('transfer') || text.includes('transaction'))
        return { category: 'banking_issue', priority: 'high' };
      return { category: 'other', priority: 'medium' };
    })();

    // Show escalation message
    const escalationMsg = getEscalationMessage(analysis.category as any, analysis.priority as any);
    sendMessage(escalationMsg);

    // Show verification modal
    setShowVerification(true);
  }, [messages, sendMessage]);

  const quickActions = [
    {
      id: '1',
      icon: 'wallet-outline' as any,
      label: 'Check Balance',
      prompt: "What's my current balance across all accounts?",
    },
    {
      id: '2',
      icon: 'list-outline' as any,
      label: 'Recent Transactions',
      prompt: 'Show me my recent transactions',
    },
    {
      id: '3',
      icon: 'swap-horizontal-outline' as any,
      label: 'Transfer Money',
      prompt: 'I want to transfer money',
    },
    {
      id: '4',
      icon: 'card-outline' as any,
      label: 'Spending Analysis',
      prompt: 'How much did I spend this month?',
    },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    messagesList: {
      flexGrow: 1,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    contextLoadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 20,
      backgroundColor: colors.brand + '10',
      marginHorizontal: 16,
      marginVertical: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.brand + '20',
    },
    contextLoadingText: {
      marginLeft: 12,
      fontSize: 14,
      color: colors.brand,
      fontWeight: '500',
    },
    escalationContainer: {
      backgroundColor: colors.brand + '10',
      borderLeftWidth: 4,
      borderLeftColor: colors.brand,
      marginHorizontal: 16,
      marginVertical: 12,
      borderRadius: 8,
      padding: 12,
    },
    escalationTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    escalationText: {
      fontSize: 13,
      color: colors.text,
      marginBottom: 12,
      lineHeight: 20,
    },
    escalationButton: {
      backgroundColor: colors.brand,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 6,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
    },
    escalationButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
    },
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      {showQuickActions && messages.length === 0 && (
        <>
          {!contextLoaded && (
            <View style={styles.contextLoadingContainer}>
              <ActivityIndicator size="small" color={colors.brand} />
              <Text style={styles.contextLoadingText}>Loading your financial data...</Text>
            </View>
          )}
          <QuickActions
            actions={quickActions}
            onAction={(action) => handleSend(action.prompt)}
          />
        </>
      )}

      {/* Escalation Offer Banner */}
      {showEscalationOffer && !showVerification && (
        <View style={styles.escalationContainer}>
          <Text style={styles.escalationTitle}>Need More Help?</Text>
          <Text style={styles.escalationText}>
            I notice you may need additional assistance. Would you like to speak with a support agent?
          </Text>
          <TouchableOpacity style={styles.escalationButton} onPress={handleEscalation} disabled={transferring}>
            <MaterialCommunityIcons name="headset" size={18} color="#FFFFFF" />
            <Text style={styles.escalationButtonText}>
              {transferring ? 'Connecting...' : 'Connect with Agent'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={({ item }) => <ChatMessage message={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.messagesList, { paddingTop: isModal ? 12 : 80 }]}
        onContentSizeChange={() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }}
      />

      {isLoading && <TypingIndicator text={currentResponse} />}

      <ChatInput onSend={handleSend} disabled={isLoading || transferring} />

      {/* Verification Modal */}
      <Modal
        visible={showVerification}
        animationType="slide"
        onRequestClose={() => setShowVerification(false)}
      >
        <CustomerVerificationModal
          onVerificationComplete={handleVerificationComplete}
          onCancel={() => setShowVerification(false)}
        />
      </Modal>
    </KeyboardAvoidingView>
  );
}
