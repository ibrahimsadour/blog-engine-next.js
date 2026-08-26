import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import SettingsForm from './SettingsForm';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const settings = await db.setting.findMany();
  const map = settings.reduce((acc, curr) => {
    acc[curr.key] = curr.value || '';
    return acc;
  }, {} as Record<string, string>);

  // 1. حفظ الهوية وبيانات الاتصال
  async function saveIdentityAction(formData: FormData) {
    'use server';
    try {
      const siteName = (formData.get('siteName') as string)?.trim();
      const phoneNumber = (formData.get('phoneNumber') as string)?.trim();
      const rawWhatsapp = (formData.get('whatsappNumber') as string)?.trim();
      const whatsappNumber = rawWhatsapp.replace(/[^\d]/g, '');

      if (!siteName) return { success: false, error: 'اسم الموقع مطلوب' };
      if (!phoneNumber) return { success: false, error: 'رقم الهاتف مطلوب' };

      const updates = [
        { key: 'site_name', value: siteName },
        { key: 'site_logo', value: (formData.get('siteLogo') as string)?.trim() || '' },
        { key: 'phone_number', value: phoneNumber },
        { key: 'whatsapp_number', value: whatsappNumber || phoneNumber.replace(/[^\d]/g, '') },
      ];

      await Promise.all(
        updates.map(({ key, value }) =>
          db.setting.upsert({
            where: { key },
            update: { value },
            create: { key, value },
          })
        )
      );

      revalidatePath('/', 'layout');
      revalidatePath('/admin/settings');
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'فشل الحفظ' };
    }
  }

  // 2. حفظ واجهة الهيرو (Hero Section)
  async function saveHeroAction(formData: FormData) {
    'use server';
    try {
      const heroTitle = (formData.get('heroTitle') as string)?.trim();
      if (!heroTitle) return { success: false, error: 'العنوان الرئيسي مطلوب' };

      const updates = [
        { key: 'hero_bg_image', value: (formData.get('heroBgImage') as string)?.trim() || '' },
        { key: 'hero_badge', value: (formData.get('heroBadge') as string)?.trim() || '' },
        { key: 'hero_title', value: heroTitle },
        { key: 'hero_subtitle', value: (formData.get('heroSubtitle') as string)?.trim() || '' },
      ];

      await Promise.all(
        updates.map(({ key, value }) =>
          db.setting.upsert({
            where: { key },
            update: { value },
            create: { key, value },
          })
        )
      );

      revalidatePath('/');
      revalidatePath('/admin/settings');
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'فشل حفظ إعدادات الهيرو' };
    }
  }

  // 3. حفظ محتوى الصفحة الرئيسية المخصص
  async function saveHomeContentAction(formData: FormData) {
    'use server';
    try {
      const homeCustomContent = (formData.get('homeCustomContent') as string) || '';

      await db.setting.upsert({
        where: { key: 'home_custom_content' },
        update: { value: homeCustomContent },
        create: { key: 'home_custom_content', value: homeCustomContent },
      });

      revalidatePath('/');
      revalidatePath('/admin/settings');
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'فشل حفظ محتوى الصفحة الرئيسية' };
    }
  }

  // 4. حفظ حسابات التواصل الاجتماعي
  async function saveSocialAction(formData: FormData) {
    'use server';
    try {
      const updates = [
        { key: 'facebook_url', value: (formData.get('facebookUrl') as string)?.trim() || '' },
        { key: 'instagram_url', value: (formData.get('instagramUrl') as string)?.trim() || '' },
      ];

      await Promise.all(
        updates.map(({ key, value }) =>
          db.setting.upsert({
            where: { key },
            update: { value },
            create: { key, value },
          })
        )
      );

      revalidatePath('/', 'layout');
      revalidatePath('/admin/settings');
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'فشل حفظ روابط التواصل' };
    }
  }

  // 5. حفظ إعدادات SEO الصفحة الرئيسية
  async function saveHomeSeoAction(formData: FormData) {
    'use server';
    try {
      const updates = [
        { key: 'home_meta_title', value: (formData.get('homeMetaTitle') as string)?.trim() || '' },
        { key: 'home_meta_desc', value: (formData.get('homeMetaDesc') as string)?.trim() || '' },
        { key: 'home_keywords', value: (formData.get('homeKeywords') as string)?.trim() || '' },
      ];

      await Promise.all(
        updates.map(({ key, value }) =>
          db.setting.upsert({
            where: { key },
            update: { value },
            create: { key, value },
          })
        )
      );

      revalidatePath('/');
      revalidatePath('/admin/settings');
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'فشل حفظ إعدادات الـ SEO' };
    }
  }

  // 6. حفظ نصوص الفوتر
  async function saveFooterAction(formData: FormData) {
    'use server';
    try {
      const updates = [
        { key: 'footer_description', value: (formData.get('footerDescription') as string)?.trim() || '' },
        { key: 'footer_contact_text', value: (formData.get('footerContactText') as string)?.trim() || '' },
      ];

      await Promise.all(
        updates.map(({ key, value }) =>
          db.setting.upsert({
            where: { key },
            update: { value },
            create: { key, value },
          })
        )
      );

      revalidatePath('/', 'layout');
      revalidatePath('/admin/settings');
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'فشل الحفظ' };
    }
  }

  // 7. حفظ أكواد الـ Head
  async function saveHeadCodeAction(formData: FormData) {
    'use server';
    try {
      const headCode = (formData.get('headCode') as string) || '';

      await db.setting.upsert({
        where: { key: 'custom_head_code' },
        update: { value: headCode },
        create: { key: 'custom_head_code', value: headCode },
      });

      revalidatePath('/', 'layout');
      revalidatePath('/admin/settings');
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'فشل الحفظ' };
    }
  }

  // 8. حفظ ملف Robots.txt
  async function saveRobotsTxtAction(formData: FormData) {
    'use server';
    try {
      const robotsTxt = (formData.get('robotsTxt') as string) || '';

      await db.setting.upsert({
        where: { key: 'custom_robots_txt' },
        update: { value: robotsTxt },
        create: { key: 'custom_robots_txt', value: robotsTxt },
      });

      revalidatePath('/robots.txt');
      revalidatePath('/admin/settings');
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'فشل الحفظ' };
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-black text-gray-900">إعدادات الموقع العامة والـ SEO</h1>
        <p className="mt-1 text-xs text-gray-500">
          تحكم في الهوية البصرية، واجهة الهيرو، المحتوى المخصص، أرقام الاتصال، السوشيال ميديا، وسيو الصفحة الرئيسية
        </p>
      </div>

      <SettingsForm
        initialSettings={map}
        saveIdentityAction={saveIdentityAction}
        saveHeroAction={saveHeroAction}
        saveHomeContentAction={saveHomeContentAction}
        saveSocialAction={saveSocialAction}
        saveHomeSeoAction={saveHomeSeoAction}
        saveFooterAction={saveFooterAction}
        saveHeadCodeAction={saveHeadCodeAction}
        saveRobotsTxtAction={saveRobotsTxtAction}
      />
    </div>
  );
}