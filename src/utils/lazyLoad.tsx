import React, { Suspense, ComponentType, memo } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

// Memoized loading fallback for better performance
const LoadingFallback = memo(() => (
  <View style={styles.container}>
    <ActivityIndicator size="large" color="#007AFF" />
  </View>
));

LoadingFallback.displayName = 'LoadingFallback';

export function lazyLoad<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
): React.FC<React.ComponentProps<T>> {
  const LazyComponent = React.lazy(importFunc);

  // Memoize the wrapper component to prevent unnecessary re-renders
  return memo((props: React.ComponentProps<T>) => (
    <Suspense fallback={<LoadingFallback />}>
      <LazyComponent {...props} />
    </Suspense>
  )) as any;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
});
