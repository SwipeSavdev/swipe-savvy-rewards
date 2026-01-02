# SwipeSavvy Icon System - Quick Start Guide

## 🎯 What's Ready

Your admin portal now has a fully integrated icon system using the SwipeSavvy branding kit. All 80+ icons are available for use with automatic theme detection, multiple sizes, and full accessibility support.

---

## ⚡ 30-Second Quick Start

### 1. Import the Icon Component
```tsx
import { BrandingKitIcon } from '@/components/ui/BrandingKitIcon';
```

### 2. Use an Icon
```tsx
<BrandingKitIcon name="bell" size="md" />
```

### 3. Make it Interactive
```tsx
import { BrandingKitIconButton } from '@/components/ui/BrandingKitIcon';

<BrandingKitIconButton
  name="trash"
  onClick={() => handleDelete()}
  tooltip="Delete"
/>
```

That's it! 🎉

---

## 📚 Quick Reference

### Common Icons

| Need | Icon Name |
|------|-----------|
| Delete | `trash` |
| Add/New | `plus` |
| Edit | `edit` |
| Search | `search` |
| Menu | `menu` |
| Settings | `settings` |
| Bell/Notifications | `bell` |
| Checkmark | `check_circle` |
| Error | `error_circle` |
| Warning | `warning_circle` |
| Home | `home` |
| Dashboard | `dashboard` |
| User | `user` |
| Users | `users` |
| Close/Dismiss | `close` |
| Send | `send` |
| Download | `download` |
| Upload | `upload` |
| Refresh | `refresh` |
| Filter | `filter` |

### Common Sizes

```tsx
<BrandingKitIcon name="bell" size="xs" />   {/* 16px */}
<BrandingKitIcon name="bell" size="sm" />   {/* 20px */}
<BrandingKitIcon name="bell" size="md" />   {/* 24px - default */}
<BrandingKitIcon name="bell" size="lg" />   {/* 32px */}
<BrandingKitIcon name="bell" size="xl" />   {/* 48px */}
<BrandingKitIcon name="bell" size="2xl" />  {/* 64px */}
<BrandingKitIcon name="bell" size={40} />   {/* Custom size */}
```

---

## 💡 Real-World Examples

### Status Badge
```tsx
<div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
  <BrandingKitIcon name="check_circle" size="sm" />
  <span>Complete</span>
</div>
```

### Action Button
```tsx
<BrandingKitIconButton
  name="trash"
  onClick={handleDelete}
  tooltip="Delete this item"
/>
```

### Header with Icon
```tsx
<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
  <BrandingKitIcon name="dashboard" size="lg" />
  <h2>Dashboard</h2>
</div>
```

### Table with Icons
```tsx
<tr>
  <td>
    <BrandingKitIcon name="check_circle" size="md" />
  </td>
  <td>Payment processed</td>
</tr>
```

---

## 🎨 Theming

Icons automatically adapt to light/dark theme:

```tsx
// Auto-detection (recommended)
<BrandingKitIcon name="bell" />

// Explicit dark theme
<BrandingKitIcon name="bell" theme="dark" />

// Explicit light theme
<BrandingKitIcon name="bell" theme="light" />
```

To change the app theme:
```tsx
document.documentElement.setAttribute('data-theme', 'dark');
// All icons automatically update!
```

---

## ✨ Pro Tips

### Disabled State
```tsx
<BrandingKitIconButton
  name="trash"
  onClick={() => {}}
  disabled={true}
/>
```

### Custom Styling
```tsx
<BrandingKitIcon 
  name="bell" 
  style={{ 
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
    opacity: 0.8
  }}
/>
```

### Conditional Icons
```tsx
const statusIcon = {
  success: 'check_circle',
  error: 'error_circle',
  warning: 'warning_circle',
}[status];

<BrandingKitIcon name={statusIcon as IconName} />
```

### Icon Sets
```tsx
import { BrandingKitIconSet } from '@/components/ui/BrandingKitIcon';

<BrandingKitIconSet 
  icons={['check', 'close', 'warning_circle']}
  size="md"
/>
```

---

## 🔍 Browse All Icons

Visit the icon gallery to see all 80+ icons:
**http://localhost:5175/tools/icon-system**

Features:
- Search icons by name
- Size comparison
- State variations
- Usage examples

---

## 📖 Full Documentation

For detailed information, see:
- **ICON_SYSTEM_GUIDE.md** - Complete guide with 100+ examples
- **ICON_SYSTEM_INTEGRATION.md** - Integration checklist
- **DEVELOPMENT_SETUP_COMPLETE.md** - Setup overview

---

## 🆘 Need Help?

### Icon not showing?
1. Check the icon name in the demo page
2. Ensure it's a valid icon name
3. Check browser console for errors

### Want to use a custom size?
```tsx
<BrandingKitIcon name="bell" size={36} />
```

### Want specific accessibility text?
```tsx
<BrandingKitIcon 
  name="check_circle"
  alt="Payment completed"
  ariaLabel="Confirm: Payment successfully processed"
/>
```

### Need to add an icon?
Add new icons from `shared/branding-kit/SwipeSavvy_VisualAssets_MasterPack_v1/icons/`

---

## 🚀 Next Steps

### For Beginners
1. Visit http://localhost:5175/tools/icon-system
2. Try copying examples from the demo
3. Add icons to your components
4. Check ICON_SYSTEM_GUIDE.md for API reference

### For Advanced Users
1. Create custom icon wrapper components
2. Build icon + text combinations
3. Create icon themes and variations
4. Optimize icon loading with preloading

---

## 📊 Icon System Stats

- **Available Icons**: 80+
- **Sizes**: 6 presets + custom
- **Themes**: Light/Dark with auto-detection
- **States**: Active/Inactive
- **TypeScript**: Full type safety
- **Accessibility**: WCAG 2.1 AA compliant

---

## ✅ Checklist for Using Icons

- [ ] Imported `BrandingKitIcon` in your component
- [ ] Chose the right icon name (check demo page)
- [ ] Set appropriate size for context
- [ ] Added alt text for accessibility
- [ ] Tested in both light and dark themes
- [ ] Verified on mobile devices

---

## 💬 Questions?

Check the documentation:
1. **Quick answer?** → Check this file (QUICK_START.md)
2. **Detailed info?** → See ICON_SYSTEM_GUIDE.md
3. **Integration help?** → See ICON_SYSTEM_INTEGRATION.md
4. **See examples?** → Visit /tools/icon-system demo

---

**Ready to build awesome UIs with icons!** 🎨✨
