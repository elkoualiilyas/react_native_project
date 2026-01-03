import { apiClient } from './apiClient';

function withAuth(token) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

export const AdminRepository = {
  listUsers(token) {
    return apiClient.get('/api/admin/users', withAuth(token));
  },
  updateUser(token, userId, patch) {
    return apiClient.patch(`/api/admin/users/${userId}`, patch, withAuth(token));
  },
  deleteUser(token, userId) {
    return apiClient.del(`/api/admin/users/${userId}`, withAuth(token));
  },
  listEvents(token) {
    return apiClient.get('/api/admin/events', withAuth(token));
  },
  createEvent(token, data) {
    return apiClient.post('/api/admin/events', data, withAuth(token));
  },
  updateEvent(token, eventId, patch) {
    return apiClient.patch(`/api/admin/events/${eventId}`, patch, withAuth(token));
  },
  deleteEvent(token, eventId) {
    return apiClient.del(`/api/admin/events/${eventId}`, withAuth(token));
  },
  listRequests(token) {
    return apiClient.get('/api/requests', withAuth(token));
  },
  approveRequest(token, requestId) {
    return apiClient.patch(`/api/requests/${requestId}/approve`, {}, withAuth(token));
  },
  rejectRequest(token, requestId) {
    return apiClient.patch(`/api/requests/${requestId}/reject`, {}, withAuth(token));
  },
};

