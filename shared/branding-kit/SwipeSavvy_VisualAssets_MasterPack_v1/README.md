# Swipe Savvy — Visual Assets Pack (v1)

This pack contains **icons**, **UI component sheets**, **portal templates**, and **design tokens** for the Swipe Savvy internal reporting dashboards (Master Web Portal).

## Contents

- `tokens/`
  - `swipesavvy.tokens.v1.json` – source tokens (light + dark)
  - `swipesavvy.tokens.v1.css` – CSS variables (`:root` + `[data-theme="dark"]`)
  - `swipesavvy.chart-theme.v1.json` – Chart.js/ECharts theme starter

- `icons/svg/`
  - `outline/` – clean 2px rounded outline icons
  - `duotone/` – modern “soft fill” (uses `fill-opacity`)

- `icons/png/`
  - `light_active/`, `light_inactive/`, `dark_active/`, `dark_inactive/`
  - Each icon has `24px` and `48px` exports: `iconname_24.png`, `iconname_48.png`

- `components/`
  - `svg/componentsheet_light.svg` + `svg/componentsheet_dark.svg`
  - PNG exports for quick preview

- `templates/`
  - Portal shell templates with **grid overlay** (light/dark)
  - Empty states (no data / no access / error / loading) in both themes

## Icon usage (recommended)

Use SVGs in your portal code and control color/opacity via CSS:

```css
.navIcon {
  color: var(--ss-text);
  opacity: var(--ss-opacity-icon-inactive);
}
.navItemActive .navIcon {
  color: var(--ss-primary);
  opacity: 1;
}
```

- Prefer `duotone/` icons for a more “modern cool” look.
- Keep icons on a **24px grid** with **2px stroke** and rounded caps/joins.

## Theme usage

Apply dark mode by toggling an attribute:

```html
<body data-theme="dark">
```

All tokens are mapped to CSS variables in `swipesavvy.tokens.v1.css`.

## Notes

- Fonts: Hermes (headlines) + Barlow (body). If not installed, use fallback and replace before final publishing.
- This pack is intended for internal reporting UI (employees only).