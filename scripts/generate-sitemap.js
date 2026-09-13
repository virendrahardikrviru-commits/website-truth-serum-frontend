/**
 * generate-sitemap.js
 *
 * Generates public/sitemap.xml for Website Truth Serum.
 *
 * Combines:
 *   1. Static marketing pages.
 *   2. SEO-eligible public report URLs fetched from the backend.
 *
 * Public report URLs are sourced exclusively from:
 *   GET /api/reports/sitemap
 *
 * The backend is authoritative for SEO eligibility. This script only
 * converts the returned scan IDs into public report URLs.
 *
 * Usage:
 *   npm run generate:sitemap
 *
 * Environment variables (all optional):
 *   SITE_URL      - Base URL of the site.
 *                   Default: https://websitetruthserum.com
 *
 *   VITE_API_URL  - Backend API base URL.
 *                   Default: https://website-truth-serum-api.onrender.com
 *
 * The script is invoked automatically before every Vite build via the
 * "prebuild" npm script.
 */

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const SITE_URL = (
  process.env.SITE_URL || 'https://websitetruthserum.com'
).replace(/\/$/, '');

const API_URL = (
  process.env.VITE_API_URL ||
  'https://website-truth-serum-api.onrender.com'
).replace(/\/$/, '');

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

// The backend is authoritative for public-report SEO eligibility.
// Only scan IDs returned by this endpoint are added to the sitemap.
const REPORT_SITEMAP_ENDPOINT = `${API_URL}/api/reports/sitemap`;

/**
 * Escape a string for safe inclusion inside XML text/attribute values.
 */
const escapeXml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

/**
 * Fetch SEO-eligible public reports from the backend and convert their
 * scan IDs into site-relative report paths.
 */
async function fetchReportPaths() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(REPORT_SITEMAP_ENDPOINT, {
      signal: controller.signal,
    });

    if (!response.ok) {
      console.warn(
        `Public report sitemap endpoint returned HTTP ${response.status}.`
      );
      return [];
    }

    const data = await response.json();

    if (!data || !Array.isArray(data.reports)) {
      console.warn(
        'Public report sitemap endpoint returned an unexpected response shape.'
      );
      return [];
    }

    const paths = data.reports
      .map((report) => {
        if (!report || !report.scan_id) {
          return null;
        }

        return `/report/${encodeURIComponent(report.scan_id)}`;
      })
      .filter(Boolean);

    // Remove accidental duplicate URLs while preserving order.
    return [...new Set(paths)];
  } catch (error) {
    if (error?.name === 'AbortError') {
      console.warn('Public report sitemap request timed out.');
    } else {
      console.warn(
        `Could not fetch public report URLs: ${error?.message || 'Unknown error'}.`
      );
    }

    return [];
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Build the <urlset> XML string.
 */
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
  const lastmod = new Date().toISOString().slice(0, 10);

  const reportPaths = await fetchReportPaths();

  if (reportPaths.length > 0) {
    console.log(
      `Fetched ${reportPaths.length} SEO-eligible public report URLs from the backend.`
    );
  } else {
    console.warn(
      'No SEO-eligible public report URLs found on the backend — sitemap will contain static pages only.'
    );
  }

  const xml = buildSitemap(reportPaths, lastmod);

  writeFileSync(OUT_FILE, xml, 'utf8');

  console.log(
    `Sitemap written to ${OUT_FILE} (${STATIC_PAGES.length} static + ${reportPaths.length} report URLs).`
  );
}

main().catch((error) => {
  console.error('Failed to generate sitemap:', error);
  process.exitCode = 1;
});