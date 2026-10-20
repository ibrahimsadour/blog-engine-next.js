'use client';

import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface MobileNavigationProps {
  links: { id: string; label: string; href: string }[];
}

export default function MobileNavigation({ links }: MobileNavigationProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const closeOnOutsideClick = (event: PointerEvent) => {
      const details = detailsRef.current;
      if (details?.open && event.target instanceof Node && !details.contains(event.target)) {
        details.open = false;
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      const details = detailsRef.current;
      if (event.key === 'Escape' && details?.open) {
        details.open = false;
        details.querySelector('summary')?.focus();
      }
    };
    const desktop = window.matchMedia('(min-width: 1024px)');
    const closeOnDesktop = () => {
      if (desktop.matches && detailsRef.current) detailsRef.current.open = false;
    };
    document.addEventListener('pointerdown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    desktop.addEventListener('change', closeOnDesktop);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
      desktop.removeEventListener('change', closeOnDesktop);
    };
  }, []);

  return (
    <details ref={detailsRef} className="group relative lg:hidden">
      <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 [&::-webkit-details-marker]:hidden">
        <span className="sr-only">القائمة الرئيسية</span>
        <Menu size={22} aria-hidden="true" className="group-open:hidden" />
        <X size={22} aria-hidden="true" className="hidden group-open:block" />
      </summary>
      <div className="absolute left-0 top-full z-50 mt-2 max-h-[calc(100dvh-6rem)] w-64 max-w-[calc(100vw-2rem)] overflow-y-auto rounded-xl border border-gray-100 bg-white p-2 text-right shadow-xl" dir="rtl">
        {links.map((link) => (
          <Link
            key={link.id}
            href={link.href}
            onClick={() => {
              if (detailsRef.current) detailsRef.current.open = false;
            }}
            className="block rounded-lg px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-blue-600"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </details>
  );
}
