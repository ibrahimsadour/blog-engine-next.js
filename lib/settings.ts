import { db } from '@/lib/db';
import { unstable_cache } from 'next/cache';
import { logDatabaseError } from '@/lib/logger';

const getSettingsRows = unstable_cache(
  async () => {
    try {
      return await db.setting.findMany();
    } catch (error) {
      logDatabaseError('settings.read', error);
      return [];
    }
  },
  ['site-settings'],
  { revalidate: 300, tags: ['site-settings'] },
);

export async function getSiteSettings() {
  const settings = await getSettingsRows();
  const map = settings.reduce((acc, curr) => {
    acc[curr.key] = curr.value || '';
    return acc;
  }, {} as Record<string, string>);

  return {
    // إعدادات الهوية والاتصال
    siteName: map['site_name'] || 'دليل الخدمات السريعة',
    siteTitle: map['site_title'] || map['meta_title'] || map['site_name'] || 'دليل الخدمات السريعة',
    siteDescription: map['site_description'] || map['meta_description'] || '',
    siteLogo: map['site_logo'] || '',
    siteIcon: map['site_icon'] || '',
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
