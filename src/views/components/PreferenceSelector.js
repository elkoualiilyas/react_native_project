// src/views/components/PreferenceSelector.js

import { Pressable, StyleSheet, Text, View } from 'react-native';

/**
 * @param {{
 *  options: import('../../models/Preference').Preference[],
 *  selected: import('../../models/Preference').Preference[],
 *  onToggle: (pref: import('../../models/Preference').Preference) => void
 * }} props
 */
export default function PreferenceSelector({ options, selected, onToggle }) {
  const selectedSet = new Set(selected);

  return (
    <View style={styles.container}>
      {options.map((pref) => {
        const active = selectedSet.has(pref);
        return (
          <Pressable
            key={pref}
            onPress={() => onToggle(pref)}
            style={({ pressed }) => [
              styles.pill,
              active && styles.pillActive,
              pressed && styles.pillPressed,
            ]}
          >
            <Text style={[styles.pillText, active && styles.pillTextActive]}>{pref}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  pill: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  pillActive: {
    backgroundColor: '#00D4AA',
    borderColor: '#00D4AA',
  },
  pillPressed: {
    opacity: 0.9,
  },
  pillText: {
    textTransform: 'capitalize',
    color: '#111827',
    fontFamily: 'SpaceGrotesk_600SemiBold',
  },
  pillTextActive: {
    color: '#0F4C5C',
    fontFamily: 'SpaceGrotesk_700Bold',
  },
});
