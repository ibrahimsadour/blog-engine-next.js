'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getEditTargetAction, logoutAdminAction } from '@/lib/admin-bar';

export default function AdminBar() {
  const pathname = usePathname();
  const [target, setTarget] = useState<{ url: string; label: string; isHidden?: boolean } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getEditTargetAction(pathname)
      .then((res) => {
        if (isMounted) {
          setTarget(res);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setTarget(null);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [pathname]);

  if (!target || target.isHidden) {
    return null;
  }

  return (
    <div className="sticky top-0 z-100 flex h-10 w-full items-center justify-between border-b border-gray-800 bg-gray-950 px-4 text-xs font-semibold text-gray-200 shadow-md">
      <div className="flex items-center gap-4">
        <Link
          href="/admin"
          className="flex items-center gap-1.5 font-bold text-white transition hover:text-blue-400"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-600 text-[11px] font-black text-white">
            W
          </span>
          <span>لوحة التحكم</span>
        </Link>

        {loading ? (
          <span className="animate-pulse text-gray-500">جاري التحقق...</span>
        ) : (
          target.url && (
            <Link
              href={target.url}
              className="flex items-center gap-1.5 rounded-md bg-blue-600 px-2.5 py-1 text-white shadow-xs transition hover:bg-blue-700 active:scale-95"
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              <span>{target.label}</span>
            </Link>
          )
        )}
      </div>

      <div className="flex items-center gap-3">
        <form action={logoutAdminAction}>
          <button
            type="submit"
            className="cursor-pointer text-gray-400 transition hover:text-red-400"
          >
            تسجيل خروج
          </button>
        </form>
      </div>
    </div>
  );
}