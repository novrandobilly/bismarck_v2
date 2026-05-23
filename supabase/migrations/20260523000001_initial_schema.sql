-- Categories
create table categories (
  id   uuid primary key default gen_random_uuid(),
  name text not null unique
);

-- Menu Items
create table menu_items (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  description   text not null default '',
  default_price numeric not null,
  category      text references categories(name),
  image         text not null default '',
  is_active     bool not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Preorder Sessions
create table preorder_sessions (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  description      text not null default '',
  fulfillment_date timestamptz not null,
  order_deadline   timestamptz not null,
  max_orders       int not null default 0,
  status           text not null default 'open',
  allow_pickup     bool not null default false,
  allow_delivery   bool not null default false,
  custom_locations jsonb not null default '[]',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Preorder Session Items
create table preorder_session_items (
  id               uuid primary key default gen_random_uuid(),
  preorder_session uuid not null references preorder_sessions(id) on delete cascade,
  menu_item        uuid not null references menu_items(id),
  price            numeric not null,
  is_available     bool not null default true,
  created_at       timestamptz not null default now()
);

-- Orders
create table orders (
  id               uuid primary key default gen_random_uuid(),
  preorder_session uuid not null references preorder_sessions(id),
  customer_name    text not null,
  whatsapp         text not null,
  fulfillment_type text not null,
  delivery_address text not null default '',
  custom_location  text not null default '',
  notes            text not null default '',
  is_fulfilled     bool not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Order Items
create table order_items (
  id                    uuid primary key default gen_random_uuid(),
  order_id              uuid not null references orders(id) on delete cascade,
  preorder_session_item uuid not null references preorder_session_items(id),
  quantity              int not null,
  created_at            timestamptz not null default now()
);
