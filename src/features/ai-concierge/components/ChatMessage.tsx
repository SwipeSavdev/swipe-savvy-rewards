import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Message } from '@ai-sdk/hooks/useAIChat';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isError = message.error;

  return (
    <View style={[
      styles.container,
      isUser ? styles.userMessage : styles.assistantMessage,
      isError && styles.errorMessage,
    ]}>
      <Text style={[
        styles.text,
        isUser && styles.userText,
      ]}>
        {message.content}
      </Text>
      {isError && (
        <Text style={styles.errorText}>Failed to send</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    marginVertical: 4,
    borderRadius: 16,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  errorMessage: {
    backgroundColor: '#FFE5E5',
    borderColor: '#FF0000',
  },
  text: {
    fontSize: 16,
    color: '#000000',
  },
  userText: {
    color: '#FFFFFF',
  },
  errorText: {
    fontSize: 12,
    color: '#FF0000',
    marginTop: 4,
  },
});
