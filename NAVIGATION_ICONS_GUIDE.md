# Navigation Icons Integration Guide

## Overview
The SwipeSavvy mobile app now uses custom brand icons from the official branding kit for navigation, replacing generic system icons with SwipeSavvy-branded assets.

## Icon Integration Details

### Component Location
[src/components/NavigationIcon.tsx](src/components/NavigationIcon.tsx)

### Icon Assets Location
`shared/branding-kit/SwipeSavvy_VisualAssets_MasterPack_v1/icons/png/`

### Available Icon Themes
- **Light Active** - Light theme, selected/active state
- **Light Inactive** - Light theme, unselected/inactive state
- **Dark Active** - Dark theme, selected/active state
- **Dark Inactive** - Dark theme, unselected/inactive state

## Navigation Icon Mappings

| Screen | Icon File | Purpose |
|--------|-----------|---------|
| Home | `dashboard_24.png` | Main home/dashboard screen icon |
| Accounts | `wallet_24.png` | Account and banking information |
| Transfers | `transfer_24.png` | Money transfer operations |
| Rewards | `trophy_24.png` | Rewards and loyalty program |
| Profile | `profile_24.png` | User profile and settings |

## How It Works

### NavigationIcon Component
The `NavigationIcon` component automatically:
1. **Detects the current theme** - Light or dark mode
2. **Detects focus state** - Whether the tab is active or inactive
3. **Selects the appropriate icon** - Loads the correct image variant
4. **Applies styling** - Respects the color and size props from React Navigation

### Theme-Aware Rendering
```tsx
<NavigationIcon
  name="home"           // Icon name
  focused={true}        // Is this tab active?
  color="brand-color"   // Color from theme
  size={24}            // Size in pixels
/>
```

## Implementation in MainStack

The icons are integrated into the bottom tab navigator in [src/app/navigation/MainStack.tsx](src/app/navigation/MainStack.tsx):

```tsx
<Tab.Navigator
  screenOptions={({ route }) => ({
    tabBarIcon: ({ focused, color, size }) => (
      <NavigationIcon
        name={route.name.toLowerCase()}
        focused={focused}
        color={color}
        size={size}
      />
    ),
    // ... other options
  })}
>
  <Tab.Screen name="Home" component={HomeScreen} />
  <Tab.Screen name="Accounts" component={AccountsScreen} />
  <Tab.Screen name="Transfers" component={TransfersScreen} />
</Tab.Navigator>
```

## Icon Assets Imported

### Light Mode
- **Active State**: `dashboard_24.png`, `wallet_24.png`, `transfer_24.png`, `trophy_24.png`, `profile_24.png`
- **Inactive State**: Same filenames from `light_inactive` directory

### Dark Mode
- **Active State**: Same filenames from `dark_active` directory
- **Inactive State**: Same filenames from `dark_inactive` directory

## Adding New Navigation Icons

To add a new navigation icon:

1. **Identify the icon** in the branding kit that represents the feature
2. **Add imports** to [src/components/NavigationIcon.tsx](src/components/NavigationIcon.tsx):
   ```tsx
   import newIconLight from '../../shared/branding-kit/.../light_active/icon_name_24.png';
   import newIconDark from '../../shared/branding-kit/.../dark_active/icon_name_24.png';
   // ... etc for inactive states
   ```
3. **Update the type definition**:
   ```tsx
   type IconName = 'home' | 'accounts' | 'transfers' | 'rewards' | 'profile' | 'newscreen';
   ```
4. **Add the case statement** in the `getIconSource()` function
5. **Use in navigation**:
   ```tsx
   <Tab.Screen name="NewScreen" component={NewScreenComponent} />
   ```

## Styling Notes

### Color Handling
- Colors are automatically applied via the `tintColor` style property
- The theme color system (`useTheme()`) is respected
- Active/inactive colors are managed by React Navigation

### Size
- Default size: 24px (matches Material Design guidelines)
- Can be customized via the `size` prop
- Icons scale proportionally

## Theme Switching
Icons automatically update when the theme changes because:
1. The component uses `useTheme()` hook
2. When theme changes, the component re-renders
3. The correct dark/light icon variant is selected

## Testing

### On Device
Scan the QR code at `exp://192.168.1.142:8081` with Expo Go

### Visual Verification
- Tab icons appear when you open the app
- They change when you switch between tabs
- Icons update color when switching between light/dark themes
- Icons are crisp and properly sized

## Available Icons in Branding Kit

The full icon library includes (24px and 48px versions):
- `bank` - Banking operations
- `bell` - Notifications
- `chat` - Chat/messaging
- `check_circle` - Confirmation/success
- `chevron_down/right` - Navigation
- `clock` - Time/history
- `close` - Close/dismiss
- `community` - Community/social
- `dashboard` - Home/dashboard ✓ (used)
- `donate` - Donations
- `engineering` - Technical/settings
- `error` - Error states
- `export` - Export data
- `filter` - Filtering
- `finance` - Finance/money
- `gift` - Rewards/gifts
- `impact` - Impact metrics
- `leaderboard` - Leaderboard/rankings
- `link` - Linking/connections
- `lock` - Security/locked
- `medal` - Achievements
- `minus/plus` - Add/remove
- `ops` - Operations
- `profile` - User profile ✓ (used)
- `refresh` - Refresh/reload
- `rewards` - Rewards program
- `risk` - Risk assessment
- `scan` - QR/NFC scanning
- `search` - Search
- `send` - Send/transfer
- `settings` - Settings
- `sparkles` - Special/premium
- `support` - Support/help
- `transfer` - Money transfer ✓ (used)
- `trophy` - Achievements/rewards ✓ (used)
- `wallet` - Wallet/accounts ✓ (used)
- `warning` - Warnings

## Troubleshooting

### Icons Not Showing
1. **Clear Metro cache**: `rm -rf .metro-cache`
2. **Restart Expo**: `npx expo start --clear`
3. **Check imports**: Verify all icon imports exist in branding kit

### Wrong Colors
1. **Check theme colors**: Verify theme colors in [src/contexts/ThemeContext.tsx](src/contexts/ThemeContext.tsx)
2. **Clear app cache**: Close and reopen Expo Go app
3. **Rebuild**: Full Metro rebuild with `--clear` flag

### Icons Not Responsive to Theme
1. **Force reload**: Press 'r' in Expo dev server
2. **Check useTheme hook**: Verify it returns `isDarkMode` correctly
3. **Inspect state**: Use React DevTools to check theme state

## File References

- **Icon Component**: [src/components/NavigationIcon.tsx](src/components/NavigationIcon.tsx)
- **Navigation Setup**: [src/app/navigation/MainStack.tsx](src/app/navigation/MainStack.tsx)
- **Theme System**: [src/contexts/ThemeContext.tsx](src/contexts/ThemeContext.tsx)
- **Icon Assets**: `shared/branding-kit/SwipeSavvy_VisualAssets_MasterPack_v1/icons/png/`

## Related Documentation

- See [MOBILE_APP_TROUBLESHOOTING.md](MOBILE_APP_TROUBLESHOOTING.md) for app troubleshooting
- See [AI_ICONS_IMPLEMENTATION_EXAMPLES.tsx](AI_ICONS_IMPLEMENTATION_EXAMPLES.tsx) for additional icon examples
- See branding kit documentation for complete icon guidelines

---

**Last Updated:** January 1, 2026
**Integrated With:** Expo 54.0.30, React 19.1.0, React Native 0.81.5
