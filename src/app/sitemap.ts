import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

// Add the verified production domain here when the site is deployed.
export default function sitemap(): MetadataRoute.Sitemap {
  return [];
}
