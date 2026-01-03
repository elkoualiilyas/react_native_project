import { useCallback, useEffect, useState } from 'react';
import { EventCreationRequestRepository } from '../repositories/EventCreationRequestRepository';

export function useEventCreationRequestController(userId) {
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const refresh = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const latest = await EventCreationRequestRepository.getLatestStatus(userId);
      setRequest(latest);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setRequest(null);
      setLoading(false);
      return;
    }
    refresh();
  }, [refresh, userId]);

  const submitRequest = useCallback(async () => {
    if (!userId) return;
    setSubmitting(true);
    try {
      const created = await EventCreationRequestRepository.create(userId);
      setRequest(created);
    } finally {
      setSubmitting(false);
    }
  }, [userId]);

  return { request, loading, submitting, refresh, submitRequest };
}

