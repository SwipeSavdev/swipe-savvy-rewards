# SwipeSavvy Mobile App - Developer Quick Start

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI
- iOS Simulator or Physical Device with Expo Go

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Scan QR code with:
# - Expo Go app (iOS/Android)
# - Camera app (iOS)
# - Expo scan (Android)
```

## 📱 Running the App

### Development Server
```bash
npm start
# Press w for web preview
# Press i for iOS simulator
# Press a for Android emulator
```

### Backend Integration
```bash
# Backend running on port 8002
# API: http://127.0.0.1:8002
# WebSocket: ws://127.0.0.1:8002/ws
```

## 🎨 Design System

### Importing Design Tokens

```typescript
// Tokens
import {
  LIGHT_THEME,
  DARK_THEME,
  SPACING,
  RADIUS,
  TYPOGRAPHY,
  BRAND_COLORS,
  SHADOWS,
  ANIMATION,
} from 'src/design-system/theme';

// Components
import {
  Card,
  Button,
  Avatar,
  Badge,
  IconBox,
} from 'src/design-system/components/CoreComponents';
```

### Using Theme Colors

```typescript
const styles = StyleSheet.create({
  container: {
    backgroundColor: LIGHT_THEME.bg,
    padding: SPACING[4], // 16px
  },
  title: {
    color: LIGHT_THEME.text,
    fontSize: TYPOGRAPHY.fontSize.h2,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  button: {
    borderRadius: RADIUS.xl,
    backgroundColor: BRAND_COLORS.navy,
  },
});
```

## 📁 Project Structure

```
src/
├── app/                           # App entry point
│   ├── App.tsx                    # Root component
│   ├── providers/                 # Context providers
│   │   └── AppProviders.tsx
│   └── navigation/                # Navigation setup
│       ├── AuthStack.tsx
│       ├── MainStack.tsx
│       └── RootNavigator.tsx
│
├── design-system/                 # Design tokens & components
│   ├── theme.ts                   # All design tokens
│   └── components/
│       └── CoreComponents.tsx     # Reusable UI components
│
├── features/                      # Feature modules
│   ├── home/                      # Home screen
│   │   └── screens/
│   │       └── HomeScreen.tsx
│   ├── accounts/                  # Wallet (cards & accounts)
│   │   └── screens/
│   │       └── AccountsScreen.tsx
│   ├── transfers/                 # Pay (send/request)
│   │   └── screens/
│   │       └── TransfersScreen.tsx
│   ├── ai-concierge/              # Rewards & AI
│   │   ├── screens/
│   │   │   ├── ChatScreen.tsx
│   │   │   ├── RewardsScreen.tsx
│   │   │   └── ...
│   │   ├── components/
│   │   │   ├── ChatMessage.tsx
│   │   │   ├── ChatInput.tsx
│   │   │   └── ...
│   │   └── hooks/
│   │       └── useAIChat.ts
│   ├── profile/                   # Profile & Settings
│   │   └── screens/
│   │       └── ProfileScreen.tsx
│   └── auth/                      # Authentication
│       └── stores/
│           └── authStore.ts
│
└── packages/                      # Shared packages
    └── ai-sdk/                    # AI SDK
        ├── client/
        │   └── AIClient.ts
        └── hooks/
            └── useAIChat.ts
```

## 🧩 Creating New Screens

### Template

```typescript
import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LIGHT_THEME, SPACING, RADIUS } from 'src/design-system/theme';
import { Card, Button } from 'src/design-system/components/CoreComponents';

export function MyScreen() {
  const navigation = useNavigation();
  const [data, setData] = useState(null);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: LIGHT_THEME.bg,
    },
    contentContainer: {
      paddingVertical: SPACING[4],
      paddingHorizontal: SPACING[4],
      gap: SPACING[4],
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Card>
          <Text>My Content</Text>
        </Card>

        <Button onPress={() => navigation.goBack()}>
          Go Back
        </Button>
      </ScrollView>
    </View>
  );
}
```

## 🧩 Using Components

### Card
```typescript
<Card padding={SPACING[4]} style={{ marginBottom: SPACING[2] }}>
  <Text>Content goes here</Text>
</Card>
```

### Button
```typescript
<Button 
  onPress={handlePress}
  variant="primary"  // or "secondary", "ghost"
  disabled={false}
>
  Click me
</Button>
```

### Avatar
```typescript
<Avatar 
  initials="JD"
  size={40}
/>
```

### Badge
```typescript
<Badge 
  label="Status"
  variant="success"  // or "warning", "default"
/>
```

### IconBox
```typescript
<IconBox
  icon={<MaterialCommunityIcons name="heart" size={20} />}
  variant="green"  // or "yellow", "deep", "default"
  size={44}
/>
```

## 🎨 Styling Guidelines

### Consistent Padding
Always use `SPACING` scale:
```typescript
padding: SPACING[4],           // 16px (standard)
paddingVertical: SPACING[3],  // 12px
paddingHorizontal: SPACING[4], // 16px
```

### Rounded Corners
Use `RADIUS` tokens:
```typescript
borderRadius: RADIUS.xl,  // 24px (cards)
borderRadius: RADIUS.lg,  // 18px (buttons)
borderRadius: RADIUS.md,  // 14px (input)
borderRadius: RADIUS.pill, // 999px (badges)
```

### Colors
Use theme directly:
```typescript
color: LIGHT_THEME.text,
backgroundColor: LIGHT_THEME.panel,
borderColor: LIGHT_THEME.stroke,
```

### Typography
Match font sizes and weights:
```typescript
fontSize: TYPOGRAPHY.fontSize.h2,
fontWeight: TYPOGRAPHY.fontWeight.bold,
lineHeight: TYPOGRAPHY.lineHeight.normal,
```

## 🔗 Navigation

### Navigate to Screen
```typescript
const navigation = useNavigation();

navigation.navigate('Home');
navigation.navigate('Wallet');
navigation.navigate('Pay');
navigation.navigate('Rewards');
navigation.navigate('Profile');
```

### Pass Parameters
```typescript
navigation.navigate('Detail', {
  id: 123,
  data: 'some value'
});

// In destination screen:
const { id, data } = route.params;
```

### Go Back
```typescript
navigation.goBack();
```

## 📡 API Integration

### Making Requests
```typescript
import axios from 'axios';

const API_BASE = 'http://127.0.0.1:8002';

// GET request
const response = await axios.get(`${API_BASE}/api/user`);

// POST request
const data = await axios.post(`${API_BASE}/api/transfer`, {
  recipient: 'user@example.com',
  amount: 50,
});
```

### WebSocket Connection
```typescript
const ws = new WebSocket('ws://127.0.0.1:8002/ws');

ws.onopen = () => console.log('Connected');
ws.onmessage = (event) => console.log(event.data);
ws.onerror = (error) => console.error(error);
ws.close();
```

## 🔐 State Management

### Auth Store
```typescript
import { useAuthStore } from 'src/features/auth/stores/authStore';

// In component:
const user = useAuthStore((state) => state.user);
const logout = useAuthStore((state) => state.logout);
const login = useAuthStore((state) => state.login);
```

## 🧪 Testing

### Run Tests
```bash
npm test

npm run test:watch

npm run test:coverage
```

## 📊 Building for Production

### iOS Build
```bash
npm run build:ios
```

### Android Build
```bash
npm run build:android
```

### Submit to App Store
```bash
npm run submit:ios
npm run submit:android
```

## 🐛 Debugging

### Enable Debug Mode
```typescript
// Set in .env
DEBUG_MODE=true
```

### Console Logging
```typescript
console.log('Debug info:', data);
console.error('Error:', error);
```

### React DevTools
```bash
# Install React DevTools
npm install --global react-devtools

# Start DevTools
react-devtools
```

## 📚 Resources

- [React Native Docs](https://reactnative.dev)
- [Expo Documentation](https://docs.expo.dev)
- [React Navigation](https://reactnavigation.org)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Material Icons](https://fonts.google.com/icons)
- [Expo Vector Icons](https://icons.expo.fyi)

## 💡 Best Practices

1. **Always use design tokens**: Never hardcode colors, spacing, or sizes
2. **Reuse components**: Create variants instead of duplicating
3. **Proper typing**: Full TypeScript coverage
4. **Optimize renders**: Use memoization, FlatList instead of map
5. **Accessible colors**: Check WCAG contrast ratios
6. **Consistent spacing**: Use SPACING scale throughout
7. **Clear naming**: Use descriptive variable and function names
8. **Comments**: Document complex logic

## 🤝 Contributing

When adding features:
1. Follow the existing file structure
2. Use design tokens consistently
3. Create reusable components
4. Add TypeScript types
5. Update navigation if needed
6. Test on device
7. Update documentation

## 📞 Support

- Check [DESIGN_SYSTEM_GUIDE.md](./DESIGN_SYSTEM_GUIDE.md) for design details
- Check [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) for what's implemented
- Review existing screens for patterns
- Ask team for clarification

---

**Happy coding! 🚀**
