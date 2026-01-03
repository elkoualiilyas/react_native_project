// src/models/Event.js

/**
 * @typedef {import('./Preference').Preference} Preference
 */

/**
 * @typedef {Object} EventLocation
 * @property {number} lat
 * @property {number} lng
 * @property {string} address
 */

/**
 * @typedef {Object} Event
 * @property {string} id
 * @property {string} title
 * @property {Preference} category
 * @property {number | undefined} [price]
 * @property {string} organizer
 * @property {string} date
 * @property {string} description
 * @property {EventLocation} location
 */

