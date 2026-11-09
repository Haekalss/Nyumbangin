import dbConnect from '@/lib/db';
import Creator from '@/models/Creator';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://nyumbangin.web.id';

export const revalidate = 3600;

export default async function sitemap() {
  const now = new Date();
  const staticPages = [
    { url: `${BASE_URL}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/creator/register`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/faq`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/contact`, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${BASE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/terms`, changeFrequency: 'yearly', priority: 0.3 },
  ].map((page) => ({ ...page, lastModified: now }));

  let creatorPages = [];
  try {
    await dbConnect();
    const creators = await Creator.find({ isActive: true, username: { $exists: true, $ne: '' } })
      .select('username updatedAt')
      .lean();
    creatorPages = creators.map((c) => ({
      url: `${BASE_URL}/${c.username}`,
      lastModified: c.updatedAt || now,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));
  } catch (error) {
    console.error('Sitemap: gagal mengambil creator', error);
  }

  return [...staticPages, ...creatorPages];
}

