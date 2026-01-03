// src/views/screens/ProfileScreen.js

import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useEffect, useMemo, useState } from 'react';

import { useProfileController } from '../../controllers/ProfileController';
import PreferenceSelector from '../components/PreferenceSelector';

export default function ProfileScreen({ userId }) {
  const { user, loading, setAge, setName, togglePreference, preferenceOptions } =
    useProfileController(userId);

  const [nameDraft, setNameDraft] = useState('');
  const [ageDraft, setAgeDraft] = useState('');

  useEffect(() => {
    if (!user) return;
    setNameDraft(user.name);
    setAgeDraft(String(user.age));
  }, [user]);

  const canSave = useMemo(() => {
    if (!user) return false;
    const parsedAge = Number(ageDraft);
    return (
      nameDraft.trim().length > 0 &&
      Number.isFinite(parsedAge) &&
      parsedAge >= 0 &&
      (nameDraft.trim() !== user.name || parsedAge !== user.age)
    );
  }, [ageDraft, nameDraft, user]);

  async function onSave() {
    if (!user) return;
    const parsedAge = Number(ageDraft);
    if (!Number.isFinite(parsedAge) || parsedAge < 0) {
      Alert.alert('Invalid age', 'Please enter a valid age.');
      return;
    }
    try {
      if (nameDraft.trim() !== user.name) {
        await setName(nameDraft.trim());
      }
      if (parsedAge !== user.age) {
        await setAge(parsedAge);
      }
      Alert.alert('Saved', 'Profile updated successfully.');
    } catch (e) {
      Alert.alert('Save failed', e?.message ?? 'Please try again');
    }
  }

  if (loading || !user) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <TextInput value={nameDraft} onChangeText={setNameDraft} style={styles.input} />

        <Text style={styles.label}>Age</Text>
        <TextInput
          value={ageDraft}
          onChangeText={setAgeDraft}
          keyboardType="number-pad"
          style={styles.input}
        />

        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user.email}</Text>

        <View style={styles.divider} />

        <Text style={styles.label}>Preferences</Text>
        <PreferenceSelector
          options={preferenceOptions}
          selected={user.preferences}
          onToggle={(p) => togglePreference(p)}
        />

        <Pressable
          onPress={onSave}
          disabled={!canSave}
          style={({ pressed }) => [
            styles.button,
            !canSave && styles.buttonDisabled,
            pressed && canSave && styles.buttonPressed,
          ]}
        >
          <Text style={styles.buttonText}>Save</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 16,
  },
  center: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
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
  },
  value: {
    marginTop: 8,
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
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
  buttonPressed: {
    opacity: 0.92,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '900',
  },
});

