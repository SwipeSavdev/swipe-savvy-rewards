import React from 'react';
import { Image, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

// Import all icon variations
// Light Active Icons
import dashboardLightActive from '../../shared/branding-kit/SwipeSavvy_VisualAssets_MasterPack_v1/icons/png/light_active/dashboard_24.png';
import profileLightActive from '../../shared/branding-kit/SwipeSavvy_VisualAssets_MasterPack_v1/icons/png/light_active/profile_24.png';
import transferLightActive from '../../shared/branding-kit/SwipeSavvy_VisualAssets_MasterPack_v1/icons/png/light_active/transfer_24.png';
import trophyLightActive from '../../shared/branding-kit/SwipeSavvy_VisualAssets_MasterPack_v1/icons/png/light_active/trophy_24.png';
import walletLightActive from '../../shared/branding-kit/SwipeSavvy_VisualAssets_MasterPack_v1/icons/png/light_active/wallet_24.png';

// Light Inactive Icons
import dashboardLightInactive from '../../shared/branding-kit/SwipeSavvy_VisualAssets_MasterPack_v1/icons/png/light_inactive/dashboard_24.png';
import profileLightInactive from '../../shared/branding-kit/SwipeSavvy_VisualAssets_MasterPack_v1/icons/png/light_inactive/profile_24.png';
import transferLightInactive from '../../shared/branding-kit/SwipeSavvy_VisualAssets_MasterPack_v1/icons/png/light_inactive/transfer_24.png';
import trophyLightInactive from '../../shared/branding-kit/SwipeSavvy_VisualAssets_MasterPack_v1/icons/png/light_inactive/trophy_24.png';
import walletLightInactive from '../../shared/branding-kit/SwipeSavvy_VisualAssets_MasterPack_v1/icons/png/light_inactive/wallet_24.png';

// Dark Active Icons
import dashboardDarkActive from '../../shared/branding-kit/SwipeSavvy_VisualAssets_MasterPack_v1/icons/png/dark_active/dashboard_24.png';
import profileDarkActive from '../../shared/branding-kit/SwipeSavvy_VisualAssets_MasterPack_v1/icons/png/dark_active/profile_24.png';
import transferDarkActive from '../../shared/branding-kit/SwipeSavvy_VisualAssets_MasterPack_v1/icons/png/dark_active/transfer_24.png';
import trophyDarkActive from '../../shared/branding-kit/SwipeSavvy_VisualAssets_MasterPack_v1/icons/png/dark_active/trophy_24.png';
import walletDarkActive from '../../shared/branding-kit/SwipeSavvy_VisualAssets_MasterPack_v1/icons/png/dark_active/wallet_24.png';

// Dark Inactive Icons
import dashboardDarkInactive from '../../shared/branding-kit/SwipeSavvy_VisualAssets_MasterPack_v1/icons/png/dark_inactive/dashboard_24.png';
import profileDarkInactive from '../../shared/branding-kit/SwipeSavvy_VisualAssets_MasterPack_v1/icons/png/dark_inactive/profile_24.png';
import transferDarkInactive from '../../shared/branding-kit/SwipeSavvy_VisualAssets_MasterPack_v1/icons/png/dark_inactive/transfer_24.png';
import trophyDarkInactive from '../../shared/branding-kit/SwipeSavvy_VisualAssets_MasterPack_v1/icons/png/dark_inactive/trophy_24.png';
import walletDarkInactive from '../../shared/branding-kit/SwipeSavvy_VisualAssets_MasterPack_v1/icons/png/dark_inactive/wallet_24.png';

interface NavigationIconProps {
  name: 'home' | 'accounts' | 'transfers' | 'rewards' | 'profile';
  focused: boolean;
  color?: string;
  size?: number;
}

/**
 * Custom navigation icon component that uses SwipeSavvy brand icons
 * from the branding kit instead of generic system icons.
 * 
 * Icon mappings:
 * - 'home' -> dashboard icon (active/inactive)
 * - 'accounts' -> wallet icon (active/inactive)
 * - 'transfers' -> transfer icon (active/inactive)
 * - 'rewards' -> trophy icon (active/inactive)
 * - 'profile' -> profile icon (active/inactive)
 */
export const NavigationIcon: React.FC<NavigationIconProps> = ({
  name,
  focused,
  color,
  size = 24,
}) => {
  const { mode } = useTheme();

  // Icon mapping based on screen name and theme/focus state
  const getIconSource = (): any => {
    const theme = mode === 'dark' ? 'dark' : 'light';
    const state = focused ? 'active' : 'inactive';

    if (theme === 'dark' && state === 'active') {
      switch (name) {
        case 'home':
          return dashboardDarkActive;
        case 'accounts':
          return walletDarkActive;
        case 'transfers':
          return transferDarkActive;
        case 'rewards':
          return trophyDarkActive;
        case 'profile':
          return profileDarkActive;
        default:
          return dashboardDarkActive;
      }
    } else if (theme === 'dark' && state === 'inactive') {
      switch (name) {
        case 'home':
          return dashboardDarkInactive;
        case 'accounts':
          return walletDarkInactive;
        case 'transfers':
          return transferDarkInactive;
        case 'rewards':
          return trophyDarkInactive;
        case 'profile':
          return profileDarkInactive;
        default:
          return dashboardDarkInactive;
      }
    } else if (theme === 'light' && state === 'active') {
      switch (name) {
        case 'home':
          return dashboardLightActive;
        case 'accounts':
          return walletLightActive;
        case 'transfers':
          return transferLightActive;
        case 'rewards':
          return trophyLightActive;
        case 'profile':
          return profileLightActive;
        default:
          return dashboardLightActive;
      }
    } else {
      // light inactive (default)
      switch (name) {
        case 'home':
          return dashboardLightInactive;
        case 'accounts':
          return walletLightInactive;
        case 'transfers':
          return transferLightInactive;
        case 'rewards':
          return trophyLightInactive;
        case 'profile':
          return profileLightInactive;
        default:
          return dashboardLightInactive;
      }
    }
  };

  const styles = StyleSheet.create({
    icon: {
      width: size,
      height: size,
      tintColor: color,
    },
  });

  return (
    <Image
      source={getIconSource()}
      style={styles.icon}
      resizeMode="contain"
    />
  );
};
