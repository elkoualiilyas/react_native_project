import { apiClient } from './apiClient';

export const EventCreationRequestRepository = {
  create(userId) {
    return apiClient.post('/api/requests/create', { userId });
  },
  getLatestStatus(userId) {
    return apiClient.get(`/api/requests/status/${userId}`);
  },
};

