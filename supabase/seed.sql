-- ============================================================
-- SEED: initial 6 products
-- Run this AFTER schema.sql. Product images are NOT seeded here —
-- upload each product's real photos from Admin > Products > Edit
-- once the site is live.
-- ============================================================

insert into products (name, slug, price, description, category, is_personalized, is_active, sort_order) values
('Forever in Your Eyes – Personalized Frame', 'forever-in-your-eyes-personalized-frame', 599, 'A personalized photo frame made from your favorite memory.', 'Frames', true, true, 1),
('Polaroid Memories', 'polaroid-memories', 100, '10 premium-quality Polaroid-style photo prints for ₹100.', 'Prints', true, true, 2),
('Personalized Photo Mug', 'personalized-photo-mug', 500, 'Your photo and message, printed on a premium ceramic mug.', 'Mugs', true, true, 3),
('Eyes of Love – Personalized Frame', 'eyes-of-love-personalized-frame', 500, 'A beautifully personalized frame capturing your special moment.', 'Frames', true, true, 4),
('Memory Story Frame', 'memory-story-frame', 399, 'A multi-photo frame that tells your story, your way.', 'Frames', true, true, 5),
('Memory Bouquet', 'memory-bouquet', 700, 'A personalized photo bouquet made from your cherished memories.', 'Bouquets', true, true, 6)
on conflict (slug) do nothing;

-- Personalization fields per product
insert into product_customization_fields (product_id, field_type, label, is_required, max_photos, sort_order)
select id, 'photo', 'Upload Photo', true, 1, 1 from products where slug = 'forever-in-your-eyes-personalized-frame'
union all
select id, 'note', 'Special Instructions', false, null, 2 from products where slug = 'forever-in-your-eyes-personalized-frame'
union all
select id, 'photo', 'Upload Photos', true, 10, 1 from products where slug = 'polaroid-memories'
union all
select id, 'photo', 'Upload Photo', true, 1, 1 from products where slug = 'personalized-photo-mug'
union all
select id, 'text', 'Custom Message', false, null, 2 from products where slug = 'personalized-photo-mug'
union all
select id, 'photo', 'Upload Photo', true, 1, 1 from products where slug = 'eyes-of-love-personalized-frame'
union all
select id, 'note', 'Special Instructions', false, null, 2 from products where slug = 'eyes-of-love-personalized-frame'
union all
select id, 'photo', 'Upload Photos', true, 5, 1 from products where slug = 'memory-story-frame'
union all
select id, 'note', 'Special Instructions', false, null, 2 from products where slug = 'memory-story-frame'
union all
select id, 'photo', 'Upload Photos', true, 5, 1 from products where slug = 'memory-bouquet'
union all
select id, 'note', 'Special Instructions', false, null, 2 from products where slug = 'memory-bouquet';
