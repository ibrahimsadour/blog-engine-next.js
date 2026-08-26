'use client';

import { useTransition } from 'react';
import { deleteArticleAction } from './actions';

export default function DeleteArticleButton({ articleId }: { articleId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm('هل أنت متأكد من رغبتك في حذف هذا المقال نهائياً؟')) return;

    startTransition(async () => {
      try {
        await deleteArticleAction(articleId);
      } catch {
        alert('حدث خطأ أثناء محاولة حذف المقال');
      }
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="rounded-lg bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
    >
      {isPending ? 'جاري الحذف...' : 'حذف'}
    </button>
  );
}