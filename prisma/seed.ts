import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('جاري إدخال البيانات التجريبية...');

  const author = await prisma.author.upsert({
    where: { slug: 'editorial-team' },
    update: {},
    create: {
      name: 'فريق التحرير المتخصص',
      slug: 'editorial-team',
      role: 'فريق الاستشارات الفنية',
      bio: 'فريق متخصص في تقديم النصائح الفنية والحلول الميدانية السريعة في الكويت.',
    },
  });

  const category = await prisma.category.upsert({
    where: { slug: 'car-services' },
    update: {},
    create: {
      name: 'خدمات السيارات',
      slug: 'car-services',
      description: 'دليل شامل لجميع خدمات وصيانة السيارات السريعة في مختلف مناطق الكويت.',
      metaTitle: 'خدمات وصيانة السيارات في الكويت | دليل شامل',
      metaDesc: 'تعرف على أفضل وأسرع حلول صيانة السيارات وخدمات الطريق في الكويت على مدار الساعة.',
    },
  });

  const article = await prisma.article.upsert({
    where: { slug: 'quick-car-battery-replacement' },
    update: {},
    create: {
      title: 'دليل تبديل بطارية السيارة أمام المنزل في الكويت',
      slug: 'quick-car-battery-replacement',
      excerpt: 'تعرف على خطوات تبديل بطارية السيارة وأهم العلامات التي تدل على تلفها مع خدمة التبديل الفوري أمام المنزل.',
      content: `
        <p>تعتبر بطارية السيارة القلب النابض للنظام الكهربائي، وقد يؤدي توقفها المفاجئ إلى تعطيل جدولك اليومي بالكامل خاصة في أوقات الطقس الحار.</p>
        
        <h2>أهم علامات تلف بطارية السيارة</h2>
        <p>هناك عدة مؤشرات تدل على قرب انتهاء العمر الافتراضي لبطارية سيارتك، ومن أبرزها:</p>
        <ul>
          <li>صعوبة أو بطء عند تشغيل المحرك في الصباح.</li>
          <li>ضعف ملحوظ في إضاءة المصابيح الأمامية أو الشاشات الداخلية.</li>
          <li>ظهور علامة تحذير البطارية على لوحة العدادات.</li>
        </ul>

        <h2>كيفية اختيار البطارية المناسبة لسيارتك</h2>
        <p>عند اختيار بطارية جديدة، يجب الانتباه لسعة الأمبير وحجم البطارية الموصى به من قبل الشركة المصنعة لتفادي أي ضغط على الدينامو.</p>
        
        <h3>فحص نظام الشحن والدينامو</h3>
        <p>قبل تبديل البطارية القديمة، من الضروري فحص كفاءة الدينامو للتأكد من أنه يشحن بالشكل المطلوب ولا يتسبب في تفريغ البطارية الجديدة.</p>
      `,
      metaTitle: 'تبديل بطارية السيارة أمام المنزل الكويت 24 ساعة',
      metaDesc: 'خدمة تبديل بطاريات السيارات أمام المنزل في جميع مناطق الكويت بأعلى جودة وضمان وأسرع وقت استجابة.',
      targetKeyword: 'تبديل بطارية السيارة',
      targetArea: 'الكويت',
      isPublished: true,
      publishedAt: new Date(),
      categoryId: category.id,
      authorId: author.id,
      faqs: [
        {
          question: 'كم يستغرق وصول الفني لتبديل البطارية؟',
          answer: 'يصل الفني عادة خلال 15 إلى 30 دقيقة حسب موقعك داخل مناطق الكويت.',
        },
        {
          question: 'هل توفرون ضماناً على البطاريات الجديدة؟',
          answer: 'نعم، جميع البطاريات مشمولة بكفالة وضمان رسمي معتمد يصل إلى 3 سنوات.',
        },
      ],
    },
  });

  console.log(`تم إدخال المقال التجريبي بنجاح: ${article.title}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });