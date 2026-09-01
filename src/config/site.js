// Centralized site-wide constants used by the SEO component, schemas,
// sitemap generator and page content. Keeps canonical URLs consistent
// across the entire app so there is a single source of truth.

export const SITE_NAME = 'Website Truth Serum';
export const SITE_TAGLINE = 'Instantly separate web truth from filler';
export const SITE_URL = 'https://websitetruthserum.com';
export const TWITTER_HANDLE = '@websitetruthserum';
export const CONTACT_EMAIL = 'hello@websitetruthserum.com';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

// Default meta description (targeting the "website trust checker" keyword).
// Kept within the recommended 150-160 character range.
export const DEFAULT_DESCRIPTION =
  'Free evidence-based website risk checker. Scan any URL for TLS, security-header, domain-registration, and page-content signals — and see exactly what we could and could not verify.';
