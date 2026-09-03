'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

const MARQUEE_TEXT = 'HANDCRAFTED FRAMES · PERSONALIZED GIFTS · MADE TO ORDER · ';

export default function Hero({ headline, subtext }: { headline: string; subtext: string }) {
  return (
    <>
      <section className="relative flex min-h-[560px] items-center overflow-hidden sm:min-h-[640px]">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src="/hero-bg.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-ink/10 via-ink/5 to-ink/30" />

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="container-lp relative flex flex-col items-center gap-6 py-16 text-center sm:py-24"
        >
          <motion.span
            variants={item}
            className="rounded-full border border-ink/20 bg-cream/90 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-ink"
          >
            Made to order, made with care
          </motion.span>

          <motion.h1
            variants={item}
            style={{ fontFamily: 'var(--font-impact)' }}
            className="max-w-4xl text-6xl uppercase leading-[0.9] tracking-tight text-ink sm:text-8xl"
          >
            {headline}
          </motion.h1>

          <motion.p variants={item} className="max-w-md text-base font-medium text-ink/80 sm:text-lg">
            {subtext}
          </motion.p>

          <motion.div variants={item} className="flex flex-col gap-3 sm:flex-row">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link href="/shop" className="btn-primary">Shop Now</Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link href="/shop" className="btn-secondary">Explore Frames</Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Scrolling marquee strip */}
      <div className="overflow-hidden border-y border-ink bg-ink py-3">
        <motion.div
          className="flex whitespace-nowrap"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <span
              key={i}
              style={{ fontFamily: 'var(--font-impact)' }}
              className="mx-4 shrink-0 text-lg uppercase tracking-wide text-cream/90 sm:text-xl"
            >
              {MARQUEE_TEXT}
            </span>
          ))}
        </motion.div>
      </div>
    </>
  );
}
