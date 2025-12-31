import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function SignupScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Signup Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  text: {
    fontSize: 18,
  },
});
