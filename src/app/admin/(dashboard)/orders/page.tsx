'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatINR } from '@/lib/utils';

const STATUSES = ['Payment Confirmed', 'Processing', 'Packed', 'Shipped', 'Delivered', 'Cancelled'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const url = status ? `/api/admin/orders?status=${encodeURIComponent(status)}` : '/api/admin/orders';
    fetch(url).then((r) => r.json()).then((d) => { setOrders(d.orders || []); setLoading(false); });
  }, [status]);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-xl font-semibold text-ink">Orders</h1>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-rose-200 px-3 py-2 text-sm">
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-charcoal">Loading…</p>
      ) : (
        <div className="card-lp overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="border-b border-rose-100 text-left text-xs text-charcoal">
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
                <tr key={o.id} className="border-b border-rose-50">
                  <td className="p-3 font-medium">{o.order_number}</td>
                  <td className="p-3">{o.customer_name}</td>
                  <td className="p-3">{formatINR(o.total)}</td>
                  <td className="p-3">{o.payment_status}</td>
                  <td className="p-3">{o.order_status}</td>
                  <td className="p-3">{new Date(o.created_at).toLocaleDateString('en-IN')}</td>
                  <td className="p-3"><Link href={`/admin/orders/${o.id}`} className="text-rose-700 underline">View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
