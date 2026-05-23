# Payment Flow Design

**Date:** 2026-05-23  
**Status:** Approved

## Overview

Add a payment flow to Bismarck so customers can see payment instructions after ordering, upload proof of payment, and appear on the public order board only once an admin confirms their payment.

---

## Database Changes

### `orders` table — 3 new columns

| Column | Type | Default | Notes |
|---|---|---|---|
| `has_paid` | `boolean` | `false NOT NULL` | Admin sets to `true` after verifying proof |
| `payment_proof_url` | `text` | `NULL` | Set when customer uploads proof |
| `payment_method` | `text` | `NULL` | `'qris'` or `'bank_transfer'` |

### Migration

New file: `supabase/migrations/20260523000002_add_payment_fields.sql`

```sql
ALTER TABLE orders
  ADD COLUMN has_paid boolean NOT NULL DEFAULT false,
  ADD COLUMN payment_proof_url text,
  ADD COLUMN payment_method text;
```

### Storage

New bucket: `payment-proofs` (public read access so admin can preview images via direct URL without signed URLs).

---

## Public Order List Change

The public session order board currently shows all orders. After this change, it will filter to `has_paid = true` only.

- Hook: `useSessionOrdersPublic` — add `.eq('has_paid', true)` to the Supabase query.

---

## Pages

### 1. `/order/success` (modified)

Layout A — a single dedicated page combining order confirmation and payment instructions.

**Sections (top to bottom):**
1. ✅ Order confirmed banner + Order ID
2. Order summary (items, total) — already exists
3. Payment instructions — two tabs:
   - **QRIS tab**: Placeholder QR image + "Scan with your banking/e-wallet app" instructions
   - **Bank Transfer tab**: Existing hardcoded bank info from `src/lib/bankInfo.ts` (bank name, account number, account name)
4. CTA button: **"I've Paid — Upload Proof"** → navigates to `/upload-proof?orderId=<id>`

The success page already exists; this extends it in place. No separate payment page is created.

---

### 2. `/upload-proof` (new dedicated page)

Accessible from:
- The `/order/success` page via CTA button (pre-fills `orderId` via query param `?orderId=<id>`)
- The home page via a "Upload Payment Proof" link/button

**Form fields:**
| Field | Type | Notes |
|---|---|---|
| Order ID | Text input | Pre-filled from `?orderId` query param; user can edit if arriving directly |
| Payment method | Select | Options: QRIS, Bank Transfer |
| Proof image | File input | Accepts image files (JPEG, PNG, WEBP) |

**Submit flow:**
1. Upload image to `payment-proofs` Supabase Storage bucket → get public URL
2. Update `orders` row matching the Order ID: set `payment_proof_url` and `payment_method`
3. Show success confirmation ("Proof submitted! We'll verify your payment shortly.")

**Error states:**
- Order ID not found → show error message
- Upload failure → show retry message
- File too large (>5MB) → show size error before upload

---

### 3. `/bismarck/payments` (new admin page)

Accessible from the admin sidebar, alongside existing admin pages.

**Data query:** Orders where `payment_proof_url IS NOT NULL AND has_paid = false`, ordered by `created_at` ascending (oldest first).

**Table columns:**
| Column | Content |
|---|---|
| Order ID | Truncated UUID |
| Customer name | From `orders.name` |
| Phone (last 4) | From `orders.whatsapp` |
| Total | Formatted IDR |
| Payment method | QRIS / Bank Transfer badge |
| Proof | Thumbnail image — click opens full image in new tab |
| Action | "Mark as Paid" button |

**"Mark as Paid" action:**
- Sets `has_paid = true` on the order
- Row disappears from this list (re-query on mutation)
- The order now appears on the public order board

**Empty state:** "No pending payment proofs." message when the list is empty.

---

### 4. Home Page (modified)

Add a **"Upload Payment Proof"** button or text link in the home page UI, navigating to `/upload-proof`. Placement: below the main CTA or in the footer area — unobtrusive but accessible.

---

## Data Flow Summary

```
Customer orders → /order/success (payment instructions)
    → clicks "Upload Proof" → /upload-proof?orderId=<id>
    → uploads image → payment_proof_url + payment_method set on order

Admin visits /bismarck/payments
    → sees orders with proof but has_paid=false
    → clicks "Mark as Paid" → has_paid=true

Public order board
    → only shows orders where has_paid=true
```

---

## Type Changes

`src/types/order.ts` — add to `Order` interface:
```ts
has_paid: boolean;
payment_proof_url: string | null;
payment_method: 'qris' | 'bank_transfer' | null;
```

---

## Out of Scope

- Email/WhatsApp notification when payment is confirmed (future)
- Automatic payment verification (future)
- QRIS actual merchant integration (placeholder image only for now)
- Rejection flow — admin can only approve, not reject (keep it simple)
