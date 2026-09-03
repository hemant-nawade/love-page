import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/server';
import { slugify } from '@/lib/utils';

export async function GET() {
  const db = supabaseAdmin();
  const { data: products, error } = await db
    .from('products')
    .select('id, name, slug, price, category, is_personalized, is_active, sort_order, created_at')
    .order('sort_order', { ascending: true });

  if (error) return NextResponse.json({ error: 'Could not load products.' }, { status: 500 });
  return NextResponse.json({ products });
}

const FieldSchema = z.object({
  field_type: z.enum(['photo', 'text', 'name', 'date', 'note']),
  label: z.string().min(1),
  is_required: z.boolean().default(false),
  max_photos: z.number().int().min(1).max(10).optional(),
  sort_order: z.number().int().default(0),
});

const BodySchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
  description: z.string().default(''),
  category: z.string().optional(),
  is_personalized: z.boolean().default(true),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().default(0),
  customization_fields: z.array(FieldSchema).default([]),
  image_storage_paths: z.array(z.string()).default([]),
});

export async function POST(req: Request) {
  const parsed = BodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid product data.', details: parsed.error.flatten() }, { status: 400 });
  }
  const body = parsed.data;
  const db = supabaseAdmin();

  let slug = slugify(body.name);
  const { data: existing } = await db.from('products').select('id').eq('slug', slug).maybeSingle();
  if (existing) slug = `${slug}-${Date.now().toString().slice(-4)}`;

  const { data: product, error } = await db
    .from('products')
    .insert({
      name: body.name,
      slug,
      price: body.price,
      description: body.description,
      category: body.category || null,
      is_personalized: body.is_personalized,
      is_active: body.is_active,
      sort_order: body.sort_order,
    })
    .select('id, slug')
    .single();

  if (error || !product) return NextResponse.json({ error: 'Could not create product.' }, { status: 500 });

  if (body.customization_fields.length) {
    await db.from('product_customization_fields').insert(
      body.customization_fields.map((f, i) => ({
        product_id: product.id,
        field_type: f.field_type,
        label: f.label,
        is_required: f.is_required,
        max_photos: f.max_photos ?? 1,
        sort_order: f.sort_order ?? i,
      }))
    );
  }

  if (body.image_storage_paths.length) {
    await db.from('product_images').insert(
      body.image_storage_paths.map((path, i) => ({
        product_id: product.id,
        storage_path: path,
        sort_order: i,
      }))
    );
  }

  return NextResponse.json({ product });
}
