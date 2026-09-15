import { db } from '@/lib/db';
import { saveGlobalCarServiceTemplateAction } from '../actions';
import CarServiceTemplateForm from './CarServiceTemplateForm';

export const revalidate = 0;

export default async function AdminCarServiceTemplatesPage() {
  const template = await db.globalCarServiceTemplate.findFirst();

  return (
    <main className="p-8 max-w-4xl mx-auto space-y-8" dir="rtl">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">إدارة القالب الموحد لجميع الخدمات والسيارات</h1>
        <p className="text-sm text-gray-500">
          استخدم المتغيرات <code className="bg-gray-100 px-1 py-0.5 rounded text-blue-600">&#123;car&#125;</code> لاسم السيارة و <code className="bg-gray-100 px-1 py-0.5 rounded text-blue-600">&#123;service&#125;</code> لاسم الخدمة.
        </p>
      </div>

      <CarServiceTemplateForm template={template} action={saveGlobalCarServiceTemplateAction} />
    </main>
  );
}