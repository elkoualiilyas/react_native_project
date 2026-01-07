import { useCallback, useEffect, useState } from 'react';
import { InteractionRepository } from '../repositories/InteractionRepository';

export function useMyEventsController(userId) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const joined = await InteractionRepository.getJoinedEvents(userId);
      setEvents(joined);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { events, loading, refresh };
}

