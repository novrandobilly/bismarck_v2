---
name: Envien Bagel
description: Homemade sourdough bagel pre-orders — warm, artisanal, community-rooted.
colors:
  crust-gold: "#c87a1e"
  crust-gold-deep: "#a5621a"
  crust-gold-light: "#fdf0dc"
  warm-cream: "#faf6f0"
  surface-white: "#fefcf8"
  kraft-border: "#e4d9cc"
  kraft-border-soft: "#f0e8dd"
  ink-dark: "#1e1510"
  ink-medium: "#5c4d3d"
  ink-light: "#9e8c7c"
  flour-dust: "#f2ebe2"
  session-open-text: "#3a6b3a"
  session-open-bg: "#e8f3e8"
  session-open-dot: "#4a9a4a"
  danger: "#c0392b"
  danger-hover: "#a33225"
typography:
  display:
    fontFamily: "'Playfair Display', Georgia, serif"
    fontSize: "clamp(2.25rem, 7vw, 3.5rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "'Playfair Display', Georgia, serif"
    fontSize: "clamp(1.5rem, 4vw, 2.25rem)"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "normal"
  title:
    fontFamily: "'Playfair Display', Georgia, serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "normal"
  body:
    fontFamily: "'DM Sans', system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "normal"
  label:
    fontFamily: "'DM Sans', system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.1em"
rounded:
  sm: "6px"
  md: "10px"
  lg: "14px"
  xl: "20px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
  "2xl": "64px"
components:
  button-primary:
    backgroundColor: "{colors.crust-gold}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.lg}"
    padding: "12px 28px"
    typography: "{typography.body}"
  button-primary-hover:
    backgroundColor: "{colors.crust-gold-deep}"
  button-dark:
    backgroundColor: "{colors.ink-dark}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.lg}"
    padding: "12px 28px"
  button-outline:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.ink-dark}"
    rounded: "{rounded.lg}"
    padding: "10px 24px"
  button-danger:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.lg}"
    padding: "10px 24px"
  card:
    backgroundColor: "{colors.surface-white}"
    rounded: "{rounded.xl}"
    padding: "20px"
  card-highlight:
    backgroundColor: "{colors.crust-gold-light}"
    rounded: "{rounded.xl}"
    padding: "20px"
  input:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.ink-dark}"
    rounded: "{rounded.md}"
    padding: "10px 14px"
  badge-open:
    backgroundColor: "{colors.session-open-bg}"
    textColor: "{colors.session-open-text}"
    rounded: "{rounded.full}"
    padding: "4px 10px"
---

# Design System: Envien Bagel

## 1. Overview

**Creative North Star: "The Baker's Handwritten Menu"**

This is the visual identity of a baker who writes their specials on a chalkboard, wraps orders in kraft paper, and knows half their customers by name. The design draws warmth from honest materials: cream, off-white, the color of baked crust, the grain of natural paper. It rejects the clinical cleanliness of corporate food delivery and the glass-and-gradient sheen of tech startups. Every surface should feel like it was made by hand, not assembled from a template.

The interface is primarily experienced on a smartphone, shared from Instagram or a personal chat. It must feel natural at thumb reach: generous tap targets, no tiny type, no interaction that requires precise pointer accuracy. The desktop admin experience is functional clarity — the baker needs to see their orders, not admire the interface.

This system explicitly rejects: fast-food corporate production-line aesthetics; SaaS gradient-hero + metric-card layouts; cold minimalist Japanese grid design.

**Key Characteristics:**
- Warm cream backgrounds instead of pure white
- Sourdough Crust gold as the single brand accent, used sparingly
- Playfair Display for all headings — serif warmth and editorial weight
- DM Sans for body and UI copy — clean, friendly, unpretentious
- Flat elevation, border-defined surfaces, no decorative shadows
- Organic rhythm in spacing — layouts breathe unevenly, like a hand-set menu

## 2. Colors: The Kraft & Crust Palette

A two-family palette: warm neutrals derived from natural kraft paper and flour, anchored by one deep amber-gold accent — the color of a well-baked sourdough crust.

### Primary
- **Sourdough Crust** (`#c87a1e` / `oklch(0.60 0.14 58)`): The brand accent. Used on primary CTAs, key interactive states, brand labels, and open-session indicators. Never decorative — every appearance of this color means something is actionable or important.
- **Sourdough Crust Deep** (`#a5621a`): Hover state for Crust Gold buttons and interactive elements. Slightly darker, same warmth.
- **Sourdough Crust Light** (`#fdf0dc`): Light amber tint for highlighted cards, active session banners, and selected-state backgrounds.

### Neutral
- **Warm Cream** (`#faf6f0`): Page background. Not white — there is always a trace of warmth in every surface.
- **Surface White** (`#fefcf8`): Card, input, and panel surfaces. Slightly cooler than Warm Cream to create visible layer separation without shadows.
- **Kraft Border** (`#e4d9cc`): Standard border — dividers, card outlines, input frames.
- **Kraft Border Soft** (`#f0e8dd`): Subtle dividers within sections, quiet separation.
- **Flour Dust** (`#f2ebe2`): Lightest tint surface — section backgrounds, badge fills, image placeholder tones.
- **Ink Dark** (`#1e1510`): Primary headings and high-emphasis text. A near-black with a warm undertone — not pure `#000`.
- **Ink Medium** (`#5c4d3d`): Body copy, secondary UI text.
- **Ink Light** (`#9e8c7c`): Muted labels, metadata, placeholder text.

### Named Rules
**The One Crust Rule.** Sourdough Crust gold appears on one primary CTA per screen. Its presence signals the most important action. It is never used decoratively — no borders, no tinted section backgrounds (use Crust Light for that), no purely ornamental highlights.

**The No Pure White Rule.** Every background surface carries a trace of warmth. `#ffffff` and `#000000` are not in this system. `surface-white` is the closest to white; `ink-dark` is the closest to black.

## 3. Typography: The Serif+Sans Contrast

**Display Font:** Playfair Display (with Georgia, serif fallback)
**Body Font:** DM Sans (with system-ui, sans-serif fallback)

**Character:** Playfair Display brings editorial warmth and old-world craft to headings — it's the font of a printed menu card, not a startup's hero banner. DM Sans keeps body copy approachable and legible at small sizes; its slight geometric friendliness balances the seriousness of the serif.

### Hierarchy
- **Display** (700, clamp(2.25rem, 7vw, 3.5rem), 1.1 leading, −0.01em tracking): Page and section hero titles — "Envien Bagel", menu section headers.
- **Headline** (600, clamp(1.5rem, 4vw, 2.25rem), 1.2 leading): Secondary content titles, modal or page section headings.
- **Title** (600, 1.125rem, 1.35 leading): Card titles, item names, session titles.
- **Body** (400, 0.9375rem, 1.65 leading): All descriptive copy, order details, notes, and supporting text. Keep lines to 65ch max.
- **Label** (DM Sans, 600, 0.6875rem, 0.1em letter-spacing, uppercase): Section overlines, category chips, status badges, field labels.

### Named Rules
**The Serif Heading Rule.** Every heading that communicates brand identity (page title, product names, session titles) uses Playfair Display. DM Sans handles all UI chrome (buttons, form labels, navigation, chips, metadata).

**The Overline Pattern.** Section labels above headings use Label style: uppercase, tracked, ink-light. Example: "Current Pre-Order" above the open session banner. No decorative dividers needed when the overline is present.

## 4. Elevation

This system is flat by default. Depth is conveyed through tonal layering (cream → surface-white) and border definition, not shadow.

The only shadows in the system are **responsive** — they appear as a live reaction to user state, not as decoration:
- Cards gain `box-shadow: 0 2px 12px oklch(0.15 0.03 55 / 0.08)` on hover, signaling interactivity.
- Modals and dropdowns use `box-shadow: 0 8px 40px oklch(0.15 0.03 55 / 0.14)` to lift them clearly above the page layer.

### Named Rules
**The Flat-by-Default Rule.** Nothing has a shadow at rest. Shadows are a signal, not a finish.

## 5. Components

### Buttons

Character: solid, warm, generous — a button should feel like something a person made, not a system element.

- **Shape:** `rounded-[14px]` — softer than pill, more substantial than square
- **Primary (CTA):** Sourdough Crust gold background, surface-white text, 12px 28px padding. Hover: Crust Deep. Disabled: 60% opacity. This is the main action button (Place Order, Order Now).
- **Dark:** Ink Dark background, surface-white text. Secondary confirmed actions in admin.
- **Outline:** Surface-white background, Kraft Border border, Ink Dark text. Tertiary actions.
- **Outline-Amber:** Transparent background, Crust Gold border + text. Soft CTAs, upsell nudges.
- **Ghost:** Transparent background, underlined text in Ink Medium. Least emphasis — cancel, back, see more.
- **Danger:** Danger red background, white text. Destructive actions only — delete, remove.

### Cards

Character: clean and bordered, like a notecard.

- Surface-white background, Kraft Border (`#e4d9cc`) 1px border, `rounded-[20px]`
- Hover state on interactive cards: shadow (`0 2px 12px oklch(0.15 0.03 55 / 0.08)`)
- Highlighted cards (open sessions, active items): Crust Gold Light background instead of Surface-white
- No nested cards. No card-within-card at any level.

### Inputs & Form Fields

- Surface-white background, Kraft Border border, `rounded-[10px]`
- Focus ring: 2px Sourdough Crust at 40% opacity — `outline: 2px solid oklch(0.60 0.14 58 / 0.4)`
- Labels: Label typestyle above the field, Ink Medium color
- Error state: border shifts to `#c0392b`, error message in Ink Medium below the field

### Badges / Status Chips

- **Open session:** session-open-bg fill, session-open-text color, 4px 10px padding, rounded-full
- **Category / taxonomy:** Flour Dust background, Crust Gold border (1px), Ink Medium text
- Animate-pulse green dot for "live" status (keep the existing pattern)

### Image Placeholders

When no product image exists, use a Flour Dust (`#f2ebe2`) background with a centered bagel emoji at a large size and a short Label-style caption. Never show a broken image state.

### Section Overlines

Before every major content section, a Label-style overline in Ink Light, uppercase, tracked. No underlines, no decorative lines. The overline alone creates sufficient visual hierarchy when paired with a Display or Headline below it.

## 6. Do's and Don'ts

**Do** use Playfair Display for every heading that names something — bagel names, session titles, the store name.
**Don't** use Playfair Display for UI labels, buttons, form copy, or navigation items.

**Do** use Sourdough Crust gold for exactly one primary CTA per screen.
**Don't** sprinkle it as decoration, dividers, highlighted text, or background tints (use Crust Light for backgrounds).

**Do** keep backgrounds warm — warm-cream for page, surface-white for cards and panels.
**Don't** use pure `#ffffff` or `#f5f5f5`-style cold grey anywhere in the customer-facing UI.

**Do** give touch targets on mobile at least 44px tall. Ordering happens on phones.
**Don't** make interactive elements rely on hover-only affordance — everything must be clear at rest.

**Do** use the overline + headline pattern to introduce sections.
**Don't** add decorative horizontal rules, colored side-borders, or gradient dividers between sections.

**Do** let images carry warmth. When a product image isn't available, the Flour Dust placeholder should feel intentional, not broken.
**Don't** use emoji as decorative graphic elements in production — they're fine for placeholder states but should be replaced by photos or SVG illustrations when possible.
