'use client';

import { useEffect, useState } from 'react';

export default function IntroLoader() {
  const [show, setShow] = useState(true);
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => setVisible(true), 50);
    const exitTimer = setTimeout(() => setExiting(true), 1800);
    const hideTimer = setTimeout(() => setShow(false), 2400);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(exitTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-[#211611] transition-opacity duration-500 ${
        exiting ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <p
          style={{ fontFamily: 'var(--font-devanagari)' }}
          className={`text-6xl font-semibold text-white transition-all duration-700 ease-out sm:text-7xl ${
            visible ? 'scale-100 opacity-100' : 'scale-150 opacity-0'
          }`}
        >
          चित्र
        </p>
        <p
          className={`mt-4 text-[10px] font-medium tracking-widest text-white/40 transition-opacity delay-700 duration-500 ${
            visible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          IDEA BY HEMANT N
        </p>
      </div>
    </div>
  );
}