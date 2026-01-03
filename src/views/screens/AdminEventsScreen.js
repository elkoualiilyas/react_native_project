import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { PreferenceValues } from '../../models/Preference';
import { useAdminEventsController } from '../../controllers/AdminEventsController';

function formatPrice(price) {
  if (price === undefined || price === null || price === 0) return 'Free';
  return `$${price}`;
}

export default function AdminEventsScreen({ token }) {
  const { events, loading, createEvent, updateEvent, deleteEvent } = useAdminEventsController(token);

  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('programming');
  const [price, setPrice] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [date, setDate] = useState(new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString());
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState('37.78825');
  const [lng, setLng] = useState('-122.4324');
  const [saving, setSaving] = useState(false);

  const canSave = useMemo(() => {
    return (
      title.trim().length > 0 &&
      organizer.trim().length > 0 &&
      description.trim().length > 0 &&
      address.trim().length > 0 &&
      String(category).length > 0 &&
      Number.isFinite(Number(lat)) &&
      Number.isFinite(Number(lng)) &&
      date.trim().length > 0
    );
  }, [address, category, date, description, lat, lng, organizer, title]);

  function resetForm() {
    setEditingId(null);
    setTitle('');
    setCategory('programming');
    setPrice('');
    setOrganizer('');
    setDate(new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString());
    setDescription('');
    setAddress('');
    setLat('37.78825');
    setLng('-122.4324');
  }

  function startEdit(event) {
    setEditingId(event.id);
    setTitle(event.title || '');
    setCategory(event.category || 'programming');
    setPrice(event.price === undefined || event.price === null ? '' : String(event.price));
    setOrganizer(event.organizer || '');
    setDate(event.date || new Date().toISOString());
    setDescription(event.description || '');
    setAddress(event.location?.address || '');
    setLat(event.location?.lat !== undefined ? String(event.location.lat) : '0');
    setLng(event.location?.lng !== undefined ? String(event.location.lng) : '0');
  }

  async function onSave() {
    if (!canSave) return;
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        category,
        price: price.trim().length ? Number(price) : undefined,
        organizer: organizer.trim(),
        date,
        description: description.trim(),
        location: {
          lat: Number(lat),
          lng: Number(lng),
          address: address.trim(),
        },
      };

      if (editingId) {
        await updateEvent(editingId, payload);
        Alert.alert('Updated', 'Event updated successfully.');
      } else {
        await createEvent(payload);
        Alert.alert('Created', 'Event created successfully.');
      }

      resetForm();
    } catch (e) {
      Alert.alert('Save failed', e?.message ?? 'Please try again');
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(eventId) {
    try {
      await deleteEvent(eventId);
      if (editingId === eventId) resetForm();
    } catch (e) {
      Alert.alert('Delete failed', e?.message ?? 'Please try again');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Events</Text>

      <View style={styles.formCard}>
        <ScrollView style={{ maxHeight: 300 }} contentContainerStyle={{ paddingBottom: 6 }}>
          <Text style={styles.formTitle}>{editingId ? 'Edit event' : 'Create event'}</Text>

          <TextInput value={title} onChangeText={setTitle} placeholder="Title" style={styles.input} />

          <View style={styles.rowWrap}>
            {PreferenceValues.map((p) => {
              const active = p === category;
              return (
                <Pressable
                  key={p}
                  onPress={() => setCategory(p)}
                  style={({ pressed }) => [
                    styles.pill,
                    active && styles.pillActive,
                    pressed && { opacity: 0.9 },
                  ]}
                >
                  <Text style={[styles.pillText, active && styles.pillTextActive]}>{p}</Text>
                </Pressable>
              );
            })}
          </View>

          <TextInput
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
            placeholder="Price (blank or 0 = Free)"
            style={styles.input}
          />
          <TextInput value={organizer} onChangeText={setOrganizer} placeholder="Organizer" style={styles.input} />
          <TextInput value={date} onChangeText={setDate} placeholder="Date ISO" style={styles.input} />
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Description"
            multiline
            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
          />
          <TextInput value={address} onChangeText={setAddress} placeholder="Address" style={styles.input} />

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TextInput
              value={lat}
              onChangeText={setLat}
              keyboardType="decimal-pad"
              placeholder="Lat"
              style={[styles.input, { flex: 1 }]}
            />
            <TextInput
              value={lng}
              onChangeText={setLng}
              keyboardType="decimal-pad"
              placeholder="Lng"
              style={[styles.input, { flex: 1 }]}
            />
          </View>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Pressable
              onPress={onSave}
              disabled={!canSave || saving}
              style={({ pressed }) => [
                styles.primaryBtn,
                (!canSave || saving) && styles.btnDisabled,
                pressed && canSave && !saving && { opacity: 0.92 },
              ]}
            >
              <Text style={styles.primaryText}>{saving ? 'Saving…' : editingId ? 'Update' : 'Create'}</Text>
            </Pressable>

            <Pressable
              onPress={resetForm}
              style={({ pressed }) => [styles.secondaryBtn, pressed && { opacity: 0.9 }]}
            >
              <Text style={styles.secondaryText}>Reset</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(e) => e.id}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => startEdit(item)}
              style={({ pressed }) => [styles.eventCard, pressed && { opacity: 0.95 }]}
            >
              <View style={styles.eventRow}>
                <Text style={styles.eventTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.eventPrice}>{formatPrice(item.price)}</Text>
              </View>
              <Text style={styles.eventMeta} numberOfLines={1}>
                {item.category} • {item.organizer}
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, gap: 10 }}>
                <Text style={styles.eventMeta} numberOfLines={1}>
                  {item.location?.address || ''}
                </Text>
                <Pressable
                  onPress={() => onDelete(item.id)}
                  style={({ pressed }) => [styles.deleteBtn, pressed && { opacity: 0.9 }]}
                >
                  <Text style={styles.deleteText}>Delete</Text>
                </Pressable>
              </View>
            </Pressable>
          )}
          contentContainerStyle={{ paddingBottom: 12 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 12,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  formTitle: {
    fontWeight: '900',
    color: '#111827',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 10,
    backgroundColor: '#fff',
  },
  rowWrap: {
    marginTop: 10,
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
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  pillText: {
    textTransform: 'capitalize',
    color: '#111827',
    fontWeight: '700',
  },
  pillTextActive: {
    color: '#fff',
  },
  primaryBtn: {
    flex: 1,
    marginTop: 12,
    backgroundColor: '#111827',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryText: {
    color: '#fff',
    fontWeight: '900',
  },
  secondaryBtn: {
    marginTop: 12,
    backgroundColor: '#E5E7EB',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {
    color: '#111827',
    fontWeight: '900',
  },
  btnDisabled: {
    backgroundColor: '#9CA3AF',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  eventTitle: {
    flex: 1,
    fontWeight: '900',
    color: '#111827',
  },
  eventPrice: {
    fontWeight: '900',
    color: '#2563EB',
  },
  eventMeta: {
    marginTop: 6,
    color: '#6B7280',
    fontSize: 12,
  },
  deleteBtn: {
    backgroundColor: '#EF4444',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  deleteText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 12,
  },
});

