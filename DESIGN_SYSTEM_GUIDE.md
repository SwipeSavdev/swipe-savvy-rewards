# SwipeSavvy Mobile App - Modern UI/UX Redesign

## 🎨 Design System Overview

The complete redesign implements a **modern, tech-focused mobile wallet UI** with comprehensive design tokens, component library, and fully functional screens.

### Design Philosophy

- **Clean Alignment**: Consistent 16dp edge insets throughout
- **Responsive Rhythm**: Vertical spacing using 8/12/16dp increments
- **Modern Glass**: Translucent panels with backdrop blur effects
- **Brand Cohesion**: Navy, Deep Navy, Green, and Yellow color palette
- **Accessible Typography**: Clear hierarchy with proper sizing and weights
- **Smooth Animations**: 150-260ms transitions with custom easing

## 📦 Architecture

### Design System (`src/design-system/`)

#### Theme Tokens (`theme.ts`)
- **Colors**: Brand colors (Navy, Deep, Green, Yellow) + Light/Dark variants
- **Spacing**: 4dp baseline scale (0-10: 0px to 56px)
- **Typography**: H1-Body with matching line heights and weights
- **Radius**: Sm (10px) to Pill (999px)
- **Shadows**: Two elevation levels for depth
- **Animation**: Duration (150-260ms) + Custom easing

#### Core Components (`components/CoreComponents.tsx`)
- **Card**: Translucent panel with backdrop blur
- **Button**: Primary/Secondary/Ghost variants
- **Avatar**: User initials in gradient box
- **Badge**: Status indicators (success, warning, default)
- **IconBox**: Icon containers with color variants

### Features Implemented

#### 1. **Home Screen** (`features/home/screens/HomeScreen.tsx`)
- **Balance Display**: Large CTA card showing checking & savings
- **Quick Actions Grid**: 2×2 grid (Send, Request, Scan, Rewards)
- **Points Card**: Tier progress with visual indicators
- **Transaction Feed**: Recent activity with amount colors
- **Floating Action Button**: Savvy AI access

**Key Features:**
- Real-time balance display
- Quick navigation to core features
- Transaction history with transaction types
- Points and tier progression visualization

#### 2. **Wallet Screen** (`features/accounts/screens/AccountsScreen.tsx`)
- **Card Carousel**: Multiple cards with swipe support
  - Default debit card (Navy gradient)
  - Virtual travel card
  - Add card button
- **Accounts Section**: Checking + Savings in side-by-side layout
- **Linked Banks**: Connected institutions with status indicators

**Key Features:**
- Card management (freeze, limits, details)
- Account overview with balances
- Bank linking status with relink capability
- Transaction filtering by account

#### 3. **Pay Screen** (`features/transfers/screens/TransfersScreen.tsx`)
- **Send/Request Toggle**: Segmented control for transaction type
- **Recipient Selection**:
  - People (@handle)
  - Bank (ACH transfer)
  - Contact list integration
  - Recent recipients chips
- **Amount Input**: Large, clear monetary input
- **Funding Source**: Account/Card selection
- **Fee & Timing**: Transparent fee display and arrival times
- **Memo Field**: Optional note for transaction

**Key Features:**
- Smooth segmented control switching
- Recent recipient quick access
- Real-time fee calculation
- Transparent transfer details
- Confirmation flow

#### 4. **Rewards Screen** (`features/ai-concierge/screens/RewardsScreen.tsx`)
- **Points Display**: Large yellow card with available points
- **Tier Progress**: Visual progress bar to next tier
- **Boost Offers**: Personalized earning opportunities
  - Fuel boosts (2× multiplier)
  - Category boosts (coffee, restaurants)
  - Activation status badges
- **Impact Snapshot**: Donation stats
  - Total donated
  - Monthly rank
  - Donation streak
  - Community leaderboard access

**Key Features:**
- Points-to-value conversion display
- Tier-based rewards structure
- Personalized boost recommendations
- Donation tracking and impact
- Community goal progress

#### 5. **Profile Screen** (`features/profile/screens/ProfileScreen.tsx`)
- **User Profile Card**: Name, KYC status, tier badge
- **Theme Toggle**: Dark mode preference with system sync option
- **Notification Settings**: Fine-grained control
- **Security Menu**: PIN, biometrics, trusted devices
- **Support & Help**: Help center, contact options
- **Logout**: Secure session termination

**Key Features:**
- Complete user information display
- Theme personalization (light/dark)
- Security preferences
- Account settings management
- Linked device overview

## 🎯 UI/UX Components

### Reusable Components

```typescript
// Theme Usage
import { LIGHT_THEME, SPACING, RADIUS, TYPOGRAPHY } from 'design-system/theme';

// Components
import { Card, Button, Avatar, Badge, IconBox } from 'design-system/components/CoreComponents';

// Example Card
<Card padding={SPACING[4]}>
  <Text style={styles.title}>Balance</Text>
  <Text style={styles.amount}>$4,250.25</Text>
</Card>

// Example Button
<Button onPress={handleSend} variant="primary">
  Send Money
</Button>
```

### Color System

**Light Theme:**
- Background: #F6F6F6
- Panel: rgba(255,255,255,0.82)
- Text: #132136
- Muted: rgba(19,33,54,0.62)
- Brand: #235393 (Navy)

**Dark Theme:**
- Background: #0B111B
- Panel: rgba(19,33,54,0.62)
- Text: rgba(246,246,246,0.92)
- Muted: rgba(246,246,246,0.62)
- Brand: #235393 (Navy)

### Spacing Scale

All spacing uses a 4dp baseline:
- `SPACING[0]`: 0px
- `SPACING[1]`: 4px
- `SPACING[2]`: 8px
- `SPACING[3]`: 12px
- `SPACING[4]`: 16px (standard padding)
- `SPACING[5]`: 20px
- `SPACING[6]`: 24px
- `SPACING[7]`: 32px
- Up to `SPACING[10]`: 56px

## 🔄 Screen Flow

### Navigation Hierarchy

```
RootNavigator
├── AuthStack (Login/Signup)
│   └── LoginScreen
│   └── SignupScreen
└── MainStack (Authenticated)
    ├── Home (Home, Points, Activity)
    ├── Wallet (Cards, Accounts, Banks)
    ├── Pay (Send, Request, Review)
    ├── Rewards (Boosts, Donations, Challenges)
    └── Profile (Settings, Security, Account)
```

### Key User Flows

1. **Send Money**:
   Home → Pay (toggle Send) → Select Recipient → Enter Amount → Select Funding → Review → Confirm

2. **Earn Rewards**:
   Home (Points Card) → Rewards → Browse Boosts → Donate Points → Community

3. **Manage Cards**:
   Home → Wallet → Select Card → Card Detail → Freeze/Limits

4. **Use Savvy AI**:
   Any Screen (FAB) → Savvy Overlay → Chat → Quick Actions → Confirm

## 📱 Responsive Design

### Device Support

- **iPhone Compatibility**: 390px-428px width (modern iPhones)
- **Aspect Ratio**: 390/844 (iPhone standard)
- **Safe Area**: Automatic inset handling
- **Orientations**: Portrait primary, Landscape supported

### Layout Constraints

- **Max Width**: 420px (phones)
- **Standard Padding**: 16dp (SPACING[4])
- **Edge Inset**: Consistent 16dp from edges
- **Card Gap**: 16dp between major sections
- **Icon Size**: 20-24px standard

## 🎬 Animation & Interaction

### Transitions
- **Duration**: 150ms (fast), 180ms (normal), 260ms (slow)
- **Easing**: `cubic-bezier(.2,.8,.2,1)` (smooth custom curve)
- **Scale**: -1px on hover, 0px on active

### Interactive Elements

- **Buttons**: Translate up on hover, scale back on press
- **Cards**: Subtle shadow lift on interaction
- **Navigation**: Smooth fade-in for screen transitions
- **Overlays**: Backdrop blur with 28% opacity
- **Sheets**: Smooth slide-up from bottom

## 🛠️ Implementation Details

### State Management

- **Auth Store**: User authentication and profile
- **Account State**: Balance and transaction data
- **UI State**: Theme, modal visibility, form inputs
- **Chat State**: Message history and AI responses

### API Integration

- **Backend**: Connected to `http://127.0.0.1:8002`
- **WebSocket**: `ws://127.0.0.1:8002/ws` (real-time)
- **Streaming**: Server-Sent Events for AI responses

### Performance Optimizations

- **Lazy Loading**: Screen components load on demand
- **Memoization**: Component re-renders optimized
- **FlatList**: Efficient list rendering
- **Image Caching**: Asset optimization

## 📊 Design Tokens Exported

All design tokens are available from `design-system/theme.ts`:

```typescript
export const BRAND_COLORS = { ... }
export const LIGHT_THEME = { ... }
export const DARK_THEME = { ... }
export const SPACING = { ... }
export const RADIUS = { ... }
export const SHADOWS = { ... }
export const TYPOGRAPHY = { ... }
export const ANIMATION = { ... }
```

## 🎨 Component Library

### Available Components

| Component | Props | Variants |
|-----------|-------|----------|
| Card | padding, style | — |
| Button | onPress, children, variant, disabled | primary, secondary, ghost |
| Avatar | initials, size, style | — |
| Badge | label, variant, style | default, success, warning |
| IconBox | icon, variant, size, style | default, green, yellow, deep |

## 🔐 Security & Privacy

- **Biometric Auth**: Face ID / Touch ID integration
- **PIN Protection**: Numeric PIN for sensitive actions
- **Token Management**: Secure card tokenization
- **PII Masking**: Account numbers masked (••••)
- **Privacy Options**: Leaderboard visibility toggle

## 📈 Next Steps & Features

### Planned Features
- [ ] Savvy AI bottom sheet with chat UI
- [ ] Card detail screen with transaction filters
- [ ] Challenges & badges system
- [ ] Community impact leaderboard
- [ ] Settings screen with full preferences
- [ ] Biometric security setup flow
- [ ] Push notifications setup
- [ ] Payment confirmation sheet

### Development Priorities
1. Complete Savvy AI concierge integration
2. Implement transfer confirmation flow
3. Add real transaction data
4. Integrate bank connection flow
5. Setup push notifications
6. Add analytics tracking

## 🚀 Getting Started

### Run the App

```bash
# Start dev server
npm start

# Scan QR code with Expo Go or use web
Press w for web preview
Press i for iOS simulator
Press a for Android emulator
```

### Backend Integration

```bash
# Start AI Agents backend (running on port 8002)
# Make requests to http://127.0.0.1:8002
# WebSocket at ws://127.0.0.1:8002/ws
```

## 📚 Design File Reference

The original design system is documented in:
`/Downloads/SwipeSavvy_MobileApp_Modern_Refactor_Screens_v1.html`

Includes:
- Screen-by-screen layout specifications
- Color token definitions
- Typography hierarchy
- Component variations
- Interactive prototype

## 🎓 Design System Principles

1. **Consistency**: Single source of truth for all design tokens
2. **Scalability**: Easy to extend with new variants
3. **Accessibility**: WCAG compliant color contrasts
4. **Performance**: Optimized animations and renders
5. **Responsiveness**: Adaptive layouts for all devices
6. **Maintainability**: Clear naming and structure

---

**Version**: 1.0.0  
**Last Updated**: December 25, 2025  
**Status**: ✅ Core screens implemented, ready for feature expansion
