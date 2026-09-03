import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { nanoid } from 'nanoid';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('file') as File | null;

  if (!file) return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Please upload a JPG, PNG or WEBP image.' }, { status: 400 });
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: 'Image is too large. Max size is 10MB.' }, { status: 400 });
  }

  const db = supabaseAdmin();
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `products/${nanoid()}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const { error } = await db.storage.from('product-images').upload(path, arrayBuffer, {
    contentType: file.type,
    upsert: false,
  });

  if (error) return NextResponse.json({ error: 'Upload failed.' }, { status: 500 });

  return NextResponse.json({ storage_path: path, url: db.storage.from('product-images').getPublicUrl(path).data.publicUrl });
}
