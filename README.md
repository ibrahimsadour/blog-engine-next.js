# Blog Engine Next.js

محرك محتوى عربي مبني على Next.js 16 وReact 19 وPrisma 7 مع MySQL أو MariaDB ولوحة إدارة محمية.

## المتطلبات

- Node.js 24 LTS
- npm 11 أو أحدث
- MySQL 8.4 أو MariaDB متوافقة
- أدوات `mysqldump` و`mysql` للنسخ الاحتياطي والاستعادة
- مساحة تخزين دائمة للصور عند استخدام التخزين المحلي

## التشغيل المحلي

```bash
cp .env.example .env
npm ci
npm run db:migrate:deploy
npm run dev
```

افتح `http://localhost:3000` وغيّر جميع القيم النموذجية قبل أي نشر.

## متغيرات البيئة

| المتغير | الحالة | الغرض |
|---|---|---|
| `SITE_PROFILE` | اختياري | نوع الموقع: `automotive` للسيارات أو `home_services` للخدمات المنزلية؛ الافتراضي `automotive` |
| `DATABASE_URL` | مطلوب | رابط MySQL بصيغة `mysql://user:password@host:3306/database` |
| `ADMIN_PASSWORD` | مطلوب | كلمة مرور قوية للوحة الإدارة |
| `SESSION_SECRET` | مطلوب | مفتاح عشوائي لا يقل عن 32 محرفًا لتوقيع الجلسات |
| `NEXT_PUBLIC_SITE_URL` | مطلوب في الإنتاج | أصل الموقع عبر HTTPS للـ Canonical وSitemap والتحقق من Origin |
| `ADMIN_ALLOWED_ORIGINS` | اختياري | نطاقات إدارية موثوقة إضافية مفصولة بفاصلة |
| `REDIRECT_ALLOWED_ORIGINS` | اختياري | نطاقات خارجية موثوقة مسموحة للتحويل |
| `IMAGE_REMOTE_HOSTS` | اختياري | مضيفو صور HTTPS المسموحون في Next Image |
| `UPLOAD_STORAGE_DIR` | مطلوب للتخزين المحلي | مسار دائم ومطلق خارج نسخة الإصدار |
| `CUSTOM_HEAD_ALLOWED_HOSTS` | اختياري | مضيفو موارد HTTPS المسموحون في Custom Head Code |
| `BACKUP_DIR` | مطلوب للنسخ الاحتياطي | مجلد مطلق وآمن لملفات `.sql.gz` |

راجع [`.env.example`](./.env.example). لا تحفظ ملف `.env` أو أي بيانات سرية داخل Git.

### نوع الموقع

ضع قيمة واحدة في ملف `.env` لكل موقع، ثم أعد بناء المشروع:

```env
# مواقع السيارات
SITE_PROFILE=automotive

# مواقع الخدمات المنزلية
SITE_PROFILE=home_services
```

في وضع `home_services` تُخفى إدارة السيارات وقوالب خدمات السيارات، وتُعطّل صفحات وواجهات API وخرائط Sitemap الخاصة بالسيارات مع إبقاء بياناتها في قاعدة البيانات دون حذف. تغيير القيمة يحتاج إلى `npm run build` ثم إعادة تشغيل التطبيق.

## الفحص والاختبارات

```bash
npm run lint
npx tsc --noEmit
npm test
npm run test:functions
npm run build -- --webpack
```

`npm test` يغطي الجلسات وكلمات المرور وOrigin وصلاحيات API والتحقق من الصور والمدخلات والتوجيهات وSitemap وMetadata وXSS. يحتاج `test:functions` إلى قاعدة تجريبية مطبق عليها آخر Migration، ويختبر الإنشاء والتعديل والحذف والتعارض وRollback.

## النشر وقاعدة البيانات

```bash
npm ci
npm run db:migrate:deploy
npm run build -- --webpack
npm start
```

لا تستخدم `prisma migrate dev` على الإنتاج. خذ نسخة احتياطية قبل Migration، ثم تحقق من `/api/health`. يعيد Health Check الحالة `200` عند جاهزية قاعدة البيانات و`503` عند تعذر الاتصال دون كشف معلومات الاتصال.

## الصور والتخزين

اجعل `UPLOAD_STORAGE_DIR` مجلدًا دائمًا ومشتركًا بين الإصدارات، أو استخدم تخزينًا خارجيًا. رفع وحذف الصور متاح للمدير فقط ويقبل JPG وPNG وWebP بحد أقصى 5 ميغابايت.

## النسخ الاحتياطي والاستعادة

```bash
DATABASE_URL='mysql://...' BACKUP_DIR='/secure/backups' npm run db:backup
DATABASE_URL='mysql://.../restore_test' npm run db:restore -- /secure/backups/blog-engine-TIMESTAMP.sql.gz
npx prisma migrate status
```

اختبر الاستعادة على قاعدة منفصلة لا على الإنتاج. احتفظ بنسخ مشفرة خارج الخادم وطبق سياسة احتفاظ يومية وأسبوعية. توجد تفاصيل إضافية في [`docs/database-deployment.md`](./docs/database-deployment.md).

## GitHub Actions وحماية main

- `quality.yml`: تثبيت نظيف وMigration وESLint وTypeScript واختبارات وبناء إنتاجي وفحص اعتماديات
- `database-migrations.yml`: اختبار قاعدة جديدة وترقية قاعدة Legacy دون فقد الصفوف
- `staging-smoke.yml`: فحص Staging عبر HTTPS وHealth وrobots وSitemap وصفحة الدخول

فعّل Branch Protection على `main` واطلب نجاح فحصي `quality` و`migrate` وPull Request قبل الدمج، وامنع Force Push وحذف الفرع.

## قائمة ما قبل فتح الموقع

1. اضبط أسرار الإنتاج وHTTPS والتخزين الدائم
2. خذ نسخة احتياطية واختبر استعادتها في قاعدة منفصلة
3. تأكد من نجاح جميع GitHub Actions
4. شغّل `Staging smoke test` على رابط Staging الحقيقي
5. تحقق من `/api/health` و`robots.txt` وجميع ملفات Sitemap
6. افحص Structured Data وCanonical وnoIndex بأدوات Google
7. راجع CSP وHSTS والصلاحيات وسجلات قاعدة البيانات
8. راقب الأداء والأخطاء بعد النشر ولا تفتح الموقع للعامة قبل نجاح البنود السابقة
