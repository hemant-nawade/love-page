-- ============================================================
-- LOVE PAGE — DATABASE SCHEMA
-- Run this in the Supabase SQL Editor (Project > SQL Editor > New query)
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- STORE SETTINGS ----------
create table if not exists store_settings (
  id int primary key default 1,
  store_name text not null default 'Love Page',
  support_email text not null default 'hemantnawade@gmail.com',
  delivery_charge numeric(10,2) not null default 50,
  store_active boolean not null default true,
  instagram_url text,
  whatsapp_number text,
  homepage_headline text default 'Turn Your Memories Into Something They''ll Keep Forever.',
  homepage_subtext text default 'Personalized gifts made specially for the people you love.',
  updated_at timestamptz not null default now(),
  constraint single_row check (id = 1)
);
insert into store_settings (id) values (1) on conflict (id) do nothing;

-- ---------- ADMIN USERS ----------
create table if not exists admin_users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  created_at timestamptz not null default now()
);

-- ---------- PRODUCTS ----------
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  price numeric(10,2) not null,
  description text not null default '',
  category text,
  is_personalized boolean not null default true,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_products_active on products (is_active, sort_order);

-- ---------- PRODUCT IMAGES ----------
create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  storage_path text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists idx_product_images_product on product_images (product_id, sort_order);

-- ---------- PRODUCT CUSTOMIZATION FIELDS ----------
-- field_type: 'photo' | 'text' | 'name' | 'date' | 'note'
create table if not exists product_customization_fields (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  field_type text not null check (field_type in ('photo','text','name','date','note')),
  label text not null,
  is_required boolean not null default false,
  max_photos int default 1,
  sort_order int not null default 0
);
create index if not exists idx_custom_fields_product on product_customization_fields (product_id, sort_order);

-- ---------- ORDERS ----------
-- order_number: human-facing LP100001 style code
-- status: Payment Confirmed | Processing | Packed | Shipped | Delivered | Cancelled
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  customer_name text not null,
  customer_phone text not null,
  customer_email text not null,
  address_line text not null,
  city text not null,
  state text not null,
  pincode text not null,
  landmark text,
  subtotal numeric(10,2) not null,
  delivery_charge numeric(10,2) not null,
  total numeric(10,2) not null,
  payment_status text not null default 'pending' check (payment_status in ('pending','paid','failed')),
  order_status text not null default 'Payment Confirmed' check (
    order_status in ('Payment Confirmed','Processing','Packed','Shipped','Delivered','Cancelled')
  ),
  razorpay_order_id text,
  razorpay_payment_id text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_orders_lookup on orders (order_number, customer_phone);
create index if not exists idx_orders_status on orders (order_status);

-- sequence backing human-readable order numbers, starting at LP100001
create sequence if not exists order_number_seq start 100001;

-- ---------- ORDER ITEMS ----------
-- snapshot of product name/price at time of purchase (rule #28 in the spec)
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_name_snapshot text not null,
  product_price_snapshot numeric(10,2) not null,
  quantity int not null default 1,
  line_total numeric(10,2) not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_order_items_order on order_items (order_id);

-- ---------- ORDER CUSTOMIZATION DATA ----------
-- text-based personalization answers per order item (message, name, date, notes)
create table if not exists order_customization_data (
  id uuid primary key default gen_random_uuid(),
  order_item_id uuid not null references order_items(id) on delete cascade,
  field_label text not null,
  field_type text not null,
  value text,
  created_at timestamptz not null default now()
);
create index if not exists idx_custom_data_item on order_customization_data (order_item_id);

-- ---------- UPLOADED CUSTOMER IMAGES ----------
-- storage_path points into the private 'customer-uploads' bucket
create table if not exists order_uploaded_images (
  id uuid primary key default gen_random_uuid(),
  order_item_id uuid not null references order_items(id) on delete cascade,
  storage_path text not null,
  original_filename text,
  file_size_bytes int,
  created_at timestamptz not null default now()
);
create index if not exists idx_uploaded_images_item on order_uploaded_images (order_item_id);

-- ---------- SHIPMENTS ----------
create table if not exists shipments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid unique not null references orders(id) on delete cascade,
  courier_name text not null,
  tracking_number text not null,
  shipping_date date not null,
  tracking_url text,
  created_at timestamptz not null default now()
);

-- ---------- updated_at triggers ----------
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_products_updated_at on products;
create trigger trg_products_updated_at before update on products
  for each row execute function set_updated_at();

drop trigger if exists trg_orders_updated_at on orders;
create trigger trg_orders_updated_at before update on orders
  for each row execute function set_updated_at();

-- ---------- RPC: next order number ----------
-- Called from the server (service role) when a payment is verified.
create or replace function nextval_order_number() returns bigint as $$
begin
  return nextval('order_number_seq');
end;
$$ language plpgsql;

-- ---------- Row Level Security ----------
-- Public (anon key) can only READ active products/images/fields.
-- Everything else (orders, uploads, admin) goes through the service-role key
-- from server-side API routes only — never exposed to the browser.
alter table products enable row level security;
alter table product_images enable row level security;
alter table product_customization_fields enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table order_customization_data enable row level security;
alter table order_uploaded_images enable row level security;
alter table shipments enable row level security;
alter table store_settings enable row level security;
alter table admin_users enable row level security;

create policy "public read active products" on products
  for select using (is_active = true);

create policy "public read product images" on product_images
  for select using (
    exists (select 1 from products p where p.id = product_images.product_id and p.is_active = true)
  );

create policy "public read customization fields" on product_customization_fields
  for select using (
    exists (select 1 from products p where p.id = product_customization_fields.product_id and p.is_active = true)
  );

create policy "public read store settings" on store_settings
  for select using (true);

-- No public policies on orders, order_items, uploads, shipments, admin_users:
-- the anon key gets zero access; only the service-role key (server-only) can touch them.
