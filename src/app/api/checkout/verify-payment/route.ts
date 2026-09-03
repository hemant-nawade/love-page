import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/server';
import { verifyRazorpaySignature } from '@/lib/razorpay';

const CustomizationSchema = z.object({
  field_id: z.string(),
  field_type: z.string(),
  label: z.string(),
  value: z.string().optional(),
  photo_storage_paths: z.array(z.string()).optional(),
});

const ItemSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().int().min(1).max(20),
  customization: z.array(CustomizationSchema).default([]),
});

const BodySchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
  items: z.array(ItemSchema).min(1),
  address: z.object({
    full_name: z.string().min(1),
    phone: z.string().min(10).max(15),
    email: z.string().email(),
    address_line: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    pincode: z.string().min(4).max(10),
    landmark: z.string().optional(),
  }),
});

export async function POST(req: Request) {
  const parsed = BodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid order data.' }, { status: 400 });
  }
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, items, address } = parsed.data;

  // CRITICAL: never trust the frontend's "payment succeeded" callback alone.
  const validSignature = verifyRazorpaySignature({
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  });
  if (!validSignature) {
    return NextResponse.json({ error: 'Payment verification failed.' }, { status: 400 });
  }

  const db = supabaseAdmin();

  const { data: products, error: productError } = await db
    .from('products')
    .select('id, name, price')
    .in('id', items.map((i) => i.product_id));

  if (productError || !products || products.length !== items.length) {
    return NextResponse.json({ error: 'One or more products are unavailable.' }, { status: 400 });
  }

  const { data: settings } = await db.from('store_settings').select('delivery_charge').single();
  const deliveryCharge = Number(settings?.delivery_charge ?? 50);

  const subtotal = items.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.product_id)!;
    return sum + product.price * item.quantity;
  }, 0);
  const total = subtotal + deliveryCharge;

  // Generate the next human-facing order number, e.g. LP100001
  const { data: seqRow, error: seqError } = await db.rpc('nextval_order_number');
  let orderNumber: string;
  if (seqError || !seqRow) {
    // Fallback if the RPC helper wasn't created — see setup notes in README.
    orderNumber = `LP${Date.now().toString().slice(-6)}`;
  } else {
    orderNumber = `LP${seqRow}`;
  }

  const { data: order, error: orderError } = await db
    .from('orders')
    .insert({
      order_number: orderNumber,
      customer_name: address.full_name,
      customer_phone: address.phone,
      customer_email: address.email,
      address_line: address.address_line,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      landmark: address.landmark || null,
      subtotal,
      delivery_charge: deliveryCharge,
      total,
      payment_status: 'paid',
      order_status: 'Payment Confirmed',
      razorpay_order_id,
      razorpay_payment_id,
      paid_at: new Date().toISOString(),
    })
    .select('id, order_number')
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: 'Payment succeeded but order could not be saved. Contact support.' }, { status: 500 });
  }

  for (const item of items) {
    const product = products.find((p) => p.id === item.product_id)!;

    const { data: orderItem, error: itemError } = await db
      .from('order_items')
      .insert({
        order_id: order.id,
        product_id: product.id,
        product_name_snapshot: product.name,
        product_price_snapshot: product.price,
        quantity: item.quantity,
        line_total: product.price * item.quantity,
      })
      .select('id')
      .single();

    if (itemError || !orderItem) continue;

    for (const field of item.customization) {
      if (field.field_type === 'photo' && field.photo_storage_paths?.length) {
        for (const path of field.photo_storage_paths) {
          await db.from('order_uploaded_images').insert({
            order_item_id: orderItem.id,
            storage_path: path,
          });
        }
      } else if (field.value) {
        await db.from('order_customization_data').insert({
          order_item_id: orderItem.id,
          field_label: field.label,
          field_type: field.field_type,
          value: field.value,
        });
      }
    }
  }

  return NextResponse.json({ order_id: order.id, order_number: order.order_number });
}
