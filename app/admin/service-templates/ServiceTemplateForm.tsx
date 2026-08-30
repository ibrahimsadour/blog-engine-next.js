'use client';

import { useState } from 'react';
import RichTextEditor from '@/components/RichTextEditor';

export default function ServiceTemplateForm({ 
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
      setMessage('تم حفظ وتحديث القالب بنجاح!');
      setTimeout(() => setMessage(null), 4000);
    } catch (error) {
      setMessage('حدث خطأ أثناء الحفظ، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
      {message && (
        <div className={`p-4 rounded-lg text-sm font-bold ${message.includes('نجاح') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          بنك العناوين الرئيسية (H1) (افصل بين كل عنوان وأخر بـ <code className="bg-gray-100 text-blue-600 px-1 rounded">---</code>)
        </label>
        <textarea 
          name="titleTemplate" 
          rows={3} 
          defaultValue={template?.titleTemplate || `أفضل خدمات {service} في {city}\n---\nأرخص أسعار {service} داخل {city}`} 
          required 
          className="w-full border rounded-lg p-2.5 text-sm" 
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          بنك المقدمات (افصل بين كل مقدمة وأخرى بـ <code className="bg-gray-100 text-blue-600 px-1 rounded">---</code>)
        </label>
        <textarea 
          name="introTemplates" 
          rows={4} 
          defaultValue={template?.introTemplates || ''} 
          className="w-full border rounded-lg p-2.5 text-sm" 
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">قالب الوصف التفصيلي الأساسي</label>
        <div className="mt-1">
          <RichTextEditor content={desc} onChange={setDesc} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          بنك الخاتمات (افصل بين كل خاتمة وأخرى بـ <code className="bg-gray-100 text-blue-600 px-1 rounded">---</code>)
        </label>
        <textarea 
          name="outroTemplates" 
          rows={4} 
          defaultValue={template?.outroTemplates || ''} 
          className="w-full border rounded-lg p-2.5 text-sm" 
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          بنك الأسئلة الشائعة (السطر الأول السؤال، الأسطر التالية الإجابة، وافصل بـ <code className="bg-gray-100 text-blue-600 px-1 rounded">---</code>)
        </label>
        <textarea 
          name="faqTemplates" 
          rows={6} 
          defaultValue={template?.faqTemplates || ''} 
          placeholder="ما هي تكلفة الخدمة؟&#10;نقدم أرخص الأسعار مع ضمان شامل.&#10;---&#10;كم تستغرق مدة العمل؟&#10;يتم إنجاز العمل في أسرع وقت ممكن." 
          className="w-full border rounded-lg p-2.5 text-sm" 
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          بنك الأحياء والمعالم (افصل بين كل فقرة وأخرى بـ <code className="bg-gray-100 text-blue-600 px-1 rounded">---</code>)
        </label>
        <textarea 
          name="neighborhoodTemplates" 
          rows={4} 
          defaultValue={template?.neighborhoodTemplates || ''} 
          placeholder="نخدم كافة أحياء وشوارع {city} الرئيسية والفرعية بسرعة فائقة...&#10;---&#10;فريقنا متواجد بالقرب منكم في كافة مناطق {city}..." 
          className="w-full border rounded-lg p-2.5 text-sm" 
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          بنك التقييمات وآراء العملاء (السطر الأول اسم العميل، الأسطر التالية نص التقييم، وافصل بـ <code className="bg-gray-100 text-blue-600 px-1 rounded">---</code>)
        </label>
        <textarea 
          name="testimonialTemplates" 
          rows={5} 
          defaultValue={template?.testimonialTemplates || ''} 
          placeholder="محمد العتيبي&#10;خدمة {service} في {city} ممتازة جداً والتنفيذ كان سريعاً واحترافياً.&#10;---&#10;سارة الشمري&#10;أفضل من يقدم {service} داخل {city} بأسعار مناسبة ومعاملة راقية." 
          className="w-full border rounded-lg p-2.5 text-sm" 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            بنك (Meta Title) (افصل بين كل عنوان بـ <code className="bg-gray-100 text-blue-600 px-1 rounded">---</code>)
          </label>
          <textarea 
            name="metaTitleTemplate" 
            rows={3}
            defaultValue={template?.metaTitleTemplate || `{service} في {city} - أرخص الأسعار\n---\nدليل خدمات {service} الشامل في {city}`} 
            className="w-full border rounded-lg p-2.5 text-sm" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            بنك (Meta Description) (افصل بين كل وصف بـ <code className="bg-gray-100 text-blue-600 px-1 rounded">---</code>)
          </label>
          <textarea 
            name="metaDescTemplate" 
            rows={3}
            defaultValue={template?.metaDescTemplate || `احصل على أفضل خدمات {service} في {city} فوراً. اتصل بنا الآن.\n---\nنقدم لك أرقى خدمات {service} في {city} بجودة عالية وضمان شامل.`} 
            className="w-full border rounded-lg p-2.5 text-sm" 
          />
        </div>
      </div>

      <button 
        type="submit" 
        disabled={isPending}
        className="bg-green-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-50"
      >
        {isPending ? 'جاري الحفظ...' : 'حفظ وتطبيق القالب الشامل'}
      </button>
    </form>
  );
}