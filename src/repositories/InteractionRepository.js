import { apiClient } from './apiClient';

export const InteractionRepository = {
  async getForUser(userId) {
    return apiClient.get(`/api/interactions/${userId}`);
  },

  async toggleInterested(userId, eventId) {
    return apiClient.patch('/api/interactions/interest', { userId, eventId });
  },

  async joinEvent(userId, eventId) {
    return apiClient.patch('/api/interactions/join', { userId, eventId });
  },

  async chatVisited(userId, eventId) {
    return apiClient.patch('/api/interactions/chat-visited', { userId, eventId });
  },

  async getJoinedEvents(userId) {
    return apiClient.get(`/api/interactions/${userId}/joined-events`);
  },
};

