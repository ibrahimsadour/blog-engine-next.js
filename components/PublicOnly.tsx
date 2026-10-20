'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

export default function PublicOnly({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (
    pathname === '/admin' ||
    pathname.startsWith('/admin/') ||
    pathname === '/login'
  ) {
    return null;
  }

  return <>{children}</>;
}