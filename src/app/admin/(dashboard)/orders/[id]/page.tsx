'use client';

import { useEffect, useState } from 'react';
import { formatINR } from '@/lib/utils';

const STATUSES = ['Payment Confirmed', 'Processing', 'Packed', 'Shipped', 'Delivered', 'Cancelled'];

export default function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<any>(null);
  const [status, setStatus] = useState('');
  const [ship, setShip] = useState({ courier_name: '', tracking_number: '', shipping_date: '', tracking_url: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    const res = await fetch(`/api/admin/orders/${params.id}`);
    const d = await res.json();
    setData(d);
    setStatus(d.order?.order_status || '');
    if (d.shipment) {
      setShip({
        courier_name: d.shipment.courier_name,
        tracking_number: d.shipment.tracking_number,
        shipping_date: d.shipment.shipping_date,
        tracking_url: d.shipment.tracking_url || '',
      });
    }
  }

  useEffect(() => { load(); }, [params.id]);

  async function updateStatus() {
    setSaving(true);
    await fetch(`/api/admin/orders/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_status: status }),
    });
    setMessage('Status updated.');
    setSaving(false);
    load();
  }

  async function saveShipment() {
    setSaving(true);
    const res = await fetch(`/api/admin/orders/${params.id}/ship`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ship),
    });
    const d = await res.json();
    setMessage(d.error || 'Shipment saved — order marked as Shipped.');
    setSaving(false);
    load();
  }

  if (!data) return <p className="text-sm text-charcoal">Loading…</p>;
  const { order, items } = data;

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="font-display text-xl font-semibold text-ink">Order {order.order_number}</h1>

      <div className="card-lp grid gap-4 p-5 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold text-charcoal">Customer</p>
          <p className="text-sm">{order.customer_name}</p>
          <p className="text-sm">{order.customer_phone}</p>
          <p className="text-sm">{order.customer_email}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-charcoal">Address</p>
          <p className="text-sm">{order.address_line}</p>
          <p className="text-sm">{order.city}, {order.state} {order.pincode}</p>
          {order.landmark && <p className="text-sm">Landmark: {order.landmark}</p>}
        </div>
      </div>

      <div className="card-lp p-5">
        <p className="mb-3 text-sm font-semibold text-ink">Items</p>
        <div className="space-y-4">
          {items.map((item: any) => (
            <div key={item.id} className="border-b border-rose-50 pb-4 last:border-0">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{item.product_name_snapshot} × {item.quantity}</span>
                <span>{formatINR(item.line_total)}</span>
              </div>
              {item.customization?.length > 0 && (
                <ul className="mt-2 space-y-1 text-xs text-charcoal">
                  {item.customization.map((c: any, i: number) => (
                    <li key={i}>{c.field_label}: {c.value}</li>
                  ))}
                </ul>
              )}
              {item.uploaded_images?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {item.uploaded_images.map((img: any) => (
                    <a key={img.id} href={img.signed_url} target="_blank" rel="noopener noreferrer" className="relative h-16 w-16 overflow-hidden rounded-lg border border-rose-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.signed_url} alt="Customer upload" className="h-full w-full object-cover" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-3 space-y-1 border-t border-rose-100 pt-3 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>{formatINR(order.subtotal)}</span></div>
          <div className="flex justify-between"><span>Delivery</span><span>{formatINR(order.delivery_charge)}</span></div>
          <div className="flex justify-between font-bold"><span>Total</span><span>{formatINR(order.total)}</span></div>
        </div>
      </div>

      <div className="card-lp p-5">
        <p className="mb-2 text-sm font-semibold text-ink">Payment</p>
        <p className="text-sm">Status: {order.payment_status}</p>
        {order.razorpay_order_id && <p className="text-xs text-charcoal">Razorpay Order: {order.razorpay_order_id}</p>}
        {order.razorpay_payment_id && <p className="text-xs text-charcoal">Razorpay Payment: {order.razorpay_payment_id}</p>}
      </div>

      <div className="card-lp space-y-3 p-5">
        <p className="text-sm font-semibold text-ink">Order Status</p>
        <div className="flex flex-wrap gap-2">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-rose-200 px-3 py-2 text-sm">
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={updateStatus} disabled={saving} className="btn-secondary">Update Status</button>
        </div>
      </div>

      <div className="card-lp space-y-3 p-5">
        <p className="text-sm font-semibold text-ink">Shipment</p>
        <input placeholder="Courier Name" value={ship.courier_name} onChange={(e) => setShip((s) => ({ ...s, courier_name: e.target.value }))} className="w-full rounded-lg border border-rose-200 px-3 py-2 text-sm" />
        <input placeholder="Tracking / AWB Number" value={ship.tracking_number} onChange={(e) => setShip((s) => ({ ...s, tracking_number: e.target.value }))} className="w-full rounded-lg border border-rose-200 px-3 py-2 text-sm" />
        <input type="date" value={ship.shipping_date} onChange={(e) => setShip((s) => ({ ...s, shipping_date: e.target.value }))} className="w-full rounded-lg border border-rose-200 px-3 py-2 text-sm" />
        <input placeholder="Tracking URL (optional)" value={ship.tracking_url} onChange={(e) => setShip((s) => ({ ...s, tracking_url: e.target.value }))} className="w-full rounded-lg border border-rose-200 px-3 py-2 text-sm" />
        <button onClick={saveShipment} disabled={saving} className="btn-primary">Mark as Shipped</button>
      </div>

      {message && <p className="text-sm font-medium text-green-700">{message}</p>}
    </div>
  );
}
