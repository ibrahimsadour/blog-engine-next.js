'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import styles from './AdminSidebar.module.css';
import type { ReactNode } from 'react';
import { Menu, X } from 'lucide-react';

export default function AdminSidebar({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const section = pathname === '/admin' || pathname.startsWith('/admin/articles/') ? 'articles' : pathname.split('/')[2] || '';
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={styles.shell} data-section={section}>
      <button type="button" onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen} aria-controls="admin-sidebar-content"
        className={styles.toggle}>
        <span>قائمة لوحة التحكم</span>
        {isOpen ? <X size={19} aria-hidden="true" /> : <Menu size={19} aria-hidden="true" />}
      </button>
      <div id="admin-sidebar-content" className={isOpen ? 'block' : 'hidden lg:block'}>{children}</div>
    </div>
  );
}
