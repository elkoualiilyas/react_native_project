import { useCallback, useEffect, useState } from 'react';
import { AdminRepository } from '../repositories/AdminRepository';

export function useAdminEventsController(token) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await AdminRepository.listEvents(token);
      setEvents(data);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setEvents([]);
      setLoading(false);
      return;
    }
    refresh();
  }, [refresh, token]);

  const createEvent = useCallback(
    async (data) => {
      const created = await AdminRepository.createEvent(token, data);
      setEvents((prev) => [created, ...prev]);
      return created;
    },
    [token]
  );

  const updateEvent = useCallback(
    async (eventId, patch) => {
      const updated = await AdminRepository.updateEvent(token, eventId, patch);
      setEvents((prev) => prev.map((e) => (e.id === eventId ? updated : e)));
      return updated;
    },
    [token]
  );

  const deleteEvent = useCallback(
    async (eventId) => {
      await AdminRepository.deleteEvent(token, eventId);
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
    },
    [token]
  );

  return { events, loading, refresh, createEvent, updateEvent, deleteEvent };
}

