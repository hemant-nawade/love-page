import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/server';

const BodySchema = z.object({
  courier_name: z.string().min(1),
  tracking_number: z.string().min(1),
  shipping_date: z.string().min(1), // ISO date
  tracking_url: z.string().url().optional().or(z.literal('')),
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const parsed = BodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Invalid shipment details.' }, { status: 400 });
  const body = parsed.data;
  const db = supabaseAdmin();

  const { error: shipError } = await db.from('shipments').upsert(
    {
      order_id: params.id,
      courier_name: body.courier_name,
      tracking_number: body.tracking_number,
      shipping_date: body.shipping_date,
      tracking_url: body.tracking_url || null,
    },
    { onConflict: 'order_id' }
  );
  if (shipError) return NextResponse.json({ error: 'Could not save shipment.' }, { status: 500 });

  await db.from('orders').update({ order_status: 'Shipped' }).eq('id', params.id);

  return NextResponse.json({ success: true });
}
