# نشر وترقية قاعدة البيانات

## أوامر المشروع

- `npm install` أو `npm ci` يشغّل `prisma generate` تلقائياً عبر `postinstall`.
- `npm run db:migrate:deploy` يتحقق من `DATABASE_URL` ثم يشغّل
  `prisma migrate deploy`.
- `npm run deploy` يطبّق migrations أولاً ثم يبني التطبيق.

يجب استخدام `npm run deploy` في مرحلة الإصدار، وتشغيل `npm start` فقط بعد
نجاحها. لا تستخدم `prisma migrate dev` أو `prisma db push` على قاعدة الإنتاج.

## متغير الاتصال

الصيغة المطلوبة:

```env
DATABASE_URL=mysql://USER:PASSWORD@HOST:3306/DATABASE
```

يفشل التطبيق وأمر النشر مبكراً برسالة واضحة إذا كان المتغير مفقوداً. خزّن
القيمة في مدير أسرار منصة الاستضافة ولا تضفها إلى Git.

## اختبار نسخة من قاعدة البيانات الحالية

لا تختبر migration للمرة الأولى على قاعدة الإنتاج. أنشئ نسخة معزولة:

1. أوقف تغييرات المحتوى لفترة النسخ القصيرة أو استخدم snapshot متناسقاً.
2. أنشئ نسخة من قاعدة الإنتاج باسم مختلف وعلى خادم اختبار إن أمكن.
3. اضبط `DATABASE_URL` مؤقتاً على النسخة، وليس على الإنتاج.
4. احفظ أعداد الصفوف قبل الترقية:

   ```bash
   node scripts/database-row-counts.mjs > /tmp/database-counts-before.json
   ```

5. طبّق الترقية وتحقق من البنية:

   ```bash
   npm run db:migrate:deploy
   node scripts/verify-migrated-database.mjs
   npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --exit-code
   ```

6. احفظ الأعداد بعدها وقارنها:

   ```bash
   node scripts/database-row-counts.mjs > /tmp/database-counts-after.json
   diff -u /tmp/database-counts-before.json /tmp/database-counts-after.json
   ```

7. افحص يدوياً بعض المقالات والتحويلات والصفحات من لوحة الإدارة قبل اعتماد
   الإصدار.

اختبار GitHub Actions ينفذ السيناريو نفسه آلياً على قاعدة MySQL جديدة وعلى
بنية قديمة تحتوي بيانات تجريبية، بما فيها تحويل `permanent=true/false` إلى
`statusCode=301/302`.

## النسخ الاحتياطي قبل كل نشر

أنشئ ملف إعدادات MySQL محمياً بصلاحية `600` حتى لا تظهر كلمة المرور في سجل
الأوامر أو قائمة العمليات:

```ini
[client]
host=DATABASE_HOST
port=3306
user=DATABASE_USER
password=DATABASE_PASSWORD
```

أنشئ نسخة منطقية متناسقة قبل migration:

```bash
mysqldump \
  --defaults-extra-file=/secure/path/mysql-backup.cnf \
  --single-transaction \
  --quick \
  --routines \
  --triggers \
  --events \
  --hex-blob \
  --set-gtid-purged=OFF \
  DATABASE_NAME \
  | gzip > /secure/backups/blog-engine-$(date -u +%Y%m%dT%H%M%SZ).sql.gz
```

- احتفظ بنسخة يومية لمدة 14 يوماً، وأسبوعية لمدة 8 أسابيع، وشهرية لمدة 12
  شهراً، مع نسخة خارج الخادم.
- شفّر النسخ الاحتياطية وقيّد الوصول إليها وسجّل نجاح كل عملية.
- اختبر الاستعادة شهرياً إلى قاعدة منفصلة؛ النسخة التي لم تُختبر استعادتها لا
  تُعد نسخة موثوقة.

## الاستعادة والتراجع

عند فشل الترقية:

1. أوقف التطبيق أو حوّله إلى وضع الصيانة لمنع كتابات جديدة.
2. احتفظ بقاعدة البيانات الفاشلة للتحليل ولا تعدّلها مباشرة.
3. أنشئ قاعدة فارغة ثم استعد النسخة إليها:

   ```bash
   gunzip -c /secure/backups/BACKUP.sql.gz | mysql \
     --defaults-extra-file=/secure/path/mysql-backup.cnf \
     RESTORE_DATABASE_NAME
   ```

4. تحقق من أعداد الصفوف وسجّل الدخول وافتح عينات من المقالات والتحويلات.
5. بدّل `DATABASE_URL` إلى القاعدة المستعادة ثم أعد تشغيل التطبيق.

لا تحاول التراجع عن migration بإسقاط الأعمدة على الإنتاج؛ الاستعادة إلى قاعدة
منفصلة أكثر أماناً لأنها تحافظ على نقطة رجوع واضحة.
