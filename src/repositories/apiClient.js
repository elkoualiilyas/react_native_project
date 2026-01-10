import { getApiBaseUrl } from '../config/api';
import { Platform } from 'react-native';

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
    const baseUrl = getApiBaseUrl();
    const hint =
      Platform.OS === 'web'
        ? 'Ensure the backend is running and reachable from your browser.'
        : baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')
          ? 'You are on a phone: localhost points to the phone. Set EXPO_PUBLIC_API_BASE_URL to http://<YOUR_PC_LAN_IP>:3002 and restart Expo.'
          : baseUrl.includes('10.0.2.2')
            ? '10.0.2.2 works only on Android emulator. For a real phone, set EXPO_PUBLIC_API_BASE_URL to http://<YOUR_PC_LAN_IP>:3002.'
            : 'Ensure your phone and computer are on the same Wi-Fi and the backend listens on 0.0.0.0.';

    throw new Error(`Network request failed. Backend: ${baseUrl}. ${hint}`);
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
