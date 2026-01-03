import { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { PreferenceValues } from '../../models/Preference';
import { EventRepository } from '../../repositories/EventRepository';

export default function CreateEventScreen({ navigation, route }) {
  const { userId } = route.params;

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

  async function onSave() {
    if (!canSave) return;
    setSaving(true);
    try {
      const created = await EventRepository.createEvent(userId, {
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
      });

      Alert.alert('Event created', created.title);
      navigation.goBack();
    } catch (e) {
      Alert.alert('Create failed', e?.message ?? 'Please try again');
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Create Event</Text>

        <Text style={styles.label}>Title</Text>
        <TextInput value={title} onChangeText={setTitle} style={styles.input} />

        <Text style={styles.label}>Category</Text>
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

        <Text style={styles.label}>Price (optional)</Text>
        <TextInput
          value={price}
          onChangeText={setPrice}
          keyboardType="decimal-pad"
          placeholder="0 for Free"
          style={styles.input}
        />

        <Text style={styles.label}>Organizer</Text>
        <TextInput value={organizer} onChangeText={setOrganizer} style={styles.input} />

        <Text style={styles.label}>Date & Time (ISO)</Text>
        <TextInput
          value={date}
          onChangeText={setDate}
          placeholder="2025-01-01T18:00:00.000Z"
          style={styles.input}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          multiline
          style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
        />

        <Text style={styles.label}>Address</Text>
        <TextInput value={address} onChangeText={setAddress} style={styles.input} />

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Lat</Text>
            <TextInput value={lat} onChangeText={setLat} keyboardType="decimal-pad" style={styles.input} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Lng</Text>
            <TextInput value={lng} onChangeText={setLng} keyboardType="decimal-pad" style={styles.input} />
          </View>
        </View>

        <Pressable
          onPress={onSave}
          disabled={!canSave || saving}
          style={({ pressed }) => [
            styles.button,
            (!canSave || saving) && styles.buttonDisabled,
            pressed && canSave && !saving && { opacity: 0.92 },
          ]}
        >
          <Text style={styles.buttonText}>{saving ? 'Saving…' : 'Create'}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
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
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 12,
  },
  label: {
    marginTop: 10,
    color: '#6B7280',
    fontWeight: '800',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginTop: 8,
    backgroundColor: '#fff',
  },
  rowWrap: {
    marginTop: 8,
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
  button: {
    marginTop: 18,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#93C5FD',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '900',
  },
});

