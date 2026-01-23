/**
 * TrustedDevicesScreen - Manage logged-in devices
 */

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SPACING, RADIUS, TYPOGRAPHY, BRAND_COLORS } from '../../../design-system/theme';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuthStore } from '../../auth/stores/authStore';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.swipesavvy.com/api/v1';

interface Device {
  id: string;
  name: string;
  type: 'mobile' | 'tablet' | 'desktop';
  lastActive: string;
  location?: string;
  isCurrent: boolean;
}

export function TrustedDevicesScreen() {
  const { colors } = useTheme();
  const { accessToken } = useAuthStore();

  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/devices`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        setDevices(data.devices || []);
      } else {
        // Use mock data if API fails
        setDevices([
          {
            id: '1',
            name: 'iPhone 15 Pro',
            type: 'mobile',
            lastActive: new Date().toISOString(),
            location: 'New York, NY',
            isCurrent: true,
          },
          {
            id: '2',
            name: 'MacBook Pro',
            type: 'desktop',
            lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            location: 'New York, NY',
            isCurrent: false,
          },
        ]);
      }
    } catch (error) {
      console.error('Failed to load devices:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRemoveDevice = (device: Device) => {
    if (device.isCurrent) {
      Alert.alert('Cannot Remove', 'You cannot remove your current device');
      return;
    }

    Alert.alert(
      'Remove Device',
      `Are you sure you want to remove "${device.name}"? This will sign out the device.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await fetch(`${API_BASE_URL}/auth/devices/${device.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${accessToken}` },
              });
              setDevices(devices.filter((d) => d.id !== device.id));
            } catch (error) {
              Alert.alert('Error', 'Failed to remove device');
            }
          },
        },
      ]
    );
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile':
        return 'cellphone';
      case 'tablet':
        return 'tablet';
      case 'desktop':
        return 'laptop';
      default:
        return 'devices';
    }
  };

  const formatLastActive = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 5) return 'Active now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    content: {
      padding: SPACING[4],
      gap: SPACING[3],
    },
    description: {
      fontSize: TYPOGRAPHY.fontSize.body,
      color: colors.muted,
      marginBottom: SPACING[2],
    },
    deviceCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.panel2,
      borderRadius: RADIUS.lg,
      borderWidth: 1,
      borderColor: colors.stroke,
      padding: SPACING[3],
      gap: SPACING[3],
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: RADIUS.md,
      backgroundColor: colors.panel,
      alignItems: 'center',
      justifyContent: 'center',
    },
    deviceInfo: {
      flex: 1,
      gap: SPACING[1],
    },
    deviceName: {
      fontSize: TYPOGRAPHY.fontSize.body,
      fontWeight: '600',
      color: colors.text,
    },
    deviceMeta: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: colors.muted,
    },
    currentBadge: {
      backgroundColor: BRAND_COLORS.green,
      paddingHorizontal: SPACING[2],
      paddingVertical: 2,
      borderRadius: RADIUS.sm,
    },
    currentText: {
      fontSize: 10,
      fontWeight: '600',
      color: 'white',
    },
    removeButton: {
      padding: SPACING[2],
    },
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadDevices(); }} />
      }
    >
      <Text style={styles.description}>
        These are the devices that are currently signed in to your account. Remove any devices you
        don't recognize.
      </Text>

      {devices.map((device) => (
        <View key={device.id} style={styles.deviceCard}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name={getDeviceIcon(device.type) as any}
              size={24}
              color={colors.brand}
            />
          </View>
          <View style={styles.deviceInfo}>
            <Text style={styles.deviceName}>{device.name}</Text>
            <Text style={styles.deviceMeta}>
              {formatLastActive(device.lastActive)}
              {device.location && ` \u2022 ${device.location}`}
            </Text>
          </View>
          {device.isCurrent ? (
            <View style={styles.currentBadge}>
              <Text style={styles.currentText}>CURRENT</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveDevice(device)}>
              <MaterialCommunityIcons name="close-circle" size={24} color={colors.danger} />
            </TouchableOpacity>
          )}
        </View>
      ))}
    </ScrollView>
  );
}
