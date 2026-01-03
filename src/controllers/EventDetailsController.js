// src/controllers/EventDetailsController.js

import { useEffect, useState } from 'react';
import { EventRepository } from '../repositories/EventRepository';

/**
 * @param {string} eventId
 * @returns {{ event: import('../models/Event').Event | null, loading: boolean }}
 */
export function useEventDetailsController(eventId) {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      try {
        const loaded = await EventRepository.getEventById(eventId);
        if (!active) return;
        setEvent(loaded);
      } finally {
        if (!active) return;
        setLoading(false);
      }
    }

    if (!eventId) {
      setEvent(null);
      setLoading(false);
      return;
    }

    load();
    return () => {
      active = false;
    };
  }, [eventId]);

  return { event, loading };
}

