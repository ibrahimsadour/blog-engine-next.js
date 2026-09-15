import { unstable_cache } from 'next/cache';
import { db } from '@/lib/db';
import { logDatabaseError } from '@/lib/logger';

export const getNavigationData = unstable_cache(
  async () => {
    try {
      const [categories, pages] = await Promise.all([
        db.category.findMany({
          select: { id: true, name: true, slug: true, showInHeader: true },
          take: 6,
          orderBy: { name: 'asc' },
        }),
        db.page.findMany({
          where: { isPublished: true, OR: [{ showInHeader: true }, { showInFooter: true }] },
          select: { id: true, title: true, slug: true, showInHeader: true, showInFooter: true },
          orderBy: { createdAt: 'asc' },
        }),
      ]);
      return {
        headerCategories: categories.filter((item) => item.showInHeader).slice(0, 4),
        footerCategories: categories,
        headerPages: pages.filter((item) => item.showInHeader),
        footerPages: pages.filter((item) => item.showInFooter),
      };
    } catch (error) {
      logDatabaseError('navigation.read', error);
      return { headerCategories: [], footerCategories: [], headerPages: [], footerPages: [] };
    }
  },
  ['site-navigation'],
  { revalidate: 300, tags: ['site-navigation'] },
);
