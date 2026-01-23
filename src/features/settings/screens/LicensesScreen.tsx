/**
 * LicensesScreen - Third-party licenses and acknowledgments
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../../design-system/theme';
import { useTheme } from '../../../contexts/ThemeContext';

interface License {
  name: string;
  version: string;
  license: string;
  repository?: string;
}

const LICENSES: License[] = [
  { name: 'React Native', version: '0.74.x', license: 'MIT', repository: 'https://github.com/facebook/react-native' },
  { name: 'Expo', version: '51.x', license: 'MIT', repository: 'https://github.com/expo/expo' },
  { name: '@react-navigation/native', version: '6.x', license: 'MIT', repository: 'https://github.com/react-navigation/react-navigation' },
  { name: '@expo/vector-icons', version: '14.x', license: 'MIT', repository: 'https://github.com/expo/vector-icons' },
  { name: 'zustand', version: '4.x', license: 'MIT', repository: 'https://github.com/pmndrs/zustand' },
  { name: 'react-native-reanimated', version: '3.x', license: 'MIT', repository: 'https://github.com/software-mansion/react-native-reanimated' },
  { name: 'react-native-gesture-handler', version: '2.x', license: 'MIT', repository: 'https://github.com/software-mansion/react-native-gesture-handler' },
  { name: 'expo-secure-store', version: '13.x', license: 'MIT', repository: 'https://github.com/expo/expo' },
  { name: 'expo-local-authentication', version: '14.x', license: 'MIT', repository: 'https://github.com/expo/expo' },
  { name: 'expo-notifications', version: '0.28.x', license: 'MIT', repository: 'https://github.com/expo/expo' },
  { name: '@react-native-async-storage/async-storage', version: '1.x', license: 'MIT', repository: 'https://github.com/react-native-async-storage/async-storage' },
  { name: 'date-fns', version: '3.x', license: 'MIT', repository: 'https://github.com/date-fns/date-fns' },
  { name: 'react-native-svg', version: '15.x', license: 'MIT', repository: 'https://github.com/react-native-svg/react-native-svg' },
  { name: 'lottie-react-native', version: '6.x', license: 'Apache-2.0', repository: 'https://github.com/lottie-react-native/lottie-react-native' },
];

export function LicensesScreen() {
  const { colors } = useTheme();
  const [expandedLicense, setExpandedLicense] = useState<string | null>(null);

  const handleOpenRepo = (url?: string) => {
    if (url) {
      Linking.openURL(url);
    }
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
    header: {
      gap: SPACING[2],
      marginBottom: SPACING[2],
    },
    title: {
      fontSize: TYPOGRAPHY.fontSize.h3,
      fontWeight: '700',
      color: colors.text,
    },
    description: {
      fontSize: TYPOGRAPHY.fontSize.body,
      color: colors.muted,
      lineHeight: 22,
    },
    licenseCard: {
      backgroundColor: colors.panel2,
      borderRadius: RADIUS.lg,
      borderWidth: 1,
      borderColor: colors.stroke,
      overflow: 'hidden',
    },
    licenseHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: SPACING[3],
    },
    licenseInfo: {
      flex: 1,
      gap: 2,
    },
    licenseName: {
      fontSize: TYPOGRAPHY.fontSize.body,
      fontWeight: '600',
      color: colors.text,
    },
    licenseMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING[2],
    },
    licenseVersion: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: colors.muted,
    },
    licenseBadge: {
      backgroundColor: colors.panel,
      paddingHorizontal: SPACING[2],
      paddingVertical: 2,
      borderRadius: RADIUS.sm,
    },
    licenseBadgeText: {
      fontSize: 10,
      fontWeight: '600',
      color: colors.muted,
    },
    licenseExpanded: {
      padding: SPACING[3],
      paddingTop: 0,
      gap: SPACING[2],
    },
    repoButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING[1],
    },
    repoText: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: colors.brand,
    },
    footer: {
      marginTop: SPACING[4],
      padding: SPACING[4],
      backgroundColor: colors.panel2,
      borderRadius: RADIUS.lg,
      alignItems: 'center',
      gap: SPACING[2],
    },
    footerText: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: colors.muted,
      textAlign: 'center',
    },
    footerLink: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: colors.brand,
      fontWeight: '600',
    },
  });

  const getMITLicenseText = () => `MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.`;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Open Source Licenses</Text>
        <Text style={styles.description}>
          SwipeSavvy is built with the help of these amazing open source projects. We're grateful to
          the developers and communities behind these libraries.
        </Text>
      </View>

      {LICENSES.map((license) => (
        <TouchableOpacity
          key={license.name}
          style={styles.licenseCard}
          onPress={() => setExpandedLicense(expandedLicense === license.name ? null : license.name)}
          activeOpacity={0.7}
        >
          <View style={styles.licenseHeader}>
            <View style={styles.licenseInfo}>
              <Text style={styles.licenseName}>{license.name}</Text>
              <View style={styles.licenseMeta}>
                <Text style={styles.licenseVersion}>v{license.version}</Text>
                <View style={styles.licenseBadge}>
                  <Text style={styles.licenseBadgeText}>{license.license}</Text>
                </View>
              </View>
            </View>
            <MaterialCommunityIcons
              name={expandedLicense === license.name ? 'chevron-up' : 'chevron-down'}
              size={24}
              color={colors.muted}
            />
          </View>

          {expandedLicense === license.name && (
            <View style={styles.licenseExpanded}>
              {license.repository && (
                <TouchableOpacity
                  style={styles.repoButton}
                  onPress={() => handleOpenRepo(license.repository)}
                >
                  <MaterialCommunityIcons name="github" size={16} color={colors.brand} />
                  <Text style={styles.repoText}>View on GitHub</Text>
                  <MaterialCommunityIcons name="open-in-new" size={14} color={colors.brand} />
                </TouchableOpacity>
              )}
              <Text style={[styles.licenseVersion, { lineHeight: 18 }]}>
                {license.license === 'MIT' ? getMITLicenseText().substring(0, 200) + '...' : `Licensed under ${license.license}`}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      ))}

      <View style={styles.footer}>
        <MaterialCommunityIcons name="heart" size={24} color={colors.danger} />
        <Text style={styles.footerText}>
          Built with love using React Native and Expo
        </Text>
        <TouchableOpacity onPress={() => Linking.openURL('https://swipesavvy.com')}>
          <Text style={styles.footerLink}>swipesavvy.com</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
