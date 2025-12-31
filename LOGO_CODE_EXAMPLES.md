# ShopSavvy Logo Integration - Code Examples

Quick reference for adding logos and loading states to any screen.

---

## 1. Add Logo Header to Any Screen

### Simple Copy-Paste Example

```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BrandHeader } from '@components/BrandHeader';
import { LIGHT_THEME, SPACING } from '@design-system/theme';

export function MyNewScreen() {
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: LIGHT_THEME.bg,
    },
    content: {
      padding: SPACING[4],
    },
  });

  return (
    <View style={styles.container}>
      {/* Add logo header - COPY THIS LINE */}
      <BrandHeader variant="full" size="small" style={{ marginBottom: SPACING[2] }} />
      
      {/* Rest of your screen content */}
      <View style={styles.content}>
        <Text>My Screen Content</Text>
      </View>
    </View>
  );
}
```

---

## 2. Use Loading Modal During API Calls

### Pattern for API Operations

```tsx
import React, { useState } from 'react';
import { View, Button, Alert } from 'react-native';
import { useLoading } from '@contexts/LoadingContext';
import { dataService } from '@services/DataService';

export function MyDataScreen() {
  const { showLoading, hideLoading } = useLoading();

  // PATTERN 1: Simple Loading
  const handleFetchData = async () => {
    showLoading('Loading data...');
    try {
      const data = await dataService.getTransactions(10);
      // Use data
      Alert.alert('Success', 'Data loaded');
    } catch (error) {
      Alert.alert('Error', 'Failed to load data');
    } finally {
      hideLoading();
    }
  };

  // PATTERN 2: Multi-step Loading
  const handleTransfer = async () => {
    showLoading('Verifying account...');
    try {
      // Step 1
      await new Promise(r => setTimeout(r, 1000));
      
      showLoading('Processing transfer...');
      // Step 2
      await new Promise(r => setTimeout(r, 1000));
      
      showLoading('Confirming...');
      // Step 3
      await new Promise(r => setTimeout(r, 1000));
      
      Alert.alert('Success', 'Transfer complete');
    } catch (error) {
      Alert.alert('Error', String(error));
    } finally {
      hideLoading();
    }
  };

  return (
    <View>
      <Button title="Load Data" onPress={handleFetchData} />
      <Button title="Transfer Funds" onPress={handleTransfer} />
    </View>
  );
}
```

---

## 3. Add Logo to Login Screen

```tsx
import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { BrandHeader } from '@components/BrandHeader';
import { useLoading } from '@contexts/LoadingContext';
import { LIGHT_THEME, SPACING, RADIUS, TYPOGRAPHY } from '@design-system/theme';

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { showLoading, hideLoading } = useLoading();

  const handleLogin = async () => {
    showLoading('Signing in...');
    try {
      // Simulate login API call
      await new Promise(r => setTimeout(r, 2000));
      // Navigate to main app
    } finally {
      hideLoading();
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: LIGHT_THEME.bg,
      justifyContent: 'center',
      paddingHorizontal: SPACING[4],
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: SPACING[8],
    },
    title: {
      fontSize: TYPOGRAPHY.fontSize.h2,
      fontWeight: '700',
      color: LIGHT_THEME.text,
      marginTop: SPACING[4],
      textAlign: 'center',
    },
    input: {
      borderRadius: RADIUS.md,
      paddingVertical: SPACING[3],
      paddingHorizontal: SPACING[4],
      marginVertical: SPACING[2],
      backgroundColor: LIGHT_THEME.panel,
      color: LIGHT_THEME.text,
      borderWidth: 1,
      borderColor: LIGHT_THEME.stroke,
    },
    button: {
      backgroundColor: LIGHT_THEME.brand,
      borderRadius: RADIUS.pill,
      paddingVertical: SPACING[3],
      marginTop: SPACING[4],
      alignItems: 'center',
    },
    buttonText: {
      color: 'white',
      fontWeight: '600',
      fontSize: TYPOGRAPHY.fontSize.body,
    },
  });

  return (
    <View style={styles.container}>
      {/* Logo Header */}
      <View style={styles.logoContainer}>
        <BrandHeader variant="full" size="medium" />
        <Text style={styles.title}>Welcome Back</Text>
      </View>

      {/* Login Form */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        placeholderTextColor={LIGHT_THEME.muted}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor={LIGHT_THEME.muted}
      />

      {/* Login Button */}
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>
    </View>
  );
}
```

---

## 4. Add Logo to Transfer Screen

```tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BrandHeader } from '@components/BrandHeader';
import { useLoading } from '@contexts/LoadingContext';
import { Card, Button } from '@design-system/components/CoreComponents';
import { LIGHT_THEME, SPACING, TYPOGRAPHY } from '@design-system/theme';
import { dataService } from '@services/DataService';

export function TransfersScreen() {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const { showLoading, hideLoading } = useLoading();

  const handleSubmit = async () => {
    if (!recipient || !amount) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    showLoading('Processing transfer...');
    try {
      const result = await dataService.submitTransfer({
        recipientId: recipient,
        amount: parseFloat(amount),
        currency: 'USD',
        type: 'send',
      });
      
      Alert.alert('Success', `Transfer ID: ${result.transferId}`);
      setRecipient('');
      setAmount('');
    } catch (error) {
      Alert.alert('Error', 'Transfer failed');
    } finally {
      hideLoading();
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: LIGHT_THEME.bg,
      paddingHorizontal: SPACING[4],
    },
    header: {
      marginTop: SPACING[4],
      marginBottom: SPACING[6],
    },
    title: {
      fontSize: TYPOGRAPHY.fontSize.h2,
      fontWeight: '700',
      color: LIGHT_THEME.text,
      marginTop: SPACING[3],
    },
  });

  return (
    <View style={styles.container}>
      {/* Logo Header */}
      <View style={styles.header}>
        <BrandHeader variant="full" size="small" />
        <Text style={styles.title}>Send Money</Text>
      </View>

      {/* Form */}
      <Card>
        {/* Form inputs and transfer logic */}
      </Card>

      {/* Submit Button */}
      <Button variant="primary" onPress={handleSubmit}>
        Review & Confirm
      </Button>
    </View>
  );
}
```

---

## 5. Add Logo to Rewards Screen

```tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { BrandHeader } from '@components/BrandHeader';
import { useLoading } from '@contexts/LoadingContext';
import { LIGHT_THEME, SPACING, TYPOGRAPHY, BRAND_COLORS } from '@design-system/theme';
import { dataService } from '@services/DataService';

export function RewardsScreen() {
  const [points, setPoints] = useState(0);
  const { showLoading, hideLoading } = useLoading();

  useEffect(() => {
    loadRewardsData();
  }, []);

  const loadRewardsData = async () => {
    showLoading('Loading rewards...');
    try {
      const pointsData = await dataService.getRewardsPoints();
      setPoints(pointsData.balance);
    } finally {
      hideLoading();
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: LIGHT_THEME.bg,
    },
    header: {
      paddingHorizontal: SPACING[4],
      paddingTop: SPACING[4],
      marginBottom: SPACING[6],
    },
    title: {
      fontSize: TYPOGRAPHY.fontSize.h2,
      fontWeight: '700',
      color: LIGHT_THEME.text,
      marginTop: SPACING[3],
    },
    pointsCard: {
      backgroundColor: BRAND_COLORS.green,
      marginHorizontal: SPACING[4],
      padding: SPACING[4],
      borderRadius: 18,
      marginBottom: SPACING[4],
    },
    pointsLabel: {
      color: 'rgba(255,255,255,0.7)',
      fontSize: TYPOGRAPHY.fontSize.body,
    },
    pointsValue: {
      color: 'white',
      fontSize: 32,
      fontWeight: '800',
      marginTop: SPACING[2],
    },
  });

  return (
    <ScrollView style={styles.container}>
      {/* Logo Header */}
      <View style={styles.header}>
        <BrandHeader variant="full" size="small" />
        <Text style={styles.title}>Rewards</Text>
      </View>

      {/* Points Card */}
      <View style={styles.pointsCard}>
        <Text style={styles.pointsLabel}>Your Points</Text>
        <Text style={styles.pointsValue}>{points.toLocaleString()}</Text>
      </View>

      {/* Rest of rewards content */}
    </ScrollView>
  );
}
```

---

## 6. Add Logo to Profile Screen

```tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { BrandHeader } from '@components/BrandHeader';
import { useLoading } from '@contexts/LoadingContext';
import { Card } from '@design-system/components/CoreComponents';
import { LIGHT_THEME, SPACING, TYPOGRAPHY } from '@design-system/theme';
import { dataService } from '@services/DataService';

export function ProfileScreen() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const { showLoading, hideLoading } = useLoading();

  const handleDarkModeToggle = async (value: boolean) => {
    setDarkMode(value);
    showLoading('Saving preferences...');
    try {
      await dataService.updatePreferences({ darkMode: value });
    } finally {
      hideLoading();
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: LIGHT_THEME.bg,
      paddingHorizontal: SPACING[4],
    },
    header: {
      marginTop: SPACING[4],
      marginBottom: SPACING[6],
    },
    title: {
      fontSize: TYPOGRAPHY.fontSize.h2,
      fontWeight: '700',
      color: LIGHT_THEME.text,
      marginTop: SPACING[3],
    },
    settingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: SPACING[3],
      borderBottomWidth: 1,
      borderBottomColor: LIGHT_THEME.stroke,
    },
    settingLabel: {
      fontSize: TYPOGRAPHY.fontSize.body,
      color: LIGHT_THEME.text,
    },
  });

  return (
    <View style={styles.container}>
      {/* Logo Header */}
      <View style={styles.header}>
        <BrandHeader variant="full" size="small" />
        <Text style={styles.title}>Profile</Text>
      </View>

      {/* Settings */}
      <Card>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Dark Mode</Text>
          <Switch
            value={darkMode}
            onValueChange={handleDarkModeToggle}
          />
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Notifications</Text>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
          />
        </View>
      </Card>
    </View>
  );
}
```

---

## 7. Show Loading with Detailed Progress

```tsx
import React from 'react';
import { Button, View } from 'react-native';
import { useLoading } from '@contexts/LoadingContext';

export function ComplexOperationScreen() {
  const { showLoading, setLoadingMessage, hideLoading } = useLoading();

  const handleComplexOperation = async () => {
    showLoading('Starting...');

    try {
      // Step 1
      setLoadingMessage('Step 1: Validating data...');
      await new Promise(r => setTimeout(r, 1500));

      // Step 2
      setLoadingMessage('Step 2: Connecting to server...');
      await new Promise(r => setTimeout(r, 1500));

      // Step 3
      setLoadingMessage('Step 3: Processing...');
      await new Promise(r => setTimeout(r, 1500));

      // Step 4
      setLoadingMessage('Step 4: Finalizing...');
      await new Promise(r => setTimeout(r, 1500));

      // Complete
      Alert.alert('Complete', 'Operation finished successfully');
    } catch (error) {
      Alert.alert('Error', String(error));
    } finally {
      hideLoading();
    }
  };

  return (
    <View>
      <Button title="Start Complex Operation" onPress={handleComplexOperation} />
    </View>
  );
}
```

---

## 8. Conditional Logo Rendering

```tsx
import React from 'react';
import { View } from 'react-native';
import { BrandHeader } from '@components/BrandHeader';

interface ScreenProps {
  showLogo?: boolean;
  logoSize?: 'small' | 'medium' | 'large';
}

export function FlexibleScreen({ showLogo = true, logoSize = 'small' }: ScreenProps) {
  return (
    <View>
      {/* Conditionally show logo */}
      {showLogo && <BrandHeader variant="full" size={logoSize} />}
      
      {/* Rest of content */}
    </View>
  );
}
```

---

## 9. Combine Logo + Loading in Confirmation

```tsx
import React from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { BrandHeader } from '@components/BrandHeader';
import { useLoading } from '@contexts/LoadingContext';
import { Button } from '@design-system/components/CoreComponents';
import { SPACING, LIGHT_THEME } from '@design-system/theme';

export function ConfirmationScreen() {
  const { showLoading, hideLoading } = useLoading();

  const handleConfirm = async () => {
    showLoading('Confirming...');
    try {
      // Do something
      await new Promise(r => setTimeout(r, 2000));
      Alert.alert('Success', 'Confirmed!');
    } finally {
      hideLoading();
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: LIGHT_THEME.bg,
      padding: SPACING[4],
      justifyContent: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <BrandHeader variant="full" size="medium" />
      
      <Text style={{ marginVertical: SPACING[6] }}>
        Are you sure you want to proceed?
      </Text>

      <Button variant="primary" onPress={handleConfirm}>
        Confirm
      </Button>
    </View>
  );
}
```

---

## 10. Dark Mode Logo Variant

```tsx
import React, { useState } from 'react';
import { View, Image, useColorScheme } from 'react-native';

export function AdaptiveLogoScreen() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  // Select logo based on theme
  const logoSource = isDarkMode
    ? require('@assets/logos/shopsavvy-white.png')
    : require('@assets/logos/shopsavvy-colored.png');

  return (
    <View>
      <Image
        source={logoSource}
        style={{ width: 120, height: 60, resizeMode: 'contain' }}
      />
    </View>
  );
}
```

---

## Quick Reference

| Task | Code |
|------|------|
| Add logo header | `<BrandHeader variant="full" size="small" />` |
| Show loading | `showLoading('Loading...')` |
| Update message | `setLoadingMessage('New message')` |
| Hide loading | `hideLoading()` |
| Use loading context | `const { showLoading, hideLoading } = useLoading()` |

---

## Common Patterns

### Pattern 1: API Call with Loading
```tsx
const { showLoading, hideLoading } = useLoading();

const fetchData = async () => {
  showLoading('Loading...');
  try {
    const data = await api.fetch();
  } finally {
    hideLoading();
  }
};
```

### Pattern 2: Multi-step Operation
```tsx
showLoading('Step 1...');
// Do step 1
setLoadingMessage('Step 2...');
// Do step 2
setLoadingMessage('Step 3...');
// Do step 3
hideLoading();
```

### Pattern 3: Screen with Logo
```tsx
<BrandHeader variant="full" size="small" style={{ marginBottom: 16 }} />
<Text>Screen title</Text>
{/* Content */}
```

---

**That's it!** Copy-paste these patterns to add logos and loading states throughout the app.
