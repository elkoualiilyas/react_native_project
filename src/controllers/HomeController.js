// src/controllers/HomeController.js

import { useCallback, useEffect, useMemo, useState } from 'react';
import { EventRepository } from '../repositories/EventRepository';
import { InteractionRepository } from '../repositories/InteractionRepository';
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
  const [interactions, setInteractions] = useState({
    interestedEventIds: [],
    joinedEventIds: [],
    chatVisitedEventIds: [],
  });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const loadedUser = await UserRepository.getUserById(userId);
      const loadedEvents = await EventRepository.getEventsByPreferences(loadedUser.preferences);
      const loadedInteractions = await InteractionRepository.getForUser(userId);
      setUser(loadedUser);
      setEvents(loadedEvents);
      setInteractions(loadedInteractions);
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
      navigation.navigate('EventDetails', { eventId: event.id, userId });
    };
  }, [userId]);

  const interestedSet = useMemo(() => new Set(interactions.interestedEventIds || []), [interactions]);
  const joinedSet = useMemo(() => new Set(interactions.joinedEventIds || []), [interactions]);

  const toggleInterested = useCallback(
    async (eventId) => {
      const res = await InteractionRepository.toggleInterested(userId, eventId);
      setInteractions((prev) => {
        const set = new Set(prev.interestedEventIds || []);
        if (res.interested) set.add(String(eventId));
        else set.delete(String(eventId));
        return { ...prev, interestedEventIds: Array.from(set) };
      });
      return res;
    },
    [userId]
  );

  const joinEvent = useCallback(
    async (eventId) => {
      const res = await InteractionRepository.joinEvent(userId, eventId);
      setInteractions((prev) => {
        const set = new Set(prev.joinedEventIds || []);
        if (res.joined) set.add(String(eventId));
        return { ...prev, joinedEventIds: Array.from(set) };
      });
      return res;
    },
    [userId]
  );

  const chatVisited = useCallback(
    async (eventId) => {
      await InteractionRepository.chatVisited(userId, eventId);
      setInteractions((prev) => {
        const set = new Set(prev.chatVisitedEventIds || []);
        set.add(String(eventId));
        return { ...prev, chatVisitedEventIds: Array.from(set) };
      });
    },
    [userId]
  );

  return {
    user,
    events,
    loading,
    refresh,
    onEventPress,
    interestedSet,
    joinedSet,
    toggleInterested,
    joinEvent,
    chatVisited,
  };
}
