import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { HomeScreen } from '@features/home/screens/HomeScreen';
import { AccountsScreen } from '@features/accounts/screens/AccountsScreen';
import { TransfersScreen } from '@features/transfers/screens/TransfersScreen';
import { ChatScreen } from '@features/ai-concierge/screens/ChatScreen';

export type MainTabParamList = {
  Home: undefined;
  Accounts: undefined;
  Transfers: undefined;
  AIConcierge: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainStack() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Accounts') {
            iconName = focused ? 'wallet' : 'wallet-outline';
          } else if (route.name === 'Transfers') {
            iconName = focused ? 'swap-horizontal' : 'swap-horizontal-outline';
          } else if (route.name === 'AIConcierge') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Accounts" component={AccountsScreen} />
      <Tab.Screen name="Transfers" component={TransfersScreen} />
      <Tab.Screen 
        name="AIConcierge" 
        component={ChatScreen}
        options={{ title: 'AI Assistant' }}
      />
    </Tab.Navigator>
  );
}
