import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Contact Us' };

export default function ContactPage() {
  return (
    <div className="container-lp py-14 sm:py-20">
      <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">Contact Us</h1>
      <p className="mt-4 max-w-md text-charcoal">
        Have a question about your order or want help choosing a gift? We&rsquo;d love to hear from you.
      </p>
      <div className="mt-6 space-y-2 text-sm text-charcoal">
        <p>
          Email:{' '}
          <a href="mailto:hemantnawade@gmail.com" className="font-medium text-rose-700 underline">
            hemantnawade@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
}
