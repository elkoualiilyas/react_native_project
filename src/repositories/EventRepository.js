import { apiClient } from './apiClient';

export const EventRepository = {
  /**
   * @returns {Promise<import('../models/Event').Event[]>}
   */
  async getAllEvents() {
    return apiClient.get('/api/events');
  },

  /**
   * @param {import('../models/Preference').Preference[]} preferences
   * @returns {Promise<import('../models/Event').Event[]>}
   */
  async getEventsByPreferences(preferences) {
    const query =
      preferences && preferences.length > 0
        ? `?preferences=${encodeURIComponent(preferences.join(','))}`
        : '';
    return apiClient.get(`/api/events${query}`);
  },

  /**
   * @param {string} eventId
   * @returns {Promise<import('../models/Event').Event>}
   */
  async getEventById(eventId) {
    return apiClient.get(`/api/events/${eventId}`);
  },

  /**
   * @param {string} userId
   * @param {Omit<import('../models/Event').Event,'id'>} data
   * @returns {Promise<import('../models/Event').Event>}
   */
  async createEvent(userId, data) {
    return apiClient.post('/api/events', { userId, ...data });
  },
};
