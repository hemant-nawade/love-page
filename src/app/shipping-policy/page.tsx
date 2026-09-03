import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Shipping Policy' };

export default function ShippingPolicyPage() {
  return (
    <div className="container-lp max-w-3xl py-14 sm:py-20">
      <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">Shipping Policy</h1>
      <div className="mt-6 space-y-5 text-sm leading-relaxed text-charcoal">
        <p>A flat delivery charge of ₹50 applies per order, regardless of the number of items.</p>
        <p>
          Since every item is made to order, please allow processing time before your order ships. Once shipped,
          you&rsquo;ll be able to see the courier name and tracking number on your{' '}
          <a href="/track-order" className="text-rose-700 underline">Track Order</a> page.
        </p>
        <p>We currently ship across India.</p>
      </div>
    </div>
  );
}
