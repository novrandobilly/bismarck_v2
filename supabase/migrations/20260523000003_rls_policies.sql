-- ============================================================
-- RLS Policies
-- ============================================================
-- Enable RLS on all tables
alter table menu_items          enable row level security;
alter table categories          enable row level security;
alter table preorder_sessions   enable row level security;
alter table preorder_session_items enable row level security;
alter table orders              enable row level security;
alter table order_items         enable row level security;

-- ============================================================
-- categories: public read, authenticated write
-- ============================================================
create policy "categories_public_read"
  on categories for select to anon, authenticated using (true);

create policy "categories_auth_write"
  on categories for all to authenticated using (true) with check (true);

-- ============================================================
-- menu_items: public read, authenticated write
-- ============================================================
create policy "menu_items_public_read"
  on menu_items for select to anon, authenticated using (true);

create policy "menu_items_auth_write"
  on menu_items for all to authenticated using (true) with check (true);

-- ============================================================
-- preorder_sessions: public read, authenticated write
-- ============================================================
create policy "preorder_sessions_public_read"
  on preorder_sessions for select to anon, authenticated using (true);

create policy "preorder_sessions_auth_write"
  on preorder_sessions for all to authenticated using (true) with check (true);

-- ============================================================
-- preorder_session_items: public read, authenticated write
-- ============================================================
create policy "preorder_session_items_public_read"
  on preorder_session_items for select to anon, authenticated using (true);

create policy "preorder_session_items_auth_write"
  on preorder_session_items for all to authenticated using (true) with check (true);

-- ============================================================
-- orders: public read+insert (customers place orders),
--         authenticated full access (admin manages)
-- ============================================================
create policy "orders_public_read"
  on orders for select to anon, authenticated using (true);

create policy "orders_public_insert"
  on orders for insert to anon, authenticated with check (true);

create policy "orders_auth_write"
  on orders for update to authenticated using (true) with check (true);

create policy "orders_auth_delete"
  on orders for delete to authenticated using (true);

-- ============================================================
-- order_items: public read+insert, authenticated delete
-- ============================================================
create policy "order_items_public_read"
  on order_items for select to anon, authenticated using (true);

create policy "order_items_public_insert"
  on order_items for insert to anon, authenticated with check (true);

create policy "order_items_auth_delete"
  on order_items for delete to authenticated using (true);

-- ============================================================
-- Storage: menu-images bucket
-- ============================================================
create policy "menu_images_public_read"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'menu-images');

create policy "menu_images_auth_upload"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'menu-images');

create policy "menu_images_auth_update"
  on storage.objects for update to authenticated
  using (bucket_id = 'menu-images');

create policy "menu_images_auth_delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'menu-images');

-- ============================================================
-- Storage: payment-proofs bucket
-- ============================================================
create policy "payment_proofs_public_read"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'payment-proofs');

create policy "payment_proofs_anon_upload"
  on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'payment-proofs');

create policy "payment_proofs_auth_delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'payment-proofs');
