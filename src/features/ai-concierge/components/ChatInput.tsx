import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        testID="chat-input"
        accessibilityLabel="Message input field"
        style={styles.input}
        placeholder="Ask me anything..."
        value={message}
        onChangeText={setMessage}
        onSubmitEditing={handleSend}
        editable={!disabled}
        multiline
        maxLength={500}
      />
      <TouchableOpacity
        testID="send-button"
        accessibilityLabel="Send message"
        accessibilityRole="button"
        style={[styles.sendButton, (!message.trim() || disabled) && styles.sendButtonDisabled]}
        onPress={handleSend}
        disabled={!message.trim() || disabled}
      >
        <Ionicons
          name="send"
          size={24}
          color={!message.trim() || disabled ? '#999' : '#007AFF'}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    fontSize: 16,
    marginRight: 8,
  },
  sendButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
