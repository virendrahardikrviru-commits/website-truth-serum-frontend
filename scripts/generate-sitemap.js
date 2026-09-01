/**
 * generate-sitemap.js
 *
 * Generates public/sitemap.xml for Website Truth Serum.
 *
 * Combines:
 *   1. The static marketing pages (/, /features, /pricing, /how-it-works,
 *      /about, /contact).
 *   2. Public report URLs fetched from the backend (best-effort — if the
 *      backend does not expose a report list yet, the script falls back to
 *      the static pages only and prints a warning).
 *
 * Usage:
 *   npm run generate:sitemap
 *
 * Environment variables (all optional):
 *   SITE_URL    - Base URL of the site.      Default: https://websitetruthserum.com
 *   VITE_API_URL - Backend API base URL.     Default: https://website-truth-serum-api.onrender.com
 *
 * The script is invoked automatically before every `vite build` via the
 * "prebuild" npm script so the shipped sitemap is always fresh.
 */

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const SITE_URL = (process.env.SITE_URL || 'https://websitetruthserum.com').replace(/\/$/, '');
const API_URL = (process.env.VITE_API_URL || 'https://website-truth-serum-api.onrender.com').replace(/\/$/, '');

// Path to public/sitemap.xml (this file lives in <root>/scripts).
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_FILE = path.resolve(__dirname, '..', 'public', 'sitemap.xml');

// Static marketing pages with their crawl priority & change frequency.
const STATIC_PAGES = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/features', priority: '0.9', changefreq: 'monthly' },
  { path: '/pricing', priority: '0.8', changefreq: 'monthly' },
  { path: '/how-it-works', priority: '0.8', changefreq: 'monthly' },
  { path: '/about', priority: '0.7', changefreq: 'monthly' },
  { path: '/contact', priority: '0.6', changefreq: 'monthly' },
];

// Candidate report-list endpoints on the FastAPI backend. The script tries
// each until one returns data; unknown response shapes are handled gracefully.
const REPORT_ENDPOINTS = [
  `${API_URL}/api/reports/`,
  `${API_URL}/api/reports`,
  `${API_URL}/api/public-reports`,
];

/** Escape a string for safe inclusion inside XML text/attribute values. */
const escapeXml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

/** Best-effort fetch of public report URLs from the backend. */
async function fetchReportPaths() {
  for (const endpoint of REPORT_ENDPOINTS) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(endpoint, { signal: controller.signal });
      clearTimeout(timer);

      if (!res.ok) continue;

      const data = await res.json();
      // Accept any of these shapes:
      //   ["https://.../report/x"] | ["/report/x"] | { reports: [...] } | { results: [...] }
      const list = Array.isArray(data)
        ? data
        : (data.reports || data.results || data.urls || []);

      const paths = list
        .map((entry) => {
          const item = typeof entry === 'string' ? { url: entry } : entry || {};
          if (item.url) return item.url;
          if (item.path) return item.path;
          if (item.domain) return `/report/${encodeURIComponent(item.domain)}`;
          if (item.slug) return `/report/${encodeURIComponent(item.slug)}`;
          return null;
        })
        .filter(Boolean)
        // Normalize to site-relative paths.
        .map((url) => url.replace(SITE_URL, ''))
        .filter((path) => path.startsWith('/'));

      if (paths.length > 0) return paths;
    } catch {
      // Try the next endpoint.
    }
  }
  return [];
}

/** Build the <urlset> XML string. */
function buildSitemap(reportPaths, lastmod) {
  const urls = [
    ...STATIC_PAGES.map((page) => ({
      loc: `${SITE_URL}${page.path}`,
      lastmod,
      changefreq: page.changefreq,
      priority: page.priority,
    })),
    ...reportPaths.map((path) => ({
      loc: `${SITE_URL}${path}`,
      lastmod,
      changefreq: 'weekly',
      priority: '0.5',
    })),
  ];

  const urlTags = urls
    .map(
      (url) => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlTags}
</urlset>
`;
}

async function main() {
  const lastmod = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  const reportPaths = await fetchReportPaths();
  if (reportPaths.length > 0) {
    console.log(`Fetched ${reportPaths.length} public report URLs from the backend.`);
  } else {
    console.warn('No public report URLs found on the backend — sitemap will contain static pages only.');
  }

  const xml = buildSitemap(reportPaths, lastmod);
  writeFileSync(OUT_FILE, xml, 'utf8');
  console.log(`Sitemap written to ${OUT_FILE} (${STATIC_PAGES.length} static + ${reportPaths.length} report URLs).`);
}

main().catch((error) => {
  console.error('Failed to generate sitemap:', error);
  process.exitCode = 1;
});
