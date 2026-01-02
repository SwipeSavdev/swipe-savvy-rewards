import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { NavigationIcon } from '../../components/NavigationIcon';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING } from '../../design-system/theme';
import { AccountBalanceDetailScreen } from '../../features/accounts/screens/AccountBalanceDetailScreen';
import { AccountsScreen } from '../../features/accounts/screens/AccountsScreen';
import { BudgetDetailScreen } from '../../features/accounts/screens/BudgetDetailScreen';
import { BudgetScreen } from '../../features/accounts/screens/BudgetScreen';
import { CardsScreen } from '../../features/accounts/screens/CardsScreen';
import { LeaderboardScreen } from '../../features/ai-concierge/screens/LeaderboardScreen';
import { RewardsDonateScreen } from '../../features/ai-concierge/screens/RewardsDonateScreen';
import { RewardsScreen } from '../../features/ai-concierge/screens/RewardsScreen';
import { AnalyticsScreen } from '../../features/home/screens/AnalyticsScreen';
import { HomeScreen } from '../../features/home/screens/HomeScreen';
import { SavingsGoalsScreen } from '../../features/home/screens/SavingsGoalsScreen';
import { SpendingAnalysisScreen } from '../../features/home/screens/SpendingAnalysisScreen';
import { ProfileScreen } from '../../features/profile/screens/ProfileScreen';
import { TransfersScreen } from '../../features/transfers/screens/TransfersScreen';

export type MainTabParamList = {
  Home: undefined;
  Accounts: undefined;
  Transfers: undefined;
};

export type MainStackParamList = {
  TabNavigator: undefined;
  Rewards: undefined;
  RewardsDonate: undefined;
  Leaderboard: undefined;
  Cards: undefined;
  AccountDetail: { accountId: string; accountName: string; accountType: string };
  Budget: undefined;
  BudgetDetail: { budgetId: string };
  Analytics: undefined;
  SavingsGoals: undefined;
  SpendingAnalysis: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<MainStackParamList>();
// Memoized tab screens for performance
const MemoizedHomeScreen = React.memo(HomeScreen);
const MemoizedAccountsScreen = React.memo(AccountsScreen);
const MemoizedTransfersScreen = React.memo(TransfersScreen);

// Bottom Tab Navigator - memoized to prevent unnecessary re-renders
const TabNavigatorComponent = React.memo(function TabNavigator() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => (
          <NavigationIcon
            name={route.name.toLowerCase() as 'home' | 'accounts' | 'transfers'}
            focused={focused}
            color={color}
            size={size}
          />
        ),
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.navGlass,
          borderTopColor: colors.stroke,
          borderTopWidth: 1,
          paddingBottom: SPACING[2],
        },
        headerShown: false,
        tabBarShowLabel: true,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={MemoizedHomeScreen}
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="Accounts" 
        component={MemoizedAccountsScreen}
        options={{ title: 'Accounts' }}
      />
      <Tab.Screen 
        name="Transfers" 
        component={MemoizedTransfersScreen}
        options={{ title: 'Transfers' }}
      />
    </Tab.Navigator>
  );
});
// Main Stack Navigator - memoized
export const MainStack = React.memo(function MainStackComponent() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Group screenOptions={{ headerShown: false }}>
        <Stack.Screen 
          name="TabNavigator" 
          component={TabNavigatorComponent}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Group>
        
        {/* Stack screens - appear with back button */}
        <Stack.Group screenOptions={{ presentation: 'card' }}>
          <Stack.Screen 
            name="Cards" 
            component={CardsScreen}
            options={{ title: 'Saved Cards', headerShown: true }}
          />
          <Stack.Screen 
            name="AccountDetail" 
            component={AccountBalanceDetailScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Leaderboard" 
            component={LeaderboardScreen}
            options={{ title: 'Leaderboard', headerShown: true }}
          />
          <Stack.Screen 
            name="Budget" 
            component={BudgetScreen}
            options={{ title: 'Budgets', headerShown: true }}
          />
          <Stack.Screen 
            name="BudgetDetail" 
            component={BudgetDetailScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Analytics" 
            component={AnalyticsScreen}
            options={{ title: 'Analytics', headerShown: true }}
          />
          <Stack.Screen 
            name="SavingsGoals" 
            component={SavingsGoalsScreen}
            options={{ title: 'Savings Goals', headerShown: true }}
          />
          <Stack.Screen 
            name="SpendingAnalysis" 
            component={SpendingAnalysisScreen}
            options={{ title: 'Spending Analysis', headerShown: true }}
          />
        </Stack.Group>
        
        {/* Modal screens */}
        <Stack.Group screenOptions={{ presentation: 'modal' }}>
          <Stack.Screen 
            name="Rewards" 
            component={RewardsScreen}
            options={{ title: 'Rewards' }}
          />
          <Stack.Screen 
            name="RewardsDonate" 
            component={RewardsDonateScreen}
            options={{ title: 'Donate Points', headerShown: true }}
          />
          <Stack.Screen 
            name="Profile" 
            component={ProfileScreen}
            options={{ title: 'Profile' }}
          />
        </Stack.Group>
      </Stack.Navigator>
    );
});
