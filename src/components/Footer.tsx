import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-rose-100 bg-white">
      <div className="container-lp grid gap-10 py-14 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <p className="font-display text-lg font-semibold text-rose-700">Chitra</p>
          <p className="mt-3 text-sm text-charcoal">Personalized gifts made with love.</p>
          <p className="mt-4 text-sm text-charcoal">
            Contact:{' '}
            <a href="mailto:hemantnawade@gmail.com" className="underline">
              hemantnawade@gmail.com
            </a>
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-ink">Shop</p>
          <ul className="mt-3 space-y-2 text-sm text-charcoal">
            <li><Link href="/shop">All Products</Link></li>
            <li><Link href="/track-order">Track Order</Link></li>
            <li><Link href="/about">Our Story</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-ink">Policies</p>
          <ul className="mt-3 space-y-2 text-sm text-charcoal">
            <li><Link href="/privacy-policy">Privacy Policy</Link></li>
            <li><Link href="/terms">Terms &amp; Conditions</Link></li>
            <li><Link href="/shipping-policy">Shipping Policy</Link></li>
            <li><Link href="/refund-policy">Refund / Cancellation Policy</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-ink">Made to order</p>
          <p className="mt-3 text-sm text-charcoal">
            Every gift is created after you order — carefully, just for you.
          </p>
        </div>
      </div>

      <div className="border-t border-rose-100 py-5 text-center text-xs text-charcoal">
        <p>© {new Date().getFullYear()} Chitra. All rights reserved.</p>
        <p className="mt-1 text-[11px] text-charcoal/50">Made by Hemant N</p>
      </div>
    </footer>
  );
}
