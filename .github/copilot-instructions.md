# Copilot Instructions

## Project Overview

**Envien Bagel** — a pre-order management system for a bagel shop. Customers browse the menu and place orders via a public-facing storefront; admins manage sessions, orders, menu items, and payments through a protected dashboard at `/bismarck/*`.

Stack: React 19 + TypeScript + Vite, Supabase (auth, PostgreSQL, storage), TanStack Query, React Hook Form + Zod, Tailwind CSS v4.

## Commands

```bash
yarn dev       # start dev server (port 5173)
yarn build     # type-check + production build (tsc -b && vite build)
yarn lint      # ESLint
```

No test suite exists.

## Architecture

### Two user realms

| Realm | Routes | Layout |
|-------|--------|--------|
| Guest/Customer | `/`, `/menu`, `/order/:sessionId`, `/session/:sessionId/orders`, `/upload-proof` | `GuestWrapper` |
| Admin | `/bismarck/*` | `ProtectedRoute` → `AdminWrapper` |

`ProtectedRoute` checks Supabase auth via `useAuth`; unauthenticated users are redirected to `/bismarck/login`.

### Data flow

All data fetching uses **TanStack Query** with direct Supabase client calls inside custom hooks. There is no API layer — hooks call `supabase.from(...)` directly. Mutations use `useMutation`; reads use `useQuery`.

The Supabase client is a singleton exported from `src/lib/supabase/index.ts`. Required env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.

### Database schema (key tables)

- `menu_items` — the product catalog
- `preorder_sessions` — a time-bounded ordering window with deadline, max orders, and fulfillment config
- `preorder_session_items` — menu items enabled for a specific session, with per-session pricing
- `orders` / `order_items` — customer orders linked to a session
- `custom_locations` on `preorder_sessions` is a **JSONB array** of `{ name, time }` objects

### Storage buckets

- `menu-images` — product photos; helpers in `src/lib/supabase/storage.ts`
- `payment-proofs` — customer payment proof uploads; helpers in `src/lib/supabase/payment-storage.ts`

### Modal system

A custom portal-based modal: wrap with `ModalProvider`, then call `useModal()` to get `open(node)` / `close()`. The modal content is rendered via React portal into `document.body`.

## Key Conventions

### Path alias

`@/` resolves to `src/`. Always use `@/` imports, never relative `../../`.

### Classname utility

Use `cn()` from `@/lib/utils/cn` (clsx + tailwind-merge) for all conditional or merged class names.

### Page structure

Complex pages decompose into co-located subdirectories:

```
pages/order/
  index.tsx          # page component — assembles features, passes form + data
  hooks/
    useSession/      # data fetching
    useOrderForm/    # form state
    useSubmitOrder/  # mutation
  features/
    MenuSection.tsx
    CustomerDetails.tsx
    ...
```

### Exports

- **Pages**: default exports (`export default function OrderPage`)
- **Components, hooks, utilities**: named exports

### UI components

`BismarckButton` (`src/components/BismarckButton.tsx`) is the standard button. Use its `variant` (`primary` | `dark` | `outline` | `outline-amber` | `ghost` | `danger`) and `size` (`sm` | `md` | `lg` | `full`) props rather than ad-hoc button styling.

### Tailwind color palette

- **Amber** (`amber-500` / `amber-600`) — primary CTAs, brand accents
- **Stone** (`stone-50` through `stone-900`) — backgrounds, text, borders
- Red for destructive actions; no other color families are used

### Currency formatting

Use `formatRupiah` from `src/tools/formatRupiah.ts` for all price display.

### Forms

All forms use `react-hook-form` with a **Zod schema** for validation. Resolver is `@hookform/resolvers/zod`.

### Session closure logic

A session is considered closed if: `status === 'closed'`, OR the `order_deadline` has passed, OR `max_orders > 0 && orderCount >= max_orders`. This logic lives in `src/pages/order/index.tsx` (`isSessionClosed`).
