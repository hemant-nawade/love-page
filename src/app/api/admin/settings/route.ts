import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET() {
  const db = supabaseAdmin();
  const { data: settings, error } = await db.from('store_settings').select('*').eq('id', 1).single();
  if (error) return NextResponse.json({ error: 'Could not load settings.' }, { status: 500 });
  return NextResponse.json({ settings });
}

const BodySchema = z.object({
  store_name: z.string().min(1).optional(),
  support_email: z.string().email().optional(),
  delivery_charge: z.number().min(0).optional(),
  store_active: z.boolean().optional(),
  instagram_url: z.string().url().optional().or(z.literal('')),
  whatsapp_number: z.string().optional(),
  homepage_headline: z.string().optional(),
  homepage_subtext: z.string().optional(),
});

export async function PATCH(req: Request) {
  const parsed = BodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Invalid settings.' }, { status: 400 });

  const db = supabaseAdmin();
  const { error } = await db.from('store_settings').update(parsed.data).eq('id', 1);
  if (error) return NextResponse.json({ error: 'Could not update settings.' }, { status: 500 });

  return NextResponse.json({ success: true });
}
