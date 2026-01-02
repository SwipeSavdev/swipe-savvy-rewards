import React from 'react';
import {
    ActivityIndicator,
    Image,
    Modal,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { LIGHT_THEME, SPACING, TYPOGRAPHY } from '../design-system/theme';

interface LoadingModalProps {
  visible: boolean;
  message?: string;
  isFullScreen?: boolean;
}

export const LoadingModal: React.FC<LoadingModalProps> = ({
  visible,
  message = 'Loading...',
  isFullScreen = false,
}) => {
  const styles = StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: isFullScreen ? LIGHT_THEME.bg : 'rgba(0, 0, 0, 0.4)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: SPACING[8],
      paddingHorizontal: SPACING[6],
      borderRadius: 20,
      backgroundColor: isFullScreen ? LIGHT_THEME.bg : LIGHT_THEME.panelSolid,
    },
    logo: {
      width: 120,
      height: 120,
      marginBottom: SPACING[6],
      resizeMode: 'contain',
    },
    spinner: {
      marginVertical: SPACING[4],
    },
    message: {
      marginTop: SPACING[4],
      fontSize: TYPOGRAPHY.fontSize.body,
      color: LIGHT_THEME.muted,
      textAlign: 'center',
    },
  });

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <View style={styles.modalContent}>
          {/* ShopSavvy Logo - Colored Version */}
          <Image
            source={require('../../assets/logos/shopsavvy-colored.png')}
            style={styles.logo}
          />
          <ActivityIndicator
            size="large"
            color={LIGHT_THEME.brand}
            style={styles.spinner}
          />
          {message && <Text style={styles.message}>{message}</Text>}
        </View>
      </View>
    </Modal>
  );
};

interface LoadingOverlayProps {
  visible: boolean;
}

/**
 * Lightweight loading indicator overlay
 * Shows just a spinner without modal backdrop
 */
export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ visible }) => {
  if (!visible) return null;

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 999,
    },
  });

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={LIGHT_THEME.brand} />
    </View>
  );
};
