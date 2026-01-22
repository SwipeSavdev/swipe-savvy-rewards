import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { StatusBar, View } from 'react-native';
import { FloatingAIButton } from '../../components/FloatingAIButton';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuthStore } from '../../features/auth/stores/authStore';
import { AuthStack } from './AuthStack';
import { MainStack } from './MainStack';

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
      <Stack.Navigator id="root-navigator" screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MemoizedMainStack} />
        ) : (
          <Stack.Screen name="Auth" component={MemoizedAuthStack} />
        )}
      </Stack.Navigator>
      {isAuthenticated && <MemoizedFloatingAIButton />}
    </View>
  );
}

export const RootNavigator = React.memo(RootNavigatorComponent);
