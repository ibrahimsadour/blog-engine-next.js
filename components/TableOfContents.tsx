'use client';

import { useEffect, useState } from 'react';

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  headings: Heading[];
}

export default function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    if (!headings || headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '0px 0px -70% 0px' }
    );

    headings.forEach((heading) => {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (!headings || headings.length === 0) return null;

  return (
    <nav
      aria-label="جدول محتويات المقال"
      className="my-8 rounded-2xl border border-blue-100 bg-blue-50/40 p-5 shadow-xs transition sm:p-6"
    >
      <div className="mb-3 flex items-center gap-2 text-sm font-black text-gray-900">
        <svg
          className="h-4 w-4 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M4 6h16M4 12h16M4 18h7"
          />
        </svg>
        <span>محتويات الدليل</span>
      </div>

      <ul className="space-y-2.5 text-xs font-bold leading-relaxed sm:text-sm">
        {headings.map((heading) => {
          const isActive = activeId === heading.id;
          return (
            <li
              key={heading.id}
              className={`${
                heading.level === 3 ? 'mr-4 font-normal text-gray-600' : 'text-gray-800'
              }`}
            >
              <a
                href={`#${heading.id}`}
                className={`inline-block transition-all hover:text-blue-600 ${
                  isActive
                    ? 'font-black text-blue-700 underline underline-offset-8 decoration-2'
                    : 'hover:underline underline-offset-4'
                }`}
              >
                {heading.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}