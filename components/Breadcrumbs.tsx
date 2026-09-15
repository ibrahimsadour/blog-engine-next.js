import Link from 'next/link';

export interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  // استبعاد أي عنصر مكرر للرئيسية ممرر في المصفوفة
  const filteredItems = items.filter(
    (item) => item.url !== '/' && item.name.trim() !== 'الرئيسية'
  );

  return (
    <nav aria-label="Breadcrumb" className="py-3 text-sm text-gray-500">
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link href="/" className="transition hover:text-gray-900">
            الرئيسية
          </Link>
        </li>
        {filteredItems.map((item, index) => {
          const isLast = index === filteredItems.length - 1;

          return (
            <li key={`${item.url}-${index}`} className="flex items-center gap-2">
              <span className="select-none text-gray-400">/</span>
              {isLast ? (
                <span className="font-semibold text-gray-900" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <Link href={item.url} className="transition hover:text-gray-900">
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}