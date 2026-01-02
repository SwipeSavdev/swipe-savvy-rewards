# FloatingAIButton Component Documentation

## Overview

The `FloatingAIButton` is a React Native component that renders a floating action button (FAB) with an integrated AI Concierge modal. It serves as the primary entry point for users to access the Savvy AI assistant on mobile devices.

**Location:** `/src/components/FloatingAIButton.tsx`

## Component Architecture

### Main Components

1. **AIButtonIcon** - SVG-based icon component
2. **FloatingAIButton** - Main component with modal management
3. **ChatScreen** - Chat interface displayed in modal (imported)

## Visual Design

### Button Icon (AIButtonIcon)

**Dimensions:** 64x64 pixels (customizable via `size` prop)

**Visual Elements:**

- **Gradient Border:**
  - Blue (#4A90E2) to Purple (#9B59B6)
  - 4px stroke width
  - 20px border radius

- **Inner Background:**
  - White (#FFFFFF)
  - 16px border radius
  - Positioned inside gradient border

- **"AI" Text:**
  - **Color:** Swipe Savvy Bright Green (#00B050)
  - **Font Size:** 20px
  - **Font Weight:** 700 (Bold)
  - **Position:** Centered, overlaid on background
  - **Text Align:** Center
  - **Z-Index:** 10 (ensures visibility above SVG)

- **Four-Point Star Sparkle:**
  - **Position:** Top-right corner
  - **Gradient:** Gold (#FFD700) to Orange (#FFA500)
  - **Size:** ~22px polygon

### Floating Button Container

**Position:** Fixed bottom-right corner

**Dimensions:**
- Width: 64px
- Height: 64px

**Styling:**
- Background: Transparent (shows AIButtonIcon)
- Shadow:
  - Color: #000000
  - Offset: 0 x 4px
  - Opacity: 0.15
  - Radius: 8px
  - Elevation: 8 (Android)

**Animations:**
- Bounce effect on modal open (scale: 1 → 1.05)
- Smooth scale-in animation (scale: 0 → 1)
- Opacity fade animation

## Chat Modal

**Position:** Bottom sheet style

**Dimensions:**
- Width: 100% (with 16px horizontal padding)
- Height: Screen height - 100px
- Padding Bottom: 16px

**Styling:**
- Border Radius: 24px
- Background: White (#FFFFFF)
- Shadow:
  - Color: #000000
  - Offset: 0 x 12px
  - Opacity: 0.3
  - Radius: 16px
  - Elevation: 15 (Android)

### Modal Overlay

- **Background:** rgba(0, 0, 0, 0.4) - semi-transparent dark
- **Justification:** Flex-end (positions content at bottom)
- **Touch Handling:** Closes modal on overlay tap

### Modal Header

**Height:** 70px

**Background:** Purple (#6B5BFF)

**Elements:**

1. **Close Button (Top-Right)**
   - Width/Height: 36x36px
   - Border Radius: 18px
   - Background: rgba(255, 255, 255, 0.25)
   - Icon: MaterialCommunityIcons "close" (size 20, white)

2. **Sparkle Icon (Center-Top)**
   - Width/Height: 40x40px
   - Icon: MaterialCommunityIcons "star-four-points" (size 32, white)
   - Margin Top: -8px
   - Margin Bottom: 2px

3. **Title Text**
   - Text: "Savvy AI Concierge"
   - Font Size: 16px
   - Font Weight: 700 (Bold)
   - Color: White (#FFFFFF)
   - Position: Absolute bottom-centered

### Modal Body

- **Background:** Light gray (#F6F6F6)
- **Content:** ChatScreen component with modal mode enabled
- **Session Management:** Unique `sessionId` per modal instance

## Props

### AIButtonIcon Props

```typescript
interface AIButtonIconProps {
  size?: number; // Default: 56 pixels
}
```

### FloatingAIButton Props

No props - uses internal state management

## State Management

```typescript
const [showModal, setShowModal] = useState(false);        // Modal visibility
const [chatKey, setChatKey] = useState(0);               // Chat instance key
const scaleAnim = useRef(new Animated.Value(0)).current; // Modal scale animation
const bounceAnim = useRef(new Animated.Value(0)).current; // Button bounce animation
```

## Key Functions

### handleCloseAndRefresh()

Executed when modal is closed:
1. Retrieves previous session ID
2. Clears conversation cache for that session
3. Increments chat key (creates new chat instance)
4. Closes modal

```typescript
const handleCloseAndRefresh = async () => {
  const previousSessionId = `modal-${chatKey}`;
  await conversationCache.clear(previousSessionId);
  setChatKey((prev) => prev + 1);
  setShowModal(false);
};
```

## Animation Details

### Modal Appearance Animation

**Duration:** 200ms (timing) + spring physics

**Properties:**
- Easing: Cubic out
- From: Scale 0, Opacity 0
- To: Scale 1, Opacity 1
- Uses native driver for performance

### Button Bounce Animation

**Duration:** Undefined (spring-based)

**Properties:**
- Friction: 8
- From: Scale 1
- To: Scale 1.05
- Uses native driver for performance

## Color Palette

| Element | Color | Hex Code |
|---------|-------|----------|
| AI Text | Swipe Savvy Green | #00B050 |
| Gradient Start | Bright Blue | #4A90E2 |
| Gradient End | Purple | #9B59B6 |
| Sparkle Start | Gold | #FFD700 |
| Sparkle End | Orange | #FFA500 |
| Header Background | Purple | #6B5BFF |
| Modal Background | White | #FFFFFF |
| Modal Body | Light Gray | #F6F6F6 |
| Overlay | Black (40% opacity) | rgba(0, 0, 0, 0.4) |

## Accessibility

- Touch targets meet minimum size requirements (36x36px minimum)
- High contrast text (green on white)
- Modal has proper z-index layering
- Close button is easily accessible
- Responsive to screen dimensions

## Performance Optimizations

- Uses React Native Animated API for smooth 60fps animations
- Native driver enabled for all animations
- SVG rendering optimized with proper viewBox
- Modal cache cleared per session to prevent memory leaks
- Ref-based animation value management

## Dependencies

```typescript
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
```

## Integration Example

```typescript
// In your main app/screen component
import { FloatingAIButton } from './components/FloatingAIButton';

export function HomeScreen() {
  return (
    <View style={{ flex: 1 }}>
      {/* Your screen content */}
      <FloatingAIButton />
    </View>
  );
}
```

## Browser/Platform Support

- **React Native:** 0.81.5+
- **Expo:** 54.0.30+
- **Platforms:** iOS and Android
- **React:** 19.1.0+

## Recent Updates (v2.0)

### Changes Made

1. **AI Text Color:** Changed from dark gray to Swipe Savvy bright green (#00B050)
2. **AI Text Size:** Reduced from 32px to 20px for proper button proportions
3. **Text Rendering:** Implemented as overlaid React Native Text component instead of SVG Text for better compatibility
4. **Sparkle Gradient:** Added gradient effect (gold to orange) to four-point star decoration
5. **Button Layout:** Uses View wrapper with absolute positioning for proper z-index layering

### Technical Improvements

- Better text visibility and rendering consistency
- Improved gradient effects on decorative elements
- Enhanced visual hierarchy with proper sizing
- Optimized component layering for cross-platform compatibility

## Troubleshooting

### Text not visible

Ensure Text component is positioned with `zIndex: 10` and the parent View has relative positioning.

### Animation stuttering

Verify that `useNativeDriver: true` is set on all Animated API calls and that the animation values are properly initialized.

### Modal not closing

Check that `conversationCache.clear()` is functioning and `showModal` state is being updated in `handleCloseAndRefresh()`.

### Gradient not displaying

Ensure react-native-svg is installed (`npm install react-native-svg --legacy-peer-deps`) and `LinearGradient` IDs are unique in the `Defs` section.

## Future Enhancements

- Haptic feedback on button press
- Customizable positioning
- Theme support (light/dark mode)
- Configurable size variations
- User preference persistence
