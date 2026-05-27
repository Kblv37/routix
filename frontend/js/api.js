import { API_URL } from './config.js';
import { getToken, clearToken } from './auth.js';

const buildUrl = (path) => `${API_URL}${path}`;

export const apiRequest = async (path, options = {}) => {
  const {
    method = 'GET',
    data,
    headers = {},
    auth = true
  } = options;

  const requestHeaders = {
    'Content-Type': 'application/json',
    ...headers
  };

  if (auth) {
    const token = getToken();
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(buildUrl(path), {
    method,
    headers: requestHeaders,
    body: data ? JSON.stringify(data) : undefined
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    if (response.status === 401 && auth) {
      clearToken();
    }

    const message = payload?.message || `Request failed (${response.status})`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return payload;
};
