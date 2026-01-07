// src/models/Preference.js

export const PreferenceValues = [
  'tech',
  'sports',
  'music',
  'culture',
  'food',
  'networking',
];

/**
 * @typedef {'tech' | 'sports' | 'music' | 'culture' | 'food' | 'networking'} Preference
 */

/**
 * @param {unknown} value
 * @returns {value is import('./Preference').Preference}
 */
export function isPreference(value) {
  return PreferenceValues.includes(value);
}

