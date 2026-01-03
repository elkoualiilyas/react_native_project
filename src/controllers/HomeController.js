// src/controllers/HomeController.js

import { useCallback, useEffect, useMemo, useState } from 'react';
import { EventRepository } from '../repositories/EventRepository';
import { UserRepository } from '../repositories/UserRepository';

/**
 * @param {string} userId
 * @returns {{
 *  user: import('../models/User').User | null,
 *  events: import('../models/Event').Event[],
 *  loading: boolean,
 *  refresh: () => Promise<void>,
 *  onEventPress: (event: import('../models/Event').Event, navigation: any) => void
 * }}
 */
export function useHomeController(userId) {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const loadedUser = await UserRepository.getUserById(userId);
      const loadedEvents = await EventRepository.getEventsByPreferences(loadedUser.preferences);
      setUser(loadedUser);
      setEvents(loadedEvents);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setUser(null);
      setEvents([]);
      setLoading(false);
      return;
    }
    refresh();
  }, [userId, refresh]);

  const onEventPress = useMemo(() => {
    return (event, navigation) => {
      navigation.navigate('EventDetails', { eventId: event.id });
    };
  }, []);

  return { user, events, loading, refresh, onEventPress };
}
