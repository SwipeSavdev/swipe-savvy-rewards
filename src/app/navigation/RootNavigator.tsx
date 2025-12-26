import React, { useMemo } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, StatusBar } from 'react-native';
import { useTheme } from '@contexts/ThemeContext';
import { useAuthStore } from '@features/auth/stores/authStore';
import { AuthStack } from './AuthStack';
import { MainStack } from './MainStack';
import { FloatingAIButton } from '@components/FloatingAIButton';

const Stack = createNativeStackNavigator();

// Memoize stacks to prevent unnecessary re-renders
const MemoizedAuthStack = React.memo(AuthStack);
const MemoizedMainStack = React.memo(MainStack);
const MemoizedFloatingAIButton = React.memo(FloatingAIButton);

function RootNavigatorComponent() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { mode, colors } = useTheme();

  return (
    <View style={{ flex: 1 }}>
      <StatusBar
        barStyle={mode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.statusbar}
      />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {isAuthenticated ? (
            <Stack.Screen name="Main" component={MemoizedMainStack} />
          ) : (
            <Stack.Screen name="Auth" component={MemoizedAuthStack} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
      {isAuthenticated && <MemoizedFloatingAIButton />}
    </View>
  );
}

export const RootNavigator = React.memo(RootNavigatorComponent);
