import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Refund & Cancellation Policy' };

export default function RefundPolicyPage() {
  return (
    <div className="container-lp max-w-3xl py-14 sm:py-20">
      <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">Refund / Cancellation Policy</h1>
      <div className="mt-6 space-y-5 text-sm leading-relaxed text-charcoal">
        <p>
          Because every item is personalized and made to order specifically for you, we&rsquo;re unable to accept
          cancellations or offer refunds once production has started.
        </p>
        <p>
          If you notice an error in your order (wrong photo, spelling mistake, etc.) please contact us immediately
          at{' '}
          <a href="mailto:hemantnawade@gmail.com" className="text-rose-700 underline">hemantnawade@gmail.com</a>{' '}
          — we&rsquo;ll do our best to help before production begins.
        </p>
        <p>
          If an item arrives damaged or defective, please reach out with photos within 48 hours of delivery so we
          can make it right.
        </p>
      </div>
    </div>
  );
}
