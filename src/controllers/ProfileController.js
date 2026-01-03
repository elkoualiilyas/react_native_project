// src/controllers/ProfileController.js

import { useCallback, useEffect, useMemo, useState } from 'react';
import { PreferenceValues } from '../models/Preference';
import { UserRepository } from '../repositories/UserRepository';

/**
 * @param {string} userId
 * @returns {{
 *  user: import('../models/User').User | null,
 *  loading: boolean,
 *  setAge: (age: number) => Promise<void>,
 *  setName: (name: string) => Promise<void>,
 *  togglePreference: (pref: import('../models/Preference').Preference) => Promise<void>,
 *  preferenceOptions: import('../models/Preference').Preference[]
 * }}
 */
export function useProfileController(userId) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      try {
        const loaded = await UserRepository.getUserById(userId);
        if (!active) return;
        setUser(loaded);
      } finally {
        if (!active) return;
        setLoading(false);
      }
    }

    if (!userId) {
      setUser(null);
      setLoading(false);
      return;
    }

    load();
    return () => {
      active = false;
    };
  }, [userId]);

  const setAge = useCallback(
    async (age) => {
      const updated = await UserRepository.updateUserProfile(userId, { age });
      setUser(updated);
    },
    [userId]
  );

  const setName = useCallback(
    async (name) => {
      const updated = await UserRepository.updateUserProfile(userId, { name });
      setUser(updated);
    },
    [userId]
  );

  const togglePreference = useCallback(
    async (pref) => {
      if (!user) return;
      const set = new Set(user.preferences);
      if (set.has(pref)) {
        set.delete(pref);
      } else {
        set.add(pref);
      }
      const preferences = Array.from(set);
      const updated = await UserRepository.updateUserProfile(userId, { preferences });
      setUser(updated);
    },
    [user, userId]
  );

  const preferenceOptions = useMemo(() => PreferenceValues, []);

  return { user, loading, setAge, setName, togglePreference, preferenceOptions };
}

