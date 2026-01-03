import { getApiBaseUrl } from '../config/api';

async function request(method, path, { body, headers } = {}) {
  const url = `${getApiBaseUrl()}${path}`;
  let res;
  try {
    res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(headers || {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error(`Network request failed. Backend: ${getApiBaseUrl()}`);
  }

  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!res.ok) {
    const message = data?.error || data?.message || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const apiClient = {
  get(path, opts) {
    return request('GET', path, opts);
  },
  post(path, body, opts) {
    return request('POST', path, { ...(opts || {}), body });
  },
  patch(path, body, opts) {
    return request('PATCH', path, { ...(opts || {}), body });
  },
  del(path, opts) {
    return request('DELETE', path, opts);
  },
};
