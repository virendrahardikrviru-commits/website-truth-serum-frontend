import {
  SITE_NAME,
  SITE_URL,
  SITE_TAGLINE,
  CONTACT_EMAIL,
  DEFAULT_OG_IMAGE,
} from '../config/site';

/**
 * Structured data (JSON-LD) builders.
 *
 * Each schema object is self-contained except for the missing "@context"
 * wrapper, which is added at the point of use:
 *   - Standalone: add `"@context": "https://schema.org"` yourself, or
 *   - Compose several into a `@graph` via `composeGraph(...)`.
 */

/** Organization schema: name, URL, logo, description, founder, sameAs. */
export const organizationSchema = {
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: DEFAULT_OG_IMAGE,
  description: SITE_TAGLINE,
  founder: {
    '@type': 'Person',
    name: 'Website Truth Serum Team',
  },
  email: CONTACT_EMAIL,
  sameAs: [
    'https://twitter.com/websitetruthserum',
    'https://github.com/websitetruthserum',
  ],
};

/** SoftwareApplication schema describing the scanner product. */
export const softwareSchema = {
  '@type': 'SoftwareApplication',
  name: SITE_NAME,
  applicationCategory: 'SecurityApplication',
  operatingSystem: 'Web',
  url: SITE_URL,
  description: SITE_TAGLINE,
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    description: 'Free plan with 10 daily scans; Pro plan for unlimited access.',
  },
};

/** WebSite schema with a SearchAction for sitelinks searchbox eligibility. */
export const websiteSchema = {
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_TAGLINE,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

/**
 * BreadcrumbList schema generated from an array of { name, url } items.
 * @param {Array<{name: string, url: string}>} items - Ordered breadcrumb trail.
 * @returns {{'@context': string, '@type': string, itemListElement: Array}}
 */
export const breadcrumbSchema = (items = []) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

/**
 * Wrap multiple schema objects in a single @graph (for the homepage).
 * Strips any nested "@context" keys since they are inherited from the parent.
 * @param {...object} schemas - Schema objects to include in the graph.
 */
export const composeGraph = (...schemas) => ({
  '@context': 'https://schema.org',
  '@graph': schemas.map((schema) => {
    const copy = { ...schema };
    delete copy['@context'];
    return copy;
  }),
});

/** Homepage graph: Organization + SoftwareApplication + WebSite. */
export const homeSchema = composeGraph(organizationSchema, softwareSchema, websiteSchema);
