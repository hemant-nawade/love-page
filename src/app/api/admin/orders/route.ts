import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(req: Request) {
  const db = supabaseAdmin();
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const pageSize = 20;
  const status = searchParams.get('status');
  const stats = searchParams.get('stats') === 'true';

  if (stats) {
    const [{ count: total }, { count: pending }, { count: processing }, { count: shipped }, { count: delivered }, { data: revenueRows }, { count: totalProducts }] =
      await Promise.all([
        db.from('orders').select('id', { count: 'exact', head: true }),
        db.from('orders').select('id', { count: 'exact', head: true }).eq('order_status', 'Payment Confirmed'),
        db.from('orders').select('id', { count: 'exact', head: true }).eq('order_status', 'Processing'),
        db.from('orders').select('id', { count: 'exact', head: true }).eq('order_status', 'Shipped'),
        db.from('orders').select('id', { count: 'exact', head: true }).eq('order_status', 'Delivered'),
        db.from('orders').select('total').eq('payment_status', 'paid'),
        db.from('products').select('id', { count: 'exact', head: true }),
      ]);

    const totalRevenue = (revenueRows || []).reduce((sum, r) => sum + Number(r.total), 0);

    return NextResponse.json({
      stats: {
        total_orders: total || 0,
        pending_orders: pending || 0,
        processing_orders: processing || 0,
        shipped_orders: shipped || 0,
        delivered_orders: delivered || 0,
        total_revenue: totalRevenue,
        total_products: totalProducts || 0,
      },
    });
  }

  let query = db
    .from('orders')
    .select('id, order_number, customer_name, total, payment_status, order_status, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (status) query = query.eq('order_status', status);

  const { data: orders, count, error } = await query;
  if (error) return NextResponse.json({ error: 'Could not load orders.' }, { status: 500 });

  return NextResponse.json({ orders, total: count, page, pageSize });
}
