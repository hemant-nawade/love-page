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
            <a href="mailto:hemantnawade@gmail.com" className="underline transition active:opacity-50">
              hemantnawade@gmail.com
            </a>
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-ink">Shop</p>
          <ul className="mt-3 space-y-2 text-sm text-charcoal">
            <li><Link href="/shop" className="transition hover:text-maroon-500 active:opacity-50">All Products</Link></li>
            <li><Link href="/track-order" className="transition hover:text-maroon-500 active:opacity-50">Track Order</Link></li>
            <li><Link href="/about" className="transition hover:text-maroon-500 active:opacity-50">Our Story</Link></li>
            <li><Link href="/contact" className="transition hover:text-maroon-500 active:opacity-50">Contact</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-ink">Policies</p>
          <ul className="mt-3 space-y-2 text-sm text-charcoal">
            <li><Link href="/privacy-policy" className="transition hover:text-maroon-500 active:opacity-50">Privacy Policy</Link></li>
            <li><Link href="/terms" className="transition hover:text-maroon-500 active:opacity-50">Terms &amp; Conditions</Link></li>
            <li><Link href="/shipping-policy" className="transition hover:text-maroon-500 active:opacity-50">Shipping Policy</Link></li>
            <li><Link href="/refund-policy" className="transition hover:text-maroon-500 active:opacity-50">Refund / Cancellation Policy</Link></li>
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