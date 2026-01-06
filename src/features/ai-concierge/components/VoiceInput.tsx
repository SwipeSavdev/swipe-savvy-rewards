import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
// @ts-ignore - Missing module
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscript, disabled }) => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const startRecording = async () => {
    try {
      // Request permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please grant microphone permissions to use voice input.');
        return;
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording:', err);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      // For now, we'll simulate transcription with a placeholder
      // In production, you would send this to a speech-to-text service
      // like Google Cloud Speech-to-Text, Azure Speech, or Whisper API
      simulateTranscription(uri);

      setRecording(null);
    } catch (err) {
      console.error('Failed to stop recording:', err);
      Alert.alert('Error', 'Failed to process recording. Please try again.');
    }
  };

  const simulateTranscription = async (uri: string | null) => {
    // Simulate API call delay
    await new Promise<void>(resolve => setTimeout(resolve, 1000));

    // Mock transcription - in production, replace with actual API call
    const mockTranscripts = [
      'What is my account balance?',
      'Show me my recent transactions',
      'How much did I spend last month?',
      'Transfer money to savings',
      'Pay my electric bill',
    ];

    const randomTranscript = mockTranscripts[Math.floor(Math.random() * mockTranscripts.length)];
    onTranscript(randomTranscript);
  };

  const handlePress = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isRecording && styles.buttonRecording,
        disabled && styles.buttonDisabled,
      ]}
      onPress={handlePress}
      disabled={disabled}
      testID="voice-input-button"
      accessibilityLabel={isRecording ? 'Stop recording' : 'Start voice input'}
      accessibilityRole="button"
    >
      <Ionicons
        name={isRecording ? 'stop-circle' : 'mic'}
        size={24}
        color={isRecording ? '#fff' : '#007AFF'}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  buttonRecording: {
    backgroundColor: '#FF3B30',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
