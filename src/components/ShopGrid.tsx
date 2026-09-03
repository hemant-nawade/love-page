'use client';

import { useMemo, useState } from 'react';
import ProductCard from './ProductCard';
import type { Product } from '@/types';

export default function ShopGrid({ products }: { products: Product[] }) {
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ['All', ...Array.from(set)];
  }, [products]);

  const [active, setActive] = useState('All');

  const filtered = active === 'All' ? products : products.filter((p) => p.category === active);

  return (
    <div>
      {categories.length > 1 && (
        <div className="mb-8 flex gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                active === cat ? 'bg-ink text-cream' : 'bg-maroon-50 text-charcoal hover:bg-maroon-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6">
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="text-charcoal">No products in this category yet.</p>
      )}
    </div>
  );
}
