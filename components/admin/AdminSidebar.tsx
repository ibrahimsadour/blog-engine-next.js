'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import { Menu, X } from 'lucide-react';

export default function AdminSidebar({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="shrink-0 lg:w-64">
      <button type="button" onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen} aria-controls="admin-sidebar-content"
        className="flex w-full items-center justify-between border-b border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 lg:hidden">
        <span>قائمة لوحة التحكم</span>
        {isOpen ? <X size={19} aria-hidden="true" /> : <Menu size={19} aria-hidden="true" />}
      </button>
      <div id="admin-sidebar-content" className={isOpen ? 'block' : 'hidden lg:block'}>{children}</div>
    </div>
  );
}
