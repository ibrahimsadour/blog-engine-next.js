interface CallToActionProps {
  title?: string;
  description?: string;
  phone?: string;
  whatsapp?: string;
}

export default function CallToAction({
  title = 'هل تحتاج إلى خدمة سريعة وفورية؟',
  description = 'تواصل معنا مباشرة للحصول على الخدمة على مدار 24 ساعة بأفضل جودة وسرعة استجابة',
  phone = '+96500000000',
  whatsapp = '96500000000',
}: CallToActionProps) {
  return (
    <section className="my-10 rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-800 p-8 text-white shadow-lg">
      <div className="flex flex-col items-center justify-between gap-6 text-center md:flex-row md:text-right">
        <div>
          <h2 className="text-xl font-bold md:text-2xl">{title}</h2>
          <p className="mt-2 text-sm text-blue-100 md:text-base">{description}</p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-center gap-3">
          <a
            href={`tel:${phone}`}
            className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-800 shadow-sm transition hover:bg-blue-50"
          >
            اتصل الآن
          </a>
          <a
            href={`https://wa.me/${whatsapp}`}
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