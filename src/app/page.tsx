import { supabaseAdmin } from '@/lib/supabase/server';
import ProductCard from '@/components/ProductCard';
import Hero from '@/components/Hero';
import Reveal from '@/components/Reveal';
import type { Product } from '@/types';
import { Heart, Palette, Package, Truck, ShieldCheck, Sparkles, Headset } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getFeaturedProducts(): Promise<Product[]> {
  const db = supabaseAdmin();
  const { data: products } = await db
    .from('products')
    .select('id, name, slug, price, description, category, is_personalized, is_active')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .limit(6);

  if (!products) return [];

  const { data: images } = await db
    .from('product_images')
    .select('product_id, storage_path, sort_order')
    .in('product_id', products.map((p) => p.id))
    .order('sort_order', { ascending: true });

  return products.map((p) => ({
    ...p,
    customization_fields: [],
    images: (images || [])
      .filter((img) => img.product_id === p.id)
      .map((img) => ({
        id: img.storage_path,
        storage_path: img.storage_path,
        sort_order: img.sort_order,
        url: db.storage.from('product-images').getPublicUrl(img.storage_path).data.publicUrl,
      })),
  })) as Product[];
}

async function getHomepageCopy() {
  const db = supabaseAdmin();
  const { data } = await db.from('store_settings').select('homepage_headline, homepage_subtext').eq('id', 1).single();
  return {
    headline: data?.homepage_headline || 'Every Frame Tells A Story',
    subtext: data?.homepage_subtext || 'Handcrafted frames, historical portraits, and personalized photo gifts — made to order.',
  };
}

export default async function HomePage() {
  const [products, copy] = await Promise.all([getFeaturedProducts(), getHomepageCopy()]);

  return (
    <div>
      <Hero headline={copy.headline} subtext={copy.subtext} />

      {/* Featured products */}
      <section className="container-lp py-16 sm:py-24">
        <Reveal className="mb-2 text-center">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-maroon-400">Curated</span>
        </Reveal>
        <Reveal>
          <h2 style={{ fontFamily: 'var(--font-impact)' }} className="mb-10 text-center text-4xl uppercase tracking-tight text-ink sm:text-5xl">
            Fresh Drops
          </h2>
        </Reveal>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6">
          {products.map((p, i) => (
            <Reveal key={p.id} delay={Math.min(i * 0.06, 0.3)}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
        {products.length === 0 && (
          <p className="text-center text-charcoal">New pieces are on the way — check back soon.</p>
        )}
      </section>

      {/* Why Chitra */}
      <section className="border-y border-maroon-100 bg-white py-16 sm:py-24">
        <div className="container-lp grid grid-cols-2 gap-8 sm:grid-cols-4">
          {[
            { Icon: Heart, label: 'Made With Care' },
            { Icon: Palette, label: 'Personalized For You' },
            { Icon: Package, label: 'Carefully Packed' },
            { Icon: Truck, label: 'Delivered To Your Door' },
          ].map((item, i) => (
            <Reveal key={item.label} delay={i * 0.08} className="flex flex-col items-center gap-3 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-maroon-50 text-maroon-500">
                <item.Icon size={22} strokeWidth={1.75} />
              </span>
              <p className="text-sm font-medium text-ink">{item.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="container-lp py-16 sm:py-24">
        <Reveal className="mb-2 text-center">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-maroon-400">Process</span>
        </Reveal>
        <Reveal>
          <h2 style={{ fontFamily: 'var(--font-impact)' }} className="mb-10 text-center text-4xl uppercase tracking-tight text-ink sm:text-5xl">
            How It Works
          </h2>
        </Reveal>
        <div className="grid gap-6 sm:grid-cols-4">
          {[
            'Choose Your Piece',
            'Personalize It',
            'Make Payment',
            'We Create & Ship It',
          ].map((step, i) => (
            <Reveal key={step} delay={i * 0.1} className="card-lp flex flex-col items-center gap-3 border border-maroon-50 p-7 text-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-ink font-display text-base font-bold text-ink">
                {i + 1}
              </span>
              <p className="text-sm font-medium text-ink">{step}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Trust section */}
      <section className="border-t border-maroon-100 bg-ink py-16 sm:py-20">
        <div className="container-lp grid grid-cols-2 gap-8 sm:grid-cols-4">
          {[
            { Icon: ShieldCheck, label: 'Secure Online Payment' },
            { Icon: Sparkles, label: 'Personalized Products' },
            { Icon: Package, label: 'Made To Order' },
            { Icon: Headset, label: 'Customer Support' },
          ].map((item, i) => (
            <Reveal key={item.label} delay={i * 0.06} className="flex flex-col items-center gap-2 text-center">
              <item.Icon size={20} strokeWidth={1.75} className="text-gold-200" />
              <span className="text-xs font-medium text-cream/80">{item.label}</span>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
