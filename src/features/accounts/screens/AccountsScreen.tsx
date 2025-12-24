import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function AccountsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Accounts Screen</Text>
      <Text style={styles.subtitle}>View your account balances and details</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
});
