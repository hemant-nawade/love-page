import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/server';
import { razorpayClient } from '@/lib/razorpay';

const ItemSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().int().min(1).max(20),
});

const BodySchema = z.object({
  items: z.array(ItemSchema).min(1),
});

export async function POST(req: Request) {
  const parsed = BodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid cart.' }, { status: 400 });
  }

  const db = supabaseAdmin();
  const { items } = parsed.data;

  // Recompute price server-side from the database — never trust a client-sent amount.
  const { data: products, error } = await db
    .from('products')
    .select('id, price, is_active')
    .in('id', items.map((i) => i.product_id));

  if (error || !products || products.length !== items.length) {
    return NextResponse.json({ error: 'One or more products are unavailable.' }, { status: 400 });
  }
  if (products.some((p) => !p.is_active)) {
    return NextResponse.json({ error: 'One or more products are no longer available.' }, { status: 400 });
  }

  const { data: settings } = await db.from('store_settings').select('delivery_charge, store_active').single();
  if (!settings?.store_active) {
    return NextResponse.json({ error: 'The store is currently not accepting orders.' }, { status: 400 });
  }

  const subtotal = items.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.product_id)!;
    return sum + product.price * item.quantity;
  }, 0);
  const total = subtotal + Number(settings.delivery_charge);

  const razorpayOrder = await razorpayClient().orders.create({
    amount: Math.round(total * 100), // paise
    currency: 'INR',
    notes: { source: 'love-page-checkout' },
  });

  return NextResponse.json({
    razorpay_order_id: razorpayOrder.id,
    amount: total,
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  });
}
