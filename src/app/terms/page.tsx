import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Terms & Conditions' };

export default function TermsPage() {
  return (
    <div className="container-lp max-w-3xl py-14 sm:py-20">
      <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">Terms &amp; Conditions</h1>
      <div className="mt-6 space-y-5 text-sm leading-relaxed text-charcoal">
        <p>By placing an order on Chitra, you agree to the following terms.</p>
        <p>
          All products are made to order based on the photos and details you provide. Please double-check spelling,
          names, dates and uploaded photos before completing payment, as production begins after your order is placed.
        </p>
        <p>
          Payment is required in full at checkout via Razorpay. We do not offer Cash on Delivery.
        </p>
        <p>
          Delivery timelines are estimates and may vary depending on courier availability and location.
        </p>
        <p>
          For questions about a specific order, contact{' '}
          <a href="mailto:hemantnawade@gmail.com" className="text-rose-700 underline">hemantnawade@gmail.com</a>.
        </p>
      </div>
    </div>
  );
}
