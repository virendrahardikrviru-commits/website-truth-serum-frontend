import { supabase } from './auth';

const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

async function verityRequest(path, options = {}) {
  if (!API_BASE_URL) {
    throw new Error('VITE_API_URL is not configured.');
  }

  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw new Error(error.message);
  }

  const accessToken = data.session?.access_token;

  if (!accessToken) {
    throw new Error('Please sign in before accessing VERITY.');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  let result = null;

  try {
    result = await response.json();
  } catch {
    // The API may return an empty or non-JSON response.
  }

  if (!response.ok) {
    const message =
      typeof result?.detail === 'string'
        ? result.detail
        : `VERITY API request failed (${response.status}).`;

    throw new Error(message);
  }

  return result;
}

export function verifyVerityAdmin() {
  return verityRequest('/api/verity/admin/me');
}

export function getVerityEnquiries(limit = 50, offset = 0) {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });

  return verityRequest(`/api/verity/enquiries?${params}`);
}

export function getVerityCases(limit = 50, offset = 0) {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });

  return verityRequest(`/api/verity/cases?${params}`);
}
