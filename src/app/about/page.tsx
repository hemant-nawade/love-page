import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Our Story' };

export default function AboutPage() {
  return (
    <div className="container-lp py-14 sm:py-20">
      <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">Our Story</h1>
      <div className="mt-4 max-w-2xl space-y-4 text-charcoal">
        <p>
          Chitra began with a simple idea: the best gifts aren&rsquo;t the most expensive ones — they&rsquo;re
          the ones that hold a memory. A photo, a message, a moment that means something only to the two of you.
        </p>
        <p>
          Every piece we make is created after you order it, personalized with your photos and words, and put
          together carefully by hand — never mass-produced, never generic.
        </p>
        <p>
          We&rsquo;re just getting started, and we&rsquo;re glad you&rsquo;re here.
        </p>
      </div>
    </div>
  );
}
