// src/controllers/AuthController.js

import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../repositories/apiClient';

const AUTH_USER_ID_KEY = 'auth:currentUserId';

/** @type {string | null} */
let currentUserId = null;

/** @type {Set<(userId: string | null) => void>} */
const listeners = new Set();

function notify() {
  for (const listener of listeners) {
    listener(currentUserId);
  }
}

async function setCurrentUserId(userId) {
  currentUserId = userId;
  if (userId) {
    await AsyncStorage.setItem(AUTH_USER_ID_KEY, userId);
  } else {
    await AsyncStorage.removeItem(AUTH_USER_ID_KEY);
  }
  notify();
}

export const AuthController = {
  /**
   * @returns {Promise<string | null>}
   */
  async getCurrentUserId() {
    if (currentUserId) {
      return currentUserId;
    }
    const stored = await AsyncStorage.getItem(AUTH_USER_ID_KEY);
    currentUserId = stored ?? null;
    return currentUserId;
  },

  /**
   * @param {string} email
   * @param {string} password
   * @returns {Promise<string>} userId
   */
  async signUp(email, password) {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    const res = await apiClient.post('/api/auth/signup', {
      email: email.trim(),
      password,
    });
    await setCurrentUserId(res.userId);
    return res.userId;
  },

  /**
   * @param {string} email
   * @param {string} password
   * @returns {Promise<string>} userId
   */
  async signIn(email, password) {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    const res = await apiClient.post('/api/auth/signin', {
      email: email.trim(),
      password,
    });
    await setCurrentUserId(res.userId);
    return res.userId;
  },

  /**
   * @returns {Promise<void>}
   */
  async signOut() {
    await setCurrentUserId(null);
  },

  /**
   * @param {(userId: string | null) => void} callback
   * @returns {() => void}
   */
  onAuthStateChanged(callback) {
    listeners.add(callback);
    callback(currentUserId);
    return () => {
      listeners.delete(callback);
    };
  },
};

/**
 * React hook that exposes auth state without any JSX.
 * @returns {{ userId: string | null, initializing: boolean }}
 */
export function useAuthState() {
  const [userId, setUserId] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let mounted = true;

    AuthController.getCurrentUserId()
      .then((id) => {
        if (!mounted) return;
        setUserId(id);
      })
      .finally(() => {
        if (!mounted) return;
        setInitializing(false);
      });

    const unsubscribe = AuthController.onAuthStateChanged((id) => {
      setUserId(id);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  return { userId, initializing };
}
