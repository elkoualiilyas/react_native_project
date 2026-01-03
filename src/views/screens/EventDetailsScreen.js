// src/views/screens/EventDetailsScreen.js

import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useEventDetailsController } from '../../controllers/EventDetailsController';
import EventMap from '../components/EventMap';

function formatPrice(price) {
  if (price === undefined || price === null || price === 0) {
    return 'Free';
  }
  return `$${price}`;
}

function formatDateTime(dateIso) {
  try {
    return new Date(dateIso).toLocaleString();
  } catch {
    return dateIso;
  }
}

export default function EventDetailsScreen({ route }) {
  const { eventId } = route.params;
  const { event, loading } = useEventDetailsController(eventId);

  if (loading || !event) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{event.title}</Text>

      <View style={styles.metaRow}>
        <Text style={styles.badge}>{event.category}</Text>
        <Text style={styles.price}>{formatPrice(event.price)}</Text>
      </View>

      <Text style={styles.label}>Organizer</Text>
      <Text style={styles.value}>{event.organizer}</Text>

      <Text style={styles.label}>Date & Time</Text>
      <Text style={styles.value}>{formatDateTime(event.date)}</Text>

      <Text style={styles.label}>Description</Text>
      <Text style={styles.value}>{event.description}</Text>

      <Text style={styles.label}>Location</Text>
      <Text style={styles.value}>{event.location.address}</Text>

      <View style={styles.mapWrap}>
        <EventMap
          style={styles.map}
          title={event.title}
          address={event.location.address}
          lat={event.location.lat}
          lng={event.location.lng}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    padding: 16,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111827',
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
    fontWeight: '700',
  },
  price: {
    color: '#2563EB',
    fontWeight: '900',
  },
  label: {
    marginTop: 14,
    color: '#6B7280',
    fontWeight: '800',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  value: {
    marginTop: 6,
    color: '#111827',
    fontSize: 14,
    lineHeight: 20,
  },
  mapWrap: {
    marginTop: 12,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  map: {
    height: 260,
    width: '100%',
  },
});
