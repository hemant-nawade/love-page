'use client';

import { useState } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/CartProvider';
import { formatINR } from '@/lib/utils';

const DELIVERY_CHARGE = 50;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const [form, setForm] = useState({
    full_name: '', phone: '', email: '', address_line: '', city: '', state: '', pincode: '', landmark: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = subtotal + DELIVERY_CHARGE;

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function validate(): boolean {
    if (!form.full_name || !form.phone || !form.email || !form.address_line || !form.city || !form.state || !form.pincode) {
      setError('Please fill in all required fields.');
      return false;
    }
    if (form.phone.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid mobile number.');
      return false;
    }
    return true;
  }

  async function handlePay() {
    setError(null);
    if (items.length === 0) {
      setError('Your cart is empty.');
      return;
    }
    if (!validate()) return;
    setLoading(true);

    try {
      const orderRes = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
        }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || 'Could not start checkout.');

      const razorpay = new (window as any).Razorpay({
        key: orderData.key_id,
        amount: Math.round(orderData.amount * 100),
        currency: 'INR',
        name: 'Chitra',
        description: 'Personalized gifts, made to order',
        order_id: orderData.razorpay_order_id,
        prefill: { name: form.full_name, email: form.email, contact: form.phone },
        theme: { color: '#BC3644' },
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch('/api/checkout/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                address: form,
                items: items.map((i) => ({
                  product_id: i.product_id,
                  quantity: i.quantity,
                  customization: (i.customization || []).map((c) => {
                    const photoRef = i.uploadedFileRefs?.find((r) => r.field_id === c.field_id);
                    return {
                      field_id: c.field_id,
                      field_type: c.field_type,
                      label: c.label,
                      value: c.value,
                      photo_storage_paths: photoRef?.temp_paths,
                    };
                  }),
                })),
              }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.error || 'Payment verification failed.');

            clearCart();
            router.push(`/order-confirmation/${verifyData.order_number}`);
          } catch (e: any) {
            setError(e.message || 'Something went wrong confirming your order. Please contact support.');
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      });

      razorpay.open();
    } catch (e: any) {
      setError(e.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return <div className="container-lp py-20 text-center text-charcoal">Your cart is empty.</div>;
  }

  return (
    <div className="container-lp py-8 sm:py-12">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <h1 className="mb-6 font-display text-2xl font-semibold text-ink sm:text-3xl">Checkout</h1>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="space-y-4 md:col-span-2">
          <div className="card-lp space-y-3 p-5">
            <p className="text-sm font-semibold text-ink">Your Details</p>
            <input placeholder="Full Name *" value={form.full_name} onChange={(e) => update('full_name', e.target.value)} className="w-full rounded-lg border border-rose-200 px-3 py-2.5 text-base" />
            <input placeholder="Mobile Number *" value={form.phone} onChange={(e) => update('phone', e.target.value)} className="w-full rounded-lg border border-rose-200 px-3 py-2.5 text-base" />
            <input placeholder="Email *" value={form.email} onChange={(e) => update('email', e.target.value)} className="w-full rounded-lg border border-rose-200 px-3 py-2.5 text-base" />
          </div>

          <div className="card-lp space-y-3 p-5">
            <p className="text-sm font-semibold text-ink">Shipping Address</p>
            <input placeholder="Address *" value={form.address_line} onChange={(e) => update('address_line', e.target.value)} className="w-full rounded-lg border border-rose-200 px-3 py-2.5 text-base" />
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="City *" value={form.city} onChange={(e) => update('city', e.target.value)} className="rounded-lg border border-rose-200 px-3 py-2.5 text-base" />
              <input placeholder="State *" value={form.state} onChange={(e) => update('state', e.target.value)} className="rounded-lg border border-rose-200 px-3 py-2.5 text-base" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="PIN Code *" value={form.pincode} onChange={(e) => update('pincode', e.target.value)} className="rounded-lg border border-rose-200 px-3 py-2.5 text-base" />
              <input placeholder="Landmark (optional)" value={form.landmark} onChange={(e) => update('landmark', e.target.value)} className="rounded-lg border border-rose-200 px-3 py-2.5 text-base" />
            </div>
          </div>
        </div>

        <div className="card-lp h-fit p-5">
          <p className="mb-4 text-sm font-semibold text-ink">Order Summary</p>
          <div className="space-y-2 text-sm text-charcoal">
            {items.map((item, i) => (
              <div key={i} className="flex justify-between">
                <span>{item.product_name} × {item.quantity}</span>
                <span>{formatINR(item.product_price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 space-y-1 border-t border-rose-100 pt-3 text-sm text-charcoal">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatINR(subtotal)}</span></div>
            <div className="flex justify-between"><span>Delivery</span><span>{formatINR(DELIVERY_CHARGE)}</span></div>
          </div>
          <div className="mt-3 flex justify-between border-t border-rose-100 pt-3 text-base font-bold text-ink">
            <span>Total</span><span>{formatINR(total)}</span>
          </div>

          {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}

          <button onClick={handlePay} disabled={loading} className="btn-primary mt-5 w-full disabled:opacity-60">
            {loading ? 'Processing…' : 'Pay Securely'}
          </button>
          <p className="mt-3 text-center text-xs text-charcoal">💳 Secure payment via Razorpay (UPI, cards & more)</p>
        </div>
      </div>
    </div>
  );
}
