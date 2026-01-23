/**
 * KYCVerificationScreen - Identity verification flow
 */

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SPACING, RADIUS, TYPOGRAPHY, BRAND_COLORS } from '../../../design-system/theme';
import { useTheme } from '../../../contexts/ThemeContext';
import { Button } from '../../../design-system/components/CoreComponents';
import { useAuthStore } from '../../auth/stores/authStore';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.swipesavvy.com/api/v1';

interface VerificationStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
}

export function KYCVerificationScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { accessToken, user } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [kycStatus, setKycStatus] = useState(user?.kycStatus || 'pending');

  const [steps, setSteps] = useState<VerificationStep[]>([
    {
      id: 'personal',
      title: 'Personal Information',
      description: 'Verify your name, date of birth, and address',
      icon: 'account-outline',
      status: 'completed',
    },
    {
      id: 'document',
      title: 'Government ID',
      description: 'Upload a valid government-issued ID',
      icon: 'card-account-details-outline',
      status: kycStatus === 'approved' ? 'completed' : 'pending',
    },
    {
      id: 'selfie',
      title: 'Selfie Verification',
      description: 'Take a photo to match your ID',
      icon: 'camera-account',
      status: kycStatus === 'approved' ? 'completed' : 'pending',
    },
    {
      id: 'address',
      title: 'Proof of Address',
      description: 'Upload a utility bill or bank statement',
      icon: 'home-outline',
      status: kycStatus === 'approved' ? 'completed' : 'pending',
    },
  ]);

  useEffect(() => {
    loadKYCStatus();
  }, []);

  const loadKYCStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/kyc/status`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        setKycStatus(data.status);
        if (data.steps) {
          setSteps(data.steps);
        }
      }
    } catch (error) {
      console.error('Failed to load KYC status:', error);
    }
  };

  const handleStartVerification = async (stepId: string) => {
    // In a real app, this would open document capture or camera
    Alert.alert(
      'Document Upload',
      'This would open the document capture camera or file picker.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Simulate Upload',
          onPress: async () => {
            setLoading(true);
            // Simulate upload
            await new Promise((resolve) => setTimeout(resolve, 2000));

            setSteps((prev) =>
              prev.map((step) =>
                step.id === stepId ? { ...step, status: 'completed' } : step
              )
            );
            setLoading(false);

            // Check if all steps are complete
            const allComplete = steps.every(
              (s) => s.id === stepId || s.status === 'completed'
            );
            if (allComplete) {
              Alert.alert(
                'Verification Submitted',
                'Your documents have been submitted for review. This typically takes 1-2 business days.'
              );
            }
          },
        },
      ]
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return { name: 'check-circle', color: BRAND_COLORS.green };
      case 'in_progress':
        return { name: 'progress-clock', color: BRAND_COLORS.orange };
      case 'failed':
        return { name: 'alert-circle', color: colors.danger };
      default:
        return { name: 'circle-outline', color: colors.muted };
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    content: {
      padding: SPACING[4],
      gap: SPACING[4],
    },
    statusCard: {
      backgroundColor: colors.panel2,
      borderRadius: RADIUS.lg,
      borderWidth: 1,
      borderColor: colors.stroke,
      padding: SPACING[4],
      alignItems: 'center',
      gap: SPACING[3],
    },
    statusIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    statusTitle: {
      fontSize: TYPOGRAPHY.fontSize.h3,
      fontWeight: '700',
      color: colors.text,
    },
    statusText: {
      fontSize: TYPOGRAPHY.fontSize.body,
      color: colors.muted,
      textAlign: 'center',
      lineHeight: 22,
    },
    stepsSection: {
      gap: SPACING[3],
    },
    sectionTitle: {
      fontSize: TYPOGRAPHY.fontSize.body,
      fontWeight: '600',
      color: colors.text,
    },
    stepCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.panel2,
      borderRadius: RADIUS.lg,
      borderWidth: 1,
      borderColor: colors.stroke,
      padding: SPACING[3],
      gap: SPACING[3],
    },
    stepIconContainer: {
      width: 44,
      height: 44,
      borderRadius: RADIUS.md,
      backgroundColor: colors.panel,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepInfo: {
      flex: 1,
      gap: SPACING[1],
    },
    stepTitle: {
      fontSize: TYPOGRAPHY.fontSize.body,
      fontWeight: '600',
      color: colors.text,
    },
    stepDescription: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: colors.muted,
    },
    actionButton: {
      paddingHorizontal: SPACING[3],
      paddingVertical: SPACING[2],
      backgroundColor: colors.brand,
      borderRadius: RADIUS.md,
    },
    actionButtonText: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      fontWeight: '600',
      color: 'white',
    },
    benefits: {
      backgroundColor: colors.panel2,
      borderRadius: RADIUS.lg,
      padding: SPACING[4],
      gap: SPACING[3],
    },
    benefitItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING[3],
    },
    benefitText: {
      fontSize: TYPOGRAPHY.fontSize.body,
      color: colors.text,
    },
  });

  const isVerified = kycStatus === 'approved';
  const isPending = kycStatus === 'in_review';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.statusCard}>
        <View
          style={[
            styles.statusIcon,
            {
              backgroundColor: isVerified
                ? `${BRAND_COLORS.green}20`
                : isPending
                ? `${BRAND_COLORS.orange}20`
                : `${colors.brand}20`,
            },
          ]}
        >
          <MaterialCommunityIcons
            name={isVerified ? 'shield-check' : isPending ? 'clock-outline' : 'shield-alert-outline'}
            size={32}
            color={isVerified ? BRAND_COLORS.green : isPending ? BRAND_COLORS.orange : colors.brand}
          />
        </View>
        <Text style={styles.statusTitle}>
          {isVerified ? 'Verified' : isPending ? 'Under Review' : 'Verification Required'}
        </Text>
        <Text style={styles.statusText}>
          {isVerified
            ? 'Your identity has been verified. You have full access to all features.'
            : isPending
            ? 'Your documents are being reviewed. This typically takes 1-2 business days.'
            : 'Complete identity verification to unlock higher limits and additional features.'}
        </Text>
      </View>

      {!isVerified && (
        <View style={styles.stepsSection}>
          <Text style={styles.sectionTitle}>Verification Steps</Text>

          {steps.map((step) => {
            const statusIcon = getStatusIcon(step.status);
            return (
              <View key={step.id} style={styles.stepCard}>
                <View style={styles.stepIconContainer}>
                  <MaterialCommunityIcons
                    name={step.icon as any}
                    size={24}
                    color={colors.brand}
                  />
                </View>
                <View style={styles.stepInfo}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepDescription}>{step.description}</Text>
                </View>
                {step.status === 'completed' ? (
                  <MaterialCommunityIcons
                    name={statusIcon.name as any}
                    size={24}
                    color={statusIcon.color}
                  />
                ) : (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleStartVerification(step.id)}
                    disabled={loading}
                  >
                    <Text style={styles.actionButtonText}>
                      {step.status === 'failed' ? 'Retry' : 'Start'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>
      )}

      <View style={styles.benefits}>
        <Text style={styles.sectionTitle}>Benefits of Verification</Text>
        <View style={styles.benefitItem}>
          <MaterialCommunityIcons name="check-circle" size={20} color={BRAND_COLORS.green} />
          <Text style={styles.benefitText}>Higher transaction limits</Text>
        </View>
        <View style={styles.benefitItem}>
          <MaterialCommunityIcons name="check-circle" size={20} color={BRAND_COLORS.green} />
          <Text style={styles.benefitText}>Send money internationally</Text>
        </View>
        <View style={styles.benefitItem}>
          <MaterialCommunityIcons name="check-circle" size={20} color={BRAND_COLORS.green} />
          <Text style={styles.benefitText}>Access premium rewards</Text>
        </View>
        <View style={styles.benefitItem}>
          <MaterialCommunityIcons name="check-circle" size={20} color={BRAND_COLORS.green} />
          <Text style={styles.benefitText}>Priority customer support</Text>
        </View>
      </View>
    </ScrollView>
  );
}
