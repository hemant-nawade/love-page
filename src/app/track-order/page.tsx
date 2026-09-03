'use client';

import { useState } from 'react';
import { CheckCircle2, Circle, CircleDot } from 'lucide-react';
import { formatINR } from '@/lib/utils';

const STATUS_STEPS = ['Payment Confirmed', 'Processing', 'Packed', 'Shipped', 'Delivered'];

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOrder(null);
    setLoading(true);
    try {
      const res = await fetch('/api/track-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_number: orderNumber, phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setOrder(data.order);
    } catch (e: any) {
      setError(e.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  const currentStepIndex = order ? STATUS_STEPS.indexOf(order.order_status) : -1;
  const isCancelled = order?.order_status === 'Cancelled';

  return (
    <div className="container-lp py-10 sm:py-14">
      <h1 className="mb-6 font-display text-2xl font-semibold text-ink sm:text-3xl">Track Your Order</h1>

      <form onSubmit={handleSubmit} className="card-lp max-w-sm space-y-3 p-5">
        <input
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          placeholder="Order ID (e.g. LP100001)"
          className="w-full rounded-lg border border-rose-200 px-3 py-2.5 text-sm"
        />
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Mobile Number"
          className="w-full rounded-lg border border-rose-200 px-3 py-2.5 text-sm"
        />
        {error && <p className="text-sm font-medium text-red-600">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
          {loading ? 'Searching…' : 'Track Order'}
        </button>
      </form>

      {order && (
        <div className="card-lp mt-8 max-w-lg p-5">
          <p className="text-sm font-semibold text-ink">Order {order.order_number}</p>
          <p className="text-xs text-charcoal">Placed on {new Date(order.created_at).toLocaleDateString('en-IN')}</p>

          {!isCancelled ? (
            <div className="mt-5 space-y-3">
              {STATUS_STEPS.map((step, i) => (
                <div key={step} className="flex items-center gap-3">
                  {i < currentStepIndex ? (
                    <CheckCircle2 size={18} strokeWidth={1.75} className="text-maroon-500" />
                  ) : i === currentStepIndex ? (
                    <CircleDot size={18} strokeWidth={1.75} className="text-maroon-500" />
                  ) : (
                    <Circle size={18} strokeWidth={1.75} className="text-charcoal/30" />
                  )}
                  <span className={`text-sm ${i <= currentStepIndex ? 'font-medium text-ink' : 'text-charcoal'}`}>{step}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm font-medium text-red-600">This order was cancelled.</p>
          )}

          {order.shipment && (
            <div className="mt-5 border-t border-rose-100 pt-4 text-sm text-charcoal">
              <p><span className="font-medium text-ink">Courier:</span> {order.shipment.courier_name}</p>
              <p><span className="font-medium text-ink">Tracking Number:</span> {order.shipment.tracking_number}</p>
              {order.shipment.tracking_url && (
                <a href={order.shipment.tracking_url} target="_blank" rel="noopener noreferrer" className="btn-secondary mt-3 inline-block">
                  Track Shipment
                </a>
              )}
            </div>
          )}

          <div className="mt-5 border-t border-rose-100 pt-4 text-sm text-charcoal">
            {order.items?.map((item: any, i: number) => (
              <div key={i} className="flex justify-between">
                <span>{item.product_name_snapshot} × {item.quantity}</span>
                <span>{formatINR(item.line_total)}</span>
              </div>
            ))}
            <div className="mt-2 flex justify-between border-t border-rose-100 pt-2 font-bold text-ink">
              <span>Total</span><span>{formatINR(order.total)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
