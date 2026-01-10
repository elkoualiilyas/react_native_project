import Constants from 'expo-constants';
import { Platform } from 'react-native';

function toHostname(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    if (trimmed.includes('://')) {
      const u = new URL(trimmed);
      return u.hostname || null;
    }
  } catch {
    // ignore
  }

  const withoutProtocol = trimmed.replace(/^[a-zA-Z+.-]+:\/\//, '');
  const beforePath = withoutProtocol.split('/')[0] || '';
  const host = beforePath.split(':')[0] || '';
  return host || null;
}

function getHostFromExpo() {
  const candidates = [
    Constants.expoConfig?.hostUri,
    Constants.manifest2?.extra?.expoClient?.hostUri,
    Constants.expoGoConfig?.debuggerHost,
    Constants.manifest?.debuggerHost,
    Constants.linkingUri,
    Constants.experienceUrl,
    Constants.debuggerHost,
  ];

  for (const c of candidates) {
    const host = toHostname(c);
    if (host) return host;
  }

  return null;
}

function getExplicitApiBaseUrl() {
  const v =
    Constants.expoConfig?.extra?.apiBaseUrl ||
    Constants.manifest2?.extra?.expoClient?.extra?.apiBaseUrl ||
    Constants.manifest?.extra?.apiBaseUrl;
  return typeof v === 'string' && v.trim().length > 0 ? v.trim() : null;
}

export function getApiBaseUrl() {
  const envUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (typeof envUrl === 'string' && envUrl.length > 0) {
    return envUrl;
  }

  const explicitUrl = getExplicitApiBaseUrl();
  if (explicitUrl) return explicitUrl;

  const port = Number(process.env.EXPO_PUBLIC_API_PORT || 3002);

  if (Platform.OS === 'web') {
    const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    return `http://${host}:${port}`;
  }

  const host = getHostFromExpo();
  if (host) return `http://${host}:${port}`;

  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${port}`;
  }

  return `http://localhost:${port}`;
}
