import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Modal,
  Animated,
  Easing,
  Text,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BRAND_COLORS, SPACING } from '../design-system/theme';
import { ChatScreen } from '@features/ai-concierge/screens/ChatScreen';

const { width, height } = Dimensions.get('window');

export function FloatingAIButton() {
  const [showModal, setShowModal] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (showModal) {
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  }, [showModal, scaleAnim]);

  const animatedStyle = {
    transform: [
      {
        scale: scaleAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
        }),
      },
    ],
    opacity: scaleAnim,
  };

  const styles = StyleSheet.create({
    floatingButton: {
      position: 'absolute',
      bottom: SPACING[6],
      right: SPACING[4],
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: BRAND_COLORS.green,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: BRAND_COLORS.green,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
      zIndex: 999,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      justifyContent: 'flex-start',
      alignItems: 'center',
      paddingTop: 80,
    },
    modalCard: {
      width: width - 32,
      maxHeight: height * 0.65,
      backgroundColor: '#FFFFFF',
      borderRadius: 24,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 15,
    },
    modalHeader: {
      height: 120,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#6B5BFF',
      paddingHorizontal: SPACING[5],
      paddingVertical: SPACING[4],
      position: 'relative',
    },
    sparkleIcon: {
      width: 60,
      height: 60,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalTitle: {
      position: 'absolute',
      bottom: SPACING[3],
      fontSize: 16,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    closeButton: {
      position: 'absolute',
      top: SPACING[3],
      right: SPACING[3],
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: 'rgba(255, 255, 255, 0.25)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    chatContainer: {
      flex: 1,
      backgroundColor: '#F6F6F6',
    },
  });

  return (
    <>
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setShowModal(true)}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons name="sparkles" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      <Modal
        visible={showModal}
        animationType="none"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowModal(false)}
        >
          <Animated.View style={[styles.modalCard, animatedStyle]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowModal(false)}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="close" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <View style={styles.sparkleIcon}>
                <MaterialCommunityIcons name="star-four-points" size={48} color="#FFFFFF" />
              </View>
              <Text style={styles.modalTitle}>AI Assistant</Text>
            </View>
            <View style={styles.chatContainer}>
              <ChatScreen isModal={true} />
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}
