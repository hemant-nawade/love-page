import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/server';

const BodySchema = z.object({
  order_number: z.string().min(1),
  phone: z.string().min(10).max(15),
});

export async function POST(req: Request) {
  const parsed = BodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Please enter a valid order ID and mobile number.' }, { status: 400 });
  }
  const { order_number, phone } = parsed.data;
  const db = supabaseAdmin();

  const { data: order, error } = await db
    .from('orders')
    .select(
      'id, order_number, order_status, payment_status, created_at, subtotal, delivery_charge, total, customer_phone'
    )
    .eq('order_number', order_number.trim().toUpperCase())
    .eq('customer_phone', phone.trim())
    .single();

  if (error || !order) {
    return NextResponse.json(
      { error: 'We could not find an order matching that order ID and mobile number.' },
      { status: 404 }
    );
  }

  const [{ data: items }, { data: shipment }] = await Promise.all([
    db.from('order_items').select('product_name_snapshot, quantity, line_total').eq('order_id', order.id),
    db
      .from('shipments')
      .select('courier_name, tracking_number, shipping_date, tracking_url')
      .eq('order_id', order.id)
      .maybeSingle(),
  ]);

  return NextResponse.json({
    order: {
      order_number: order.order_number,
      order_status: order.order_status,
      payment_status: order.payment_status,
      created_at: order.created_at,
      subtotal: order.subtotal,
      delivery_charge: order.delivery_charge,
      total: order.total,
      items,
      shipment: shipment || null,
    },
  });
}
