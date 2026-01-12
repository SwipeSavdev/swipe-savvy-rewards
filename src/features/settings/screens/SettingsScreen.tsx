/**
 * SettingsScreen - App settings and preferences management
 */

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SPACING, RADIUS, TYPOGRAPHY, BRAND_COLORS } from '../../../design-system/theme';
import { useTheme } from '../../../contexts/ThemeContext';
import { Card, Button, Badge, IconBox } from '../../../design-system/components/CoreComponents';
import { useAuthStore } from '../../auth/stores/authStore';
import { dataService } from '../../../services/DataService';

interface SettingMenuItem {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  iconVariant?: 'default' | 'green' | 'yellow' | 'deep';
  action?: () => void;
  showArrow?: boolean;
  badge?: string;
}

interface SettingToggle {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

export function SettingsScreen() {
  const navigation = useNavigation<any>();
  const { colors, mode, toggleTheme } = useTheme();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  // Settings state
  const [notifications, setNotifications] = useState(true);
  const [biometrics, setBiometrics] = useState(false);
  const [transactionAlerts, setTransactionAlerts] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const prefs = await dataService.getPreferences();
      setNotifications(prefs.notificationsEnabled);
      setBiometrics(prefs.biometricsEnabled || false);
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  const savePreference = async (key: string, value: boolean) => {
    try {
      setSaving(true);
      await dataService.updatePreferences({
        darkMode: mode === 'dark',
        notificationsEnabled: key === 'notifications' ? value : notifications,
        biometricsEnabled: key === 'biometrics' ? value : biometrics,
      });
    } catch (error) {
      console.error('Failed to save preference:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => {
            logout();
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement account deletion
            Alert.alert('Contact Support', 'Please contact support to delete your account.');
          },
        },
      ]
    );
  };

  const SECURITY_MENU: SettingMenuItem[] = [
    {
      id: 'password',
      title: 'Change Password',
      subtitle: 'Update your account password',
      icon: 'lock-reset',
      showArrow: true,
      action: () => navigation.navigate('ChangePassword'),
    },
    {
      id: 'pin',
      title: 'Transaction PIN',
      subtitle: 'Manage your 4-digit PIN',
      icon: 'numeric',
      showArrow: true,
      action: () => navigation.navigate('TransactionPin'),
    },
    {
      id: 'devices',
      title: 'Trusted Devices',
      subtitle: 'Manage logged-in devices',
      icon: 'cellphone-link',
      showArrow: true,
      badge: '2',
      action: () => navigation.navigate('TrustedDevices'),
    },
  ];

  const ACCOUNT_MENU: SettingMenuItem[] = [
    {
      id: 'personal',
      title: 'Personal Information',
      subtitle: 'Name, email, phone',
      icon: 'account-edit',
      showArrow: true,
      action: () => navigation.navigate('Profile'),
    },
    {
      id: 'kyc',
      title: 'Identity Verification',
      subtitle: user?.kyc_status === 'approved' ? 'Verified' : 'Complete verification',
      icon: 'shield-check',
      iconVariant: 'green',
      showArrow: true,
      badge: user?.kyc_status === 'approved' ? undefined : 'Action Required',
      action: () => navigation.navigate('KYCVerification'),
    },
    {
      id: 'limits',
      title: 'Transaction Limits',
      subtitle: 'View your daily and monthly limits',
      icon: 'speedometer',
      showArrow: true,
      action: () => navigation.navigate('TransactionLimits'),
    },
  ];

  const SUPPORT_MENU: SettingMenuItem[] = [
    {
      id: 'help',
      title: 'Help Center',
      subtitle: 'FAQs and guides',
      icon: 'help-circle',
      showArrow: true,
      action: () => navigation.navigate('HelpCenter'),
    },
    {
      id: 'contact',
      title: 'Contact Support',
      subtitle: 'Chat with our team',
      icon: 'message-text',
      showArrow: true,
      action: () => navigation.navigate('ContactSupport'),
    },
    {
      id: 'feedback',
      title: 'Send Feedback',
      subtitle: 'Help us improve',
      icon: 'comment-quote',
      showArrow: true,
      action: () => Linking.openURL('mailto:feedback@swipesavvy.com'),
    },
  ];

  const LEGAL_MENU: SettingMenuItem[] = [
    {
      id: 'privacy',
      title: 'Privacy Policy',
      subtitle: 'How we handle your data',
      icon: 'shield-lock',
      showArrow: true,
      action: () => Linking.openURL('https://swipesavvy.com/privacy'),
    },
    {
      id: 'terms',
      title: 'Terms of Service',
      subtitle: 'User agreement',
      icon: 'file-document',
      showArrow: true,
      action: () => Linking.openURL('https://swipesavvy.com/terms'),
    },
    {
      id: 'licenses',
      title: 'Open Source Licenses',
      subtitle: 'Third-party libraries',
      icon: 'code-tags',
      showArrow: true,
      action: () => navigation.navigate('Licenses'),
    },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    contentContainer: {
      paddingVertical: SPACING[4],
      paddingHorizontal: SPACING[4],
      gap: SPACING[4],
      paddingBottom: SPACING[10],
    },
    sectionTitle: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: colors.muted,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: SPACING[2],
    },
    settingsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: SPACING[3],
      paddingHorizontal: SPACING[3],
      backgroundColor: colors.panel2,
      borderRadius: RADIUS.lg,
      borderWidth: 1,
      borderColor: colors.stroke,
      marginBottom: SPACING[2],
    },
    settingsInfo: {
      flex: 1,
      gap: SPACING[1],
    },
    settingsLabel: {
      fontSize: TYPOGRAPHY.fontSize.body,
      fontWeight: '600',
      color: colors.text,
    },
    settingsSubtitle: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: colors.muted,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: SPACING[3],
      paddingHorizontal: SPACING[3],
      backgroundColor: colors.panel2,
      borderRadius: RADIUS.lg,
      borderWidth: 1,
      borderColor: colors.stroke,
      marginBottom: SPACING[2],
      gap: SPACING[3],
    },
    menuInfo: {
      flex: 1,
      gap: SPACING[1],
    },
    menuTitle: {
      fontSize: TYPOGRAPHY.fontSize.body,
      fontWeight: '600',
      color: colors.text,
    },
    menuSubtitle: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: colors.muted,
    },
    arrow: {
      color: colors.muted,
    },
    versionContainer: {
      alignItems: 'center',
      paddingVertical: SPACING[4],
      gap: SPACING[1],
    },
    versionText: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: colors.muted,
    },
    logoutButton: {
      backgroundColor: 'rgba(214, 69, 69, 0.08)',
      borderWidth: 1,
      borderColor: colors.danger,
      paddingVertical: SPACING[3],
    },
    deleteButton: {
      backgroundColor: 'transparent',
      paddingVertical: SPACING[2],
    },
    deleteText: {
      color: colors.danger,
      fontSize: TYPOGRAPHY.fontSize.meta,
      fontWeight: '600',
    },
  });

  const renderMenuItem = (item: SettingMenuItem) => (
    <TouchableOpacity key={item.id} style={styles.menuItem} onPress={item.action}>
      <IconBox
        icon={<MaterialCommunityIcons name={item.icon as any} size={20} color={colors.brand} />}
        variant={item.iconVariant}
      />
      <View style={styles.menuInfo}>
        <Text style={styles.menuTitle}>{item.title}</Text>
        <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
      </View>
      {item.badge && (
        <Badge
          label={item.badge}
          variant={item.badge === 'Action Required' ? 'warning' : 'default'}
        />
      )}
      {item.showArrow && (
        <MaterialCommunityIcons name="chevron-right" size={20} style={styles.arrow} />
      )}
    </TouchableOpacity>
  );

  const renderToggle = (toggle: SettingToggle) => (
    <View key={toggle.id} style={styles.settingsRow}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING[3], flex: 1 }}>
        <IconBox
          icon={<MaterialCommunityIcons name={toggle.icon as any} size={20} color={colors.brand} />}
        />
        <View style={styles.settingsInfo}>
          <Text style={styles.settingsLabel}>{toggle.title}</Text>
          <Text style={styles.settingsSubtitle}>{toggle.subtitle}</Text>
        </View>
      </View>
      <Switch
        value={toggle.value}
        onValueChange={toggle.onChange}
        trackColor={{ false: colors.stroke, true: BRAND_COLORS.green }}
        thumbColor={toggle.value ? 'white' : colors.panel}
        disabled={saving}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Preferences */}
        <View>
          <Text style={styles.sectionTitle}>Preferences</Text>

          {renderToggle({
            id: 'darkMode',
            title: 'Dark Mode',
            subtitle: mode === 'dark' ? 'On' : 'Off',
            icon: 'theme-light-dark',
            value: mode === 'dark',
            onChange: () => toggleTheme(),
          })}

          {renderToggle({
            id: 'notifications',
            title: 'Push Notifications',
            subtitle: 'Transfers, security alerts, rewards',
            icon: 'bell',
            value: notifications,
            onChange: (value) => {
              setNotifications(value);
              savePreference('notifications', value);
            },
          })}

          {renderToggle({
            id: 'biometrics',
            title: 'Biometric Login',
            subtitle: 'Use Face ID or fingerprint',
            icon: 'fingerprint',
            value: biometrics,
            onChange: (value) => {
              setBiometrics(value);
              savePreference('biometrics', value);
            },
          })}

          {renderToggle({
            id: 'transactionAlerts',
            title: 'Transaction Alerts',
            subtitle: 'Real-time spending notifications',
            icon: 'cash-check',
            value: transactionAlerts,
            onChange: setTransactionAlerts,
          })}
        </View>

        {/* Security */}
        <View>
          <Text style={styles.sectionTitle}>Security</Text>
          {SECURITY_MENU.map(renderMenuItem)}
        </View>

        {/* Account */}
        <View>
          <Text style={styles.sectionTitle}>Account</Text>
          {ACCOUNT_MENU.map(renderMenuItem)}
        </View>

        {/* Support */}
        <View>
          <Text style={styles.sectionTitle}>Support</Text>
          {SUPPORT_MENU.map(renderMenuItem)}
        </View>

        {/* Legal */}
        <View>
          <Text style={styles.sectionTitle}>Legal</Text>
          {LEGAL_MENU.map(renderMenuItem)}
        </View>

        {/* Logout */}
        <Button onPress={handleLogout} variant="secondary" style={styles.logoutButton}>
          Log Out
        </Button>

        {/* Delete Account */}
        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
          <Text style={styles.deleteText}>Delete Account</Text>
        </TouchableOpacity>

        {/* Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>SwipeSavvy v1.0.0</Text>
          <Text style={styles.versionText}>Build 2026.01.09</Text>
        </View>
      </ScrollView>
    </View>
  );
}
