# Swipe Savvy — Unified Website Build Prompt (Consumer + Merchant + Support)

You are building a modern, clean, responsive marketing site for **Swipe Savvy** (company + merchant rewards engine) and **Shop Savvy** (consumer Visa debit references).

## Files you have
- `index.html` — unified single-page site (consumer + merchant + CDP + support + references)
- `assets/logos/`
  - `swipe_savvy_color.png` / `swipe_savvy_white.png` (company + merchants)
  - `shop_savvy_color.png` / `shop_savvy_white.png` (Visa debit references)
- `assets/cards/shop_savvy_hero_card_w1024.png` (+ 2048 version)
- `handoff/design-tokens.json` — brand tokens
- `references/mobile-app-prototype.html` — mobile app UI reference used to style the hero “app home sample”

## What to build (preferred)
Convert the unified HTML into a modern componentized app:
- Next.js / React (or Vue/Svelte if requested)
- Tailwind (optional) using the tokens in `design-tokens.json`
- Keep the same structure and copy, but make components reusable.

### Required pages / routes
Even though the current design is single-page, create routes that render the same sections:
- `/` consumer + hero + features + waitlist
- `/merchants` merchant hero + benefits + demo
- `/cdp` CDP + cohorts deep dive
- `/support` Support center + Savvy AI widget

### Support AI widget
For now, keep the widget as **docs-based demo**:
- Use the same local knowledge base array and simple search scoring.
- Implement clean UI + chat bubbles.
- Add an integration point where an LLM call can be plugged in later.

## Branding rules (IMPORTANT)
- **No Mastercard or mCards anywhere.**
- Use **Shop Savvy logo** for Visa debit card references and card imagery.
- Use **Swipe Savvy logo** for company branding and merchant rewards engine.

## Output expectations
- Clean, modern CSS or Tailwind utility styles.
- Mobile-first and responsive.
- Use semantic HTML and accessibility attributes.
- Keep the same look/feel as the provided `index.html`.

Start by reading `index.html` and replicating the design 1:1, then refactor into components.
