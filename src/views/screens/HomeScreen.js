// src/views/screens/HomeScreen.js

import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useHomeController } from '../../controllers/HomeController';
import { AuthController } from '../../controllers/AuthController';
import { useEventCreationRequestController } from '../../controllers/EventCreationRequestController';
import EventCard from '../components/EventCard';

export default function HomeScreen({ navigation, userId }) {
  const { user, events, loading, refresh: refreshHome, onEventPress } = useHomeController(userId);
  const { request, submitting, refresh: refreshRequest, submitRequest } =
    useEventCreationRequestController(userId);

  useFocusEffect(
    useCallback(() => {
      refreshHome();
      refreshRequest();
    }, [refreshHome, refreshRequest])
  );

  const requestStatusText = request?.status
    ? request.status.charAt(0) + request.status.slice(1).toLowerCase()
    : 'Not requested';

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

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          contentContainerStyle={events.length === 0 ? styles.emptyContainer : undefined}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No matching events</Text>
              <Text style={styles.emptyText}>
                Update your preferences in Profile to see more.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <EventCard event={item} onPress={() => onEventPress(item, navigation)} />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
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
    fontWeight: '900',
    color: '#111827',
  },
  subtitle: {
    marginTop: 2,
    color: '#6B7280',
  },
  signOutBtn: {
    backgroundColor: '#111827',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  signOutText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 12,
  },
  actionsCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  actionsTitle: {
    fontWeight: '900',
    color: '#111827',
  },
  actionsSubtitle: {
    marginTop: 4,
    color: '#6B7280',
    fontSize: 12,
  },
  primaryBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 12,
  },
  btnPressed: {
    opacity: 0.9,
  },
  btnDisabled: {
    backgroundColor: '#93C5FD',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flexGrow: 1,
  },
  empty: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontWeight: '900',
    fontSize: 16,
    color: '#111827',
  },
  emptyText: {
    marginTop: 6,
    textAlign: 'center',
    color: '#6B7280',
  },
});
