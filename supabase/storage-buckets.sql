-- ============================================================
-- STORAGE BUCKETS
-- Run this in the Supabase SQL Editor AFTER schema.sql
-- ============================================================

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('customer-uploads', 'customer-uploads', false)
on conflict (id) do nothing;

-- Public can only READ product images (admin uploads go through the
-- service-role key in /api/admin/upload-image, which bypasses these policies).
create policy "public read product images bucket"
  on storage.objects for select
  using (bucket_id = 'product-images');

-- No public policies on 'customer-uploads' at all — only the service-role
-- key (server-only, used by /api/upload and the admin order APIs) can
-- read or write there. This keeps personalization photos private.
