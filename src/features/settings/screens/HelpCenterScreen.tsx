/**
 * HelpCenterScreen - FAQ and help articles
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../../design-system/theme';
import { useTheme } from '../../../contexts/ThemeContext';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    id: '1',
    question: 'How do I add a new card?',
    answer: 'Go to the Cards tab and tap the "Add Card" button. You can link your credit or debit card by entering the card details or scanning it with your camera.',
    category: 'Cards',
  },
  {
    id: '2',
    question: 'How do I earn rewards?',
    answer: 'You earn rewards automatically when you make purchases with your linked cards. Different card categories earn different reward rates. Check the Rewards tab to see your earnings.',
    category: 'Rewards',
  },
  {
    id: '3',
    question: 'How do I redeem my rewards?',
    answer: 'Navigate to the Rewards tab and select "Redeem". You can redeem your points for cash back, gift cards, or statement credits.',
    category: 'Rewards',
  },
  {
    id: '4',
    question: 'Is my data secure?',
    answer: 'Yes! We use bank-level encryption (256-bit SSL) to protect your data. Your card information is tokenized and never stored on our servers directly.',
    category: 'Security',
  },
  {
    id: '5',
    question: 'How do I change my password?',
    answer: 'Go to Settings > Security > Change Password. You\'ll need to enter your current password and then create a new one that meets our security requirements.',
    category: 'Account',
  },
  {
    id: '6',
    question: 'What is a transaction PIN?',
    answer: 'Your transaction PIN is a 4-digit code used to authorize payments and transfers above $50 or to new recipients. This adds an extra layer of security to your account.',
    category: 'Security',
  },
  {
    id: '7',
    question: 'How do I enable biometric login?',
    answer: 'Go to Settings > Security and toggle on "Biometric Login". You\'ll be prompted to authenticate with Face ID or Touch ID to enable this feature.',
    category: 'Security',
  },
  {
    id: '8',
    question: 'How do I contact support?',
    answer: 'You can reach our support team by going to Settings > Support > Contact Support. We also offer 24/7 chat support within the app.',
    category: 'Support',
  },
];

const CATEGORIES = ['All', 'Cards', 'Rewards', 'Security', 'Account', 'Support'];

export function HelpCenterScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredFAQs = FAQ_DATA.filter((item) => {
    const matchesSearch =
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleContactSupport = () => {
    (navigation as any).navigate('ContactSupport');
  };

  const handleOpenWebsite = () => {
    Linking.openURL('https://swipesavvy.com/help');
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
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.panel2,
      borderRadius: RADIUS.lg,
      borderWidth: 1,
      borderColor: colors.stroke,
      paddingHorizontal: SPACING[3],
      gap: SPACING[2],
    },
    searchInput: {
      flex: 1,
      paddingVertical: SPACING[3],
      fontSize: TYPOGRAPHY.fontSize.body,
      color: colors.text,
    },
    categoriesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: SPACING[2],
    },
    categoryChip: {
      paddingHorizontal: SPACING[3],
      paddingVertical: SPACING[2],
      borderRadius: RADIUS.pill,
      backgroundColor: colors.panel2,
      borderWidth: 1,
      borderColor: colors.stroke,
    },
    categoryChipActive: {
      backgroundColor: colors.brand,
      borderColor: colors.brand,
    },
    categoryText: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: colors.muted,
    },
    categoryTextActive: {
      color: 'white',
      fontWeight: '600',
    },
    faqSection: {
      gap: SPACING[3],
    },
    sectionTitle: {
      fontSize: TYPOGRAPHY.fontSize.body,
      fontWeight: '600',
      color: colors.text,
    },
    faqItem: {
      backgroundColor: colors.panel2,
      borderRadius: RADIUS.lg,
      borderWidth: 1,
      borderColor: colors.stroke,
      overflow: 'hidden',
    },
    faqHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: SPACING[3],
      gap: SPACING[2],
    },
    faqQuestion: {
      flex: 1,
      fontSize: TYPOGRAPHY.fontSize.body,
      color: colors.text,
      fontWeight: '500',
    },
    faqAnswer: {
      padding: SPACING[3],
      paddingTop: 0,
      fontSize: TYPOGRAPHY.fontSize.body,
      color: colors.muted,
      lineHeight: 22,
    },
    helpActions: {
      gap: SPACING[3],
    },
    helpAction: {
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
      width: 44,
      height: 44,
      borderRadius: RADIUS.md,
      backgroundColor: colors.panel,
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionContent: {
      flex: 1,
    },
    actionTitle: {
      fontSize: TYPOGRAPHY.fontSize.body,
      fontWeight: '600',
      color: colors.text,
    },
    actionSubtitle: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: colors.muted,
    },
    noResults: {
      padding: SPACING[6],
      alignItems: 'center',
      gap: SPACING[2],
    },
    noResultsText: {
      fontSize: TYPOGRAPHY.fontSize.body,
      color: colors.muted,
      textAlign: 'center',
    },
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={20} color={colors.muted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search help articles..."
          placeholderTextColor={colors.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialCommunityIcons name="close" size={20} color={colors.muted} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.categoriesContainer}>
        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category}
            style={[styles.categoryChip, selectedCategory === category && styles.categoryChipActive]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[styles.categoryText, selectedCategory === category && styles.categoryTextActive]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.faqSection}>
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

        {filteredFAQs.length === 0 ? (
          <View style={styles.noResults}>
            <MaterialCommunityIcons name="help-circle-outline" size={48} color={colors.muted} />
            <Text style={styles.noResultsText}>
              No results found. Try adjusting your search or category filter.
            </Text>
          </View>
        ) : (
          filteredFAQs.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.faqItem}
              onPress={() => setExpandedId(expandedId === item.id ? null : item.id)}
              activeOpacity={0.7}
            >
              <View style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{item.question}</Text>
                <MaterialCommunityIcons
                  name={expandedId === item.id ? 'chevron-up' : 'chevron-down'}
                  size={24}
                  color={colors.muted}
                />
              </View>
              {expandedId === item.id && <Text style={styles.faqAnswer}>{item.answer}</Text>}
            </TouchableOpacity>
          ))
        )}
      </View>

      <View style={styles.helpActions}>
        <Text style={styles.sectionTitle}>Need More Help?</Text>

        <TouchableOpacity style={styles.helpAction} onPress={handleContactSupport}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="message-text-outline" size={24} color={colors.brand} />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Contact Support</Text>
            <Text style={styles.actionSubtitle}>Get help from our support team</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={colors.muted} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.helpAction} onPress={handleOpenWebsite}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="web" size={24} color={colors.brand} />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Visit Help Center</Text>
            <Text style={styles.actionSubtitle}>Browse all help articles online</Text>
          </View>
          <MaterialCommunityIcons name="open-in-new" size={20} color={colors.muted} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
