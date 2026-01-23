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
import { LeaderboardScreen } from '../../features/ai-concierge/screens/LeaderboardScreen';
import { RewardsDonateScreen } from '../../features/ai-concierge/screens/RewardsDonateScreen';
import { RewardsScreen } from '../../features/ai-concierge/screens/RewardsScreen';
import { AnalyticsScreen } from '../../features/home/screens/AnalyticsScreen';
import { HomeScreen } from '../../features/home/screens/HomeScreen';
import { SavingsGoalsScreen } from '../../features/home/screens/SavingsGoalsScreen';
import { SpendingAnalysisScreen } from '../../features/home/screens/SpendingAnalysisScreen';
import { ProfileScreen } from '../../features/profile/screens/ProfileScreen';
import { TransfersScreen } from '../../features/transfers/screens/TransfersScreen';
import { WalletScreen } from '../../features/wallet/screens/WalletScreen';
import { SettingsScreen } from '../../features/settings/screens/SettingsScreen';
import { PreferredMerchantsScreen } from '../../features/merchants/screens/PreferredMerchantsScreen';
import { DealsScreen } from '../../features/merchants/screens/DealsScreen';
// FIS Card Management Screens
import { FISCardsScreen } from '../../features/wallet/screens/FISCardsScreen';
import { FISCardDetailScreen } from '../../features/wallet/screens/FISCardDetailScreen';
import { FISIssueCardScreen } from '../../features/wallet/screens/FISIssueCardScreen';
// Settings Sub-screens
import { ChangePasswordScreen } from '../../features/settings/screens/ChangePasswordScreen';
import { TransactionPinScreen } from '../../features/settings/screens/TransactionPinScreen';
import { TrustedDevicesScreen } from '../../features/settings/screens/TrustedDevicesScreen';
import { TransactionLimitsScreen } from '../../features/settings/screens/TransactionLimitsScreen';
import { HelpCenterScreen } from '../../features/settings/screens/HelpCenterScreen';
import { ContactSupportScreen } from '../../features/settings/screens/ContactSupportScreen';
import { LicensesScreen } from '../../features/settings/screens/LicensesScreen';
import { KYCVerificationScreen } from '../../features/settings/screens/KYCVerificationScreen';

export type MainTabParamList = {
  Home: undefined;
  Cards: undefined;
  Accounts: undefined;
  Transfers: undefined;
  Settings: undefined;
};

export type MainStackParamList = {
  TabNavigator: undefined;
  Rewards: undefined;
  RewardsDonate: undefined;
  Leaderboard: undefined;
  AccountDetail: { accountId: string; accountName: string; accountType: string };
  Budget: undefined;
  BudgetDetail: { budgetId: string };
  Analytics: undefined;
  SavingsGoals: undefined;
  SpendingAnalysis: undefined;
  Profile: undefined;
  Wallet: undefined;
  PreferredMerchants: undefined;
  Deals: undefined;
  // FIS Card Management
  FISCards: undefined;
  FISCardDetail: { cardId: string };
  FISIssueCard: undefined;
  FISCardControls: { cardId: string };
  FISCardTransactions: { cardId: string };
  FISPinManagement: { cardId: string };
  FISDigitalWallet: undefined;
  FISTravelNotice: { cardId: string };
  FISReportFraud: { cardId: string };
  FISReplaceCard: { cardId: string; reason: string };
  // Settings Sub-screens
  ChangePassword: undefined;
  TransactionPin: undefined;
  TrustedDevices: undefined;
  TransactionLimits: undefined;
  HelpCenter: undefined;
  ContactSupport: undefined;
  Licenses: undefined;
  KYCVerification: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<MainStackParamList>();
// Memoized tab screens for performance
const MemoizedHomeScreen = React.memo(HomeScreen);
const MemoizedAccountsScreen = React.memo(AccountsScreen);
const MemoizedTransfersScreen = React.memo(TransfersScreen);
const MemoizedFISCardsScreen = React.memo(FISCardsScreen);
const MemoizedSettingsScreen = React.memo(SettingsScreen);

// Bottom Tab Navigator - memoized to prevent unnecessary re-renders
const TabNavigatorComponent = React.memo(function TabNavigator() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      id="main-tabs"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => (
          <NavigationIcon
            name={route.name.toLowerCase() as 'home' | 'accounts' | 'transfers' | 'cards' | 'settings'}
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
      <Tab.Screen
        name="Cards"
        component={MemoizedFISCardsScreen}
        options={{ title: 'Cards' }}
      />
      <Tab.Screen
        name="Settings"
        component={MemoizedSettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
});
// Main Stack Navigator - memoized
export const MainStack = React.memo(function MainStackComponent() {
  return (
    <Stack.Navigator
      id="main-stack"
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
          <Stack.Screen
            name="Wallet"
            component={WalletScreen}
            options={{ title: 'Wallet', headerShown: true }}
          />
          <Stack.Screen
            name="PreferredMerchants"
            component={PreferredMerchantsScreen}
            options={{ title: 'Preferred Merchants', headerShown: true }}
          />
          <Stack.Screen
            name="Deals"
            component={DealsScreen}
            options={{ title: 'Deals & Offers', headerShown: true }}
          />
          {/* FIS Card Management Screens */}
          <Stack.Screen
            name="FISCards"
            component={FISCardsScreen}
            options={{ title: 'My Cards', headerShown: true }}
          />
          <Stack.Screen
            name="FISCardDetail"
            component={FISCardDetailScreen}
            options={{ title: 'Card Details', headerShown: true }}
          />
          <Stack.Screen
            name="FISIssueCard"
            component={FISIssueCardScreen}
            options={{ title: 'Get New Card', headerShown: true }}
          />
          {/* Settings Sub-screens */}
          <Stack.Screen
            name="ChangePassword"
            component={ChangePasswordScreen}
            options={{ title: 'Change Password', headerShown: true }}
          />
          <Stack.Screen
            name="TransactionPin"
            component={TransactionPinScreen}
            options={{ title: 'Transaction PIN', headerShown: true }}
          />
          <Stack.Screen
            name="TrustedDevices"
            component={TrustedDevicesScreen}
            options={{ title: 'Trusted Devices', headerShown: true }}
          />
          <Stack.Screen
            name="TransactionLimits"
            component={TransactionLimitsScreen}
            options={{ title: 'Transaction Limits', headerShown: true }}
          />
          <Stack.Screen
            name="HelpCenter"
            component={HelpCenterScreen}
            options={{ title: 'Help Center', headerShown: true }}
          />
          <Stack.Screen
            name="ContactSupport"
            component={ContactSupportScreen}
            options={{ title: 'Contact Support', headerShown: true }}
          />
          <Stack.Screen
            name="Licenses"
            component={LicensesScreen}
            options={{ title: 'Licenses', headerShown: true }}
          />
          <Stack.Screen
            name="KYCVerification"
            component={KYCVerificationScreen}
            options={{ title: 'Identity Verification', headerShown: true }}
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
