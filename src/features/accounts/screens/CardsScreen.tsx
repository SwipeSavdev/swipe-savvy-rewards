import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  ListRenderItem,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LIGHT_THEME, SPACING, RADIUS, TYPOGRAPHY, BRAND_COLORS } from '../../../design-system/theme';
import { Card, Button, IconBox, Avatar } from '../../../design-system/components/CoreComponents';
import { dataService } from '../../../services/DataService';

interface CardData {
  id: string;
  number: string;
  holder: string;
  expiry: string;
  type: 'visa' | 'mastercard' | 'amex';
}

export function CardsScreen() {
  const navigation = useNavigation();
  const [cards, setCards] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      setLoading(true);
      const data = await dataService.getCards();
      setCards(data);
    } catch (error) {
      console.error('Failed to load cards:', error);
      Alert.alert('Error', 'Failed to load cards');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCard = async () => {
    if (!cardNumber || !cardHolder || !expiryDate || !cvv) {
      Alert.alert('Validation Error', 'Please fill in all fields');
      return;
    }

    try {
      setSubmitting(true);
      const result = await dataService.addCard({
        cardNumber,
        expiryDate,
        cvv,
        holderName: cardHolder,
      });

      if (result.success) {
        Alert.alert('Success', 'Card added successfully');
        setShowAddModal(false);
        setCardNumber('');
        setCardHolder('');
        setExpiryDate('');
        setCvv('');
        loadCards();
      }
    } catch (error) {
      console.error('Failed to add card:', error);
      Alert.alert('Error', 'Failed to add card');
    } finally {
      setSubmitting(false);
    }
  };

  const renderCardItem: ListRenderItem<CardData> = ({ item }) => (
    <Card style={styles.cardItem}>
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardNumber}>{item.number}</Text>
          <MaterialCommunityIcons
            name={item.type === 'visa' ? 'credit-card' : 'credit-card'}
            size={24}
            color={BRAND_COLORS.navy}
          />
        </View>
        <Text style={styles.cardHolder}>{item.holder}</Text>
        <Text style={styles.cardExpiry}>Expires: {item.expiry}</Text>
      </View>
    </Card>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: LIGHT_THEME.bg,
    },
    contentContainer: {
      padding: SPACING[4],
      paddingBottom: SPACING[10],
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING[3],
    },
    title: {
      fontSize: TYPOGRAPHY.fontSize.h2,
      fontWeight: '700',
      color: LIGHT_THEME.text,
    },
    addButton: {
      backgroundColor: BRAND_COLORS.navy,
      paddingHorizontal: SPACING[3],
      paddingVertical: SPACING[2],
      borderRadius: RADIUS.lg,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: SPACING[4],
    },
    emptyText: {
      fontSize: TYPOGRAPHY.fontSize.body,
      color: LIGHT_THEME.muted,
      marginTop: SPACING[3],
      textAlign: 'center',
    },
    cardItem: {
      marginBottom: SPACING[3],
      padding: SPACING[4],
    },
    cardContent: {
      gap: SPACING[2],
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    cardNumber: {
      fontSize: TYPOGRAPHY.fontSize.body,
      fontWeight: '600',
      color: LIGHT_THEME.text,
      letterSpacing: 2,
    },
    cardHolder: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: LIGHT_THEME.muted,
    },
    cardExpiry: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: LIGHT_THEME.muted,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: LIGHT_THEME.bg,
      borderTopLeftRadius: RADIUS.lg,
      borderTopRightRadius: RADIUS.lg,
      padding: SPACING[4],
      maxHeight: '80%',
    },
    modalTitle: {
      fontSize: TYPOGRAPHY.fontSize.h2,
      fontWeight: '700',
      marginBottom: SPACING[3],
      color: LIGHT_THEME.text,
    },
    input: {
      borderWidth: 1,
      borderColor: LIGHT_THEME.stroke,
      borderRadius: RADIUS.md,
      paddingHorizontal: SPACING[3],
      paddingVertical: SPACING[2],
      marginBottom: SPACING[3],
      color: LIGHT_THEME.text,
    },
    inputRow: {
      flexDirection: 'row',
      gap: SPACING[3],
    },
    inputHalf: {
      flex: 1,
    },
    buttonGroup: {
      flexDirection: 'row',
      gap: SPACING[3],
      marginTop: SPACING[4],
    },
  });

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={BRAND_COLORS.navy} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Saved Cards</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {cards.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="credit-card-plus"
              size={64}
              color={LIGHT_THEME.stroke}
            />
            <Text style={styles.emptyText}>No cards added yet</Text>
            <Button
              onPress={() => setShowAddModal(true)}
              style={{ marginTop: SPACING[4] }}
            >
              Add Your First Card
            </Button>
          </View>
        ) : (
          <FlatList
            scrollEnabled={false}
            data={cards}
            renderItem={renderCardItem}
            keyExtractor={(item) => item.id}
          />
        )}
      </ScrollView>

      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: SPACING[3],
              }}
            >
              <Text style={styles.modalTitle}>Add New Card</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color={LIGHT_THEME.text} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Card Number"
              placeholderTextColor={LIGHT_THEME.muted}
              value={cardNumber}
              onChangeText={setCardNumber}
              keyboardType="numeric"
              maxLength={16}
            />

            <TextInput
              style={styles.input}
              placeholder="Cardholder Name"
              placeholderTextColor={LIGHT_THEME.muted}
              value={cardHolder}
              onChangeText={setCardHolder}
            />

            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, styles.inputHalf]}
                placeholder="MM/YY"
                placeholderTextColor={LIGHT_THEME.muted}
                value={expiryDate}
                onChangeText={setExpiryDate}
                maxLength={5}
              />
              <TextInput
                style={[styles.input, styles.inputHalf]}
                placeholder="CVV"
                placeholderTextColor={LIGHT_THEME.muted}
                value={cvv}
                onChangeText={setCvv}
                keyboardType="numeric"
                maxLength={4}
              />
            </View>

            <View style={styles.buttonGroup}>
              <Button
                onPress={() => setShowAddModal(false)}
                variant="secondary"
                style={{ flex: 1 }}
              >
                Cancel
              </Button>
              <Button
                onPress={handleAddCard}
                disabled={submitting}
                style={{ flex: 1 }}
              >
                {submitting ? 'Adding...' : 'Add Card'}
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
