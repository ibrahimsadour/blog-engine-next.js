import { Phone, MessageCircle } from 'lucide-react';
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

  const finalTitle = title || 'هل تحتاج إلى مساعدة في اختيار الخدمة؟';
  const finalDescription =
    description || 'تواصل للاستفسار عن الخدمة المطلوبة والتغطية والتوفر قبل تأكيد طلبك';

  // استخدام الأرقام الممررة أو جلبها ديناميكياً من الإعدادات
  const rawPhone = phone || settings.phoneNumber || '+96500000000';
  const rawWhatsapp = whatsapp || settings.whatsappNumber || settings.phoneNumber || '96500000000';

  // تنظيف الأرقام للروابط (إزالة المسافات والرموز الزائدة للواتساب)
  const cleanWhatsapp = rawWhatsapp.replace(/[^0-9]/g, '');

  return (
    <section className="public-surface relative my-10 overflow-hidden rounded-3xl border border-blue-800 bg-gradient-to-l from-blue-950 via-blue-900 to-slate-900 p-6 text-white shadow-lg sm:p-10">
      <div className="flex flex-col items-center justify-between gap-6 text-center md:flex-row md:text-right">
        <div>
          <h2 className="text-balance text-xl font-bold leading-relaxed md:text-2xl">{finalTitle}</h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-blue-100">{finalDescription}</p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-center gap-3">
          <a
            href={`tel:${rawPhone}`}
            className="public-button bg-white text-blue-900 shadow-sm hover:bg-blue-50"
          >
            <Phone size={17} aria-hidden="true" />
            اتصل الآن
          </a>
          <a
            href={`https://wa.me/${cleanWhatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="public-button border border-white/25 bg-white/10 text-white hover:bg-white/20"
          >
            <MessageCircle size={18} aria-hidden="true" />
            واتساب مباشر
          </a>
        </div>
      </div>
    </section>
  );
}