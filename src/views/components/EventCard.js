// src/views/components/EventCard.js

import { Pressable, StyleSheet, Text, View } from 'react-native';

function formatPrice(price) {
  if (price === undefined || price === null || price === 0) {
    return 'Free';
  }
  return `$${price}`;
}

function formatDate(dateIso) {
  try {
    return new Date(dateIso).toLocaleString();
  } catch {
    return dateIso;
  }
}

/**
 * @param {{ event: import('../../models/Event').Event, onPress: () => void }} props
 */
export default function EventCard({ event, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.row}>
        <Text style={styles.title} numberOfLines={1}>
          {event.title}
        </Text>
        <Text style={styles.price}>{formatPrice(event.price)}</Text>
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.badge}>{event.category}</Text>
        <Text style={styles.date} numberOfLines={1}>
          {formatDate(event.date)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  pressed: {
    opacity: 0.85,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563EB',
  },
  metaRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  badge: {
    textTransform: 'capitalize',
    backgroundColor: '#EEF2FF',
    color: '#3730A3',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
    fontSize: 12,
    fontWeight: '600',
  },
  date: {
    flex: 1,
    textAlign: 'right',
    color: '#6B7280',
    fontSize: 12,
  },
});
