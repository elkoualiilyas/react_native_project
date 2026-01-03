import { useCallback, useEffect, useState } from 'react';
import { AdminRepository } from '../repositories/AdminRepository';

export function useAdminRequestsController(token) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await AdminRepository.listRequests(token);
      setRequests(data);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setRequests([]);
      setLoading(false);
      return;
    }
    refresh();
  }, [refresh, token]);

  const approve = useCallback(
    async (requestId) => {
      const updated = await AdminRepository.approveRequest(token, requestId);
      setRequests((prev) => prev.map((r) => (r.id === requestId ? updated : r)));
    },
    [token]
  );

  const reject = useCallback(
    async (requestId) => {
      const updated = await AdminRepository.rejectRequest(token, requestId);
      setRequests((prev) => prev.map((r) => (r.id === requestId ? updated : r)));
    },
    [token]
  );

  return { requests, loading, refresh, approve, reject };
}

