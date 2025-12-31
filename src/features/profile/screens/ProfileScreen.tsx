import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  FlatList,
  ListRenderItem,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LIGHT_THEME, SPACING, RADIUS, TYPOGRAPHY, BRAND_COLORS } from '../../../design-system/theme';
import { useTheme } from '../../../contexts/ThemeContext';
import { Card, Button, Badge, IconBox, Avatar } from '../../../design-system/components/CoreComponents';
import { useAuthStore } from '../../auth/stores/authStore';
import { dataService } from '../../../services/DataService';

interface MenuItem {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  action?: () => void;
}

const PREFERENCES_MENU: MenuItem[] = [
  {
    id: '1',
    title: 'Security',
    subtitle: 'PIN, biometrics, trusted devices',
    icon: 'shield',
  },
  {
    id: '2',
    title: 'Support',
    subtitle: 'Help center & contact',
    icon: 'help-circle',
  },
];

export function ProfileScreen() {
  const navigation = useNavigation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { colors, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load preferences on mount
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const prefs = await dataService.getPreferences();
      setNotifications(prefs.notificationsEnabled);
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  const updateDarkMode = async (value: boolean) => {
    toggleTheme();
    // Save to backend
    try {
      setSaving(true);
      await dataService.updatePreferences({
        darkMode: value,
        notificationsEnabled: notifications,
      });
    } catch (error) {
      console.error('Failed to save dark mode preference:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateNotifications = async (value: boolean) => {
    setNotifications(value);
    // Save to backend
    try {
      setSaving(true);
      await dataService.updatePreferences({
        darkMode: false,
        notificationsEnabled: value,
      });
    } catch (error) {
      console.error('Failed to save notification preference:', error);
    } finally {
      setSaving(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    contentContainer: {
      paddingVertical: SPACING[4],
      paddingHorizontal: SPACING[4],
      gap: SPACING[4],
    },
    profileHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: SPACING[3],
    },
    profileInfo: {
      flex: 1,
      gap: SPACING[1],
    },
    profileName: {
      fontSize: TYPOGRAPHY.fontSize.h2,
      fontWeight: '800',
      color: colors.text,
      letterSpacing: -0.01,
    },
    profileStatus: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: colors.muted,
    },
    tier: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: colors.text,
      fontWeight: '600',
      marginTop: SPACING[1],
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
    settingsLabel: {
      fontSize: TYPOGRAPHY.fontSize.body,
      fontWeight: '600',
      color: colors.text,
    },
    settingsSubtitle: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: colors.muted,
      marginTop: SPACING[1],
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
    sectionTitle: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: colors.muted,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginTop: SPACING[2],
      marginBottom: SPACING[2],
    },
    logoutButton: {
      backgroundColor: 'rgba(214, 69, 69, 0.08)',
      borderWidth: 1,
      borderColor: colors.danger,
    },
    logoutButtonText: {
      color: colors.danger,
      fontWeight: '700',
      textAlign: 'center',
    },
  });

  const renderMenuItem: ListRenderItem<MenuItem> = ({ item }) => (
    <TouchableOpacity style={styles.menuItem} onPress={item.action}>
      <IconBox icon={<MaterialCommunityIcons name={item.icon as any} size={20} />} />
      <View style={styles.menuInfo}>
        <Text style={styles.menuTitle}>{item.title}</Text>
        <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} style={styles.arrow} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <Card padding={SPACING[4]}>
          <View style={styles.profileHeader}>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.name || 'User'}</Text>
              <Text style={styles.profileStatus}>KYC: Tier 2 • Approved</Text>
              <Text style={styles.tier}>Silver Tier</Text>
            </View>
            <Avatar initials={user?.name?.substring(0, 2).toUpperCase() || 'US'} />
          </View>

          <View style={{ marginTop: SPACING[2], flexDirection: 'row', gap: SPACING[2] }}>
            <Badge label="Security: Biometrics" />
            <Badge label="Privacy: Masked" />
          </View>
        </Card>

        {/* Preferences Section */}
        <Text style={styles.sectionTitle}>Preferences</Text>

        {/* Theme Setting */}
        <View style={styles.settingsRow}>
          <View>
            <Text style={styles.settingsLabel}>Dark Mode</Text>
            <Text style={styles.settingsSubtitle}>Follow system (recommended)</Text>
          </View>
          <Switch
            value={false}
            onValueChange={updateDarkMode}
            trackColor={{ false: colors.stroke, true: BRAND_COLORS.green }}
            thumbColor={false ? 'white' : colors.panel}
            disabled={saving}
          />
        </View>

        {/* Notifications */}
        <View style={styles.settingsRow}>
          <View>
            <Text style={styles.settingsLabel}>Notifications</Text>
            <Text style={styles.settingsSubtitle}>Transfers, security, rewards</Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={updateNotifications}
            trackColor={{ false: colors.stroke, true: BRAND_COLORS.green }}
            thumbColor={notifications ? 'white' : colors.panel}
            disabled={saving}
          />
        </View>

        {/* Account Section */}
        <Text style={styles.sectionTitle}>Account</Text>

        <FlatList
          data={PREFERENCES_MENU}
          renderItem={renderMenuItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />

        {/* Logout */}
        <Button
          onPress={logout}
          variant="secondary"
          style={[styles.logoutButton, { width: '100%', marginTop: SPACING[2] }]}
        >
          Log out
        </Button>
      </ScrollView>
    </View>
  );
}
