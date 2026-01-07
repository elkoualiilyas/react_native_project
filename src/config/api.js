import Constants from 'expo-constants';
import { Platform } from 'react-native';

function getHostFromExpo() {
  const hostUri = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoClient?.hostUri;
  if (typeof hostUri !== 'string' || hostUri.length === 0) return null;
  const host = hostUri.split(':')[0];
  return host || null;
}

export function getApiBaseUrl() {
  const envUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (typeof envUrl === 'string' && envUrl.length > 0) {
    return envUrl;
  }

  const port = Number(process.env.EXPO_PUBLIC_API_PORT || 3001);

  if (Platform.OS === 'web') {
    const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    return `http://${host}:${port}`;
  }

  const host = getHostFromExpo();
  return `http://${host || 'localhost'}:${port}`;
}
