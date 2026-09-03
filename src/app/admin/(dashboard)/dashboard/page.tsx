'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, IndianRupee, Clock, RefreshCw, Truck, CheckCircle2, Package, ArrowUpRight } from 'lucide-react';
import { formatINR } from '@/lib/utils';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/admin/orders?stats=true').then((r) => r.json()).then((d) => setStats(d.stats));
    fetch('/api/admin/orders?page=1').then((r) => r.json()).then((d) => setOrders(d.orders || []));
  }, []);

  const cards = stats
    ? [
        { label: 'Total Orders', value: stats.total_orders, Icon: ShoppingBag },
        { label: 'Total Revenue', value: formatINR(stats.total_revenue), Icon: IndianRupee },
        { label: 'Pending', value: stats.pending_orders, Icon: Clock },
        { label: 'Processing', value: stats.processing_orders, Icon: RefreshCw },
        { label: 'Shipped', value: stats.shipped_orders, Icon: Truck },
        { label: 'Delivered', value: stats.delivered_orders, Icon: CheckCircle2 },
        { label: 'Total Products', value: stats.total_products, Icon: Package },
      ]
    : [];

  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-bold text-ink">Dashboard</h1>
      <p className="mb-6 text-sm text-charcoal">A quick look at how the store is doing.</p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl2 border border-maroon-100 bg-white p-4 shadow-soft">
            <div className="flex items-center justify-between">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-maroon-50 text-maroon-500">
                <c.Icon size={16} strokeWidth={1.75} />
              </span>
            </div>
            <p className="mt-3 text-xl font-bold text-ink">{c.value}</p>
            <p className="text-xs text-charcoal">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="mb-3 mt-8 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink">Recent Orders</h2>
        <Link href="/admin/orders" className="flex items-center gap-1 text-xs font-medium text-maroon-500">
          View all <ArrowUpRight size={13} />
        </Link>
      </div>
      <div className="overflow-x-auto rounded-xl2 border border-maroon-100 bg-white shadow-soft">
        <table className="w-full min-w-[600px] text-sm">
          <thead>
            <tr className="border-b border-maroon-100 text-left text-xs text-charcoal">
              <th className="p-3">Order ID</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Payment</th>
              <th className="p-3">Status</th>
              <th className="p-3">Date</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-maroon-50 last:border-0">
                <td className="p-3 font-medium">{o.order_number}</td>
                <td className="p-3">{o.customer_name}</td>
                <td className="p-3">{formatINR(o.total)}</td>
                <td className="p-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${o.payment_status === 'paid' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                    {o.payment_status}
                  </span>
                </td>
                <td className="p-3">{o.order_status}</td>
                <td className="p-3">{new Date(o.created_at).toLocaleDateString('en-IN')}</td>
                <td className="p-3">
                  <Link href={`/admin/orders/${o.id}`} className="text-maroon-500 underline">View</Link>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={7} className="p-6 text-center text-charcoal">No orders yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
