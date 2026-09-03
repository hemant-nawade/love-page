import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Privacy Policy' };

export default function PrivacyPolicyPage() {
  return (
    <div className="container-lp max-w-3xl py-14 sm:py-20">
      <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">Privacy Policy</h1>
      <div className="mt-6 space-y-5 text-sm leading-relaxed text-charcoal">
        <p>
          Chitra (&ldquo;we&rdquo;, &ldquo;us&rdquo;) collects the information you provide at checkout — your
          name, mobile number, email, shipping address, and any photos or personalization details you upload — in
          order to create and deliver your order.
        </p>
        <p>
          Personalization photos are stored securely and are used only to produce your gift. They are not shared
          publicly or with third parties, other than the payment processor (Razorpay) needed to process payment.
        </p>
        <p>
          We do not sell your personal information. We retain order information for as long as needed to fulfil
          your order and for legitimate business record-keeping.
        </p>
        <p>
          For any questions about your data, contact us at{' '}
          <a href="mailto:hemantnawade@gmail.com" className="text-rose-700 underline">hemantnawade@gmail.com</a>.
        </p>
      </div>
    </div>
  );
}
