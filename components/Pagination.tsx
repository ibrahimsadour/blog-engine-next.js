import Link from 'next/link';

export default function Pagination({ page, totalPages, basePath }: { page: number; totalPages: number; basePath: string }) {
  if (totalPages <= 1) return null;
  return (
    <nav className="mt-6 flex items-center justify-center gap-3" aria-label="التنقل بين الصفحات">
      {page > 1 && <Link className="rounded-lg border bg-white px-4 py-2 text-sm" href={`${basePath}?page=${page - 1}`}>السابق</Link>}
      <span className="text-sm text-gray-600">صفحة {page} من {totalPages}</span>
      {page < totalPages && <Link className="rounded-lg border bg-white px-4 py-2 text-sm" href={`${basePath}?page=${page + 1}`}>التالي</Link>}
    </nav>
  );
}
