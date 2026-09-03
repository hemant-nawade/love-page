import { supabaseAdmin } from '@/lib/supabase/server';
import ShopGrid from '@/components/ShopGrid';
import type { Product } from '@/types';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shop All Pieces',
  description: 'Browse handcrafted frames, historical portraits, and personalized photo gifts — made to order.',
};

export const dynamic = 'force-dynamic';

async function getAllProducts(): Promise<Product[]> {
  const db = supabaseAdmin();
  const { data: products } = await db
    .from('products')
    .select('id, name, slug, price, description, category, is_personalized, is_active')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (!products) return [];

  const { data: images } = await db
    .from('product_images')
    .select('product_id, storage_path, sort_order')
    .in('product_id', products.map((p) => p.id))
    .order('sort_order', { ascending: true });

  return products.map((p) => ({
    ...p,
    customization_fields: [],
    images: (images || [])
      .filter((img) => img.product_id === p.id)
      .map((img) => ({
        id: img.storage_path,
        storage_path: img.storage_path,
        sort_order: img.sort_order,
        url: db.storage.from('product-images').getPublicUrl(img.storage_path).data.publicUrl,
      })),
  })) as Product[];
}

export default async function ShopPage() {
  const products = await getAllProducts();

  return (
    <div className="container-lp py-10 sm:py-16">
      <h1 className="mb-2 font-display text-3xl font-bold text-ink sm:text-4xl">Shop All Pieces</h1>
      <p className="mb-8 text-sm text-charcoal">Handcrafted frames and personalized gifts, made to order.</p>

      {products.length === 0 ? (
        <p className="text-charcoal">No products available right now — please check back soon.</p>
      ) : (
        <ShopGrid products={products} />
      )}
    </div>
  );
}
