# SwipeSavvy Icon System Guide

This document provides a complete guide to using the SwipeSavvy icon system from the branding kit in the admin portal.

## Overview

The icon system provides access to all icons in the SwipeSavvy Visual Assets Master Pack v1. Icons are available in:
- **Sizes**: 24px and 48px (automatically scaled to any size)
- **States**: Active and Inactive
- **Themes**: Light and Dark (auto-detected from `data-theme` attribute)

## Installation & Setup

The icon system is already integrated and available at:
- **Library**: `src/lib/icons/` - Icon catalog and utilities
- **Components**: `src/components/ui/BrandingKitIcon.tsx` - React components

## Quick Start

### Basic Icon Usage

```tsx
import { BrandingKitIcon } from '@/components/ui/BrandingKitIcon';

// Simple icon
<BrandingKitIcon name="bell" size="md" />

// Different sizes
<BrandingKitIcon name="dashboard" size="lg" />
<BrandingKitIcon name="check_circle" size={32} />

// Different states
<BrandingKitIcon name="bell" state="inactive" />

// With styling
<BrandingKitIcon 
  name="settings" 
  size="xl"
  className="text-blue-600"
  style={{ opacity: 0.8 }}
/>
```

### Icon Button

For interactive icons, use the IconButton component:

```tsx
import { BrandingKitIconButton } from '@/components/ui/BrandingKitIcon';

<BrandingKitIconButton
  name="trash"
  size="md"
  onClick={() => console.log('Delete!')}
  tooltip="Delete item"
/>
```

### Icon Set

Display multiple related icons:

```tsx
import { BrandingKitIconSet } from '@/components/ui/BrandingKitIcon';

<BrandingKitIconSet 
  icons={['check', 'close', 'warning_circle']}
  size="md"
  direction="row"
  gap={12}
/>
```

## Available Icons

### Navigation Icons
- `bank` - Bank/financial institution
- `bell` - Notifications
- `calendar` - Calendar/dates
- `chart_bar` - Bar chart
- `chart_line` - Line chart
- `chat` - Chat/messaging
- `chevron_down`, `chevron_left`, `chevron_right`, `chevron_up` - Navigation arrows
- `dashboard` - Dashboard
- `gear` - Settings
- `home` - Home
- `menu` - Menu/hamburger
- `search` - Search
- `settings` - Settings
- `user` - User account
- `users` - Multiple users
- `wallet` - Wallet

### Status Icons
- `check` - Success/checkmark
- `check_circle` - Success circle
- `error_circle` - Error
- `warning_circle` - Warning
- `info` - Information
- `help_circle` - Help
- `alert_circle` - Alert

### Action Icons
- `close` - Close/dismiss
- `plus` - Add/create
- `edit` - Edit
- `trash` - Delete
- `download` - Download
- `upload` - Upload
- `refresh` - Refresh
- `send` - Send
- `share` - Share
- `copy` - Copy
- `filter` - Filter
- `sort` - Sort
- `more_horizontal` - More options (horizontal)
- `more_vertical` - More options (vertical)

### Financial Icons
- `credit_card` - Credit card
- `trending_up` - Price up
- `trending_down` - Price down
- `arrow_up` - Amount up
- `arrow_down` - Amount down
- `arrow_left` - Move left
- `arrow_right` - Move right

### Communication Icons
- `envelope` - Email
- `phone` - Phone
- `message` - Message
- `paperclip` - Attachment

### Security Icons
- `lock` - Secure/locked
- `shield` - Security/protection
- `shield_alert` - Security alert

### UI Icons
- `eye` - Show/visibility
- `eye_off` - Hide
- `toggle_on` - Toggle enabled
- `toggle_off` - Toggle disabled
- `radio_checked` - Radio selected
- `radio_unchecked` - Radio unselected
- `circle` - Circle indicator
- `circle_filled` - Filled circle

## Component Props

### BrandingKitIcon Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `IconName` | Required | Icon name from catalog |
| `size` | `'xs'\|'sm'\|'md'\|'lg'\|'xl'\|'2xl'\|number` | `'md'` | Icon size (24 = md, 48 = lg) |
| `state` | `'active'\|'inactive'` | `'active'` | Icon state variant |
| `theme` | `'light'\|'dark'` | auto-detect | Theme variant |
| `className` | `string` | - | Additional CSS classes |
| `style` | `CSSProperties` | - | Inline styles |
| `alt` | `string` | auto | Alt text for accessibility |
| `ariaLabel` | `string` | auto | ARIA label for screen readers |
| `title` | `string` | auto | Hover tooltip |
| `onClick` | `function` | - | Click handler |
| `focusable` | `boolean` | `false` | Make icon keyboard focusable |
| `tabIndex` | `number` | - | Tab index for focus management |

### BrandingKitIconButton Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| (all BrandingKitIcon props) | - | - | Inherits all icon props |
| `onClick` | `function` | Required | Button click handler |
| `tooltip` | `string` | - | Hover tooltip |
| `disabled` | `boolean` | `false` | Disable the button |
| `padding` | `number` | `8` | Padding around icon in px |

## Real-World Examples

### Dashboard Header with Action Icons

```tsx
import { BrandingKitIcon, BrandingKitIconButton } from '@/components/ui/BrandingKitIcon';

export function DashboardHeader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <BrandingKitIcon name="dashboard" size="lg" />
        <h1>Dashboard</h1>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <BrandingKitIconButton
          name="refresh"
          onClick={handleRefresh}
          tooltip="Refresh data"
        />
        <BrandingKitIconButton
          name="settings"
          onClick={handleSettings}
          tooltip="Settings"
        />
      </div>
    </div>
  );
}
```

### Status Badge with Icon

```tsx
import { BrandingKitIcon } from '@/components/ui/BrandingKitIcon';

interface StatusBadgeProps {
  status: 'success' | 'error' | 'warning' | 'info';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const iconMap = {
    success: 'check_circle',
    error: 'error_circle',
    warning: 'warning_circle',
    info: 'info',
  };

  const colorMap = {
    success: '#60BA46',
    error: '#D64545',
    warning: '#FAB915',
    info: '#235393',
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <BrandingKitIcon 
        name={iconMap[status] as any}
        size="sm"
        style={{ color: colorMap[status] }}
      />
      <span>{status}</span>
    </div>
  );
}
```

### Filter Panel with Icons

```tsx
import { BrandingKitIcon, BrandingKitIconButton } from '@/components/ui/BrandingKitIcon';

export function FilterPanel() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <BrandingKitIconButton
        name="filter"
        size="md"
        onClick={() => setIsOpen(!isOpen)}
        tooltip={isOpen ? 'Hide filters' : 'Show filters'}
      />
      
      {isOpen && (
        <div style={{ padding: 16, border: '1px solid #ddd' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BrandingKitIcon name="search" size="sm" />
            <input placeholder="Search..." />
          </div>
          
          <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
            <BrandingKitIconButton
              name="refresh"
              size="sm"
              onClick={() => console.log('Reset filters')}
              tooltip="Reset"
            />
            <BrandingKitIconButton
              name="close"
              size="sm"
              onClick={() => setIsOpen(false)}
              tooltip="Close"
            />
          </div>
        </div>
      )}
    </div>
  );
}
```

### Transaction Table with Status Icons

```tsx
import { BrandingKitIcon } from '@/components/ui/BrandingKitIcon';

interface Transaction {
  id: string;
  type: 'send' | 'receive';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
}

export function TransactionRow({ tx }: { tx: Transaction }) {
  const statusIcon = {
    completed: 'check_circle',
    pending: 'clock',
    failed: 'error_circle',
  };

  const directionIcon = {
    send: 'arrow_left',
    receive: 'arrow_right',
  };

  return (
    <tr>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <BrandingKitIcon name={directionIcon[tx.type]} size="md" />
          <span>{tx.type}</span>
        </div>
      </td>
      <td>${tx.amount.toFixed(2)}</td>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <BrandingKitIcon 
            name={statusIcon[tx.status]} 
            size="sm"
            state={tx.status === 'completed' ? 'active' : 'inactive'}
          />
          <span>{tx.status}</span>
        </div>
      </td>
    </tr>
  );
}
```

## Theme Support

Icons automatically detect and adapt to light/dark themes:

```tsx
// Automatically uses light theme
<BrandingKitIcon name="bell" />

// Explicitly set theme
<BrandingKitIcon name="bell" theme="dark" />

// Theme is detected from document[data-theme]
// Set in your app root: document.documentElement.setAttribute('data-theme', 'dark')
```

## Size Reference

| Size | Pixels | Use Case |
|------|--------|----------|
| `xs` | 16px | Inline, small UI |
| `sm` | 20px | Form inputs, badges |
| `md` | 24px | Standard, buttons |
| `lg` | 32px | Large buttons, cards |
| `xl` | 48px | Headers, featured |
| `2xl` | 64px | Showcases |
| Custom | any | `size={40}` |

## Accessibility

The icon system includes built-in accessibility features:

1. **Automatic Alt Text**: Generated from icon name
2. **ARIA Labels**: For screen readers
3. **Semantic HTML**: Proper roles and attributes
4. **Keyboard Support**: IconButton supports Tab and Enter/Space
5. **Focus Indicators**: Proper focus management

### Accessibility Examples

```tsx
// Icon with custom alt text
<BrandingKitIcon 
  name="check_circle"
  alt="Payment successful"
/>

// Icon button with aria-label
<BrandingKitIconButton
  name="trash"
  onClick={handleDelete}
  ariaLabel="Delete transaction"
/>

// Non-interactive icon (screen reader ignored)
<BrandingKitIcon 
  name="arrow_right"
  ariaLabel={false}
/>
```

## Performance Notes

- Icons are PNG files (24px and 48px) - automatically scaled
- Zero JavaScript overhead - simple `<img>` elements
- Supports CSS transforms and effects
- Respects theme changes via `data-theme` attribute

## Styling & Customization

```tsx
// CSS classes approach
<BrandingKitIcon name="bell" className="hover:opacity-75" />

// Inline styles
<BrandingKitIcon 
  name="bell" 
  style={{ 
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
    transition: 'opacity 0.2s'
  }}
/>

// Dynamic styling
<BrandingKitIcon 
  name="trending_up"
  style={{ color: price > 0 ? '#60BA46' : '#D64545' }}
/>
```

## Troubleshooting

### Icon not appearing
1. Check that the icon name is in `ICON_CATALOG`
2. Verify the branding kit path is correct
3. Check browser console for 404 errors

### Wrong icon showing
1. Verify the `state` prop (active vs inactive)
2. Check the `theme` prop or `data-theme` attribute
3. Clear browser cache

### Styling not applied
1. Use `className` or `style` prop directly on icon
2. Ensure CSS is properly scoped
3. Check for conflicting styles

## API Reference

### `getIconPath(name, size, state, theme)`

Utility function to get the path to an icon file.

```tsx
import { getIconPath } from '@/lib/icons';

const path = getIconPath('bell', 24, 'active', 'light');
// Returns: ../../../../shared/branding-kit/SwipeSavvy_VisualAssets_MasterPack_v1/icons/png/light_active/bell_24.png
```

### `ICON_CATALOG`

Complete list of available icon names.

```tsx
import { ICON_CATALOG } from '@/lib/icons';

Object.values(ICON_CATALOG).forEach(icon => console.log(icon));
```

### `ICON_METADATA`

Information about each icon (label, category, available sizes).

```tsx
import { ICON_METADATA } from '@/lib/icons';

const bellInfo = ICON_METADATA['bell'];
// { label: 'Notifications', category: 'navigation', sizes: [24, 48] }
```

## Future Enhancements

- [ ] SVG versions for better scalability
- [ ] Icon variations (outlined, filled)
- [ ] Custom color overlays
- [ ] Animation presets
- [ ] Storybook documentation
- [ ] Icon search utility
