import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase/server';
import ProductPurchaseForm from '@/components/ProductPurchaseForm';
import type { Metadata } from 'next';

async function getProduct(slug: string) {
  const db = supabaseAdmin();
  const { data: product, error } = await db
    .from('products')
    .select('id, name, slug, price, description, category, is_personalized')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error || !product) return null;

  const [{ data: images }, { data: fields }] = await Promise.all([
    db.from('product_images').select('id, storage_path, sort_order').eq('product_id', product.id).order('sort_order'),
    db
      .from('product_customization_fields')
      .select('id, field_type, label, is_required, max_photos, sort_order')
      .eq('product_id', product.id)
      .order('sort_order'),
  ]);

  return {
    ...product,
    images: (images || []).map((img) => ({
      ...img,
      url: db.storage.from('product-images').getPublicUrl(img.storage_path).data.publicUrl,
    })),
    customization_fields: fields || [],
  };
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProduct(params.slug);
  if (!product) return { title: 'Product Not Found' };
  return {
    title: product.name,
    description: product.description?.slice(0, 155),
    openGraph: { title: product.name, description: product.description?.slice(0, 155) },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);
  if (!product) notFound();

  return (
    <div className="container-lp py-8 sm:py-12">
      <ProductPurchaseForm product={product} />
    </div>
  );
}
