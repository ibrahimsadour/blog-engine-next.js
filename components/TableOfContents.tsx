'use client';

import { useEffect, useState } from 'react';
import { List, ChevronDown } from 'lucide-react';

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
  // فتح تلقائي إذا كانت العناوين 5 أو أقل، وإغلاق تلقائي إذا كانت كثيرة
  const [isOpen, setIsOpen] = useState<boolean>(headings?.length <= 5);

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
      { rootMargin: '-90px 0px -70% 0px' }
    );

    headings.forEach((heading) => {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (!headings || headings.length === 0) return null;

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -95;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      window.history.pushState(null, '', `#${id}`);
      setActiveId(id);
    }
  };

  return (
    <nav
      aria-label="جدول محتويات المقال"
      className="my-8 rounded-2xl border border-blue-100 bg-blue-50/40 p-4 shadow-xs transition sm:p-5"
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full cursor-pointer items-center justify-between text-right font-black text-gray-900 focus:outline-none"
      >
        <span className="flex items-center gap-2 text-sm sm:text-base">
          <List className="h-4 w-4 text-blue-600" />
          <span>محتويات الدليل ({headings.length} أقسام)</span>
        </span>
        <ChevronDown
          className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <ul className="mt-4 space-y-2 border-t border-blue-100/70 pt-3 text-xs font-bold leading-relaxed sm:text-sm">
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
                  onClick={(e) => handleScrollTo(e, heading.id)}
                  className={`inline-block py-0.5 transition-all hover:text-blue-600 ${
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
      )}
    </nav>
  );
}