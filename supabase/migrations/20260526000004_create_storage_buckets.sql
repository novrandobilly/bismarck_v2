-- Create storage buckets (idempotent)
-- Supabase storage buckets are not auto-created by RLS policies alone.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'menu-images',
    'menu-images',
    true,
    5242880, -- 5 MB
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  ),
  (
    'payment-proofs',
    'payment-proofs',
    true,
    5242880, -- 5 MB
    array['image/jpeg', 'image/png', 'image/webp']
  )
on conflict (id) do nothing;
