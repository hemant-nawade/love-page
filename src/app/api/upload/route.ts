import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { nanoid } from 'nanoid';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
const MAX_SIZE_BYTES = 15 * 1024 * 1024; // 15MB per photo

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Please upload a JPG, PNG, WEBP or HEIC image.' }, { status: 400 });
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: 'Image is too large. Max size is 15MB.' }, { status: 400 });
  }

  const db = supabaseAdmin();
  const ext = file.name.split('.').pop() || 'jpg';
  // Stored under a "pending" prefix until an order is confirmed; the path itself
  // is never publicly guessable since this is a private bucket accessed only
  // via the service role key.
  const path = `pending/${nanoid()}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const { error } = await db.storage.from('customer-uploads').upload(path, arrayBuffer, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 });
  }

  return NextResponse.json({ storage_path: path, original_filename: file.name, file_size_bytes: file.size });
}
