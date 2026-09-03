'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { formatINR } from '@/lib/utils';

export default function OrderConfirmationPage({ params }: { params: { orderId: string } }) {
  const [order, setOrder] = useState<any>(null);
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  // We only have the order number in the URL; ask for the phone once to
  // securely pull details, same rule as order tracking (order ID + mobile).
  async function lookup(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    const res = await fetch('/api/track-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_number: params.orderId, phone }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Could not find your order.');
      return;
    }
    setOrder(data.order);
    setLoaded(true);
  }

  return (
    <div className="container-lp flex flex-col items-center py-12 text-center sm:py-16">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-maroon-50 text-maroon-500">
        <CheckCircle2 size={32} strokeWidth={1.5} />
      </span>
      <h1 className="mt-3 font-display text-2xl font-semibold text-ink sm:text-3xl">
        Order Placed Successfully
      </h1>
      <p className="mt-2 text-sm text-charcoal">Order ID</p>
      <p className="text-lg font-bold text-rose-700">{params.orderId}</p>

      {!loaded ? (
        <form onSubmit={lookup} className="mt-6 w-full max-w-xs space-y-3">
          <p className="text-sm text-charcoal">Enter your mobile number to view order details.</p>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Mobile Number"
            className="w-full rounded-lg border border-rose-200 px-3 py-2.5 text-sm"
          />
          {error && <p className="text-sm font-medium text-red-600">{error}</p>}
          <button type="submit" className="btn-primary w-full">View Order</button>
        </form>
      ) : (
        <div className="card-lp mt-6 w-full max-w-md p-5 text-left">
          <div className="space-y-2 text-sm text-charcoal">
            {order.items?.map((item: any, i: number) => (
              <div key={i} className="flex justify-between">
                <span>{item.product_name_snapshot} × {item.quantity}</span>
                <span>{formatINR(item.line_total)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 space-y-1 border-t border-rose-100 pt-3 text-sm text-charcoal">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatINR(order.subtotal)}</span></div>
            <div className="flex justify-between"><span>Delivery</span><span>{formatINR(order.delivery_charge)}</span></div>
          </div>
          <div className="mt-3 flex justify-between border-t border-rose-100 pt-3 text-base font-bold text-ink">
            <span>Total</span><span>{formatINR(order.total)}</span>
          </div>
          <p className="mt-4 text-sm">
            Payment: <span className="font-medium text-green-700">{order.payment_status}</span>
          </p>
          <p className="text-sm">
            Status: <span className="font-medium text-rose-700">{order.order_status}</span>
          </p>
        </div>
      )}

      <div className="mt-8 flex gap-3">
        <Link href="/shop" className="btn-secondary">Continue Shopping</Link>
        <Link href="/track-order" className="btn-primary">Track Order</Link>
      </div>
    </div>
  );
}
