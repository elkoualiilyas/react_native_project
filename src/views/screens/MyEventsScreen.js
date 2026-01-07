import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { useMyEventsController } from '../../controllers/MyEventsController';
import EventCard from '../components/EventCard';
import SkeletonEventCard from '../components/SkeletonEventCard';

export default function MyEventsScreen({ navigation, userId }) {
  const { events, loading, refresh } = useMyEventsController(userId);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const showSkeleton = loading && events.length === 0;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Events</Text>
        <Text style={styles.subtitle}>Events you’ve joined</Text>
      </View>

      {showSkeleton ? (
        <FlatList
          data={[0, 1, 2, 3, 4, 5]}
          keyExtractor={(n) => String(n)}
          contentContainerStyle={styles.listContent}
          renderItem={() => <SkeletonEventCard />}
        />
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          refreshing={refreshing}
          onRefresh={onRefresh}
          contentContainerStyle={[
            styles.listContent,
            events.length === 0 ? styles.emptyContainer : undefined,
          ]}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No joined events yet</Text>
              <Text style={styles.emptyText}>Tap “Join Event” on an event to save it here.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <EventCard
              event={item}
              onPress={() => navigation.navigate('EventDetails', { eventId: item.id, userId })}
              interested={false}
              joined
              onToggleInterested={() => {}}
              onJoin={() => {}}
              onChat={() => navigation.navigate('GlobalChat', { eventId: item.id })}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10 },
  title: { fontSize: 22, fontFamily: 'SpaceGrotesk_700Bold', color: '#2D3436' },
  subtitle: { marginTop: 2, color: '#636E72', fontFamily: 'SpaceGrotesk_600SemiBold' },
  listContent: { paddingBottom: 118, paddingTop: 6 },
  emptyContainer: { flexGrow: 1 },
  empty: { padding: 16, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 16, color: '#2D3436' },
  emptyText: { marginTop: 6, textAlign: 'center', color: '#636E72', fontFamily: 'SpaceGrotesk_600SemiBold' },
});
