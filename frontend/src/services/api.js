/**
 * Thin fetch wrapper. Every page talks to the backend through this
 * abstraction (and the service modules built on top of it) rather than
 * calling fetch() directly, so swapping mock endpoints for real
 * government APIs later touches this layer only — see master spec
 * section 23, "API Simulation".
 */
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('cfai_token');
}

async function request(path, { method = 'GET', body, auth = false, headers = {} } = {}) {
  const finalHeaders = { 'Content-Type': 'application/json', ...headers };
  if (auth) {
    const token = getToken();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: finalHeaders,
      body: body ? JSON.stringify(body) : undefined
    });
  } catch (networkErr) {
    const err = new Error('Government service temporarily unavailable. Your request has been safely queued.');
    err.isNetworkError = true;
    throw err;
  }

  let data = null;
  try {
    data = await res.json();
  } catch (parseErr) {
    data = null;
  }

  if (!res.ok) {
    const err = new Error((data && data.error) || `Request failed with status ${res.status}`);
    err.status = res.status;
    throw err;
  }

  return data;
}

export const api = {
  get: (path, opts) => request(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  patch: (path, body, opts) => request(path, { ...opts, method: 'PATCH', body })
};

export { BASE_URL };
