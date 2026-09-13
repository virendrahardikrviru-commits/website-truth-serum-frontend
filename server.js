import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

const DIST_DIR = path.join(__dirname, 'dist');
const INDEX_FILE = path.join(DIST_DIR, 'index.html');

const API_URL = (
  process.env.VITE_API_URL ||
  'https://website-truth-serum-api.onrender.com'
).replace(/\/$/, '');

const SITE_URL = (
  process.env.SITE_URL ||
  'https://websitetruthserum.com'
).replace(/\/$/, '');

const REPORT_TIMEOUT_MS = 15000;

/**
 * Escape text before inserting it into HTML.
 */
function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Escape JSON-LD so it cannot accidentally terminate
 * the surrounding script element.
 */
function safeJsonLd(value) {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}

/**
 * Fetch one persisted public report.
 *
 * This ONLY reads an existing report.
 * It never starts a new scan.
 */
async function fetchPublicReport(scanId) {
  const controller = new AbortController();

  const timeout = setTimeout(
    () => controller.abort(),
    REPORT_TIMEOUT_MS
  );

  try {
    const response = await fetch(
      `${API_URL}/api/reports/${encodeURIComponent(scanId)}`,
      {
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
        },
      }
    );

    if (response.status === 404) {
  return {
    status: 'not-found',
    report: null,
  };
}

if (!response.ok) {
  return {
    status: 'error',
    report: null,
  };
}

const report = await response.json();

return {
  status: 'success',
  report,
};
  } catch (error) {
    console.warn(
      `Public report fetch failed for ${scanId}:`,
      error?.message || error
    );

    return {
      status: 'error',
      report: null,
    };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Determine whether a persisted report has enough evidence
 * to be useful as a search landing page.
 *
 * SEO eligibility is intentionally separate from scoring.
 * This function never changes the report's score, confidence,
 * classification, or evidence.
 */
function isSeoEligibleReport(report) {
  const verified = Array.isArray(report?.transparency?.verified)
    ? report.transparency.verified
    : [];

  const usableCategories = new Set(
    verified
      .map((item) => item?.category)
      .filter(Boolean)
  );

  const minimumVerifiedSignals = 3;
  const minimumUsableCategories = 3;

  return (
    verified.length >= minimumVerifiedSignals &&
    usableCategories.size >= minimumUsableCategories
  );
}

/**
 * Build SEO metadata from the already-persisted report.
 *
 * IMPORTANT:
 * This does NOT calculate the trust score.
 * It only reads the backend's existing score.
 */
function buildReportSeo(report, scanId) {
  const transparency = report?.transparency || {};

  const score =
    typeof transparency.score === 'number'
      ? transparency.score
      : typeof report?.trust_score === 'number'
        ? report.trust_score
        : null;

  const domain =
    report?.domain ||
    report?.scanned_url ||
    'Unknown';

  const canonicalUrl =
    `${SITE_URL}/report/${encodeURIComponent(scanId)}`;

  const title =
    typeof score === 'number'
      ? `${domain} Website Risk Report — Score ${score} | Website Truth Serum`
      : `${domain} Website Risk Report | Website Truth Serum`;

  const description =
    `View the Website Truth Serum risk report for ${domain}, including its score, confidence, verified evidence, and what could not be determined.`;

  const analyzedAt =
    typeof report?.analyzed_at === 'string' &&
    report.analyzed_at.trim() !== '' &&
    !Number.isNaN(Date.parse(report.analyzed_at))
      ? report.analyzed_at
      : null;

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url: canonicalUrl,
    publisher: {
      '@type': 'Organization',
      name: 'Website Truth Serum',
      url: SITE_URL,
    },
    ...(analyzedAt
      ? {
          datePublished: analyzedAt,
          dateModified: analyzedAt,
        }
      : {}),
  };

  return {
    title,
    description,
    canonicalUrl,
    articleSchema,
  };
}

/**
 * Replace generic SPA SEO metadata with report-specific metadata.
 *
 * React itself remains unchanged and still renders the full report UI.
 */
function injectReportSeo(html, seo) {
  const title = escapeHtml(seo.title);
  const description = escapeHtml(seo.description);
  const canonicalUrl = escapeHtml(seo.canonicalUrl);
  const imageUrl = escapeHtml(`${SITE_URL}/og-image.png`);
  const jsonLd = safeJsonLd(seo.articleSchema);

  const reportMeta = `
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <link rel="canonical" href="${canonicalUrl}" />

    <meta property="og:type" content="article" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:site_name" content="Website Truth Serum" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="Website Truth Serum public risk report" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@websitetruthserum" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${imageUrl}" />

    <script type="application/ld+json">${jsonLd}</script>
  `;

  return html
    .replace(/<title>[\s\S]*?<\/title>/i, '')
    .replace(
      /<meta\s+name=["']description["'][^>]*>\s*/i,
      ''
    )
    .replace(
      /<meta\s+name=["']robots["'][^>]*>\s*/i,
      ''
    )
    .replace(
      /<link\s+rel=["']canonical["'][^>]*>\s*/i,
      ''
    )
    .replace(
      /<meta\s+property=["']og:type["'][^>]*>\s*/i,
      ''
    )
    .replace(
      /<meta\s+property=["']og:url["'][^>]*>\s*/i,
      ''
    )
    .replace(
      /<meta\s+property=["']og:title["'][^>]*>\s*/i,
      ''
    )
    .replace(
      /<meta\s+property=["']og:description["'][^>]*>\s*/i,
      ''
    )
    .replace(
      /<meta\s+name=["']twitter:title["'][^>]*>\s*/i,
      ''
    )
    .replace(
      /<meta\s+name=["']twitter:description["'][^>]*>\s*/i,
      ''
    )
    .replace(
      /<meta\s+name=["']twitter:image["'][^>]*>\s*/i,
      ''
    )
    .replace(
      /<meta\s+property=["']og:image["'][^>]*>\s*/i,
      ''
    )
    .replace('</head>', `${reportMeta}\n  </head>`);
}

/**
 * Build a safe noindex response for missing/unavailable reports.
 */

function injectNoindex(html, scanId) {
  const canonicalUrl =
    `${SITE_URL}/report/${encodeURIComponent(scanId)}`;

  const meta = `
    <title>Report Unavailable | Website Truth Serum</title>
    <meta name="robots" content="noindex, nofollow" />
    <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
  `;

  return html
    .replace(/<title>[\s\S]*?<\/title>/i, '')
    .replace(
      /<meta\s+name=["']description["'][^>]*>\s*/i,
      ''
    )
    .replace(
      /<meta\s+name=["']robots["'][^>]*>\s*/i,
      ''
    )
    .replace(
      /<link\s+rel=["']canonical["'][^>]*>\s*/i,
      ''
    )
    .replace(
      /<meta\s+property=["']og:[^"']+["'][^>]*>\s*/gi,
      ''
    )
    .replace(
      /<meta\s+name=["']twitter:[^"']+["'][^>]*>\s*/gi,
      ''
    )
    .replace(
      /<script[^>]+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi,
      ''
    )
    .replace('</head>', `${meta}\n  </head>`);
}

/**
 * Serve Vite's static assets.
 */
app.use(express.static(DIST_DIR));

/**
 * Public report route.
 *
 * This is the ONLY route that receives server-generated
 * report-specific SEO metadata.
 */
app.get('/report/:scanId', async (req, res) => {
  const { scanId } = req.params;

  let html;

  try {
    html = await fs.readFile(INDEX_FILE, 'utf8');
  } catch (error) {
    console.error(
      'Unable to read dist/index.html:',
      error
    );

    return res
      .status(500)
      .send('Application build is unavailable.');
  }

  const result = await fetchPublicReport(scanId);

  if (result.status === 'success' && result.report) {
  if (isSeoEligibleReport(result.report)) {
    const seo = buildReportSeo(
      result.report,
      scanId
    );

    return res
      .status(200)
      .type('html')
      .send(injectReportSeo(html, seo));
  }

  return res
    .status(200)
    .type('html')
    .send(injectNoindex(html, scanId));
}

  if (result.status === 'not-found') {
    return res
      .status(404)
      .type('html')
      .send(injectNoindex(html, scanId));
  }

  return res
    .status(503)
    .type('html')
    .send(injectNoindex(html, scanId));
});

/**
 * All other routes continue using the normal Vite SPA shell.
 */
app.get('*', async (req, res) => {
  try {
    const html = await fs.readFile(
      INDEX_FILE,
      'utf8'
    );

    res
      .type('html')
      .send(html);
  } catch (error) {
    console.error(
      'Unable to read dist/index.html:',
      error
    );

    res
      .status(500)
      .send('Application build is unavailable.');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});