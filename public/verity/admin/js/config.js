/**
 * VERITY Administrator Dashboard — API configuration.
 *
 * API base URL is resolved separately from Supabase authentication configuration
 * (which is loaded from ../js/supabase-config.js as window.VERITY_SUPABASE_CONFIG).
 * Local development API is selected automatically when the browser hostname is
 * localhost or 127.0.0.1; otherwise the production API is used.
 */
window.VERITY_ADMIN_CONFIG = (function () {
  'use strict';

  const hostname = typeof window !== 'undefined' && window.location
    ? window.location.hostname
    : '';

  const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';

  return {
    apiBaseUrl: isLocal ? 'http://127.0.0.1:8000' : 'https://website-truth-serum-api.onrender.com',

    // Endpoint paths relative to apiBaseUrl
    endpoints: {
      adminMe: '/api/verity/admin/me',
      enquiries: '/api/verity/enquiries',
      cases: '/api/verity/cases',
      caseById: function (caseId) { return '/api/verity/cases/' + encodeURIComponent(caseId); },
      evidence: function (caseId) { return '/api/verity/cases/' + encodeURIComponent(caseId) + '/evidence'; },
      findings: function (caseId) { return '/api/verity/cases/' + encodeURIComponent(caseId) + '/findings'; },
      reports: function (caseId) { return '/api/verity/cases/' + encodeURIComponent(caseId) + '/reports'; },
    },

    // Supported values, kept in sync with backend validation
    caseStatuses: ['open', 'in_progress', 'closed', 'archived'],
    reportStatuses: ['draft', 'final'],
    evidenceTypes: ['document', 'screenshot', 'link', 'email', 'record', 'other'],
    verificationStatuses: ['unverified', 'verified', 'disputed', 'inconclusive'],
    findingTypes: ['confirmed_fact', 'unverified_information', 'analytical_assessment'],
  };
})();
