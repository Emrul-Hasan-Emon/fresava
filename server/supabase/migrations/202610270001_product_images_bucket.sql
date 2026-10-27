-- Adds a public storage bucket for admin-uploaded product photos.
-- Products are managed entirely through the admin API (service role),
-- so no storage RLS policy is needed — only the "public" flag, which lets
-- the storefront read images via their public URL without signing.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('product-images','product-images',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict(id) do nothing;
