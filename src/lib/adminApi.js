/**
 * API client for the dashboard.
 *
 * The access token lives in this module, in memory only. Nothing is written to
 * localStorage, so a script that manages to run on the page cannot read it and
 * closing the tab ends the session. Continuity comes from the refresh cookie,
 * which JavaScript cannot touch at all.
 */
import { ApiError, request } from './api';

let accessToken = null;
let onSessionLost = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

/** Lets the auth provider react when a refresh finally fails. */
export const setSessionLostHandler = (handler) => {
  onSessionLost = handler;
};

const authorised = (options = {}) => ({
  ...options,
  headers: {
    ...options.headers,
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  },
});

/**
 * Runs a request, and on a 401 tries once to mint a new access token from the
 * refresh cookie before repeating it. Without this the dashboard would throw
 * someone out every fifteen minutes mid-task.
 */
const withRefresh = async (path, options) => {
  try {
    return await request(path, authorised(options));
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) throw error;

    try {
      const refreshed = await request('/admin/auth/refresh', { method: 'POST' });
      accessToken = refreshed.data.accessToken;
    } catch (refreshError) {
      accessToken = null;
      onSessionLost?.();
      throw refreshError;
    }

    return request(path, authorised(options));
  }
};

export const adminApi = {
  get: (path) => withRefresh(path),
  post: (path, body) => withRefresh(path, { method: 'POST', body }),
  patch: (path, body) => withRefresh(path, { method: 'PATCH', body }),
};

/** Builds ?a=1&b=2 while dropping anything empty, so the URL stays readable. */
export const toQuery = (params) => {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    search.set(key, value);
  }

  const query = search.toString();
  return query ? `?${query}` : '';
};
