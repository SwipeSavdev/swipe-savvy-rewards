import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Svg, { Defs, LinearGradient, Polygon, Rect, Stop } from 'react-native-svg';
import { SPACING } from '../design-system/theme';
import { ChatScreen } from '../features/ai-concierge/screens/ChatScreen';
import { conversationCache } from '../packages/ai-sdk/src/utils/conversationCache';

const { width, height } = Dimensions.get('window');

// AI Button Icon Component
const AIButtonIcon = ({ size = 56 }: { size?: number }) => {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
      <Svg width={size} height={size} viewBox="0 0 120 120" style={{ position: 'absolute' }}>
        <Defs>
          <LinearGradient id="borderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#4A90E2" stopOpacity="1" />
            <Stop offset="100%" stopColor="#9B59B6" stopOpacity="1" />
          </LinearGradient>
          <LinearGradient id="sparkleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FFD700" stopOpacity="1" />
            <Stop offset="100%" stopColor="#FFA500" stopOpacity="1" />
          </LinearGradient>
        </Defs>
        
        {/* Outer gradient border */}
        <Rect
          x="8"
          y="8"
          width="104"
          height="104"
          rx="20"
          ry="20"
          fill="none"
          stroke="url(#borderGradient)"
          strokeWidth="4"
        />
        
        {/* Inner white background */}
        <Rect
          x="14"
          y="14"
          width="92"
          height="92"
          rx="16"
          ry="16"
          fill="#FFFFFF"
        />
        
        {/* Four-point sparkle - top right */}
        <Polygon points="90,20 94,32 106,36 94,40 90,52 86,40 74,36 86,32" fill="url(#sparkleGradient)" />
      </Svg>
      
      {/* AI Text overlaid on top */}
      <Text style={{
        position: 'absolute',
        fontSize: 20,
        fontWeight: '700',
        color: '#00B050',
        textAlign: 'center',
        zIndex: 10,
      }}>
        AI
      </Text>
    </View>
  );
};

export function FloatingAIButton() {
  const [showModal, setShowModal] = useState(false);
  const [chatKey, setChatKey] = useState(0);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  const handleCloseAndRefresh = async () => {
    const previousSessionId = `modal-${chatKey}`;
    await conversationCache.clear(previousSessionId);
    setChatKey((prev) => prev + 1);
    setShowModal(false);
  };

  useEffect(() => {
    if (showModal) {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(bounceAnim, {
          toValue: 1,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 100,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  }, [showModal, scaleAnim, bounceAnim]);

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

  const buttonAnimatedStyle = {
    transform: [
      {
        scale: bounceAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.05],
        }),
      },
    ],
  };

  const styles = StyleSheet.create({
    floatingButton: {
      position: 'absolute',
      bottom: SPACING[8] + 48,
      right: SPACING[4],
      width: 64,
      height: 64,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 8,
      zIndex: 999,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      justifyContent: 'flex-end',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingBottom: 16,
    },
    modalCard: {
      width: '100%',
      height: height - 100,
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
      height: 70,
      justifyContent: 'flex-start',
      alignItems: 'center',
      backgroundColor: '#6B5BFF',
      paddingHorizontal: SPACING[5],
      paddingVertical: SPACING[3],
      position: 'relative',
      paddingTop: 0,
    },
    sparkleIcon: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: -8,
      marginBottom: 2,
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
      <Animated.View style={[styles.floatingButton, buttonAnimatedStyle]}>
        <TouchableOpacity
          onPress={() => setShowModal(true)}
          activeOpacity={0.8}
          style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
        >
          <AIButtonIcon size={64} />
        </TouchableOpacity>
      </Animated.View>

      <Modal
        visible={showModal}
        animationType="none"
        transparent={true}
        onRequestClose={handleCloseAndRefresh}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleCloseAndRefresh}
        >
          <Animated.View style={[styles.modalCard, animatedStyle]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleCloseAndRefresh}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="close" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <View style={styles.sparkleIcon}>
                <MaterialCommunityIcons
                  name="star-four-points"
                  size={32}
                  color="#FFFFFF"
                />
              </View>
              <Text style={styles.modalTitle}>Savvy AI Concierge</Text>
            </View>
            <View style={styles.chatContainer}>
              <ChatScreen isModal={true} key={chatKey} sessionId={`modal-${chatKey}`} />
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}
