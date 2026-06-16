# PocketBase → Supabase Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace every PocketBase call in bismarck_v2 with Supabase — same business logic, same UI, no new features.

**Architecture:** Install `@supabase/supabase-js`, create a single `supabase` client in `src/lib/supabase/index.ts`, rewrite all 13 data hooks to use Supabase's native query API, update UI components that read PocketBase `expand` objects to read Supabase nested join objects directly, and replace PocketBase file URL construction with a Supabase Storage helper.

**Tech Stack:** React 19, TypeScript, Vite, TanStack Query v5, `@supabase/supabase-js`, Supabase Storage, Tailwind CSS.

---

## File Map

| Action | Path                                                                           | Responsibility                                                     |
| ------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| Modify | `package.json`                                                                 | Remove `pocketbase`, add `@supabase/supabase-js`                   |
| Create | `.env.example`                                                                 | Document required env vars                                         |
| Create | `src/lib/supabase/index.ts`                                                    | Single Supabase client instance                                    |
| Create | `src/lib/supabase/storage.ts`                                                  | `getImageUrl`, `uploadImage`, `deleteImage` helpers                |
| Delete | `src/lib/pocketbase/index.ts`                                                  | Remove PocketBase client                                           |
| Modify | `src/types/session.ts`                                                         | Remove `RecordModel` import, plain interface                       |
| Modify | `src/types/menu.ts`                                                            | Remove `collectionId`/`collectionName`, add Supabase join shape    |
| Modify | `src/types/order.ts`                                                           | Rename `order→order_id`, replace `expand` with Supabase join shape |
| Modify | `src/hooks/useAuth/index.ts`                                                   | Supabase session, loading state                                    |
| Modify | `src/hooks/useLogout/index.ts`                                                 | `supabase.auth.signOut()`                                          |
| Modify | `src/router/ProtectedRoute.tsx`                                                | Handle `loading` state from `useAuth`                              |
| Modify | `src/pages/bismarck/login/hooks/useAdminLogin/index.ts`                        | `signInWithPassword`                                               |
| Modify | `src/hooks/useMenuItems/index.ts`                                              | Supabase select                                                    |
| Modify | `src/pages/bismarck/menu/hooks/useCategoryOptions/index.ts`                    | Query `categories` table                                           |
| Modify | `src/pages/bismarck/menu/hooks/useMenuItemMutations/index.ts`                  | Supabase insert/update + Storage                                   |
| Modify | `src/components/ProductThumbnail.tsx`                                          | Use `getImageUrl()` instead of `pb.files.getURL()`                 |
| Modify | `src/pages/bismarck/menu/index.tsx`                                            | Pass `currentImagePath` to `updateItem.mutate`                     |
| Modify | `src/pages/bismarck/sessions/hooks/useSessions/index.ts`                       | Supabase select                                                    |
| Modify | `src/pages/bismarck/sessions/new/hooks/useCreateSession/index.ts`              | Supabase insert, no `JSON.stringify` for `custom_locations`        |
| Modify | `src/pages/bismarck/sessions/detail/hooks/useSessionDetail/index.ts`           | Supabase nested select                                             |
| Modify | `src/pages/bismarck/sessions/detail/hooks/useCloseSession/index.ts`            | Supabase update                                                    |
| Modify | `src/pages/bismarck/sessions/detail/hooks/useMarkAllFulfilled/index.ts`        | Batch `.in('id', ids)` update                                      |
| Modify | `src/pages/bismarck/sessions/detail/hooks/useToggleFulfilled/index.ts`         | Supabase update                                                    |
| Modify | `src/pages/bismarck/dashboard/hooks/useSessionOrders/index.ts`                 | Supabase select                                                    |
| Modify | `src/pages/home/hooks/usePublicSessions/index.ts`                              | Supabase select                                                    |
| Modify | `src/pages/order/hooks/useSession/index.ts`                                    | Supabase nested select + JS sort                                   |
| Modify | `src/pages/order/hooks/useSubmitOrder/index.ts`                                | Supabase insert, `order_id` column                                 |
| Modify | `src/pages/order/success/hooks/useOrderSuccess.ts`                             | Supabase nested select                                             |
| Modify | `src/pages/order/success/index.tsx`                                            | `expand` → direct nested properties                                |
| Modify | `src/pages/session-orders/hooks/useSessionOrdersPublic.ts`                     | Supabase nested select                                             |
| Modify | `src/pages/session-orders/index.tsx`                                           | `expand` → direct nested properties                                |
| Modify | `src/components/BillModal/hooks/useOrderBill.ts`                               | Supabase nested select                                             |
| Modify | `src/components/BillModal/features/BillDetail.tsx`                             | `expand` → direct nested properties                                |
| Modify | `src/pages/bismarck/sessions/detail/features/StatsRow.tsx`                     | `expand` → direct nested properties                                |
| Modify | `src/pages/bismarck/sessions/detail/features/OrderTable/features/OrderRow.tsx` | `expand` → direct nested properties                                |
| Modify | `src/pages/order/features/MenuSection/features/MenuItemCard.tsx`               | `expand?.menu_item` → `menu_items`                                 |

---

## Task 1: Dependencies & Environment Setup

**Files:**

- Modify: `package.json`
- Create: `.env.example`

- [ ] **Step 1: Install Supabase, remove PocketBase**

```bash
cd /Users/jacktfz/Work/bismarck_v2
yarn remove pocketbase
yarn add @supabase/supabase-js
```

Expected output: `pocketbase` removed, `@supabase/supabase-js` added to `dependencies`.

- [ ] **Step 2: Create `.env.example`**

Create file `/Users/jacktfz/Work/bismarck_v2/.env.example`:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

- [ ] **Step 3: Commit**

```bash
cd /Users/jacktfz/Work/bismarck_v2
git add package.json yarn.lock .env.example
git commit -m "chore: swap pocketbase for @supabase/supabase-js"
```

---

## Task 2: Supabase Client + Storage Utility

**Files:**

- Create: `src/lib/supabase/index.ts`
- Create: `src/lib/supabase/storage.ts`

- [ ] **Step 1: Create Supabase client**

Create file `src/lib/supabase/index.ts`:

```ts
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url) throw new Error("VITE_SUPABASE_URL is required");
if (!key) throw new Error("VITE_SUPABASE_ANON_KEY is required");

export const supabase = createClient(url, key);
```

- [ ] **Step 2: Create storage utility**

Create file `src/lib/supabase/storage.ts`:

```ts
import { supabase } from "./index";

const BUCKET = "menu-images";

export function getImageUrl(path: string): string {
  if (!path) return "";
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file);
  if (error) throw error;
  return path;
}

export async function deleteImage(path: string): Promise<void> {
  if (!path) return;
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) throw error;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/supabase/
git commit -m "feat: add Supabase client and storage utility"
```

---

## Task 3: TypeScript Types Cleanup

**Files:**

- Modify: `src/types/session.ts`
- Modify: `src/types/menu.ts`
- Modify: `src/types/order.ts`

- [ ] **Step 1: Rewrite `src/types/session.ts`**

Replace entire file content:

```ts
export type SessionStatus = "open" | "closed";

export interface CustomLocation {
  name: string;
  time: string;
}

export interface Session {
  id: string;
  title: string;
  description: string;
  fulfillment_date: string;
  order_deadline: string;
  max_orders: number;
  status: SessionStatus;
  allow_pickup: boolean;
  allow_delivery: boolean;
  custom_locations: CustomLocation[];
  created_at: string;
  updated_at: string;
}
```

- [ ] **Step 2: Rewrite `src/types/menu.ts`**

Replace entire file content:

```ts
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  default_price: number;
  category: string;
  image: string;
  is_active: boolean;
  created_at: string;
}

export interface SessionItem {
  id: string;
  preorder_session: string;
  menu_item: string;
  price: number;
  is_available: boolean;
  menu_items?: MenuItem;
}
```

- [ ] **Step 3: Rewrite `src/types/order.ts`**

Replace entire file content:

```ts
import type { SessionItem } from "./menu";

export type FulfillmentType = "pickup" | "delivery" | "custom";

export interface Order {
  id: string;
  preorder_session: string;
  customer_name: string;
  whatsapp: string;
  fulfillment_type: FulfillmentType;
  delivery_address: string;
  custom_location: string;
  notes: string;
  is_fulfilled: boolean;
  created_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  preorder_session_item: string;
  quantity: number;
  preorder_session_items?: SessionItem;
}

export interface OrderItemFormValue {
  session_item_id: string;
  quantity: number;
}

export interface OrderFormValues {
  customer_name: string;
  whatsapp: string;
  fulfillment_type: FulfillmentType;
  delivery_address: string;
  custom_location: string;
  notes: string;
  items: OrderItemFormValue[];
}
```

- [ ] **Step 4: Commit**

```bash
git add src/types/
git commit -m "refactor: remove PocketBase types, add Supabase-shaped types"
```

---

## Task 4: Auth Hooks + ProtectedRoute

**Files:**

- Modify: `src/hooks/useAuth/index.ts`
- Modify: `src/hooks/useLogout/index.ts`
- Modify: `src/router/ProtectedRoute.tsx`
- Modify: `src/pages/bismarck/login/hooks/useAdminLogin/index.ts`

- [ ] **Step 1: Rewrite `src/hooks/useAuth/index.ts`**

Replace entire file content:

```ts
import { useState, useEffect } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { isAuthenticated, user, loading };
}
```

- [ ] **Step 2: Rewrite `src/hooks/useLogout/index.ts`**

Replace entire file content:

```ts
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export function useLogout() {
  const navigate = useNavigate();

  return async function logout() {
    await supabase.auth.signOut();
    navigate("/bismarck/login", { replace: true });
  };
}
```

- [ ] **Step 3: Rewrite `src/router/ProtectedRoute.tsx`**

Replace entire file content:

```tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to="/bismarck/login" replace />
  );
}
```

- [ ] **Step 4: Rewrite `src/pages/bismarck/login/hooks/useAdminLogin/index.ts`**

Replace entire file content:

```ts
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface LoginInput {
  identity: string;
  password: string;
}

export function useAdminLogin() {
  return useMutation({
    mutationFn: async ({ identity, password }: LoginInput) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: identity,
        password,
      });
      if (error) throw error;
      return data;
    },
  });
}
```

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useAuth/ src/hooks/useLogout/ src/router/ProtectedRoute.tsx src/pages/bismarck/login/hooks/useAdminLogin/
git commit -m "feat: replace PocketBase auth with Supabase auth"
```

---

## Task 5: Menu Management Hooks + Image Components

**Files:**

- Modify: `src/hooks/useMenuItems/index.ts`
- Modify: `src/pages/bismarck/menu/hooks/useCategoryOptions/index.ts`
- Modify: `src/pages/bismarck/menu/hooks/useMenuItemMutations/index.ts`
- Modify: `src/components/ProductThumbnail.tsx`
- Modify: `src/pages/bismarck/menu/index.tsx`

- [ ] **Step 1: Rewrite `src/hooks/useMenuItems/index.ts`**

Replace entire file content:

```ts
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { MenuItem } from "@/types/menu";

export function useMenuItems() {
  return useQuery({
    queryKey: ["menu_items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      return data as MenuItem[];
    },
  });
}
```

- [ ] **Step 2: Rewrite `src/pages/bismarck/menu/hooks/useCategoryOptions/index.ts`**

Replace entire file content:

```ts
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function useCategoryOptions() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("name")
        .order("name", { ascending: true });
      if (error) throw error;
      return (data ?? []).map((row) => row.name as string);
    },
    staleTime: Infinity,
  });
}
```

- [ ] **Step 3: Rewrite `src/pages/bismarck/menu/hooks/useMenuItemMutations/index.ts`**

Replace entire file content:

```ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { uploadImage, deleteImage } from "@/lib/supabase/storage";
import type { MenuItem } from "@/types/menu";

export interface MenuItemFormData {
  name: string;
  description: string;
  default_price: number;
  category: string;
  image?: FileList;
}

export function useMenuItemMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["menu_items"] });

  const createItem = useMutation({
    mutationFn: async (data: MenuItemFormData) => {
      let imagePath = "";
      if (data.image?.[0]) {
        imagePath = await uploadImage(data.image[0]);
      }
      const { data: item, error } = await supabase
        .from("menu_items")
        .insert({
          name: data.name,
          description: data.description,
          default_price: data.default_price,
          category: data.category,
          image: imagePath,
          is_active: true,
        })
        .select()
        .single();
      if (error) throw error;
      return item as MenuItem;
    },
    onSuccess: invalidate,
  });

  const updateItem = useMutation({
    mutationFn: async ({
      id,
      data,
      currentImagePath,
    }: {
      id: string;
      data: Partial<MenuItemFormData>;
      currentImagePath?: string;
    }) => {
      let imagePath = currentImagePath;
      if (data.image?.[0]) {
        imagePath = await uploadImage(data.image[0]);
        if (currentImagePath) await deleteImage(currentImagePath);
      }
      const updates: Record<string, unknown> = {};
      if (data.name !== undefined) updates.name = data.name;
      if (data.description !== undefined)
        updates.description = data.description;
      if (data.default_price !== undefined)
        updates.default_price = data.default_price;
      if (data.category !== undefined) updates.category = data.category;
      if (imagePath !== undefined) updates.image = imagePath;
      const { data: item, error } = await supabase
        .from("menu_items")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return item as MenuItem;
    },
    onSuccess: invalidate,
  });

  const toggleActive = useMutation({
    mutationFn: async ({
      id,
      is_active,
    }: {
      id: string;
      is_active: boolean;
    }) => {
      const { data, error } = await supabase
        .from("menu_items")
        .update({ is_active })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as MenuItem;
    },
    onSuccess: invalidate,
  });

  return { createItem, updateItem, toggleActive };
}
```

- [ ] **Step 4: Rewrite `src/components/ProductThumbnail.tsx`**

Replace entire file content:

```tsx
import { getImageUrl } from "@/lib/supabase/storage";
import type { MenuItem } from "@/types/menu";
import { cn } from "@/lib/utils/cn";

interface Props {
  item: Pick<MenuItem, "image" | "name">;
  className?: string;
}

export function ProductThumbnail({ item, className }: Props) {
  const src = item.image ? getImageUrl(item.image) : null;

  return (
    <div
      className={cn(
        "w-16 h-16 rounded-lg overflow-hidden bg-stone-100 flex items-center justify-center shrink-0",
        className,
      )}
    >
      {src ? (
        <img src={src} alt={item.name} className="w-full h-full object-cover" />
      ) : (
        <span className="text-2xl" role="img" aria-label={item.name}>
          🥯
        </span>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Update `src/pages/bismarck/menu/index.tsx` — pass `currentImagePath` on update**

Find this line in `handleSave`:

```ts
      updateItem.mutate({ id: editTarget.id, data }, {
```

Replace with:

```ts
      updateItem.mutate({ id: editTarget.id, data, currentImagePath: editTarget.image }, {
```

- [ ] **Step 6: Commit**

```bash
git add src/hooks/useMenuItems/ src/pages/bismarck/menu/ src/components/ProductThumbnail.tsx
git commit -m "feat: replace PocketBase menu hooks with Supabase, use Storage for images"
```

---

## Task 6: Session Management Hooks

**Files:**

- Modify: `src/pages/bismarck/sessions/hooks/useSessions/index.ts`
- Modify: `src/pages/bismarck/sessions/new/hooks/useCreateSession/index.ts`

- [ ] **Step 1: Rewrite `src/pages/bismarck/sessions/hooks/useSessions/index.ts`**

Replace entire file content:

```ts
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Session } from "@/types/session";

export function useSessions() {
  return useQuery({
    queryKey: ["preorder_sessions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("preorder_sessions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Session[];
    },
  });
}

export function hasOpenSession(sessions: Session[]): boolean {
  return sessions.some(
    (s) => s.status === "open" && new Date() <= new Date(s.order_deadline),
  );
}
```

- [ ] **Step 2: Rewrite `src/pages/bismarck/sessions/new/hooks/useCreateSession/index.ts`**

Replace entire file content:

```ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Session } from "@/types/session";

export interface SessionFormValues {
  title: string;
  description: string;
  fulfillment_date: string;
  order_deadline: string;
  max_orders: number;
  allow_pickup: boolean;
  allow_delivery: boolean;
  custom_locations: { name: string; time: string }[];
  selectedItems: {
    menu_item_id: string;
    price: number;
    is_available: boolean;
  }[];
}

async function createSession(values: SessionFormValues): Promise<Session> {
  const { data: session, error: sessionError } = await supabase
    .from("preorder_sessions")
    .insert({
      title: values.title,
      description: values.description,
      fulfillment_date: new Date(values.fulfillment_date).toISOString(),
      order_deadline: new Date(values.order_deadline).toISOString(),
      max_orders: values.max_orders,
      status: "open",
      allow_pickup: values.allow_pickup,
      allow_delivery: values.allow_delivery,
      custom_locations: values.custom_locations,
    })
    .select()
    .single();
  if (sessionError) throw sessionError;

  const itemRows = values.selectedItems.map((item) => ({
    preorder_session: session.id,
    menu_item: item.menu_item_id,
    price: item.price,
    is_available: item.is_available,
  }));

  const { error: itemsError } = await supabase
    .from("preorder_session_items")
    .insert(itemRows);

  if (itemsError) {
    await supabase.from("preorder_sessions").delete().eq("id", session.id);
    throw itemsError;
  }

  return session as Session;
}

export function useCreateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createSession,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["preorder_sessions"] }),
  });
}
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/bismarck/sessions/hooks/ src/pages/bismarck/sessions/new/
git commit -m "feat: replace PocketBase session hooks with Supabase"
```

---

## Task 7: Session Detail Hooks

**Files:**

- Modify: `src/pages/bismarck/sessions/detail/hooks/useSessionDetail/index.ts`
- Modify: `src/pages/bismarck/sessions/detail/hooks/useCloseSession/index.ts`
- Modify: `src/pages/bismarck/sessions/detail/hooks/useMarkAllFulfilled/index.ts`
- Modify: `src/pages/bismarck/sessions/detail/hooks/useToggleFulfilled/index.ts`

- [ ] **Step 1: Rewrite `src/pages/bismarck/sessions/detail/hooks/useSessionDetail/index.ts`**

Replace entire file content:

```ts
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Session } from "@/types/session";
import type { Order } from "@/types/order";

export interface SessionDetailData {
  session: Session;
  orders: Order[];
}

async function fetchSessionDetail(id: string): Promise<SessionDetailData> {
  const [sessionResult, ordersResult] = await Promise.all([
    supabase.from("preorder_sessions").select("*").eq("id", id).single(),
    supabase
      .from("orders")
      .select("*, order_items(*, preorder_session_items(*, menu_items(*)))")
      .eq("preorder_session", id)
      .order("created_at", { ascending: true }),
  ]);
  if (sessionResult.error) throw sessionResult.error;
  if (ordersResult.error) throw ordersResult.error;
  return {
    session: sessionResult.data as Session,
    orders: (ordersResult.data ?? []) as Order[],
  };
}

export function useSessionDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["session-detail", id],
    queryFn: () => fetchSessionDetail(id!),
    enabled: !!id,
  });
}
```

- [ ] **Step 2: Rewrite `src/pages/bismarck/sessions/detail/hooks/useCloseSession/index.ts`**

Replace entire file content:

```ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function useCloseSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase
        .from("preorder_sessions")
        .update({ status: "closed" })
        .eq("id", sessionId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["preorder_sessions"] });
      qc.invalidateQueries({ queryKey: ["session-detail"] });
    },
  });
}
```

- [ ] **Step 3: Rewrite `src/pages/bismarck/sessions/detail/hooks/useMarkAllFulfilled/index.ts`**

Replace entire file content:

```ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Order } from "@/types/order";

export function useMarkAllFulfilled(sessionId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orders,
      is_fulfilled,
    }: {
      orders: Order[];
      is_fulfilled: boolean;
    }) => {
      const ids = orders.map((o) => o.id);
      const { error } = await supabase
        .from("orders")
        .update({ is_fulfilled })
        .in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      if (sessionId)
        qc.invalidateQueries({ queryKey: ["session-detail", sessionId] });
    },
  });
}
```

- [ ] **Step 4: Rewrite `src/pages/bismarck/sessions/detail/hooks/useToggleFulfilled/index.ts`**

Replace entire file content:

```ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function useToggleFulfilled(sessionId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      is_fulfilled,
    }: {
      orderId: string;
      is_fulfilled: boolean;
    }) => {
      const { error } = await supabase
        .from("orders")
        .update({ is_fulfilled })
        .eq("id", orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      if (sessionId)
        qc.invalidateQueries({ queryKey: ["session-detail", sessionId] });
    },
  });
}
```

- [ ] **Step 5: Commit**

```bash
git add src/pages/bismarck/sessions/detail/hooks/
git commit -m "feat: replace PocketBase session detail hooks with Supabase"
```

---

## Task 8: Dashboard + Public-Facing Hooks

**Files:**

- Modify: `src/pages/bismarck/dashboard/hooks/useSessionOrders/index.ts`
- Modify: `src/pages/home/hooks/usePublicSessions/index.ts`
- Modify: `src/pages/order/hooks/useSession/index.ts`
- Modify: `src/pages/order/hooks/useSubmitOrder/index.ts`
- Modify: `src/pages/order/success/hooks/useOrderSuccess.ts`
- Modify: `src/pages/session-orders/hooks/useSessionOrdersPublic.ts`
- Modify: `src/components/BillModal/hooks/useOrderBill.ts`

- [ ] **Step 1: Rewrite `src/pages/bismarck/dashboard/hooks/useSessionOrders/index.ts`**

Replace entire file content:

```ts
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Order } from "@/types/order";

export function useSessionOrders(sessionId: string) {
  return useQuery({
    queryKey: ["session-orders-preview", sessionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, customer_name, fulfillment_type, is_fulfilled, created_at")
        .eq("preorder_session", sessionId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Pick<
        Order,
        | "id"
        | "customer_name"
        | "fulfillment_type"
        | "is_fulfilled"
        | "created_at"
      >[];
    },
    enabled: !!sessionId,
  });
}
```

- [ ] **Step 2: Rewrite `src/pages/home/hooks/usePublicSessions/index.ts`**

Replace entire file content:

```ts
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Session } from "@/types/session";

export function usePublicSessions() {
  return useQuery({
    queryKey: ["public-sessions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("preorder_sessions")
        .select("*")
        .order("fulfillment_date", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Session[];
    },
    retry: false,
  });
}

export function getOpenSession(sessions: Session[]): Session | undefined {
  return sessions.find(
    (s) => s.status === "open" && new Date() <= new Date(s.order_deadline),
  );
}

export function getClosedSessions(sessions: Session[]): Session[] {
  return sessions.filter(
    (s) => s.status === "closed" || new Date() > new Date(s.order_deadline),
  );
}
```

- [ ] **Step 3: Rewrite `src/pages/order/hooks/useSession/index.ts`**

Replace entire file content:

```ts
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Session } from "@/types/session";
import type { SessionItem } from "@/types/menu";

export interface SessionData {
  session: Session;
  sessionItems: SessionItem[];
  orderCount: number;
}

async function fetchSession(sessionId: string): Promise<SessionData> {
  const [sessionResult, itemsResult, countResult] = await Promise.all([
    supabase.from("preorder_sessions").select("*").eq("id", sessionId).single(),
    supabase
      .from("preorder_session_items")
      .select("*, menu_items(*)")
      .eq("preorder_session", sessionId)
      .eq("is_available", true),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("preorder_session", sessionId),
  ]);
  if (sessionResult.error) throw sessionResult.error;
  if (itemsResult.error) throw itemsResult.error;
  if (countResult.error) throw countResult.error;

  const sessionItems = (itemsResult.data ?? []).sort((a, b) =>
    (a.menu_items?.name ?? "").localeCompare(b.menu_items?.name ?? ""),
  ) as SessionItem[];

  return {
    session: sessionResult.data as Session,
    sessionItems,
    orderCount: countResult.count ?? 0,
  };
}

export function useSession(sessionId: string | undefined) {
  return useQuery({
    queryKey: ["session", sessionId],
    queryFn: () => fetchSession(sessionId!),
    retry: false,
    enabled: !!sessionId,
  });
}
```

- [ ] **Step 4: Rewrite `src/pages/order/hooks/useSubmitOrder/index.ts`**

Replace entire file content:

```ts
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { OrderFormValues } from "@/types/order";

interface SubmitOrderInput {
  sessionId: string;
  values: OrderFormValues;
}

async function submitOrder({
  sessionId,
  values,
}: SubmitOrderInput): Promise<string> {
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      preorder_session: sessionId,
      customer_name: values.customer_name,
      whatsapp: values.whatsapp,
      fulfillment_type: values.fulfillment_type,
      delivery_address: values.delivery_address ?? "",
      custom_location: values.custom_location ?? "",
      notes: values.notes ?? "",
    })
    .select("id")
    .single();
  if (orderError) throw orderError;

  const itemRows = values.items
    .filter((i) => i.quantity > 0)
    .map((item) => ({
      order_id: order.id,
      preorder_session_item: item.session_item_id,
      quantity: item.quantity,
    }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(itemRows);
  if (itemsError) throw itemsError;

  return order.id;
}

export function useSubmitOrder() {
  return useMutation({ mutationFn: submitOrder });
}
```

- [ ] **Step 5: Rewrite `src/pages/order/success/hooks/useOrderSuccess.ts`**

Replace entire file content:

```ts
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Order } from "@/types/order";

async function fetchOrderSuccess(orderId: string): Promise<Order> {
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*, preorder_session_items(*, menu_items(*)))")
    .eq("id", orderId)
    .single();
  if (error) throw error;
  return data as Order;
}

export function useOrderSuccess(orderId: string | null) {
  return useQuery({
    queryKey: ["order-success", orderId],
    queryFn: () => fetchOrderSuccess(orderId!),
    enabled: !!orderId,
    retry: false,
  });
}
```

- [ ] **Step 6: Rewrite `src/pages/session-orders/hooks/useSessionOrdersPublic.ts`**

Replace entire file content:

```ts
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Order } from "@/types/order";
import type { Session } from "@/types/session";

interface SessionOrdersData {
  session: Session;
  orders: Order[];
}

async function fetchSessionOrders(
  sessionId: string,
): Promise<SessionOrdersData> {
  const [sessionResult, ordersResult] = await Promise.all([
    supabase.from("preorder_sessions").select("*").eq("id", sessionId).single(),
    supabase
      .from("orders")
      .select("*, order_items(*, preorder_session_items(*, menu_items(*)))")
      .eq("preorder_session", sessionId)
      .order("created_at", { ascending: true }),
  ]);
  if (sessionResult.error) throw sessionResult.error;
  if (ordersResult.error) throw ordersResult.error;
  return {
    session: sessionResult.data as Session,
    orders: (ordersResult.data ?? []) as Order[],
  };
}

export function useSessionOrdersPublic(sessionId: string | undefined) {
  return useQuery({
    queryKey: ["session-orders-public", sessionId],
    queryFn: () => fetchSessionOrders(sessionId!),
    enabled: !!sessionId,
    refetchInterval: 30_000,
  });
}
```

- [ ] **Step 7: Rewrite `src/components/BillModal/hooks/useOrderBill.ts`**

Replace entire file content:

```ts
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Order } from "@/types/order";

async function fetchOrderBill(orderId: string): Promise<Order> {
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*, preorder_session_items(*, menu_items(*)))")
    .eq("id", orderId)
    .single();
  if (error) throw error;
  return data as Order;
}

export function useOrderBill(orderId: string | null) {
  return useQuery({
    queryKey: ["order-bill", orderId],
    queryFn: () => fetchOrderBill(orderId!),
    enabled: !!orderId,
  });
}
```

- [ ] **Step 8: Commit**

```bash
git add src/pages/bismarck/dashboard/hooks/ src/pages/home/hooks/ src/pages/order/hooks/ src/pages/order/success/hooks/ src/pages/session-orders/hooks/ src/components/BillModal/hooks/
git commit -m "feat: replace PocketBase data hooks with Supabase across all pages"
```

---

## Task 9: Update UI Components — Replace `expand` Access

These components read PocketBase's `expand` nested objects. With Supabase, nested join data is returned as direct properties using the table name.

**Mapping:**

- `order.expand?.['order_items(order)']` → `order.order_items`
- `oi.expand?.preorder_session_item` → `oi.preorder_session_items`
- `si?.expand?.menu_item` → `si?.menu_items`
- `sessionItem.expand?.menu_item` → `sessionItem.menu_items`

**Files:**

- Modify: `src/components/BillModal/features/BillDetail.tsx`
- Modify: `src/pages/order/success/index.tsx`
- Modify: `src/pages/order/features/MenuSection/features/MenuItemCard.tsx`
- Modify: `src/pages/session-orders/index.tsx`
- Modify: `src/pages/bismarck/sessions/detail/features/StatsRow.tsx`
- Modify: `src/pages/bismarck/sessions/detail/features/OrderTable/features/OrderRow.tsx`

- [ ] **Step 1: Rewrite `src/components/BillModal/features/BillDetail.tsx`**

Replace entire file content:

```tsx
import { BANK_INFO } from "@/lib/bankInfo";
import { formatRupiah } from "@/tools/formatRupiah";
import type { Order } from "@/types/order";

interface Props {
  order: Order;
  onClose: () => void;
}

export function BillDetail({ order, onClose }: Props) {
  const orderItems = order.order_items ?? [];

  const total = orderItems.reduce((sum, oi) => {
    const price = oi.preorder_session_items?.price ?? 0;
    return sum + price * oi.quantity;
  }, 0);

  return (
    <div className="p-6">
      <div className="mb-4">
        <h2 className="font-bold text-stone-900 text-base">
          {order.customer_name} — Your Bill
        </h2>
        <p className="text-xs text-stone-400 capitalize">
          {order.fulfillment_type}
        </p>
      </div>

      <div className="border-t border-stone-100 pt-3 space-y-2 mb-3">
        {orderItems.map((oi) => {
          const si = oi.preorder_session_items;
          const name = si?.menu_items?.name ?? "Item";
          const price = si?.price ?? 0;
          return (
            <div key={oi.id} className="flex justify-between text-sm">
              <span className="text-stone-600">
                {name} ×{oi.quantity}
              </span>
              <span className="font-medium text-stone-800">
                {formatRupiah(price * oi.quantity)}
              </span>
            </div>
          );
        })}
      </div>

      <div className="border-t border-stone-200 pt-3 flex justify-between mb-4">
        <span className="font-bold text-stone-900">Total</span>
        <span className="font-bold text-amber-500 text-base">
          {formatRupiah(total)}
        </span>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900 leading-relaxed mb-4">
        <p className="font-bold mb-1">💳 Transfer to:</p>
        <p>
          {BANK_INFO.bank} · {BANK_INFO.accountNumber}
        </p>
        <p>a/n {BANK_INFO.accountHolder}</p>
        <p className="mt-1">
          Amount: <strong>{formatRupiah(total)}</strong>
        </p>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="w-full text-stone-400 text-sm py-2 hover:text-stone-600 transition-colors"
      >
        Close
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Rewrite `src/pages/order/success/index.tsx`**

Replace entire file content:

```tsx
import { useParams, useSearchParams, Link } from "react-router-dom";
import { useOrderSuccess } from "./hooks/useOrderSuccess";
import { BANK_INFO } from "@/lib/bankInfo";
import { formatRupiah } from "@/tools/formatRupiah";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function OrderSuccessPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");

  const { data: order, isLoading } = useOrderSuccess(orderId);

  const orderItems = order?.order_items ?? [];
  const total = orderItems.reduce((sum, oi) => {
    const price = oi.preorder_session_items?.price ?? 0;
    return sum + price * oi.quantity;
  }, 0);

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-md mx-auto px-4 py-10">
        {/* Confirmation header */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🎉</div>
          <h1 className="text-2xl font-bold text-stone-800 mb-1">
            Order placed!
          </h1>
          {order && (
            <p className="text-stone-500 text-sm">
              Thanks, {order.customer_name}. We'll see you on fulfillment day.
            </p>
          )}
          {!order && !isLoading && (
            <p className="text-stone-500 text-sm">
              Your order has been received. Thank you!
            </p>
          )}
        </div>

        {/* Bill summary — shown when data is available */}
        {isLoading && (
          <div className="flex justify-center py-6">
            <LoadingSpinner />
          </div>
        )}

        {!isLoading && orderItems.length > 0 && (
          <div className="bg-white rounded-2xl border border-stone-200 px-5 py-4 mb-4">
            <p className="font-bold text-stone-800 text-sm mb-3">
              🧾 Your Order
            </p>
            <div className="space-y-2 mb-3">
              {orderItems.map((oi) => {
                const si = oi.preorder_session_items;
                const name = si?.menu_items?.name ?? "Item";
                const price = si?.price ?? 0;
                return (
                  <div key={oi.id} className="flex justify-between text-sm">
                    <span className="text-stone-600">
                      {name} ×{oi.quantity}
                    </span>
                    <span className="font-medium text-stone-800">
                      {formatRupiah(price * oi.quantity)}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-stone-100 pt-3 flex justify-between">
              <span className="font-bold text-stone-900">Total</span>
              <span className="font-bold text-amber-500 text-base">
                {formatRupiah(total)}
              </span>
            </div>
          </div>
        )}

        {/* Payment info */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 mb-4">
          <p className="font-bold text-amber-900 text-sm mb-1">
            💳 Pay via bank transfer
          </p>
          <p className="text-amber-800 text-sm leading-relaxed">
            {BANK_INFO.bank} · <strong>{BANK_INFO.accountNumber}</strong>
            <br />
            a/n <strong>{BANK_INFO.accountHolder}</strong>
            {total > 0 && (
              <>
                <br />
                <span className="text-amber-700">
                  Amount: <strong>{formatRupiah(total)}</strong>
                </span>
              </>
            )}
          </p>
        </div>

        {/* Reassurance + CTA */}
        <p className="text-center text-xs text-stone-400 mb-4">
          Don't worry — you can always come back to see your order detail on the
          orders page.
        </p>
        {sessionId && (
          <Link
            to={`/session/${sessionId}/orders`}
            className="block bg-stone-900 hover:bg-stone-800 text-white text-center font-semibold text-sm py-3 rounded-xl transition-colors"
          >
            See all orders for this session →
          </Link>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Rewrite `src/pages/order/features/MenuSection/features/MenuItemCard.tsx`**

Replace entire file content:

```tsx
import type { SessionItem } from "@/types/menu";
import { ProductThumbnail } from "@/components/ProductThumbnail";
import { QuantitySelector } from "@/components/QuantitySelector";

interface Props {
  sessionItem: SessionItem;
  quantity: number;
  onChangeQuantity: (qty: number) => void;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(price);
}

export function MenuItemCard({
  sessionItem,
  quantity,
  onChangeQuantity,
}: Props) {
  const menuItem = sessionItem.menu_items;
  if (!menuItem) return null;

  return (
    <div className="flex gap-3 items-center py-3 border-b border-stone-100 last:border-0">
      <ProductThumbnail item={menuItem} />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-stone-800 text-sm leading-snug">
          {menuItem.name}
        </p>
        {menuItem.description && (
          <p className="text-stone-500 text-xs mt-0.5 line-clamp-1">
            {menuItem.description}
          </p>
        )}
        <div className="flex items-center justify-between mt-1.5 gap-2">
          <p className="text-amber-600 font-medium text-sm">
            {formatPrice(sessionItem.price)}
          </p>
          <QuantitySelector value={quantity} onChange={onChangeQuantity} />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Rewrite `src/pages/session-orders/index.tsx`**

Replace entire file content:

```tsx
import { useParams, Link } from "react-router-dom";
import { useSessionOrdersPublic } from "./hooks/useSessionOrdersPublic";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import type { Order } from "@/types/order";
import { cn } from "@/lib/utils/cn";
import { useModal } from "@/lib/modal/useModal";
import { BillModal } from "@/components/BillModal";
import { BANK_INFO } from "@/lib/bankInfo";

function maskName(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts
    .map((part) => {
      if (part.length <= 2) return part;
      return part[0] + "*".repeat(part.length - 2) + part[part.length - 1];
    })
    .join(" ");
}

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length <= 2) return "**";
  return "*".repeat(digits.length - 2) + digits.slice(-2);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function OrderCard({
  order,
  index,
  onViewBill,
}: {
  order: Order;
  index: number;
  onViewBill: () => void;
}) {
  const orderItems = order.order_items ?? [];

  return (
    <div
      className={cn(
        "bg-white rounded-2xl px-5 py-4 flex items-start gap-4",
        order.is_fulfilled ? "opacity-60" : "",
      )}
    >
      <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-xs font-bold text-stone-500 shrink-0 mt-0.5">
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <p className="font-semibold text-stone-800 text-sm">
              {maskName(order.customer_name)}
            </p>
            <p className="text-stone-400 text-xs mt-0.5">
              {maskPhone(order.whatsapp)}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span
              className={cn(
                "text-xs font-semibold px-2.5 py-1 rounded-full",
                order.is_fulfilled
                  ? "bg-green-100 text-green-700"
                  : "bg-amber-50 text-amber-700",
              )}
            >
              {order.is_fulfilled ? "✓ Ready" : "Processing"}
            </span>
            <button
              type="button"
              onClick={onViewBill}
              className="text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded-full transition-colors"
            >
              View Bill →
            </button>
          </div>
        </div>
        {orderItems.length > 0 && (
          <div className="mt-2 space-y-0.5">
            {orderItems.map((oi) => {
              const name =
                oi.preorder_session_items?.menu_items?.name ?? "Item";
              return (
                <p key={oi.id} className="text-xs text-stone-500">
                  {oi.quantity}× {name}
                </p>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SessionOrdersPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { data, isLoading, isError } = useSessionOrdersPublic(sessionId);
  const { open } = useModal();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <LoadingSpinner centered />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4 text-center">
        <div>
          <p className="text-3xl mb-2">😕</p>
          <p className="text-stone-600 font-medium">Session not found</p>
          <Link
            to="/"
            className="text-amber-600 text-sm mt-2 inline-block hover:underline"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    );
  }

  const { session, orders } = data;
  const fulfilled = orders.filter((o) => o.is_fulfilled).length;

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            to="/"
            className="text-xs text-stone-400 hover:text-stone-600 mb-3 inline-flex items-center gap-1"
          >
            ← Home
          </Link>
          <h1 className="text-2xl font-bold text-stone-800">{session.title}</h1>
          <p className="text-stone-500 text-sm mt-0.5">
            Pick-up: {formatDate(session.fulfillment_date)}
          </p>
        </div>

        <div className="bg-white rounded-2xl px-5 py-4 mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-2xl font-extrabold text-stone-800">
              {orders.length}
            </p>
            <p className="text-xs text-stone-400 mt-0.5">Total orders</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-extrabold text-green-600">
              {fulfilled}
            </p>
            <p className="text-xs text-stone-400 mt-0.5">Ready for pickup</p>
          </div>
          <div className="flex-1 max-w-30">
            <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-400 rounded-full transition-all"
                style={{
                  width: orders.length
                    ? `${(fulfilled / orders.length) * 100}%`
                    : "0%",
                }}
              />
            </div>
            <p className="text-xs text-stone-400 mt-1 text-right">
              {orders.length
                ? Math.round((fulfilled / orders.length) * 100)
                : 0}
              % ready
            </p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 mb-6">
          <p className="font-bold text-amber-900 text-sm mb-1">💳 How to Pay</p>
          <p className="text-amber-800 text-sm leading-relaxed">
            {BANK_INFO.bank} · <strong>{BANK_INFO.accountNumber}</strong> · a/n{" "}
            <strong>{BANK_INFO.accountHolder}</strong>
          </p>
          <p className="text-amber-700 text-xs mt-1">
            Forgot your bill details? No worries — tap{" "}
            <strong>View Bill</strong> next to your name below 👇
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-16 text-stone-400">
            <p className="text-4xl mb-3">🥯</p>
            <p className="font-medium text-stone-600">No orders yet</p>
            <p className="text-sm mt-1">Be the first to order!</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">
              Order List
            </p>
            {orders.map((order, i) => (
              <OrderCard
                key={order.id}
                order={order}
                index={i}
                onViewBill={() => open(<BillModal orderId={order.id} />)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Rewrite `src/pages/bismarck/sessions/detail/features/StatsRow.tsx`**

Replace entire file content:

```tsx
import type { Order } from "@/types/order";

const idr = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
});

interface Props {
  orders: Order[];
}

export function StatsRow({ orders }: Props) {
  const total = orders.length;
  const fulfilled = orders.filter((o) => o.is_fulfilled).length;

  const totalRevenue = orders
    .filter((o) => o.is_fulfilled)
    .reduce((sum, order) => {
      const items = order.order_items ?? [];
      return (
        sum +
        items.reduce(
          (s, oi) => s + (oi.preorder_session_items?.price ?? 0) * oi.quantity,
          0,
        )
      );
    }, 0);

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
        <p className="text-2xl font-bold text-stone-800">{total}</p>
        <p className="text-xs text-stone-500 mt-0.5">Total Orders</p>
      </div>
      <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
        <p className="text-2xl font-bold text-green-600">{fulfilled}</p>
        <p className="text-xs text-stone-500 mt-0.5">Fulfilled</p>
      </div>
      <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
        <p className="text-2xl font-bold text-amber-500">{total - fulfilled}</p>
        <p className="text-xs text-stone-500 mt-0.5">Pending</p>
      </div>
      <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
        <p className="text-xl font-bold text-emerald-600">
          {idr.format(totalRevenue)}
        </p>
        <p className="text-xs text-stone-500 mt-0.5">Revenue (Done)</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Rewrite `src/pages/bismarck/sessions/detail/features/OrderTable/features/OrderRow.tsx`**

Replace entire file content:

```tsx
import type { Order } from "@/types/order";
import { cn } from "@/lib/utils/cn";

const idr = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
});

interface Props {
  order: Order;
  onToggleFulfilled: (order: Order) => void;
  isToggling: boolean;
}

export function OrderRow({ order, onToggleFulfilled, isToggling }: Props) {
  const orderItems = order.order_items ?? [];
  const fulfillmentLabel: Record<string, string> = {
    pickup: "Pickup",
    delivery: "Delivery",
    custom: order.custom_location || "Drop-off",
  };

  const orderTotal = orderItems.reduce((sum, oi) => {
    const price = oi.preorder_session_items?.price ?? 0;
    return sum + price * oi.quantity;
  }, 0);

  return (
    <tr className="border-b border-stone-100 last:border-0">
      <td className="py-3 px-4">
        <p className="font-medium text-stone-800 text-sm">
          {order.customer_name}
        </p>
        <p className="text-stone-400 text-xs">{order.whatsapp}</p>
      </td>
      <td className="py-3 px-4">
        <p className="text-xs text-stone-500">
          {fulfillmentLabel[order.fulfillment_type]}
        </p>
        {order.delivery_address && (
          <p className="text-xs text-stone-400 mt-0.5 max-w-40 truncate">
            {order.delivery_address}
          </p>
        )}
      </td>
      <td className="py-3 px-4">
        {orderItems.map((oi) => {
          const name = oi.preorder_session_items?.menu_items?.name ?? "Item";
          const price = oi.preorder_session_items?.price ?? 0;
          return (
            <p key={oi.id} className="text-xs text-stone-600">
              {oi.quantity}x {name}
              <span className="text-stone-400 ml-1.5">
                {idr.format(price * oi.quantity)}
              </span>
            </p>
          );
        })}
      </td>
      <td className="py-3 px-4 text-right">
        <p className="text-sm font-semibold text-stone-700 mb-1.5">
          {idr.format(orderTotal)}
        </p>
        <button
          type="button"
          onClick={() => onToggleFulfilled(order)}
          disabled={isToggling}
          className={cn(
            "cursor-pointer text-xs font-medium px-3 py-1.5 rounded-full border transition-colors",
            order.is_fulfilled
              ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
              : "bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100",
          )}
        >
          {order.is_fulfilled ? "✓ Done" : "Mark Done"}
        </button>
      </td>
    </tr>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add src/components/BillModal/features/ src/pages/order/success/index.tsx src/pages/order/features/ src/pages/session-orders/index.tsx src/pages/bismarck/sessions/detail/features/
git commit -m "refactor: replace PocketBase expand access with Supabase nested join access"
```

---

## Task 10: Delete PocketBase Lib + Final Build Verification

**Files:**

- Delete: `src/lib/pocketbase/index.ts`

- [ ] **Step 1: Delete the PocketBase library file**

```bash
rm -rf /Users/jacktfz/Work/bismarck_v2/src/lib/pocketbase
```

- [ ] **Step 2: Run TypeScript build to verify zero errors**

```bash
cd /Users/jacktfz/Work/bismarck_v2
yarn build
```

Expected: Build completes with 0 TypeScript errors and 0 type errors. If errors appear, they must be fixed before proceeding.

- [ ] **Step 3: Run linter to verify zero lint errors**

```bash
yarn lint
```

Expected: No ESLint errors or warnings related to the migration.

- [ ] **Step 4: Verify no remaining PocketBase references**

```bash
grep -r "pocketbase\|from 'pocketbase'\|pb\." src/ --include="*.ts" --include="*.tsx" | grep -v "node_modules"
```

Expected: Zero matches (empty output).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove PocketBase library, migration to Supabase complete"
```

---

## Done ✓

All PocketBase logic has been replaced with Supabase. The app is ready to connect to a real Supabase project by:

1. Creating a `.env.local` file with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
2. Creating the Supabase tables per the schema in `docs/superpowers/specs/2026-05-23-pocketbase-to-supabase-migration-design.md`
3. Creating a `menu-images` public storage bucket
4. Creating the admin user in Supabase Auth
