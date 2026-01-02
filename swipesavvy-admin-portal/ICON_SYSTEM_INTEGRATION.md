/**
 * Icon System Integration Index
 * Quick reference for icon system usage across the admin portal
 */

## Integration Status

✅ **Icon Library Created**
- Location: `src/lib/icons/index.ts`
- Contains: Icon catalog, metadata, size definitions, path utilities
- 80+ icons available from SwipeSavvy branding kit

✅ **Icon Components Created**
- Location: `src/components/ui/BrandingKitIcon.tsx`
- Components: BrandingKitIcon, BrandingKitIconButton, BrandingKitIconSet
- Features: Automatic theme detection, size scaling, state management

✅ **Components Updated with Icon System**
- Header.tsx: Updated menu, search, and notification icons
- Sidebar.tsx: Updated navigation icons and chevrons
- Using: BrandingKitIcon for consistent icon rendering

✅ **Demo Page Created**
- Location: `src/pages/IconSystemDemo.tsx`
- Features: Icon gallery, size reference, button states, usage patterns

## Quick Start Examples

### Using the Icon Component

```tsx
import { BrandingKitIcon } from '@/components/ui/BrandingKitIcon';

// Basic usage
<BrandingKitIcon name="bell" size="md" />

// With state
<BrandingKitIcon name="check_circle" state="active" />

// Custom size
<BrandingKitIcon name="dashboard" size={32} />

// Dark theme
<BrandingKitIcon name="settings" theme="dark" />
```

### Using Icon Button

```tsx
import { BrandingKitIconButton } from '@/components/ui/BrandingKitIcon';

<BrandingKitIconButton
  name="trash"
  onClick={() => handleDelete()}
  tooltip="Delete item"
/>
```

## Available Icon Sizes

- `xs` (16px) - Inline, small UI
- `sm` (20px) - Form inputs, badges
- `md` (24px) - Standard buttons
- `lg` (32px) - Large buttons
- `xl` (48px) - Headers
- `2xl` (64px) - Showcases
- Custom: `size={40}`

## Common Icons by Category

### Navigation
- menu, bell, calendar, dashboard, home, settings, gear, search, user, users, wallet

### Status
- check, check_circle, error_circle, warning_circle, info, help_circle, alert_circle

### Actions
- close, plus, edit, trash, download, upload, refresh, send, share, copy, filter, sort

### Financial
- credit_card, trending_up, trending_down, arrow_up, arrow_down, arrow_left, arrow_right

### Communication
- envelope, phone, message, chat, paperclip

## Theme Support

Icons automatically detect the document theme:

```tsx
// Auto-detects from data-theme attribute
<BrandingKitIcon name="bell" />

// Explicit theme
<BrandingKitIcon name="bell" theme="dark" />
```

## File Locations

- Icons Library: `src/lib/icons/index.ts`
- Icon Components: `src/components/ui/BrandingKitIcon.tsx`
- Demo Page: `src/pages/IconSystemDemo.tsx`
- Documentation: `ICON_SYSTEM_GUIDE.md`
- Source Icons: `shared/branding-kit/SwipeSavvy_VisualAssets_MasterPack_v1/icons/`

## Next Steps

1. ✅ Icon system created and integrated into Header/Sidebar
2. ⏳ Integration into dashboard cards and tables
3. ⏳ Integration into form components
4. ⏳ Integration into status badges and alerts
5. ⏳ Storybook documentation
6. ⏳ Performance optimization (icon preloading)

## Performance Notes

- Icons are PNG files (24px and 48px) - automatically scaled
- No JavaScript overhead - simple `<img>` elements
- Supports CSS transforms and effects
- Theme switching is CSS-based (no re-renders)

## Accessibility

- Automatic alt text generation from icon names
- ARIA labels for screen readers
- Semantic HTML structure
- Keyboard support for IconButton components
- Focus indicators for accessibility

## Troubleshooting

**Icon not appearing?**
1. Check icon name in ICON_CATALOG
2. Verify branding kit path is correct
3. Check browser console for 404 errors

**Wrong icon showing?**
1. Verify state prop (active vs inactive)
2. Check theme prop or data-theme attribute
3. Clear browser cache

**Styling not applied?**
1. Use className or style prop on component
2. Ensure no conflicting styles
3. Check CSS specificity

## Support & Questions

For icon system usage questions, see:
- ICON_SYSTEM_GUIDE.md - Full documentation
- IconSystemDemo.tsx - Example implementations
- BrandingKitIcon.tsx - Component API documentation
