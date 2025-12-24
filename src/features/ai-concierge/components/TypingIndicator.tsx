import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface TypingIndicatorProps {
  text?: string;
}

export function TypingIndicator({ text }: TypingIndicatorProps) {
  const dot1 = new Animated.Value(0);
  const dot2 = new Animated.Value(0);
  const dot3 = new Animated.Value(0);

  useEffect(() => {
    const animate = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(dot1, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot2, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot3, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.parallel([
            Animated.timing(dot1, { toValue: 0, duration: 0, useNativeDriver: true }),
            Animated.timing(dot2, { toValue: 0, duration: 0, useNativeDriver: true }),
            Animated.timing(dot3, { toValue: 0, duration: 0, useNativeDriver: true }),
          ]),
        ])
      ).start();
    };

    animate();
  }, []);

  return (
    <View style={styles.container}>
      {text ? (
        <Text style={styles.text}>{text}</Text>
      ) : (
        <View style={styles.dotsContainer}>
          <Animated.View style={[styles.dot, { opacity: dot1 }]} />
          <Animated.View style={[styles.dot, { opacity: dot2 }]} />
          <Animated.View style={[styles.dot, { opacity: dot3 }]} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginHorizontal: 3,
  },
  text: {
    fontSize: 16,
    color: '#666',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    alignSelf: 'flex-start',
  },
});
