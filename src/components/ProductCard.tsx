'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ImageOff, ArrowRight } from 'lucide-react';
import type { Product } from '@/types';
import { formatINR } from '@/lib/utils';

export default function ProductCard({ product }: { product: Product }) {
  const image = product.images?.[0]?.url;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="card-lp group overflow-hidden border border-maroon-50"
    >
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-maroon-50">
          {image ? (
            <motion.div whileHover={{ scale: 1.06 }} transition={{ duration: 0.4, ease: 'easeOut' }} className="h-full w-full">
              <Image
                src={image}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 50vw, 33vw"
                className="object-contain"
              />
            </motion.div>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-maroon-200">
              <ImageOff size={28} strokeWidth={1.5} />
            </div>
          )}
          {product.category && (
            <span className="absolute left-2 top-2 rounded-full bg-cream/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-ink">
              {product.category}
            </span>
          )}
        </div>
        <div className="p-3 sm:p-4">
          <p className="line-clamp-1 text-sm font-semibold text-ink sm:text-base">{product.name}</p>
          <p className="mt-1 line-clamp-1 text-xs text-charcoal sm:text-sm">{product.description}</p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm font-bold text-ink sm:text-base">{formatINR(product.price)}</span>
            <motion.span
              className="flex items-center gap-0.5 text-xs font-medium text-maroon-500"
              initial={{ x: 0 }}
              whileHover={{ x: 3 }}
            >
              View <ArrowRight size={12} strokeWidth={2} />
            </motion.span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
