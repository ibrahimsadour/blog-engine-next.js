import { db } from '@/lib/db';
import { saveGlobalServiceTemplateAction } from '../actions';
import ServiceTemplateForm from './ServiceTemplateForm';

export default async function AdminServiceTemplatesPage() {
  const template = await db.globalServiceTemplate.findFirst();

  return (
    <main className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">إدارة القالب الموحد لجميع الخدمات والمدن</h1>
        <p className="text-sm text-gray-500">
          استخدم المتغيرات <code className="bg-gray-100 px-1 py-0.5 rounded text-blue-600">&#123;city&#125;</code> لاسم المدينة و <code className="bg-gray-100 px-1 py-0.5 rounded text-blue-600">&#123;service&#125;</code> لاسم الخدمة. سيتم تطبيق هذا القالب تلقائياً على كافة الخدمات والمدن دفعة واحدة.
        </p>
      </div>

      <ServiceTemplateForm template={template} action={saveGlobalServiceTemplateAction} />
    </main>
  );
}