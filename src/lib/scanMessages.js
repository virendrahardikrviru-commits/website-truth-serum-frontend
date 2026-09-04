/**
 * V1.4 Phase 4 — safe, deterministic user-facing scan error copy.
 *
 * Maps backend status / transport failure conditions to static,
 * human-friendly messages. Raw exception text, server `detail` strings,
 * status numbers, URLs and stack traces are NEVER included in user-facing
 * output. Messages are static constants only.
 */

const MESSAGES = {
  400: "We couldn't analyze that address. Please check that it is a valid, publicly reachable URL and try again.",
  422: "That doesn't look like a valid web address. Use a full URL such as https://example.com and try again.",
  429: 'Too many scans right now. Please wait a moment and try again.',
  500: 'The analysis service hit a temporary problem. Please try again in a moment.',
};

/** Safe message for any unmapped HTTP status or unexpected failure. */
export const FALLBACK_ERROR_MESSAGE =
  'The analysis service is temporarily unavailable. Please try again shortly.';

/** Safe message for transport-level failures (offline, DNS, refused). */
export const NETWORK_ERROR_MESSAGE =
  "Couldn't reach the analysis service. Please check your connection and try again.";

/** Safe message for a controlled client-side scan timeout. */
export const TIMEOUT_ERROR_MESSAGE =
  'The scan is taking longer than expected. Please try again.';

/**
 * Deterministic status -> message mapping. Unknown/malformed statuses fall
 * back to the safe generic message.
 *
 * @param {unknown} status
 * @returns {string}
 */
export function scanErrorMessage(status) {
  if (
    Number.isInteger(status) &&
    Object.prototype.hasOwnProperty.call(MESSAGES, status)
  ) {
    return MESSAGES[status];
  }
  return FALLBACK_ERROR_MESSAGE;
}
