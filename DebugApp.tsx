import React from 'react';
import { View, Text } from 'react-native';

export default function DebugApp() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' }}>
        SwipeSavvy Debug Mode
      </Text>
      <Text style={{ fontSize: 16, textAlign: 'center', color: '#666', paddingHorizontal: 20 }}>
        The app is initializing...
      </Text>
      <Text style={{ fontSize: 12, marginTop: 30, color: '#999' }}>
        If you see this screen, the Expo connection is working!
      </Text>
    </View>
  );
}
