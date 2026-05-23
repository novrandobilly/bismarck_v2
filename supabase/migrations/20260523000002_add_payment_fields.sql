-- supabase/migrations/20260523000002_add_payment_fields.sql
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS has_paid boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS payment_proof_url text,
  ADD COLUMN IF NOT EXISTS payment_method text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_payment_method_check'
  ) THEN
    ALTER TABLE orders ADD CONSTRAINT orders_payment_method_check
      CHECK (payment_method IS NULL OR payment_method IN ('qris', 'bank_transfer'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_paid_requires_proof'
  ) THEN
    ALTER TABLE orders ADD CONSTRAINT orders_paid_requires_proof
      CHECK (NOT has_paid OR payment_proof_url IS NOT NULL);
  END IF;
END $$;
