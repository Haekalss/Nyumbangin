const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://nyumbangin.web.id';

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard', '/admin', '/overlay/', '/order/', '/history', '/reset-password'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}

