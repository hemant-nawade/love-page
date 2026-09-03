import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const db = supabaseAdmin();

  const { data: product, error } = await db
    .from('products')
    .select('id, name, slug, price, description, category, is_personalized')
    .eq('slug', params.slug)
    .eq('is_active', true)
    .single();

  if (error || !product) {
    return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
  }

  const [{ data: images }, { data: fields }] = await Promise.all([
    db
      .from('product_images')
      .select('id, storage_path, sort_order')
      .eq('product_id', product.id)
      .order('sort_order', { ascending: true }),
    db
      .from('product_customization_fields')
      .select('id, field_type, label, is_required, max_photos, sort_order')
      .eq('product_id', product.id)
      .order('sort_order', { ascending: true }),
  ]);

  return NextResponse.json({
    product: {
      ...product,
      images: (images || []).map((img) => ({
        ...img,
        url: db.storage.from('product-images').getPublicUrl(img.storage_path).data.publicUrl,
      })),
      customization_fields: fields || [],
    },
  });
}
