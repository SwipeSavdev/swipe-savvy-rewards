/**
 * FISIssueCardScreen - Issue a new FIS debit card
 *
 * Allows users to:
 * - Choose between virtual (instant) or physical card
 * - Enter cardholder name
 * - Enter shipping address (for physical)
 * - Select expedited shipping option
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../../design-system/theme';
import { useTheme } from '../../../contexts/ThemeContext';
import { Card, Button } from '../../../design-system/components/CoreComponents';
import { useFISCardStore } from '../stores/fisCardStore';
import { useAuthStore } from '../../auth/stores/authStore';

type CardType = 'virtual' | 'physical';

export function FISIssueCardScreen() {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const user = useAuthStore((state) => state.user);
  const { issueVirtualCard, issuePhysicalCard, isLoading, error } = useFISCardStore();

  const [cardType, setCardType] = useState<CardType>('virtual');
  const [cardholderName, setCardholderName] = useState(user?.name || '');
  const [nickname, setNickname] = useState('');
  const [setAsPrimary, setSetAsPrimary] = useState(true);

  // Physical card fields
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [expedited, setExpedited] = useState(false);

  const handleIssueCard = async () => {
    if (!cardholderName.trim()) {
      Alert.alert('Error', 'Please enter the cardholder name');
      return;
    }

    if (cardType === 'physical') {
      if (!street.trim() || !city.trim() || !state.trim() || !zip.trim()) {
        Alert.alert('Error', 'Please fill in all address fields');
        return;
      }
    }

    try {
      let newCard;
      if (cardType === 'virtual') {
        newCard = await issueVirtualCard({
          cardholderName: cardholderName.trim(),
          nickname: nickname.trim() || undefined,
          setAsPrimary,
        });
      } else {
        newCard = await issuePhysicalCard({
          cardholderName: cardholderName.trim(),
          shippingAddress: {
            street: street.trim(),
            city: city.trim(),
            state: state.trim(),
            zip: zip.trim(),
            country: 'US',
          },
          expedited,
          nickname: nickname.trim() || undefined,
          setAsPrimary,
        });
      }

      if (newCard) {
        Alert.alert(
          'Card Issued!',
          cardType === 'virtual'
            ? 'Your virtual card is ready to use.'
            : `Your physical card will be shipped to ${street}, ${city}. ${expedited ? 'Expedited shipping selected.' : 'Standard shipping (5-7 business days).'}`,
          [
            {
              text: 'View Card',
              onPress: () => navigation.replace('FISCardDetail', { cardId: newCard.id }),
            },
          ]
        );
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to issue card. Please try again.');
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
      paddingBottom: SPACING[10],
    },
    title: {
      fontSize: TYPOGRAPHY.fontSize.h2,
      fontWeight: '700',
      color: colors.text,
      marginBottom: SPACING[2],
    },
    subtitle: {
      fontSize: TYPOGRAPHY.fontSize.body,
      color: colors.muted,
      marginBottom: SPACING[4],
    },
    cardTypeContainer: {
      flexDirection: 'row',
      gap: SPACING[3],
      marginBottom: SPACING[4],
    },
    cardTypeOption: {
      flex: 1,
      backgroundColor: colors.panel2,
      borderRadius: RADIUS.lg,
      padding: SPACING[4],
      borderWidth: 2,
      borderColor: colors.stroke,
      alignItems: 'center',
      gap: SPACING[2],
    },
    cardTypeSelected: {
      borderColor: colors.brand,
      backgroundColor: `${colors.brand}10`,
    },
    cardTypeIcon: {
      width: 56,
      height: 56,
      borderRadius: RADIUS.lg,
      backgroundColor: colors.ghost,
      justifyContent: 'center',
      alignItems: 'center',
    },
    cardTypeIconSelected: {
      backgroundColor: `${colors.brand}20`,
    },
    cardTypeTitle: {
      fontSize: TYPOGRAPHY.fontSize.body,
      fontWeight: '700',
      color: colors.text,
    },
    cardTypeSubtitle: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: colors.muted,
      textAlign: 'center',
    },
    cardTypeBadge: {
      backgroundColor: colors.success,
      paddingHorizontal: SPACING[2],
      paddingVertical: 2,
      borderRadius: RADIUS.sm,
    },
    cardTypeBadgeText: {
      color: 'white',
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontWeight: '600',
    },
    section: {
      marginBottom: SPACING[4],
    },
    sectionTitle: {
      fontSize: TYPOGRAPHY.fontSize.h3,
      fontWeight: '700',
      color: colors.text,
      marginBottom: SPACING[3],
    },
    inputContainer: {
      marginBottom: SPACING[3],
    },
    inputLabel: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      fontWeight: '600',
      color: colors.text,
      marginBottom: SPACING[1],
    },
    input: {
      backgroundColor: colors.panel2,
      borderWidth: 1,
      borderColor: colors.stroke,
      borderRadius: RADIUS.md,
      paddingHorizontal: SPACING[3],
      paddingVertical: SPACING[3],
      fontSize: TYPOGRAPHY.fontSize.body,
      color: colors.text,
    },
    inputRow: {
      flexDirection: 'row',
      gap: SPACING[3],
    },
    inputHalf: {
      flex: 1,
    },
    toggleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: SPACING[3],
      borderBottomWidth: 1,
      borderBottomColor: colors.stroke,
    },
    toggleInfo: {
      flex: 1,
      marginRight: SPACING[3],
    },
    toggleTitle: {
      fontSize: TYPOGRAPHY.fontSize.body,
      fontWeight: '600',
      color: colors.text,
    },
    toggleSubtitle: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: colors.muted,
      marginTop: SPACING[1],
    },
    checkBox: {
      width: 24,
      height: 24,
      borderRadius: RADIUS.sm,
      borderWidth: 2,
      borderColor: colors.stroke,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkBoxChecked: {
      backgroundColor: colors.brand,
      borderColor: colors.brand,
    },
    expeditedBadge: {
      backgroundColor: '#FF9800',
      paddingHorizontal: SPACING[2],
      paddingVertical: 2,
      borderRadius: RADIUS.sm,
      marginTop: SPACING[1],
    },
    expeditedBadgeText: {
      color: 'white',
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontWeight: '600',
    },
    errorText: {
      color: colors.danger,
      fontSize: TYPOGRAPHY.fontSize.meta,
      marginBottom: SPACING[3],
    },
    infoCard: {
      backgroundColor: `${colors.brand}10`,
      borderRadius: RADIUS.md,
      padding: SPACING[3],
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: SPACING[2],
      marginBottom: SPACING[4],
    },
    infoText: {
      flex: 1,
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: colors.brand,
    },
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Get Your Card</Text>
        <Text style={styles.subtitle}>
          Choose your SwipeSavvy debit card and start earning rewards.
        </Text>

        {/* Card Type Selection */}
        <View style={styles.cardTypeContainer}>
          <TouchableOpacity
            style={[styles.cardTypeOption, cardType === 'virtual' && styles.cardTypeSelected]}
            onPress={() => setCardType('virtual')}
          >
            <View style={[styles.cardTypeIcon, cardType === 'virtual' && styles.cardTypeIconSelected]}>
              <MaterialCommunityIcons
                name="cellphone"
                size={28}
                color={cardType === 'virtual' ? colors.brand : colors.muted}
              />
            </View>
            <Text style={styles.cardTypeTitle}>Virtual Card</Text>
            <Text style={styles.cardTypeSubtitle}>Use instantly for online purchases</Text>
            <View style={styles.cardTypeBadge}>
              <Text style={styles.cardTypeBadgeText}>INSTANT</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cardTypeOption, cardType === 'physical' && styles.cardTypeSelected]}
            onPress={() => setCardType('physical')}
          >
            <View style={[styles.cardTypeIcon, cardType === 'physical' && styles.cardTypeIconSelected]}>
              <MaterialCommunityIcons
                name="credit-card"
                size={28}
                color={cardType === 'physical' ? colors.brand : colors.muted}
              />
            </View>
            <Text style={styles.cardTypeTitle}>Physical Card</Text>
            <Text style={styles.cardTypeSubtitle}>Delivered to your address</Text>
            <Text style={{ fontSize: TYPOGRAPHY.fontSize.meta, color: colors.muted }}>5-7 days</Text>
          </TouchableOpacity>
        </View>

        {/* Info Box */}
        <View style={styles.infoCard}>
          <MaterialCommunityIcons name="information" size={20} color={colors.brand} />
          <Text style={styles.infoText}>
            {cardType === 'virtual'
              ? 'Your virtual card will be ready immediately. Add it to Apple Pay or Google Pay for contactless payments.'
              : 'Your physical card will be mailed to your address. You can use your virtual card while waiting.'}
          </Text>
        </View>

        {/* Card Details */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Card Details</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Cardholder Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Name as it appears on card"
              placeholderTextColor={colors.muted}
              value={cardholderName}
              onChangeText={setCardholderName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Nickname (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., My Primary Card"
              placeholderTextColor={colors.muted}
              value={nickname}
              onChangeText={setNickname}
            />
          </View>

          <TouchableOpacity
            style={[styles.toggleRow, { borderBottomWidth: 0 }]}
            onPress={() => setSetAsPrimary(!setAsPrimary)}
          >
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleTitle}>Set as Primary Card</Text>
              <Text style={styles.toggleSubtitle}>Use this card by default for payments</Text>
            </View>
            <View style={[styles.checkBox, setAsPrimary && styles.checkBoxChecked]}>
              {setAsPrimary && (
                <MaterialCommunityIcons name="check" size={16} color="white" />
              )}
            </View>
          </TouchableOpacity>
        </Card>

        {/* Shipping Address (Physical Card Only) */}
        {cardType === 'physical' && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Shipping Address</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Street Address</Text>
              <TextInput
                style={styles.input}
                placeholder="123 Main St, Apt 4B"
                placeholderTextColor={colors.muted}
                value={street}
                onChangeText={setStreet}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>City</Text>
              <TextInput
                style={styles.input}
                placeholder="City"
                placeholderTextColor={colors.muted}
                value={city}
                onChangeText={setCity}
              />
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputContainer, styles.inputHalf]}>
                <Text style={styles.inputLabel}>State</Text>
                <TextInput
                  style={styles.input}
                  placeholder="CA"
                  placeholderTextColor={colors.muted}
                  value={state}
                  onChangeText={setState}
                  maxLength={2}
                  autoCapitalize="characters"
                />
              </View>
              <View style={[styles.inputContainer, styles.inputHalf]}>
                <Text style={styles.inputLabel}>ZIP Code</Text>
                <TextInput
                  style={styles.input}
                  placeholder="12345"
                  placeholderTextColor={colors.muted}
                  value={zip}
                  onChangeText={setZip}
                  keyboardType="number-pad"
                  maxLength={10}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.toggleRow, { borderBottomWidth: 0 }]}
              onPress={() => setExpedited(!expedited)}
            >
              <View style={styles.toggleInfo}>
                <Text style={styles.toggleTitle}>Expedited Shipping</Text>
                <Text style={styles.toggleSubtitle}>Receive in 2-3 business days</Text>
                {expedited && (
                  <View style={styles.expeditedBadge}>
                    <Text style={styles.expeditedBadgeText}>+$15.00</Text>
                  </View>
                )}
              </View>
              <View style={[styles.checkBox, expedited && styles.checkBoxChecked]}>
                {expedited && (
                  <MaterialCommunityIcons name="check" size={16} color="white" />
                )}
              </View>
            </TouchableOpacity>
          </Card>
        )}

        {/* Error Display */}
        {error && <Text style={styles.errorText}>{error}</Text>}

        {/* Submit Button */}
        <Button onPress={handleIssueCard} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            `Issue ${cardType === 'virtual' ? 'Virtual' : 'Physical'} Card`
          )}
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default FISIssueCardScreen;
