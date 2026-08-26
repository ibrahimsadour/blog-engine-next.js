import { db } from '@/lib/db';

interface StickyFloatingBarProps {
  articleTitle?: string;
}

export default async function StickyFloatingBar({ articleTitle }: StickyFloatingBarProps) {
  // جلب الأرقام مباشرة من قاعدة البيانات
  let phoneNumber = '+96500000000';
  let whatsappNumber = '96500000000';

  try {
    const settings = await db.setting.findMany({
      where: {
        key: { in: ['phone_number', 'whatsapp_number'] },
      },
    });

    const map = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value || '';
      return acc;
    }, {} as Record<string, string>);

    if (map['phone_number']) {
      phoneNumber = map['phone_number'];
    }
    if (map['whatsapp_number']) {
      whatsappNumber = map['whatsapp_number'];
    } else if (map['phone_number']) {
      whatsappNumber = map['phone_number'].replace(/[^\d]/g, '');
    }
  } catch (error) {
    console.error('Error fetching settings for StickyFloatingBar:', error);
  }

  const cleanWhatsapp = whatsappNumber.replace(/[^\d]/g, '');
  const message = articleTitle
    ? `مرحباً، أود الاستفسار بخصوص خدمة: ${articleTitle}`
    : 'مرحباً، أود الاستفسار بخصوص الخدمات المتاحة';

  const whatsappUrl = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(message)}`;
  const phoneUrl = `tel:${phoneNumber}`;

  return (
    <aside
      aria-label="خيارات الاتصال السريع"
      className="fixed bottom-0 inset-x-0 z-50 p-3 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] md:hidden"
    >
      <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
        {/* زر الاتصال المباشر */}
        <a
          href={phoneUrl}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-sm active:scale-95 transition-transform hover:bg-blue-700"
        >
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
          <span>اتصال مباشر</span>
        </a>

        {/* زر الواتساب */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-sm active:scale-95 transition-transform hover:bg-emerald-700"
        >
          <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
          </svg>
          <span>واتساب</span>
        </a>
      </div>
    </aside>
  );
}