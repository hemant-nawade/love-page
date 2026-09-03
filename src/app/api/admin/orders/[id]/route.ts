import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const db = supabaseAdmin();

  const { data: order, error } = await db.from('orders').select('*').eq('id', params.id).single();
  if (error || !order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });

  const { data: items } = await db.from('order_items').select('*').eq('order_id', order.id);

  const itemsWithDetails = await Promise.all(
    (items || []).map(async (item) => {
      const [{ data: customization }, { data: uploads }] = await Promise.all([
        db.from('order_customization_data').select('field_label, field_type, value').eq('order_item_id', item.id),
        db.from('order_uploaded_images').select('id, storage_path, original_filename').eq('order_item_id', item.id),
      ]);

      // Private bucket — generate short-lived signed URLs for the admin to view/download.
      const uploadsWithUrls = await Promise.all(
        (uploads || []).map(async (u) => {
          const { data: signed } = await db.storage
            .from('customer-uploads')
            .createSignedUrl(u.storage_path, 60 * 30); // 30 minutes
          return { ...u, signed_url: signed?.signedUrl || null };
        })
      );

      return { ...item, customization, uploaded_images: uploadsWithUrls };
    })
  );

  const { data: shipment } = await db.from('shipments').select('*').eq('order_id', order.id).maybeSingle();

  return NextResponse.json({ order, items: itemsWithDetails, shipment: shipment || null });
}

const UpdateSchema = z.object({
  order_status: z
    .enum(['Payment Confirmed', 'Processing', 'Packed', 'Shipped', 'Delivered', 'Cancelled'])
    .optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const parsed = UpdateSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Invalid update.' }, { status: 400 });

  const db = supabaseAdmin();
  const { error } = await db.from('orders').update(parsed.data).eq('id', params.id);
  if (error) return NextResponse.json({ error: 'Could not update order.' }, { status: 500 });

  return NextResponse.json({ success: true });
}
