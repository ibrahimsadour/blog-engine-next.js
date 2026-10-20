import Link from 'next/link';
import Image from 'next/image';
import { BookOpen } from 'lucide-react';

interface ArticleItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  featuredImage?: string | null;
  altText?: string | null;
  createdAt: Date;
  category?: {
    name: string;
    slug: string;
  } | null;
}

interface RelatedArticlesProps {
  articles: ArticleItem[];
}

export default function RelatedArticles({ articles }: RelatedArticlesProps) {
  if (!articles || articles.length === 0) return null;

  return (
    <section className="mt-12 border-t border-gray-100 pt-10">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">مقالات وخدمات ذات صلة</h3>
        <span className="text-xs font-semibold text-blue-600">اقرأ أيضاً</span>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((art) => (
          <article
            key={art.id}
            className="public-card group flex flex-col overflow-hidden"
          >
            <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
              {art.featuredImage ? (
                <Image
                  src={art.featuredImage}
                  alt={art.altText || art.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition duration-300 group-hover:scale-105"
                />
              ) : (
                <span className="flex h-full items-center justify-center bg-blue-50 text-blue-300">
                  <BookOpen size={36} strokeWidth={1.25} aria-hidden="true" />
                </span>
              )}
            </div>

            <div className="flex flex-1 flex-col p-5">
              {art.category && (
                <span className="mb-2 w-fit rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-700">
                  {art.category.name}
                </span>
              )}

              <h4 className="line-clamp-2 text-base leading-7 font-bold text-gray-900 group-hover:text-blue-600">
                <Link href={`/${art.slug}`}>{art.title}</Link>
              </h4>

              {art.excerpt && (
                <p className="mt-2 line-clamp-2 flex-1 text-sm leading-7 text-gray-500">
                  {art.excerpt}
                </p>
              )}

              <div className="mt-auto border-t border-gray-50 pt-4 text-xs text-gray-400">
                {new Date(art.createdAt).toLocaleDateString('ar-EG', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}