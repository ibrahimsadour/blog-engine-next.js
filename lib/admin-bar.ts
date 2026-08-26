'use server';

import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';

export async function getEditTargetAction(pathname: string) {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get('admin_session')?.value === 'authenticated_admin';

  if (!isAdmin) {
    return { url: '', label: '', isHidden: true };
  }

  if (pathname.startsWith('/admin') || pathname.startsWith('/login')) {
    return { url: '', label: '', isHidden: true };
  }

  const cleanPath = pathname.replace(/^\/+|\/+$/g, '');
  const segments = cleanPath.split('/').filter(Boolean);

  if (segments.length === 0) {
    return { url: '/admin/settings', label: 'إعدادات الموقع' };
  }

  if (segments[0] === 'category' && segments[1]) {
    const rawCategorySlug = segments[1];
    const decodedCategorySlug = decodeURIComponent(rawCategorySlug).trim();

    const category = await db.category.findFirst({
      where: {
        OR: [
          { slug: rawCategorySlug },
          { slug: decodedCategorySlug },
          { slug: decodedCategorySlug.toLowerCase() },
        ],
      },
    });

    if (category) {
      return {
        url: `/admin/categories/${category.id}/edit`,
        label: 'تعديل التصنيف',
      };
    }

    return {
      url: '/admin/categories',
      label: 'إدارة التصنيفات',
    };
  }

  if (segments.length === 1) {
    const rawSlug = segments[0];
    const decodedSlug = decodeURIComponent(rawSlug).trim();

    const article = await db.article.findFirst({
      where: {
        OR: [
          { slug: rawSlug },
          { slug: decodedSlug },
          { slug: decodedSlug.toLowerCase() },
        ],
      },
      select: { id: true },
    });

    if (article) {
      return {
        url: `/admin/articles/${article.id}/edit`,
        label: 'تعديل المقال',
      };
    }

    const page = await db.page.findFirst({
      where: {
        OR: [
          { slug: rawSlug },
          { slug: decodedSlug },
          { slug: decodedSlug.toLowerCase() },
        ],
      },
      select: { id: true },
    });

    if (page) {
      return {
        url: `/admin/pages/${page.id}/edit`,
        label: 'تعديل الصفحة',
      };
    }
  }

  return { url: '', label: 'لوحة التحكم' };
}

export async function logoutAdminAction() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_session');
  redirect('/login');
}