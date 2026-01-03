import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { apiClient } from '../repositories/apiClient';

const ADMIN_TOKEN_KEY = 'admin:token';

let adminToken = null;

const listeners = new Set();

function notify() {
  for (const listener of listeners) {
    listener(adminToken);
  }
}

async function setAdminToken(token) {
  adminToken = token;
  if (token) {
    await AsyncStorage.setItem(ADMIN_TOKEN_KEY, token);
  } else {
    await AsyncStorage.removeItem(ADMIN_TOKEN_KEY);
  }
  notify();
}

export const AdminAuthController = {
  async getToken() {
    if (adminToken) return adminToken;
    const stored = await AsyncStorage.getItem(ADMIN_TOKEN_KEY);
    adminToken = stored ?? null;
    return adminToken;
  },

  async signIn(email, password) {
    const res = await apiClient.post('/api/admin/login', { email, password });
    await setAdminToken(res.token);
    return res.token;
  },

  async signOut() {
    await setAdminToken(null);
  },

  onAuthStateChanged(callback) {
    listeners.add(callback);
    callback(adminToken);
    return () => listeners.delete(callback);
  },
};

export function useAdminAuthState() {
  const [token, setToken] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let mounted = true;
    AdminAuthController.getToken()
      .then((t) => {
        if (!mounted) return;
        setToken(t);
      })
      .finally(() => {
        if (!mounted) return;
        setInitializing(false);
      });

    const unsub = AdminAuthController.onAuthStateChanged((t) => setToken(t));
    return () => {
      mounted = false;
      unsub();
    };
  }, []);

  return { token, initializing };
}
