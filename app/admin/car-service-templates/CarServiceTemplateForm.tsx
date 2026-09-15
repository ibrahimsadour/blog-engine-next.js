'use client';

import { useState } from 'react';
import RichTextEditor from '@/components/RichTextEditor';

export default function CarServiceTemplateForm({ 
  template, 
  action 
}: { 
  template: any; 
  action: (formData: FormData) => Promise<void> | void; 
}) {
  const [desc, setDesc] = useState(template?.descTemplate || '');
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    formData.set('descTemplate', desc);

    try {
      await action(formData);
      setMessage('تم حفظ وتحديث قالب السيارات بنجاح!');
      setTimeout(() => setMessage(null), 4000);
    } catch {
      setMessage('حدث خطأ أثناء الحفظ، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-6">
      {message && (
        <div className={`p-4 rounded-lg text-sm font-bold ${message.includes('نجاح') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          بنك الصور (افصل بـ <code className="bg-gray-100 text-blue-600 px-1 rounded">---</code>)
        </label>
        <textarea 
          name="imageTemplates" 
          rows={3} 
          defaultValue={template?.imageTemplates || ''} 
          placeholder="/uploads/car-1.jpg---/uploads/car-2.jpg" 
          className="w-full border border-gray-300 rounded-lg p-2.5 text-sm" 
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          بنك العناوين الرئيسية (H1) (افصل بـ <code className="bg-gray-100 text-blue-600 px-1 rounded">---</code>)
        </label>
        <textarea 
          name="titleTemplate" 
          rows={3} 
          defaultValue={template?.titleTemplate || `أفضل خدمات {service} سيارات {car}\n---\nكراج صيانة {service} {car} معتمد`} 
          required 
          className="w-full border border-gray-300 rounded-lg p-2.5 text-sm" 
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          بنك المقدمات (افصل بـ <code className="bg-gray-100 text-blue-600 px-1 rounded">---</code>)
        </label>
        <textarea 
          name="introTemplates" 
          rows={3} 
          defaultValue={template?.introTemplates || ''} 
          className="w-full border border-gray-300 rounded-lg p-2.5 text-sm" 
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">قالب الوصف الأساسي</label>
        <div className="mt-1">
          <RichTextEditor content={desc} onChange={setDesc} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          بنك الخاتمات (افصل بـ <code className="bg-gray-100 text-blue-600 px-1 rounded">---</code>)
        </label>
        <textarea 
          name="outroTemplates" 
          rows={3} 
          defaultValue={template?.outroTemplates || ''} 
          className="w-full border border-gray-300 rounded-lg p-2.5 text-sm" 
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          بنك الأسئلة الشائعة (السطر الأول السؤال، الأسطر التالية الإجابة، وافصل بـ <code className="bg-gray-100 text-blue-600 px-1 rounded">---</code>)
        </label>
        <textarea 
          name="faqTemplates" 
          rows={5} 
          defaultValue={template?.faqTemplates || ''} 
          placeholder="هل تقدمون كفالة على صيانة {service} لسيارات {car}؟&#10;نعم نوفر كفالة كاملة على كافة قطع الغيار وخدمات الصيانة.&#10;---&#10;كم يستغرق فحص {service} لسيارة {car}؟&#10;يتم إنجاز الفحص والتشخيص بأحدث أجهزة الكمبيوتر فوراً." 
          className="w-full border border-gray-300 rounded-lg p-2.5 text-sm" 
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          بنك الموديلات والميزات الفنية (افصل بـ <code className="bg-gray-100 text-blue-600 px-1 rounded">---</code>)
        </label>
        <textarea 
          name="neighborhoodTemplates" 
          rows={3} 
          defaultValue={template?.neighborhoodTemplates || ''} 
          placeholder="نوفر الصيانة لكافة موديلات وفئات {car}...&#10;---&#10;فريقنا متخصص في محركات وأنظمة نقل الحركة الخاصة بسيارات {car}..." 
          className="w-full border border-gray-300 rounded-lg p-2.5 text-sm" 
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          بنك التقييمات (السطر الأول اسم العميل، الأسطر التالية التعليق، وافصل بـ <code className="bg-gray-100 text-blue-600 px-1 rounded">---</code>)
        </label>
        <textarea 
          name="testimonialTemplates" 
          rows={4} 
          defaultValue={template?.testimonialTemplates || ''} 
          placeholder="فيصل الشمري&#10;خدمة {service} لسيارة {car} ممتازة جداً وأسعار واضحة.&#10;---&#10;سعد الهاجري&#10;كراج احترافي وسرعة عالية في تشخيص وإصلاح {service} {car}." 
          className="w-full border border-gray-300 rounded-lg p-2.5 text-sm" 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            بنك Meta Title (افصل بـ <code className="bg-gray-100 text-blue-600 px-1 rounded">---</code>)
          </label>
          <textarea 
            name="metaTitleTemplate" 
            rows={3} 
            defaultValue={template?.metaTitleTemplate || `{service} سيارات {car} | صيانة وفحص فوري\n---\nكراج تصليح {service} {car} مع الضمان`} 
            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            بنك Meta Description (افصل بـ <code className="bg-gray-100 text-blue-600 px-1 rounded">---</code>)
          </label>
          <textarea 
            name="metaDescTemplate" 
            rows={3} 
            defaultValue={template?.metaDescTemplate || `أفضل خدمات {service} لسيارات {car} بأحدث الأجهزة وفنيين خبراء. اتصل بنا الآن.\n---\nكراج معتمد لصيانة {service} {car} مع كفالة على العمل وقطع الغيار.`} 
            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm" 
          />
        </div>
      </div>

      <button 
        type="submit" 
        disabled={isPending}
        className="bg-green-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-50 cursor-pointer"
      >
        {isPending ? 'جاري الحفظ...' : 'حفظ وتطبيق قالب السيارات'}
      </button>
    </form>
  );
}