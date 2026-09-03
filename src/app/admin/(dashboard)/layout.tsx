'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingBag, Settings, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

const NAV = [
  { href: '/admin/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', Icon: Package },
  { href: '/admin/orders', label: 'Orders', Icon: ShoppingBag },
  { href: '/admin/settings', label: 'Settings', Icon: Settings },
];

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function logout() {
    await fetch('/api/admin/login', { method: 'DELETE' });
    router.push('/admin/login');
  }

  return (
    <div className="min-h-screen bg-[#F7F3EC]">
      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-maroon-100 bg-ink px-4 py-3 md:hidden">
        <span style={{ fontFamily: 'var(--font-devanagari)' }} className="text-lg font-semibold text-cream">चित्र</span>
        <button onClick={() => setMobileOpen((o) => !o)} className="text-cream">
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${mobileOpen ? 'block' : 'hidden'} w-full border-b border-maroon-900 bg-ink md:sticky md:top-0 md:block md:h-screen md:w-60 md:border-b-0 md:border-r`}>
          <div className="hidden px-6 py-6 md:block">
            <span style={{ fontFamily: 'var(--font-devanagari)' }} className="text-xl font-semibold text-cream">चित्र</span>
            <p className="mt-0.5 text-[11px] uppercase tracking-wide text-cream/50">Admin</p>
          </div>
          <nav className="flex flex-col gap-1 px-3 py-3 md:py-0">
            {NAV.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    active ? 'bg-maroon-500 text-cream' : 'text-cream/70 hover:bg-white/5 hover:text-cream'
                  }`}
                >
                  <item.Icon size={18} strokeWidth={1.75} />
                  {item.label}
                </Link>
              );
            })}
            <button
              onClick={logout}
              className="mt-2 flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-cream/50 transition hover:bg-white/5 hover:text-cream"
            >
              <LogOut size={18} strokeWidth={1.75} />
              Log out
            </button>
          </nav>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
