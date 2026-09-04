/**
 * V1.4 Phase 1 — pure UI translation helpers for evidence display.
 *
 * Deterministic, side-effect-free, dependency-free helpers that translate
 * backend evidence identifiers and effect values into UI-friendly,
 * human-readable presentation data.
 *
 * This module NEVER mutates evidence, computes scores/confidence, or alters
 * API/evidence semantics. It is presentation translation only.
 *
 * Fallback policy: any value that is absent, null/undefined, or unparseable is
 * treated as UI "neutral" so unknown or malformed data can never be presented
 * as positive or negative evidence.
 */

const ACRONYMS = new Set([
  'ssl',
  'tls',
  'http',
  'https',
  'hsts',
  'csp',
  'coop',
  'corp',
  'coep',
  'nosniff',
  'xfo',
  'xcto',
]);

const SIGNAL_LABELS = {
  // domain
  domain_age: 'Domain Age',
  domain_status: 'Domain Status',
  // ssl / tls
  ssl_valid: 'Valid TLS Certificate',
  ssl_expiry: 'TLS Certificate Expiry',
  ssl_error: 'TLS Certificate Error',
  // http behavior
  https_ok: 'HTTPS Responded',
  http_to_https: 'HTTP to HTTPS Redirect',
  https_downgrade: 'HTTPS Downgrade',
  http_entry_error: 'HTTPS Entry Page Error',
  redirect_loop: 'Redirect Loop',
  // content
  title_present: 'Page Title Present',
  description_present: 'Meta Description Present',
  lang_present: 'Language Declared',
  viewport_present: 'Viewport Declared',
  canonical_present: 'Canonical URL Present',
  alt_text_present: 'Alt Text Present',
  metadata_quality: 'Metadata Quality',
  substantial_content: 'Substantial Content',
  no_title: 'Missing Page Title',
  insecure_mixed_content: 'Insecure Mixed Content',
  insecure_login: 'Insecure Login Form',
  // security headers
  hsts: 'HSTS (Strict Transport Security)',
  csp: 'CSP (Content Security Policy)',
  csp_frame_ancestors: 'CSP Frame-Ancestors',
  nosniff: 'X-Content-Type-Options',
  x_frame_options: 'X-Frame-Options',
  referrer_policy: 'Referrer-Policy',
  permissions_policy: 'Permissions-Policy',
  coop: 'COOP Header',
  corp: 'CORP Header',
  coep: 'COEP Header',
  csp_report_only: 'CSP Report-Only',
  cookie_security: 'Cookie Security',
  framing: 'Framing Protection',
  // reputation
  spam_hit: 'Listed as Spam Source',
  phishing_hit: 'Listed for Phishing',
  malware_hit: 'Listed for Malware',
  c2_hit: 'Listed as Command & Control',
  reputation_verdict: 'Reputation Verdict',
};

const CATEGORY_LABELS = {
  domain: 'Domain',
  ssl: 'SSL',
  http: 'HTTP',
  security_headers: 'Security Headers',
  content: 'Content',
  legal: 'Legal',
  contact: 'Contact',
  intel: 'Intelligence',
  tech: 'Technology',
  performance: 'Performance',
  reputation: 'Reputation',
};

/** True only for a finite number (or a numeric string that parses to one). */
function toEffectNumber(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return null;
}

/**
 * Classify a single effect value by sign.
 *
 *   value > 0  -> "positive"
 *   value === 0 -> "neutral"
 *   value < 0  -> "negative"
 *   null/undefined/malformed -> "neutral"  (safe UI fallback)
 *
 * @param {unknown} value
 * @returns {"positive"|"neutral"|"negative"}
 */
export function classifyEffect(value) {
  const number = toEffectNumber(value);
  if (number === null || number === 0) {
    return 'neutral';
  }
  return number > 0 ? 'positive' : 'negative';
}

/**
 * Convert a snake_case / technical identifier into readable title-case text.
 * Acronyms and short all-caps tokens are preserved uppercased. Safe fallback
 * for arbitrary future identifiers: never throws, never returns undefined.
 *
 * @param {unknown} id
 * @returns {string}
 */
export function prettifyId(id) {
  if (typeof id !== 'string' || id.trim() === '') {
    return 'Unknown';
  }
  return id
    .trim()
    .split(/[_\-\s]+/)
    .filter(Boolean)
    .map((token) => {
      if (ACRONYMS.has(token.toLowerCase()) || (token.length >= 2 && token === token.toUpperCase())) {
        return token.toUpperCase();
      }
      return token.charAt(0).toUpperCase() + token.slice(1).toLowerCase();
    })
    .join(' ');
}

/**
 * Human-readable label for a technical evidence signal id.
 *
 * @param {unknown} signal
 * @returns {string}
 */
export function signalLabel(signal) {
  if (typeof signal === 'string' && Object.prototype.hasOwnProperty.call(SIGNAL_LABELS, signal)) {
    return SIGNAL_LABELS[signal];
  }
  return prettifyId(signal);
}

/**
 * Human-readable label for an evidence category key.
 *
 * @param {unknown} category
 * @returns {string}
 */
export function categoryLabel(category) {
  if (typeof category === 'string' && Object.prototype.hasOwnProperty.call(CATEGORY_LABELS, category)) {
    return CATEGORY_LABELS[category];
  }
  return prettifyId(category);
}

/**
 * Describe an effect value for rendering: semantic tone plus the parsed
 * numeric value (or null when unavailable). Tone is always one of
 * "positive" | "neutral" | "negative".
 *
 * @param {unknown} value
 * @returns {{ tone: "positive"|"neutral"|"negative", value: number|null }}
 */
export function effectTone(value) {
  const number = toEffectNumber(value);
  return {
    tone: classifyEffect(number),
    value: number,
  };
}

/**
 * Format a finite effect number with an explicit sign (e.g. "+6", "0", "-10").
 * Returns null for null/undefined/malformed values.
 *
 * @param {unknown} value
 * @returns {string|null}
 */
export function formatEffect(value) {
  const number = toEffectNumber(value);
  if (number === null) {
    return null;
  }
  return number > 0 ? `+${number}` : String(number);
}

/**
 * Narrowly scoped text helper: returns a safe display string from a backend
 * field. Plain strings and finite numbers are returned; objects/arrays are
 * never stringified (so raw header/cookie/credential-shaped structures can
 * never leak into the UI) and instead fall back.
 *
 * @param {unknown} value
 * @param {string} [fallback]
 * @returns {string}
 */
export function safeDisplayText(value, fallback = '') {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  return fallback;
}

const SSL_CATEGORY = 'ssl';
const SSL_SIGNALS = {
  valid: 'ssl_valid',
  invalid: 'ssl_error',
};

/**
 * Derive the displayed SSL/TLS status from collected evidence.
 *
 * Deterministic precedence:
 *   1. a verified item with category "ssl" and signal "ssl_valid"
 *      -> "valid"
 *   2. a verified item with category "ssl" and signal "ssl_error"
 *      -> "invalid"
 *   3. a legacy top-level boolean (`legacySslValid`) -> "valid"/"invalid"
 *   4. otherwise -> "unknown"
 *
 * Absence of `ssl_valid` is NEVER treated as invalidity — no evidence is not
 * proof of failure. Pure: never mutates input and never performs network work.
 *
 * @param {unknown} verifiedItems transparency.verified-style item list
 * @param {unknown} [legacySslValid] optional legacy top-level boolean
 * @returns {"valid"|"invalid"|"unknown"}
 */
export function deriveSslStatus(verifiedItems, legacySslValid = null) {
  if (Array.isArray(verifiedItems)) {
    for (const item of verifiedItems) {
      if (
        item &&
        item.category === SSL_CATEGORY &&
        item.signal === SSL_SIGNALS.valid
      ) {
        return 'valid';
      }
    }
    for (const item of verifiedItems) {
      if (
        item &&
        item.category === SSL_CATEGORY &&
        item.signal === SSL_SIGNALS.invalid
      ) {
        return 'invalid';
      }
    }
  }
  if (typeof legacySslValid === 'boolean') {
    return legacySslValid ? 'valid' : 'invalid';
  }
  return 'unknown';
}

/**
 * Human-readable label for an SSL status token. Deterministic fallback to
 * "Unknown" for anything other than valid/invalid.
 *
 * @param {unknown} status
 * @returns {string}
 */
export function sslStatusLabel(status) {
  if (status === 'valid') {
    return 'Valid ✅';
  }
  if (status === 'invalid') {
    return 'Invalid ⚠️';
  }
  return 'Unknown';
}
