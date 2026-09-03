import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const db = supabaseAdmin();
  const { data: product, error } = await db.from('products').select('*').eq('id', params.id).single();
  if (error || !product) return NextResponse.json({ error: 'Product not found.' }, { status: 404 });

  const [{ data: images }, { data: fields }] = await Promise.all([
    db.from('product_images').select('*').eq('product_id', params.id).order('sort_order'),
    db.from('product_customization_fields').select('*').eq('product_id', params.id).order('sort_order'),
  ]);

  const imagesWithUrls = (images || []).map((img) => ({
    ...img,
    url: db.storage.from('product-images').getPublicUrl(img.storage_path).data.publicUrl,
  }));

  return NextResponse.json({ product: { ...product, images: imagesWithUrls, customization_fields: fields } });
}

const FieldSchema = z.object({
  id: z.string().optional(),
  field_type: z.enum(['photo', 'text', 'name', 'date', 'note']),
  label: z.string().min(1),
  is_required: z.boolean().default(false),
  max_photos: z.number().int().min(1).max(10).optional(),
  sort_order: z.number().int().default(0),
});

const UpdateSchema = z.object({
  name: z.string().min(1).optional(),
  price: z.number().positive().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  is_personalized: z.boolean().optional(),
  is_active: z.boolean().optional(),
  sort_order: z.number().int().optional(),
  customization_fields: z.array(FieldSchema).optional(),
  image_storage_paths: z.array(z.string()).optional(),
});

// IMPORTANT: editing or deleting a product must never alter past orders.
// order_items stores its own name/price snapshot taken at purchase time,
// so changes here (including price changes) never retroactively affect
// historical orders.
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const parsed = UpdateSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Invalid update.' }, { status: 400 });
  const body = parsed.data;
  const db = supabaseAdmin();

  const { customization_fields, image_storage_paths, ...productFields } = body;

  if (Object.keys(productFields).length) {
    const { error } = await db.from('products').update(productFields).eq('id', params.id);
    if (error) return NextResponse.json({ error: 'Could not update product.' }, { status: 500 });
  }

  if (customization_fields) {
    await db.from('product_customization_fields').delete().eq('product_id', params.id);
    if (customization_fields.length) {
      await db.from('product_customization_fields').insert(
        customization_fields.map((f, i) => ({
          product_id: params.id,
          field_type: f.field_type,
          label: f.label,
          is_required: f.is_required,
          max_photos: f.max_photos ?? 1,
          sort_order: f.sort_order ?? i,
        }))
      );
    }
  }

  if (image_storage_paths) {
    await db.from('product_images').delete().eq('product_id', params.id);
    if (image_storage_paths.length) {
      await db.from('product_images').insert(
        image_storage_paths.map((path, i) => ({ product_id: params.id, storage_path: path, sort_order: i }))
      );
    }
  }

  return NextResponse.json({ success: true });
}

// Safe delete: if the product has past orders, archive (hide) it instead of
// hard-deleting, so order history keeps its foreign key intact.
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const db = supabaseAdmin();

  const { count } = await db
    .from('order_items')
    .select('id', { count: 'exact', head: true })
    .eq('product_id', params.id);

  if (count && count > 0) {
    await db.from('products').update({ is_active: false }).eq('id', params.id);
    return NextResponse.json({ archived: true, message: 'Product has past orders — hidden instead of deleted.' });
  }

  await db.from('product_images').delete().eq('product_id', params.id);
  await db.from('product_customization_fields').delete().eq('product_id', params.id);
  const { error } = await db.from('products').delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: 'Could not delete product.' }, { status: 500 });

  return NextResponse.json({ deleted: true });
}
