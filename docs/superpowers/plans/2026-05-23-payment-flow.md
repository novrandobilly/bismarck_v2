# Payment Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a payment flow where customers see payment instructions after ordering, upload proof of payment, and appear on the public order board only after an admin confirms their payment.

**Architecture:** Extend the `orders` table with `has_paid`, `payment_proof_url`, and `payment_method` columns. The `/order/:sessionId/success` page gains payment instruction tabs (QRIS placeholder + bank transfer) and an "Upload Proof" CTA linking to a new dedicated `/upload-proof` page. A new admin page `/bismarck/payments` lists orders with uploaded proof pending approval.

**Tech Stack:** React, TypeScript, Supabase (DB + Storage), TanStack Query, React Router, Tailwind CSS

---

## File Map

| Action | File | Purpose |
|---|---|---|
| Create | `supabase/migrations/20260523000002_add_payment_fields.sql` | Add 3 columns to orders table |
| Modify | `src/types/order.ts` | Add `has_paid`, `payment_proof_url`, `payment_method` |
| Modify | `src/pages/session-orders/hooks/useSessionOrdersPublic.ts` | Filter orders by `has_paid = true` |
| Modify | `src/pages/order/success/index.tsx` | Add payment tabs + Upload Proof CTA |
| Create | `src/lib/supabase/payment-storage.ts` | Upload/getUrl helpers for `payment-proofs` bucket |
| Create | `src/pages/upload-proof/hooks/useUploadProof.ts` | Mutation: upload image + update order |
| Create | `src/pages/upload-proof/index.tsx` | New public `/upload-proof` page |
| Create | `src/pages/bismarck/payments/hooks/usePendingPayments.ts` | Query: orders with proof, not yet paid |
| Create | `src/pages/bismarck/payments/hooks/useMarkPaid.ts` | Mutation: set has_paid = true |
| Create | `src/pages/bismarck/payments/index.tsx` | Admin payments review page |
| Modify | `src/router/index.tsx` | Register `/upload-proof` and `/bismarck/payments` routes |
| Modify | `src/components/MainWrapper/index.tsx` | Add "Payments" link to admin header nav |
| Modify | `src/pages/home/index.tsx` | Add "Upload Payment Proof" link in OpenPOBanner |

---

## Task 1: Database Migration

**Files:**
- Create: `supabase/migrations/20260523000002_add_payment_fields.sql`

- [ ] **Step 1: Create the migration file**

```sql
-- supabase/migrations/20260523000002_add_payment_fields.sql
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS has_paid boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS payment_proof_url text,
  ADD COLUMN IF NOT EXISTS payment_method text;
```

- [ ] **Step 2: Apply the migration**

```bash
cd /path/to/bismarck_v2
supabase db push
```

Expected output: `Finished supabase db push.` with no errors. If you see a column-already-exists error, the `IF NOT EXISTS` guards handle it safely.

- [ ] **Step 3: Create the payment-proofs storage bucket**

Go to the Supabase Dashboard → Storage → New bucket.
- Name: `payment-proofs`
- Public: ✅ (checked)
- Click Create

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260523000002_add_payment_fields.sql
git commit -m "feat: add payment fields migration and payment-proofs bucket"
```

---

## Task 2: Update TypeScript Types

**Files:**
- Modify: `src/types/order.ts`

- [ ] **Step 1: Add the three new fields to the `Order` interface**

Open `src/types/order.ts`. The current `Order` interface ends with `created_at`. Add the new fields after `is_fulfilled`:

```typescript
export interface Order {
  id: string
  preorder_session: string
  customer_name: string
  whatsapp: string
  fulfillment_type: FulfillmentType
  delivery_address: string
  custom_location: string
  notes: string
  is_fulfilled: boolean
  has_paid: boolean
  payment_proof_url: string | null
  payment_method: 'qris' | 'bank_transfer' | null
  created_at: string
  order_items?: OrderItem[]
}
```

- [ ] **Step 2: Verify no TypeScript errors**

```bash
npx tsc --noEmit
```

Expected: no output (zero errors).

- [ ] **Step 3: Commit**

```bash
git add src/types/order.ts
git commit -m "feat: add has_paid, payment_proof_url, payment_method to Order type"
```

---

## Task 3: Filter Public Order List by `has_paid`

**Files:**
- Modify: `src/pages/session-orders/hooks/useSessionOrdersPublic.ts`

- [ ] **Step 1: Add `.eq('has_paid', true)` to the orders query**

Open `src/pages/session-orders/hooks/useSessionOrdersPublic.ts`. Replace the `ordersResult` query:

```typescript
// before
supabase
  .from('orders')
  .select('*, order_items(*, preorder_session_items(*, menu_items(*)))')
  .eq('preorder_session', sessionId)
  .order('created_at', { ascending: true }),

// after
supabase
  .from('orders')
  .select('*, order_items(*, preorder_session_items(*, menu_items(*)))')
  .eq('preorder_session', sessionId)
  .eq('has_paid', true)
  .order('created_at', { ascending: true }),
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/pages/session-orders/hooks/useSessionOrdersPublic.ts
git commit -m "feat: only show has_paid orders on public order board"
```

---

## Task 4: Update Success Page with Payment Tabs and Upload CTA

**Files:**
- Modify: `src/pages/order/success/index.tsx`

- [ ] **Step 1: Replace the payment section and add Upload CTA**

Replace the entire contents of `src/pages/order/success/index.tsx` with:

```tsx
import { useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { useOrderSuccess } from './hooks/useOrderSuccess'
import { BANK_INFO } from '@/lib/bankInfo'
import { formatRupiah } from '@/tools/formatRupiah'
import { LoadingSpinner } from '@/components/LoadingSpinner'

type PaymentTab = 'bank_transfer' | 'qris'

export default function OrderSuccessPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('orderId')
  const [activeTab, setActiveTab] = useState<PaymentTab>('bank_transfer')

  const { data: order, isLoading } = useOrderSuccess(orderId)

  const orderItems = order?.order_items ?? []
  const total = orderItems.reduce((sum, oi) => {
    const price = oi.preorder_session_items?.price ?? 0
    return sum + price * oi.quantity
  }, 0)

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-md mx-auto px-4 py-10">

        {/* Confirmation header */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🎉</div>
          <h1 className="text-2xl font-bold text-stone-800 mb-1">Order placed!</h1>
          {order && (
            <p className="text-stone-500 text-sm">
              Thanks, {order.customer_name}. Please complete your payment below.
            </p>
          )}
          {!order && !isLoading && (
            <p className="text-stone-500 text-sm">
              Your order has been received. Please complete your payment below.
            </p>
          )}
        </div>

        {/* Bill summary */}
        {isLoading && (
          <div className="flex justify-center py-6">
            <LoadingSpinner />
          </div>
        )}

        {!isLoading && orderItems.length > 0 && (
          <div className="bg-white rounded-2xl border border-stone-200 px-5 py-4 mb-4">
            <p className="font-bold text-stone-800 text-sm mb-3">🧾 Your Order</p>
            <div className="space-y-2 mb-3">
              {orderItems.map((oi) => {
                const si = oi.preorder_session_items
                const name = si?.menu_items?.name ?? 'Item'
                const price = si?.price ?? 0
                return (
                  <div key={oi.id} className="flex justify-between text-sm">
                    <span className="text-stone-600">{name} ×{oi.quantity}</span>
                    <span className="font-medium text-stone-800">{formatRupiah(price * oi.quantity)}</span>
                  </div>
                )
              })}
            </div>
            <div className="border-t border-stone-100 pt-3 flex justify-between">
              <span className="font-bold text-stone-900">Total</span>
              <span className="font-bold text-amber-500 text-base">{formatRupiah(total)}</span>
            </div>
          </div>
        )}

        {/* Payment instructions */}
        <div className="bg-white rounded-2xl border border-stone-200 mb-4 overflow-hidden">
          <div className="px-5 pt-4 pb-0">
            <p className="font-bold text-stone-800 text-sm mb-3">💳 Complete Payment</p>
            {/* Tabs */}
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setActiveTab('bank_transfer')}
                className={`text-xs font-semibold px-4 py-2 rounded-full border transition-colors ${
                  activeTab === 'bank_transfer'
                    ? 'bg-amber-500 border-amber-500 text-white'
                    : 'bg-white border-stone-200 text-stone-500 hover:border-stone-300'
                }`}
              >
                Bank Transfer
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('qris')}
                className={`text-xs font-semibold px-4 py-2 rounded-full border transition-colors ${
                  activeTab === 'qris'
                    ? 'bg-amber-500 border-amber-500 text-white'
                    : 'bg-white border-stone-200 text-stone-500 hover:border-stone-300'
                }`}
              >
                QRIS
              </button>
            </div>
          </div>

          <div className="px-5 pb-5">
            {activeTab === 'bank_transfer' && (
              <div className="bg-amber-50 rounded-xl p-4">
                <p className="text-amber-800 text-sm leading-relaxed">
                  {BANK_INFO.bank} · <strong>{BANK_INFO.accountNumber}</strong>
                  <br />a/n <strong>{BANK_INFO.accountHolder}</strong>
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
            )}
            {activeTab === 'qris' && (
              <div className="flex flex-col items-center gap-3 py-4">
                <div className="w-48 h-48 bg-stone-100 rounded-xl flex items-center justify-center border border-stone-200">
                  <div className="text-center text-stone-400">
                    <p className="text-4xl mb-2">📱</p>
                    <p className="text-xs font-medium">QRIS Coming Soon</p>
                  </div>
                </div>
                <p className="text-xs text-stone-500 text-center">
                  Scan with your banking or e-wallet app to pay
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Upload proof CTA */}
        {orderId && (
          <Link
            to={`/upload-proof?orderId=${orderId}`}
            className="block w-full bg-amber-500 hover:bg-amber-600 text-white text-center font-semibold text-sm py-3 rounded-xl transition-colors mb-3"
          >
            I've Paid — Upload Proof →
          </Link>
        )}

        {/* Reassurance + orders link */}
        <p className="text-center text-xs text-stone-400 mb-4">
          Don't worry — you can always come back to see your order detail on the orders page.
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
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/pages/order/success/index.tsx
git commit -m "feat: add payment tabs and upload proof CTA to success page"
```

---

## Task 5: Payment Storage Helper

**Files:**
- Create: `src/lib/supabase/payment-storage.ts`

- [ ] **Step 1: Create the helper file**

```typescript
// src/lib/supabase/payment-storage.ts
import { supabase } from './index'

const BUCKET = 'payment-proofs'

export function getPaymentProofUrl(path: string): string {
  if (!path) return ''
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}

export async function uploadPaymentProof(file: File): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from(BUCKET).upload(path, file)
  if (error) throw error
  return path
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/supabase/payment-storage.ts
git commit -m "feat: add payment-proofs storage helper"
```

---

## Task 6: Upload Proof Hook

**Files:**
- Create: `src/pages/upload-proof/hooks/useUploadProof.ts`

- [ ] **Step 1: Create the mutation hook**

```typescript
// src/pages/upload-proof/hooks/useUploadProof.ts
import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { uploadPaymentProof } from '@/lib/supabase/payment-storage'

interface UploadProofInput {
  orderId: string
  paymentMethod: 'qris' | 'bank_transfer'
  file: File
}

async function submitProof({ orderId, paymentMethod, file }: UploadProofInput): Promise<void> {
  // 1. Check the order exists
  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select('id')
    .eq('id', orderId)
    .single()
  if (fetchError || !order) throw new Error('Order not found. Please check your Order ID.')

  // 2. Upload the image
  const path = await uploadPaymentProof(file)

  // 3. Get the public URL
  const { data: urlData } = supabase.storage.from('payment-proofs').getPublicUrl(path)

  // 4. Update the order
  const { error: updateError } = await supabase
    .from('orders')
    .update({
      payment_proof_url: urlData.publicUrl,
      payment_method: paymentMethod,
    })
    .eq('id', orderId)
  if (updateError) throw updateError
}

export function useUploadProof() {
  return useMutation({ mutationFn: submitProof })
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/pages/upload-proof/hooks/useUploadProof.ts
git commit -m "feat: add useUploadProof mutation hook"
```

---

## Task 7: Upload Proof Page

**Files:**
- Create: `src/pages/upload-proof/index.tsx`

- [ ] **Step 1: Create the page**

```tsx
// src/pages/upload-proof/index.tsx
import { useState, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useUploadProof } from './hooks/useUploadProof'

const MAX_FILE_SIZE_MB = 5

export default function UploadProofPage() {
  const [searchParams] = useSearchParams()
  const [orderId, setOrderId] = useState(searchParams.get('orderId') ?? '')
  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'bank_transfer'>('bank_transfer')
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { mutate, isPending, error, reset } = useUploadProof()

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null
    setFileError(null)
    if (selected && selected.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setFileError(`File is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`)
      setFile(null)
      return
    }
    setFile(selected)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!orderId.trim() || !file) return
    reset()
    mutate(
      { orderId: orderId.trim(), paymentMethod, file },
      { onSuccess: () => setSuccess(true) }
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-xl font-bold text-stone-800 mb-2">Proof submitted!</h1>
          <p className="text-stone-500 text-sm mb-6">
            We'll verify your payment and update your order status shortly.
          </p>
          <Link
            to="/"
            className="block bg-stone-900 hover:bg-stone-800 text-white text-center font-semibold text-sm py-3 rounded-xl transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-md mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-stone-800 mb-1">Upload Payment Proof</h1>
        <p className="text-stone-500 text-sm mb-6">
          Send us a screenshot of your transfer or QRIS payment.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Order ID */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Order ID
            </label>
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Paste your order ID here"
              required
              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {/* Payment method */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Payment Method
            </label>
            <div className="flex gap-2">
              {(['bank_transfer', 'qris'] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`flex-1 text-xs font-semibold px-4 py-2.5 rounded-xl border transition-colors ${
                    paymentMethod === method
                      ? 'bg-amber-500 border-amber-500 text-white'
                      : 'bg-white border-stone-200 text-stone-500 hover:border-stone-300'
                  }`}
                >
                  {method === 'bank_transfer' ? 'Bank Transfer' : 'QRIS'}
                </button>
              ))}
            </div>
          </div>

          {/* File upload */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Proof Image
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer border-2 border-dashed border-stone-200 rounded-xl p-6 flex flex-col items-center gap-2 hover:border-amber-400 transition-colors"
            >
              {file ? (
                <>
                  <p className="text-sm font-medium text-stone-700">{file.name}</p>
                  <p className="text-xs text-stone-400">
                    {(file.size / 1024 / 1024).toFixed(1)} MB — click to change
                  </p>
                </>
              ) : (
                <>
                  <p className="text-3xl">📎</p>
                  <p className="text-sm text-stone-500">Click to select image</p>
                  <p className="text-xs text-stone-400">JPEG, PNG, WEBP · max 5 MB</p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
            {fileError && (
              <p className="text-xs text-red-500 mt-1">{fileError}</p>
            )}
          </div>

          {/* Server error */}
          {error && (
            <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">
              {(error as Error).message}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending || !orderId.trim() || !file}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-stone-200 disabled:text-stone-400 text-white font-semibold text-sm py-3 rounded-xl transition-colors"
          >
            {isPending ? 'Uploading…' : 'Submit Proof'}
          </button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/pages/upload-proof/
git commit -m "feat: add upload proof page"
```

---

## Task 8: Admin Payments Hooks

**Files:**
- Create: `src/pages/bismarck/payments/hooks/usePendingPayments.ts`
- Create: `src/pages/bismarck/payments/hooks/useMarkPaid.ts`

- [ ] **Step 1: Create `usePendingPayments` hook**

```typescript
// src/pages/bismarck/payments/hooks/usePendingPayments.ts
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Order } from '@/types/order'

async function fetchPendingPayments(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, preorder_session_items(*, menu_items(*)))')
    .not('payment_proof_url', 'is', null)
    .eq('has_paid', false)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as Order[]
}

export function usePendingPayments() {
  return useQuery({
    queryKey: ['pending-payments'],
    queryFn: fetchPendingPayments,
    refetchInterval: 30_000,
  })
}
```

- [ ] **Step 2: Create `useMarkPaid` hook**

```typescript
// src/pages/bismarck/payments/hooks/useMarkPaid.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

async function markOrderPaid(orderId: string): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .update({ has_paid: true })
    .eq('id', orderId)
  if (error) throw error
}

export function useMarkPaid() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: markOrderPaid,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-payments'] })
    },
  })
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add src/pages/bismarck/payments/hooks/
git commit -m "feat: add usePendingPayments and useMarkPaid hooks"
```

---

## Task 9: Admin Payments Page

**Files:**
- Create: `src/pages/bismarck/payments/index.tsx`

- [ ] **Step 1: Create the admin payments page**

```tsx
// src/pages/bismarck/payments/index.tsx
import { usePendingPayments } from './hooks/usePendingPayments'
import { useMarkPaid } from './hooks/useMarkPaid'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { formatRupiah } from '@/tools/formatRupiah'
import type { Order } from '@/types/order'

function PaymentRow({ order, onMarkPaid, isMarking }: {
  order: Order
  onMarkPaid: (id: string) => void
  isMarking: boolean
}) {
  const orderTotal = (order.order_items ?? []).reduce((sum, oi) => {
    return sum + (oi.preorder_session_items?.price ?? 0) * oi.quantity
  }, 0)

  const methodLabel = order.payment_method === 'qris' ? 'QRIS' : 'Bank Transfer'

  return (
    <tr className="border-b border-stone-100 last:border-0">
      <td className="py-3 px-4">
        <p className="font-medium text-stone-800 text-sm">{order.customer_name}</p>
        <p className="text-stone-400 text-xs font-mono">{order.id.slice(0, 8)}…</p>
      </td>
      <td className="py-3 px-4 text-sm text-stone-600">
        {order.whatsapp.slice(-4).padStart(order.whatsapp.length, '•')}
      </td>
      <td className="py-3 px-4 text-sm font-semibold text-stone-700">
        {formatRupiah(orderTotal)}
      </td>
      <td className="py-3 px-4">
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          order.payment_method === 'qris'
            ? 'bg-blue-50 text-blue-700'
            : 'bg-amber-50 text-amber-700'
        }`}>
          {methodLabel}
        </span>
      </td>
      <td className="py-3 px-4">
        {order.payment_proof_url ? (
          <a
            href={order.payment_proof_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-12 h-12 rounded-lg overflow-hidden border border-stone-200 hover:border-amber-400 transition-colors"
          >
            <img
              src={order.payment_proof_url}
              alt="Payment proof"
              className="w-full h-full object-cover"
            />
          </a>
        ) : (
          <span className="text-xs text-stone-400">No image</span>
        )}
      </td>
      <td className="py-3 px-4 text-right">
        <button
          type="button"
          disabled={isMarking}
          onClick={() => onMarkPaid(order.id)}
          className="cursor-pointer text-xs font-medium px-3 py-1.5 rounded-full border bg-green-50 border-green-200 text-green-700 hover:bg-green-100 transition-colors disabled:opacity-50"
        >
          {isMarking ? '…' : '✓ Mark as Paid'}
        </button>
      </td>
    </tr>
  )
}

export default function PaymentsPage() {
  const { data: orders = [], isLoading } = usePendingPayments()
  const { mutate: markPaid, isPending: isMarking, variables: markingId } = useMarkPaid()

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-stone-800 mb-1">Payments</h1>
        <p className="text-stone-500 text-sm mb-6">
          Orders with uploaded payment proof awaiting your approval.
        </p>

        {isLoading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner centered />
          </div>
        )}

        {!isLoading && orders.length === 0 && (
          <div className="bg-white border border-stone-200 rounded-2xl p-10 text-center text-stone-400">
            <p className="text-3xl mb-2">🎉</p>
            <p className="font-medium text-stone-600">No pending payment proofs</p>
            <p className="text-sm mt-1">All caught up!</p>
          </div>
        )}

        {!isLoading && orders.length > 0 && (
          <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-stone-50 border-b border-stone-100">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Customer</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Phone</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Total</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Method</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Proof</th>
                  <th className="py-3 px-4 text-right text-xs font-semibold text-stone-500 uppercase tracking-wide">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <PaymentRow
                    key={order.id}
                    order={order}
                    onMarkPaid={markPaid}
                    isMarking={isMarking && markingId === order.id}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/pages/bismarck/payments/index.tsx
git commit -m "feat: add admin payments review page"
```

---

## Task 10: Register Routes

**Files:**
- Modify: `src/router/index.tsx`

- [ ] **Step 1: Add imports and register two new routes**

Add the imports at the top of `src/router/index.tsx` (after the existing imports):

```typescript
import UploadProofPage from '@/pages/upload-proof'
import PaymentsPage from '@/pages/bismarck/payments'
```

Add `/upload-proof` to the public (GuestWrapper) routes, right after the `session-orders` route:

```typescript
{ path: '/upload-proof', element: <UploadProofPage /> },
```

Add `/bismarck/payments` to the admin (ProtectedRoute → AdminWrapper) routes, after the `bismarck/menu` route:

```typescript
{ path: '/bismarck/payments', element: <PaymentsPage /> },
```

The full updated file should look like:

```typescript
import { createBrowserRouter } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { GuestWrapper, AdminWrapper } from '@/components/MainWrapper'
import HomePage from '@/pages/home'
import PublicMenuPage from '@/pages/menu'
import LoginPage from '@/pages/bismarck/login'
import NotFoundPage from '@/pages/not-found'
import MenuCatalogPage from '@/pages/bismarck/menu'
import DashboardPage from '@/pages/bismarck/dashboard'
import SessionsDashboardPage from '@/pages/bismarck/sessions'
import SessionNewPage from '@/pages/bismarck/sessions/new'
import SessionDetailPage from '@/pages/bismarck/sessions/detail'
import OrderPage from '@/pages/order'
import OrderSuccessPage from '@/pages/order/success'
import SessionOrdersPage from '@/pages/session-orders'
import UploadProofPage from '@/pages/upload-proof'
import PaymentsPage from '@/pages/bismarck/payments'

export const router = createBrowserRouter([
  {
    element: <GuestWrapper />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/menu', element: <PublicMenuPage /> },
      { path: '/order/:sessionId', element: <OrderPage /> },
      { path: '/order/:sessionId/success', element: <OrderSuccessPage /> },
      { path: '/session/:sessionId/orders', element: <SessionOrdersPage /> },
      { path: '/upload-proof', element: <UploadProofPage /> },
    ],
  },
  {
    element: <GuestWrapper />,
    children: [
      { path: '/bismarck/login', element: <LoginPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AdminWrapper />,
        children: [
          { path: '/bismarck/dashboard', element: <DashboardPage /> },
          { path: '/bismarck/sessions', element: <SessionsDashboardPage /> },
          { path: '/bismarck/sessions/new', element: <SessionNewPage /> },
          { path: '/bismarck/sessions/:id', element: <SessionDetailPage /> },
          { path: '/bismarck/menu', element: <MenuCatalogPage /> },
          { path: '/bismarck/payments', element: <PaymentsPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/router/index.tsx
git commit -m "feat: register /upload-proof and /bismarck/payments routes"
```

---

## Task 11: Admin Nav + Home Page Link

**Files:**
- Modify: `src/components/MainWrapper/index.tsx`
- Modify: `src/pages/home/index.tsx`

- [ ] **Step 1: Add "Payments" link to admin header in `MainWrapper`**

In `src/components/MainWrapper/index.tsx`, locate the `AdminWrapper` nav — the `<div className="flex items-center gap-6">` block. Add a Payments link after the "View Store" link:

```tsx
// In AdminWrapper, inside the flex items-center gap-6 div:
<Link
  to="/bismarck/payments"
  className="text-stone-400 hover:text-white text-sm transition-colors"
>
  Payments
</Link>
```

The updated nav div should be:

```tsx
<div className="flex items-center gap-6">
  <Link
    to="/bismarck/dashboard"
    className="text-white font-extrabold text-lg"
  >
    🥯 Envien Bagel Admin
  </Link>
  <Link
    to="/"
    className="text-stone-400 hover:text-white text-sm transition-colors"
  >
    View Store ↗
  </Link>
  <Link
    to="/bismarck/payments"
    className="text-stone-400 hover:text-white text-sm transition-colors"
  >
    Payments
  </Link>
</div>
```

- [ ] **Step 2: Add "Upload Payment Proof" link in home page `OpenPOBanner`**

In `src/pages/home/index.tsx`, locate the `OpenPOBanner` component's bottom `<div className="border-t border-amber-200 pt-1">` block. It currently has one link ("Already ordered?"). Add the upload link next to it:

```tsx
<div className="border-t border-amber-200 pt-1 flex flex-wrap items-center justify-between gap-1">
  <Link
    to={`/session/${session.id}/orders`}
    className="text-xs text-amber-600 hover:text-amber-800 hover:underline transition-colors"
  >
    Already ordered? Check your order status →
  </Link>
  <Link
    to="/upload-proof"
    className="text-xs text-amber-600 hover:text-amber-800 hover:underline transition-colors"
  >
    Upload payment proof →
  </Link>
</div>
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no output.

- [ ] **Step 4: Build check**

```bash
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/MainWrapper/index.tsx src/pages/home/index.tsx
git commit -m "feat: add Payments nav link and upload proof link on home page"
```

---

## Done ✅

All tasks complete. The payment flow is now fully implemented:

1. `/order/:sessionId/success` — payment tabs (bank transfer + QRIS placeholder) + upload proof CTA
2. `/upload-proof` — dedicated proof upload page, accessible from success page and home
3. Public order board — only shows `has_paid = true` orders
4. `/bismarck/payments` — admin reviews proofs and marks orders as paid
5. Admin nav — Payments link added to header
