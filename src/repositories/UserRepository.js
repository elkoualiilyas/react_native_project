import { apiClient } from './apiClient';

export const UserRepository = {
  /**
   * @param {string} userId
   * @returns {Promise<import('../models/User').User>}
   */
  async getUserById(userId) {
    return apiClient.get(`/api/users/${userId}`);
  },

  /**
   * @param {string} userId
   * @param {Omit<import('../models/User').User,'id'>} data
   * @returns {Promise<import('../models/User').User>}
   */
  async createUserProfile(userId, data) {
    const payload = { ...data, id: userId };
    return payload;
  },

  /**
   * @param {string} userId
   * @param {Partial<Omit<import('../models/User').User,'id'>>} data
   * @returns {Promise<import('../models/User').User>}
   */
  async updateUserProfile(userId, data) {
    return apiClient.patch(`/api/users/${userId}`, data);
  },
};
