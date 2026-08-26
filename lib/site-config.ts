export const siteConfig = {
  name: 'دليل الخدمات السريعة',
  description: 'دليل شامل لأفضل وأسرع خدمات الصيانة والمساعدة على الطريق في الكويت على مدار 24 ساعة.',
  url: (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, ''),
  ogImage: '/images/og-default.jpg',
  locale: 'ar_KW',
  twitterHandle: '@site_handle',
  author: 'فريق التحرير المتخصص',
  links: {
    twitter: 'https://twitter.com',
    facebook: 'https://facebook.com',
  },
  contact: {
    phone: '+96500000000',
    whatsapp: '96500000000',
    whatsappDefaultMessage: 'مرحباً، أود الاستفسار بخصوص خدمة:',
  },
};