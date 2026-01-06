import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BRAND_COLORS, TYPOGRAPHY, SPACING } from '../design-system/theme';

interface SocialShareModalProps {
  isVisible: boolean;
  receipt?: {
    type: string;
    currency: string;
    amount: number;
    impact?: string;
  };
  onClose: () => void;
  onShareSuccess?: () => void;
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  isVisible,
  receipt,
  onClose,
  onShareSuccess,
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

  const handleShare = async (platform: string) => {
    try {
      if (!receipt) return;

      const message = `I just made a ${receipt.type} of ${receipt.currency}${receipt.amount} through SwipeSavvy! ${
        receipt.impact ? `Impact: ${receipt.impact}` : ''
      } #SwipeSavvy #GivingBack`;

      if (platform === 'native') {
        await Share.share(
          {
            message,
            title: `SwipeSavvy ${receipt.type}`,
          },
          { dialogTitle: 'Share Your Impact' }
        );
      } else if (platform === 'twitter') {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;
        // In real app: Linking.openURL(twitterUrl);
        Alert.alert('Share to Twitter', `URL would open: ${twitterUrl}`);
      } else if (platform === 'linkedin') {
        const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=swipesavvy.app`;
        // In real app: Linking.openURL(linkedinUrl);
        Alert.alert('Share to LinkedIn', `URL would open: ${linkedinUrl}`);
      } else if (platform === 'facebook') {
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=swipesavvy.app&quote=${encodeURIComponent(message)}`;
        // In real app: Linking.openURL(facebookUrl);
        Alert.alert('Share to Facebook', `URL would open: ${facebookUrl}`);
      }

      onShareSuccess?.();
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to share. Please try again.');
    }
  };

  if (!isVisible) return null;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.shareModalOverlay}>
        <View style={styles.shareModal}>
          <View style={styles.shareModalHeader}>
            <Text style={styles.shareModalTitle}>Share Your Impact</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={BRAND_COLORS.navy}
              />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.shareOptionsContainer}>
            <TouchableOpacity
              style={styles.shareOption}
              onPress={() => handleShare('native')}
            >
              <MaterialCommunityIcons
                name="share-variant"
                size={32}
                color={BRAND_COLORS.blue}
              />
              <Text style={styles.shareOptionLabel}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.shareOption}
              onPress={() => handleShare('twitter')}
            >
              <MaterialCommunityIcons
                name="twitter"
                size={32}
                color="#1DA1F2"
              />
              <Text style={styles.shareOptionLabel}>Twitter</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.shareOption}
              onPress={() => handleShare('facebook')}
            >
              <MaterialCommunityIcons
                name="facebook"
                size={32}
                color="#1877F2"
              />
              <Text style={styles.shareOptionLabel}>Facebook</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.shareOption}
              onPress={() => handleShare('linkedin')}
            >
              <MaterialCommunityIcons
                name="linkedin"
                size={32}
                color="#0A66C2"
              />
              <Text style={styles.shareOptionLabel}>LinkedIn</Text>
            </TouchableOpacity>
          </ScrollView>

          <View style={styles.sharePreview}>
            <Text style={styles.sharePreviewLabel}>Preview:</Text>
            <Text style={styles.sharePreviewText} numberOfLines={3}>
              I just made a {receipt?.type} of {receipt?.currency}
              {receipt?.amount} through SwipeSavvy!{' '}
              {receipt?.impact ? `Impact: ${receipt.impact}` : ''} #SwipeSavvy
              #GivingBack
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  shareModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  shareModal: {
    backgroundColor: BRAND_COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    maxHeight: '80%',
  },
  shareModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  shareModalTitle: {
    ...TYPOGRAPHY.heading3,
    color: BRAND_COLORS.navy,
  },
  shareOptionsContainer: {
    marginBottom: SPACING.lg,
  },
  shareOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: 12,
    backgroundColor: BRAND_COLORS.lightGray,
    marginBottom: SPACING.sm,
  },
  shareOptionLabel: {
    ...TYPOGRAPHY.body2,
    marginLeft: SPACING.md,
    color: BRAND_COLORS.navy,
  },
  sharePreview: {
    backgroundColor: BRAND_COLORS.lightGray,
    borderRadius: 12,
    padding: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: BRAND_COLORS.green,
  },
  sharePreviewLabel: {
    ...TYPOGRAPHY.caption,
    color: BRAND_COLORS.gray,
    marginBottom: SPACING.sm,
  },
  sharePreviewText: {
    ...TYPOGRAPHY.body3,
    color: BRAND_COLORS.navy,
  },
});
