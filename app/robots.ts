import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: 'https://check-my-resume-hku5056i3-check-my-resume.vercel.app/sitemap.xml',
  };
}
