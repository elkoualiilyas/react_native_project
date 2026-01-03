// src/models/Preference.js

export const PreferenceValues = [
  'sports',
  'programming',
  'drinking',
  'soccer',
  'basketball',
];

/**
 * @typedef {'sports' | 'programming' | 'drinking' | 'soccer' | 'basketball'} Preference
 */

/**
 * @param {unknown} value
 * @returns {value is import('./Preference').Preference}
 */
export function isPreference(value) {
  return PreferenceValues.includes(value);
}

