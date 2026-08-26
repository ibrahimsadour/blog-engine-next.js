import { db } from '@/lib/db';

export async function getSiteSettings() {
  const settings = await db.setting.findMany();
  const map = settings.reduce((acc, curr) => {
    acc[curr.key] = curr.value || '';
    return acc;
  }, {} as Record<string, string>);

  return {
    // إعدادات الهوية والاتصال
    siteName: map['site_name'] || 'دليل الخدمات السريعة',
    siteLogo: map['site_logo'] || '',
    phoneNumber: map['phone_number'] || '+96500000000',
    whatsappNumber: map['whatsapp_number'] || map['phone_number']?.replace(/[^\d]/g, '') || '96500000000',

    // قسم الهيرو (Hero Section) بالصفحة الرئيسية
    heroBgImage: map['hero_bg_image'] || '',
    heroBadge: map['hero_badge'] || 'خدمات سريعة على مدار 24 ساعة',
    heroTitle: map['hero_title'] || 'دليلك الشامل لأفضل وأسرع الخدمات الميدانية في الكويت',
    heroSubtitle:
      map['hero_subtitle'] ||
      'نخبة من الفنيين والخبراء المجهزين بأحدث المعدات للوصول إليك أينما كنت وفي أسرع وقت ممكن وبأعلى جودة.',

    // محتوى الصفحة الرئيسية المخصص (بين أقسام الخدمات والمقالات)
    homeCustomContent: map['home_custom_content'] || '',

    // التواصل الاجتماعي
    facebookUrl: map['facebook_url'] || '',
    instagramUrl: map['instagram_url'] || '',

    // SEO الصفحة الرئيسية
    homeMetaTitle: map['home_meta_title'] || '',
    homeMetaDesc: map['home_meta_desc'] || '',
    homeKeywords: map['home_keywords'] || '',

    // التذييل والـ Head و Robots
    footerDescription:
      map['footer_description'] ||
      'دليل الخدمات الميدانية والصيانة السريعة في الكويت على مدار 24 ساعة بأعلى معايير الجودة والسرعة.',
    footerContactText: map['footer_contact_text'] || 'خدمات سريعة على مدار 24 ساعة',
    headCode: map['custom_head_code'] || '',
    robotsTxt: map['custom_robots_txt'] || '',
  };
}