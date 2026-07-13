import { getAllProjects } from '../lib/content';

export const GET = ({ site }) => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const origin = (site && site.origin) || 'https://shubhampendse8.github.io';
  const build = (p) => origin + base + p;

  const staticRoutes = ['/', '/work', '/about', '/contact'];
  const projectRoutes = getAllProjects().map((p) => `/projects/${p.slug}`);
  const allRoutes = [...staticRoutes, ...projectRoutes];
  const now = new Date().toISOString();

  const urls = allRoutes
    .map((r) => {
      const priority = r === '/' ? '1.0' : r.startsWith('/projects/') ? '0.7' : '0.8';
      const changefreq = r === '/' ? 'weekly' : 'monthly';
      return `  <url>
    <loc>${build(r)}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
