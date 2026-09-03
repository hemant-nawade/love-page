import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET() {
  const db = supabaseAdmin();

  const { data: products, error } = await db
    .from('products')
    .select('id, name, slug, price, description, category, is_personalized, sort_order')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    return NextResponse.json({ error: 'Could not load products.' }, { status: 500 });
  }

  const productIds = products.map((p) => p.id);

  const { data: images } = await db
    .from('product_images')
    .select('id, product_id, storage_path, sort_order')
    .in('product_id', productIds.length ? productIds : ['00000000-0000-0000-0000-000000000000'])
    .order('sort_order', { ascending: true });

  const withImages = products.map((p) => ({
    ...p,
    images: (images || [])
      .filter((img) => img.product_id === p.id)
      .map((img) => ({
        id: img.id,
        storage_path: img.storage_path,
        sort_order: img.sort_order,
        url: db.storage.from('product-images').getPublicUrl(img.storage_path).data.publicUrl,
      })),
  }));

  return NextResponse.json({ products: withImages });
}
