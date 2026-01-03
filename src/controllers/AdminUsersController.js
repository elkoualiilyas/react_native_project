import { useCallback, useEffect, useState } from 'react';
import { AdminRepository } from '../repositories/AdminRepository';

export function useAdminUsersController(token) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await AdminRepository.listUsers(token);
      setUsers(data);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setUsers([]);
      setLoading(false);
      return;
    }
    refresh();
  }, [refresh, token]);

  const toggleCanCreate = useCallback(
    async (userId, nextValue) => {
      const updated = await AdminRepository.updateUser(token, userId, { canCreateEvents: nextValue });
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
    },
    [token]
  );

  const deleteUser = useCallback(
    async (userId) => {
      await AdminRepository.deleteUser(token, userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    },
    [token]
  );

  return { users, loading, refresh, toggleCanCreate, deleteUser };
}

