// src/views/screens/HomeScreen.js

import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useHomeController } from '../../controllers/HomeController';
import { AuthController } from '../../controllers/AuthController';
import { useEventCreationRequestController } from '../../controllers/EventCreationRequestController';
import EventCard from '../components/EventCard';
import SkeletonEventCard from '../components/SkeletonEventCard';

export default function HomeScreen({ navigation, userId }) {
  const {
    user,
    events,
    loading,
    refresh: refreshHome,
    onEventPress,
    interestedSet,
    joinedSet,
    toggleInterested,
    joinEvent,
    chatVisited,
  } = useHomeController(userId);
  const { request, submitting, refresh: refreshRequest, submitRequest } =
    useEventCreationRequestController(userId);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refreshHome();
      refreshRequest();
    }, [refreshHome, refreshRequest])
  );

  const requestStatusText = request?.status
    ? request.status.charAt(0) + request.status.slice(1).toLowerCase()
    : 'Not requested';

  const showSkeleton = loading && events.length === 0;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshHome();
      await refreshRequest();
    } finally {
      setRefreshing(false);
    }
  }, [refreshHome, refreshRequest]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Events</Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {user ? `For ${user.name} • ${user.preferences.length || 'all'} interests` : 'Loading…'}
          </Text>
        </View>

        <Pressable
          onPress={() => AuthController.signOut()}
          style={({ pressed }) => [styles.signOutBtn, pressed && { opacity: 0.85 }]}
        >
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
      </View>

      {!loading && user ? (
        <View style={styles.actionsCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.actionsTitle}>Event creation</Text>
            <Text style={styles.actionsSubtitle} numberOfLines={1}>
              Request status: {requestStatusText}
            </Text>
          </View>

          {user.canCreateEvents ? (
            <Pressable
              onPress={() => navigation.navigate('CreateEvent', { userId })}
              style={({ pressed }) => [styles.primaryBtn, pressed && styles.btnPressed]}
            >
              <Text style={styles.primaryBtnText}>Create Event</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={submitRequest}
              disabled={submitting}
              style={({ pressed }) => [
                styles.primaryBtn,
                pressed && styles.btnPressed,
                submitting && styles.btnDisabled,
              ]}
            >
              <Text style={styles.primaryBtnText}>
                {submitting ? 'Requesting…' : 'Request Event Creation'}
              </Text>
            </Pressable>
          )}
        </View>
      ) : null}

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
              <Text style={styles.emptyTitle}>No matching events</Text>
              <Text style={styles.emptyText}>
                Update your preferences in Profile to see more.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <EventCard
              event={item}
              onPress={() => onEventPress(item, navigation)}
              interested={interestedSet.has(item.id)}
              joined={joinedSet.has(item.id)}
              onToggleInterested={() => toggleInterested(item.id)}
              onJoin={() => joinEvent(item.id)}
              onChat={async () => {
                await chatVisited(item.id);
                navigation.navigate('GlobalChat', { eventId: item.id });
              }}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 22,
    fontFamily: 'SpaceGrotesk_700Bold',
    color: '#2D3436',
  },
  subtitle: {
    marginTop: 2,
    color: '#636E72',
    fontFamily: 'SpaceGrotesk_600SemiBold',
  },
  signOutBtn: {
    backgroundColor: '#0F4C5C',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  signOutText: {
    color: '#F8F9FA',
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 12,
  },
  actionsCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(15,76,92,0.10)',
  },
  actionsTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    color: '#2D3436',
  },
  actionsSubtitle: {
    marginTop: 4,
    color: '#636E72',
    fontSize: 12,
    fontFamily: 'SpaceGrotesk_600SemiBold',
  },
  primaryBtn: {
    backgroundColor: '#00D4AA',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  primaryBtnText: {
    color: '#0F4C5C',
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 12,
  },
  btnPressed: {
    opacity: 0.9,
  },
  btnDisabled: {
    backgroundColor: 'rgba(0,212,170,0.40)',
  },
  listContent: { paddingBottom: 118, paddingTop: 6 },
  emptyContainer: {
    flexGrow: 1,
  },
  empty: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    color: '#2D3436',
  },
  emptyText: {
    marginTop: 6,
    textAlign: 'center',
    color: '#636E72',
    fontFamily: 'SpaceGrotesk_600SemiBold',
  },
});
