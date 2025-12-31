import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useAIChat } from '@ai-sdk/hooks/useAIChat';
import { ChatMessage } from '../components/ChatMessage';
import { ChatInput } from '../components/ChatInput';
import { QuickActions } from '../components/QuickActions';
import { TypingIndicator } from '../components/TypingIndicator';

export function ChatScreen() {
  const { messages, isLoading, currentResponse, sendMessage } = useAIChat({
    onError: (error) => {
      console.error('Chat error:', error);
    },
  });

  const flatListRef = useRef<FlatList>(null);
  const [showQuickActions, setShowQuickActions] = useState(true);

  useEffect(() => {
    if (messages.length > 0) {
      setShowQuickActions(false);
    }
  }, [messages]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages, currentResponse]);

  const handleSend = (message: string) => {
    sendMessage(message);
  };

  const quickActions = [
    {
      id: '1',
      icon: 'wallet-outline',
      label: 'Check Balance',
      prompt: "What's my balance?",
    },
    {
      id: '2',
      icon: 'list-outline',
      label: 'Recent Transactions',
      prompt: 'Show my recent transactions',
    },
    {
      id: '3',
      icon: 'swap-horizontal-outline',
      label: 'Transfer Money',
      prompt: 'I want to transfer money',
    },
    {
      id: '4',
      icon: 'card-outline',
      label: 'Pay Bills',
      prompt: 'Help me pay a bill',
    },
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      {showQuickActions && messages.length === 0 && (
        <QuickActions
          actions={quickActions}
          onAction={(action) => handleSend(action.prompt)}
        />
      )}

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={({ item }) => <ChatMessage message={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }}
      />

      {isLoading && <TypingIndicator text={currentResponse} />}

      <ChatInput onSend={handleSend} disabled={isLoading} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  messagesList: {
    padding: 16,
  },
});
