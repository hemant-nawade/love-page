'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/components/CartProvider';
import { formatINR } from '@/lib/utils';

const DELIVERY_CHARGE = 50; // shown as default; checkout re-verifies against store_settings server-side

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal } = useCart();
  const total = items.length ? subtotal + DELIVERY_CHARGE : 0;

  if (items.length === 0) {
    return (
      <div className="container-lp flex flex-col items-center gap-4 py-24 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-maroon-50 text-maroon-400">
          <ShoppingBag size={26} strokeWidth={1.5} />
        </span>
        <p className="text-lg font-medium text-ink">Your cart is empty</p>
        <Link href="/shop" className="btn-primary">Shop Now</Link>
      </div>
    );
  }

  return (
    <div className="container-lp py-8 sm:py-12">
      <h1 className="mb-6 font-display text-2xl font-semibold text-ink sm:text-3xl">Your Cart</h1>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="space-y-4 md:col-span-2">
          {items.map((item, i) => (
            <div key={i} className="card-lp flex gap-4 p-4">
              <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-rose-50">
                {item.product_image ? (
                  <Image src={item.product_image} alt={item.product_name} fill sizes="80px" className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-rose-300">❤️</div>
                )}
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <p className="text-sm font-semibold text-ink sm:text-base">{item.product_name}</p>
                  <p className="text-sm text-rose-700">{formatINR(item.product_price)}</p>
                  {item.customization?.some((c) => c.value) && (
                    <p className="mt-1 text-xs text-charcoal">
                      {item.customization.filter((c) => c.value).map((c) => `${c.label}: ${c.value}`).join(' · ')}
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center rounded-full border border-rose-200">
                    <button onClick={() => updateQuantity(i, item.quantity - 1)} className="h-8 w-8 text-base">−</button>
                    <span className="w-7 text-center text-sm font-semibold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(i, item.quantity + 1)} className="h-8 w-8 text-base">+</button>
                  </div>
                  <button onClick={() => removeItem(i)} className="text-xs font-medium text-charcoal underline">
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="card-lp h-fit p-5">
          <p className="mb-4 text-sm font-semibold text-ink">Order Summary</p>
          <div className="space-y-2 text-sm text-charcoal">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatINR(subtotal)}</span></div>
            <div className="flex justify-between"><span>Delivery</span><span>{formatINR(DELIVERY_CHARGE)}</span></div>
          </div>
          <div className="mt-3 flex justify-between border-t border-rose-100 pt-3 text-base font-bold text-ink">
            <span>Total</span><span>{formatINR(total)}</span>
          </div>
          <Link href="/checkout" className="btn-primary mt-5 block text-center">Proceed to Checkout</Link>
        </div>
      </div>
    </div>
  );
}
