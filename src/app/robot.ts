import type { MetadataRoute } from 'next';
import { getBaseUrl } from '../utils/Helpers';

export default function robots(): MetadataRoute.Robots {
  const base = getBaseUrl();
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/me',
          '/post/*/edit',
          '/auth/',
          '/api/',
          '/_next/',
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
