import React from 'react';
import { Helmet } from 'react-helmet-async';
import {
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
  TWITTER_HANDLE,
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
} from '../config/site';

/**
 * Reusable SEO component built on react-helmet-async.
 *
 * Injects title, meta description, canonical URL, robots rules, Open Graph
 * tags, Twitter Card tags and optional JSON-LD structured data.
 *
 * Props:
 *   title       (string)  Page-specific title. Site name suffix is appended automatically.
 *   description (string)  Meta description (~150-160 chars recommended).
 *   canonical   (string)  Absolute canonical URL for this page.
 *   image       (string)  Absolute URL (or path) of the Open Graph image.
 *   type        (string)  og:type — "website" (default) or "article", "product", ...
 *   noindex     (boolean) When true, emits robots noindex,nofollow.
 *   schema      (object)  JSON-LD structured data object injected as-is.
 *
 * Usage:
 *   <SEO
 *     title="Features"
 *     description="..."
 *     canonical="https://websitetruthserum.com/features"
 *     schema={featuresSchema}
 *   />
 */
const SEO = ({
  title,
  description = DEFAULT_DESCRIPTION,
  canonical = `${SITE_URL}/`,
  image = DEFAULT_OG_IMAGE,
  type = 'website',
  noindex = false,
  schema = null,
}) => {
  // "<title> | Website Truth Serum"
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — ${SITE_TAGLINE}`;

  // Allow relative image paths (e.g. "/og-image.png") by resolving to absolute.
  const resolvedImage = /^https?:\/\//i.test(image) ? image : `${SITE_URL}${image}`;

  return (
    <Helmet>
      {/* Primary tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow'} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={resolvedImage} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={resolvedImage} />
      <meta name="twitter:site" content={TWITTER_HANDLE} />
      <meta name="twitter:creator" content={TWITTER_HANDLE} />

      {/* JSON-LD structured data (rendered as-is when provided) */}
      {schema && <script type="application/ld+json">{JSON.stringify(schema)}</script>}
    </Helmet>
  );
};

export default SEO;
