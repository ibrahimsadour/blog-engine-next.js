import { getSiteSettings } from '@/lib/settings';

interface CallToActionProps {
  title?: string;
  description?: string;
  phone?: string;
  whatsapp?: string;
}

export default async function CallToAction({
  title,
  description,
  phone,
  whatsapp,
}: CallToActionProps) {
  // جلب الإعدادات الحية من قاعدة البيانات
  const settings = await getSiteSettings();

  const finalTitle = title || 'هل تحتاج إلى خدمة سريعة وفورية؟';
  const finalDescription =
    description || 'تواصل معنا مباشرة للحصول على الخدمة على مدار 24 ساعة بأفضل جودة وسرعة استجابة';

  // استخدام الأرقام الممررة أو جلبها ديناميكياً من الإعدادات
  const rawPhone = phone || settings.phoneNumber || '+96500000000';
  const rawWhatsapp = whatsapp || settings.whatsappNumber || settings.phoneNumber || '96500000000';

  // تنظيف الأرقام للروابط (إزالة المسافات والرموز الزائدة للواتساب)
  const cleanWhatsapp = rawWhatsapp.replace(/[^0-9]/g, '');

  return (
    <section className="my-10 rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-800 p-8 text-white shadow-lg">
      <div className="flex flex-col items-center justify-between gap-6 text-center md:flex-row md:text-right">
        <div>
          <h2 className="text-xl font-bold md:text-2xl">{finalTitle}</h2>
          <p className="mt-2 text-sm text-blue-100 md:text-base">{finalDescription}</p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-center gap-3">
          <a
            href={`tel:${rawPhone}`}
            className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-800 shadow-sm transition hover:bg-blue-50"
          >
            اتصل الآن
          </a>
          <a
            href={`https://wa.me/${cleanWhatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-500"
          >
            واتساب مباشر
          </a>
        </div>
      </div>
    </section>
  );
}