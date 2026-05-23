# PocketBase → Supabase Migration Design

**Date:** 2026-05-23  
**Scope:** Full replacement of all PocketBase logic in `bismarck_v2` frontend with Supabase. No UI changes. Business logic preserved.

---

## 1. Architecture Overview

### What's removed
- `pocketbase` npm package
- `src/lib/pocketbase/index.ts`
- All `import { pb } from '@/lib/pocketbase'` references
- PocketBase-specific type fields (`collectionId`, `collectionName`, `RecordModel` from pocketbase)

### What's added
- `@supabase/supabase-js` npm package
- `src/lib/supabase/index.ts` — exports a single `supabase` client instance
- `src/lib/supabase/storage.ts` — helper to build public image URLs from storage paths

### Environment variables
| Old | New |
|-----|-----|
| `VITE_POCKETBASE_URL` | `VITE_SUPABASE_URL` |
| *(none)* | `VITE_SUPABASE_ANON_KEY` |

---

## 2. Auth

### Strategy
Single admin user managed via Supabase Auth (email + password). Created manually in the Supabase dashboard.

### Mapping
| PocketBase | Supabase |
|---|---|
| `pb.collection('_superusers').authWithPassword(identity, password)` | `supabase.auth.signInWithPassword({ email, password })` |
| `pb.authStore.isValid` | `session !== null` from `supabase.auth.getSession()` |
| `pb.authStore.model` | `session.user` |
| `pb.authStore.onChange(cb)` | `supabase.auth.onAuthStateChange(cb)` |
| `pb.authStore.clear()` | `supabase.auth.signOut()` |

### Files changed
- `src/hooks/useAuth/index.ts` — subscribes to `onAuthStateChange`, reads initial session
- `src/hooks/useLogout/index.ts` — calls `supabase.auth.signOut()`
- `src/pages/bismarck/login/hooks/useAdminLogin/index.ts` — calls `signInWithPassword`

---

## 3. Database Schema

All table names stay the same as existing PocketBase collection names.

### New table: `categories`
```sql
create table categories (
  id   uuid primary key default gen_random_uuid(),
  name text not null unique
);
```

### `menu_items`
```sql
create table menu_items (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  description   text not null default '',
  default_price numeric not null,
  category      text references categories(name),
  image         text not null default '',  -- storage path in menu-images bucket
  is_active     bool not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
```

### `preorder_sessions`
```sql
create table preorder_sessions (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  description      text not null default '',
  fulfillment_date timestamptz not null,
  order_deadline   timestamptz not null,
  max_orders       int not null default 0,
  status           text not null default 'open',  -- 'open' | 'closed'
  allow_pickup     bool not null default false,
  allow_delivery   bool not null default false,
  custom_locations jsonb not null default '[]',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
```

### `preorder_session_items`
```sql
create table preorder_session_items (
  id                 uuid primary key default gen_random_uuid(),
  preorder_session   uuid not null references preorder_sessions(id) on delete cascade,
  menu_item          uuid not null references menu_items(id),
  price              numeric not null,
  is_available       bool not null default true,
  created_at         timestamptz not null default now()
);
```

### `orders`
```sql
create table orders (
  id                 uuid primary key default gen_random_uuid(),
  preorder_session   uuid not null references preorder_sessions(id),
  customer_name      text not null,
  whatsapp           text not null,
  fulfillment_type   text not null,  -- 'pickup' | 'delivery' | 'custom'
  delivery_address   text not null default '',
  custom_location    text not null default '',
  notes              text not null default '',
  is_fulfilled       bool not null default false,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
```

### `order_items`
```sql
create table order_items (
  id                      uuid primary key default gen_random_uuid(),
  order_id                uuid not null references orders(id) on delete cascade,
  preorder_session_item   uuid not null references preorder_session_items(id),
  quantity                int not null,
  created_at              timestamptz not null default now()
);
```

> **Note:** The column is named `order_id` (not `order`) to avoid collision with the SQL reserved word.

---

## 4. Query Patterns

### Basic CRUD mapping
| PocketBase | Supabase |
|---|---|
| `.getFullList({ sort: '+name' })` | `.select('*').order('name', { ascending: true })` |
| `.getFullList({ sort: '-created' })` | `.select('*').order('created_at', { ascending: false })` |
| `.getOne(id)` | `.select('*').eq('id', id).single()` |
| `.create(data)` | `.insert(data).select().single()` |
| `.update(id, data)` | `.update(data).eq('id', id)` |
| `.delete(id)` | `.delete().eq('id', id)` |
| `.getList(1, 1, { fields: 'id' })` | `.select('id', { count: 'exact', head: true })` |
| `pb.filter('field = {:v}', { v: x })` | `.eq('field', x)` |

### Deep relational queries (expand → nested select)
PocketBase used `expand: 'order_items(order).preorder_session_item.menu_item'`.  
Supabase equivalent using foreign key relationships:

```ts
// Order with full item details
supabase
  .from('orders')
  .select(`
    *,
    order_items (
      *,
      preorder_session_items (
        *,
        menu_items (*)
      )
    )
  `)
  .eq('id', orderId)
  .single()
```

### Error handling
All Supabase calls return `{ data, error }`. Hooks throw when `error` is non-null:
```ts
const { data, error } = await supabase.from('...').select(...)
if (error) throw error
return data
```
React Query catches thrown errors, matching PocketBase's throw-on-error behaviour.

---

## 5. Image Uploads (Supabase Storage)

- **Bucket name:** `menu-images` (public bucket)
- **Upload path:** `{uuid}-{filename}` to avoid collisions
- `menu_items.image` stores the storage path (not a full URL)
- `src/lib/supabase/storage.ts` exports `getImageUrl(path: string): string` which calls `supabase.storage.from('menu-images').getPublicUrl(path).data.publicUrl`

### On create
1. Upload file to `menu-images`, get back path
2. Insert `menu_item` row with `image = path`

### On update with new image
1. Upload new file to `menu-images`, get back new path
2. Delete old file: `supabase.storage.from('menu-images').remove([oldPath])`
3. Update `menu_item` row with new path

---

## 6. Categories

- `useCategoryOptions` queries `select('name').from('categories').order('name')` instead of schema introspection
- Returns `string[]` of category names — same interface as before

---

## 7. Types

### Changes to existing types
- `src/types/session.ts`: Remove `import type { RecordModel } from 'pocketbase'`. `Session` extends a plain interface with `id: string, created_at: string, updated_at: string`.
- `src/types/menu.ts`: Remove `collectionId` and `collectionName` from `MenuItem`. `SessionItem.expand` structure changes to match Supabase nested response.
- `src/types/order.ts`: `Order.expand` and `OrderItem.expand` structures updated to match Supabase nested select shape. `OrderItem.order: string` renamed to `OrderItem.order_id: string` to match the DB column rename (avoids SQL reserved word conflict).

---

## 8. Files Changed

| File | Action |
|---|---|
| `package.json` | Remove `pocketbase`, add `@supabase/supabase-js` |
| `src/lib/pocketbase/index.ts` | Delete |
| `src/lib/supabase/index.ts` | Create — exports `supabase` client |
| `src/lib/supabase/storage.ts` | Create — exports `getImageUrl()` |
| `src/types/session.ts` | Rewrite — remove PocketBase imports |
| `src/types/menu.ts` | Rewrite — remove PB-specific fields |
| `src/types/order.ts` | Rewrite — update expand shapes |
| `src/hooks/useAuth/index.ts` | Rewrite |
| `src/hooks/useLogout/index.ts` | Rewrite |
| `src/hooks/useMenuItems/index.ts` | Rewrite |
| `src/pages/bismarck/login/hooks/useAdminLogin/index.ts` | Rewrite |
| `src/pages/bismarck/dashboard/hooks/useSessionOrders/index.ts` | Rewrite |
| `src/pages/bismarck/menu/hooks/useCategoryOptions/index.ts` | Rewrite |
| `src/pages/bismarck/menu/hooks/useMenuItemMutations/index.ts` | Rewrite |
| `src/pages/bismarck/sessions/hooks/useSessions/index.ts` | Rewrite |
| `src/pages/bismarck/sessions/detail/hooks/useSessionDetail/index.ts` | Rewrite |
| `src/pages/bismarck/sessions/detail/hooks/useCloseSession/index.ts` | Rewrite |
| `src/pages/bismarck/sessions/detail/hooks/useMarkAllFulfilled/index.ts` | Rewrite |
| `src/pages/bismarck/sessions/detail/hooks/useToggleFulfilled/index.ts` | Rewrite |
| `src/pages/bismarck/sessions/new/hooks/useCreateSession/index.ts` | Rewrite |
| `src/pages/home/hooks/usePublicSessions/index.ts` | Rewrite |
| `src/pages/order/hooks/useSession/index.ts` | Rewrite |
| `src/pages/order/hooks/useSubmitOrder/index.ts` | Rewrite |
| `src/pages/order/success/hooks/useOrderSuccess.ts` | Rewrite |
| `src/pages/session-orders/hooks/useSessionOrdersPublic.ts` | Rewrite |
| `src/components/BillModal/hooks/useOrderBill.ts` | Rewrite |

---

## 9. Out of Scope

- No UI component changes
- No routing changes
- No Supabase RLS policy setup (handled separately when project is configured)
- Supabase URL and anon key will be added by the user — placeholder env vars in `.env.example`
