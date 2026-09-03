import type { Metadata } from 'next';
import { Inter, Noto_Serif_Devanagari, Playfair_Display, Anton } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CartProvider } from '@/components/CartProvider';
import IntroLoader from '@/components/IntroLoader';

const devanagari = Noto_Serif_Devanagari({ subsets: ['devanagari'], variable: '--font-devanagari', weight: ['500', '600', '700'] });
const display = Playfair_Display({ subsets: ['latin'], variable: '--font-display', weight: ['500', '600', '700', '800'] });
const impact = Anton({ subsets: ['latin'], variable: '--font-impact', weight: '400' });
const body = Inter({ subsets: ['latin'], variable: '--font-body' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'Chitra — Frames, Art and Personalized Gifts',
    template: '%s | Chitra',
  },
  description:
    'Handcrafted frames, historical portraits, and personalized photo gifts. Made to order, made with care.',
  openGraph: {
    title: 'Chitra — Frames, Art and Personalized Gifts',
    description: 'Handcrafted frames, historical portraits, and personalized photo gifts.',
    siteName: 'Chitra',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${devanagari.variable} ${display.variable} ${impact.variable} ${body.variable}`}>
      <body className="font-body">
        <IntroLoader />
        <CartProvider>
          <Header />
          <main className="min-h-[60vh]">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
