import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { PreferenceValues } from '../../models/Preference';
import { UserRepository } from '../../repositories/UserRepository';
import PreferenceSelector from '../components/PreferenceSelector';

const PROFILE_SETUP_KEY = 'profile:setup';

export default function ProfileSetupScreen({ navigation, userId }) {
  const [fullName, setFullName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [preferences, setPreferences] = useState([]);
  const [photoUri, setPhotoUri] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      const stored = await AsyncStorage.getItem(PROFILE_SETUP_KEY);
      if (!active) return;
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setFullName(typeof parsed.fullName === 'string' ? parsed.fullName : '');
          setDisplayName(typeof parsed.displayName === 'string' ? parsed.displayName : '');
          setPreferences(Array.isArray(parsed.preferences) ? parsed.preferences : []);
          setPhotoUri(typeof parsed.photoUri === 'string' ? parsed.photoUri : null);
        } catch {
          setFullName('');
          setDisplayName('');
          setPreferences([]);
          setPhotoUri(null);
        }
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const canContinue = useMemo(() => {
    return fullName.trim().length > 0 && displayName.trim().length > 0;
  }, [displayName, fullName]);

  function togglePreference(pref) {
    setPreferences((prev) => {
      const set = new Set(prev);
      if (set.has(pref)) set.delete(pref);
      else set.add(pref);
      return Array.from(set);
    });
  }

  async function onPickPhoto() {
    if (Platform.OS === 'web') {
      Alert.alert('Not supported', 'Photo picking is not supported on web in this build.');
      return;
    }
    try {
      const ImagePicker = await import('expo-image-picker');
      Alert.alert('Profile Picture', 'Choose a source', [
        {
          text: 'Camera',
          onPress: async () => {
            const perm = await ImagePicker.requestCameraPermissionsAsync();
            if (!perm.granted) {
              Alert.alert('Permission required', 'Please allow camera access.');
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              quality: 0.8,
            });
            if (result.canceled) return;
            const uri = result.assets?.[0]?.uri;
            if (typeof uri === 'string') setPhotoUri(uri);
          },
        },
        {
          text: 'Gallery',
          onPress: async () => {
            const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!perm.granted) {
              Alert.alert('Permission required', 'Please allow photo library access.');
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              quality: 0.8,
            });
            if (result.canceled) return;
            const uri = result.assets?.[0]?.uri;
            if (typeof uri === 'string') setPhotoUri(uri);
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]);
    } catch (e) {
      Alert.alert('Photo failed', e?.message ?? 'Please try again');
    }
  }

  async function onSaveContinue() {
    if (!canContinue) return;
    setSaving(true);
    const payload = {
      fullName: fullName.trim(),
      displayName: displayName.trim(),
      preferences,
      photoUri,
      savedAt: new Date().toISOString(),
    };
    try {
      await AsyncStorage.setItem(PROFILE_SETUP_KEY, JSON.stringify(payload));
      await UserRepository.updateUserProfile(userId, {
        name: payload.displayName,
        fullName: payload.fullName,
        displayName: payload.displayName,
        preferences: payload.preferences,
        profilePictureUrl: payload.photoUri,
        profileComplete: true,
      });
      navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] });
    } catch (e) {
      Alert.alert('Save failed', e?.message ?? 'Please try again');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.h1}>Profile Setup</Text>
          <Text style={styles.subhead}>Finish your profile to personalize events.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput value={fullName} onChangeText={setFullName} style={styles.input} placeholder="Your full name" />

          <Text style={styles.label}>Display Name</Text>
          <TextInput
            value={displayName}
            onChangeText={setDisplayName}
            style={styles.input}
            placeholder="Name shown to others"
          />

          <Text style={styles.label}>Event Preferences</Text>
          <PreferenceSelector options={PreferenceValues} selected={preferences} onToggle={togglePreference} />

          <View style={styles.photoRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Profile Picture</Text>
              <Text style={styles.caption} numberOfLines={2}>
                Optional. Choose from camera or gallery.
              </Text>
            </View>
            <Pressable onPress={onPickPhoto} style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}>
              <Text style={styles.secondaryBtnText}>{photoUri ? 'Change' : 'Pick'}</Text>
            </Pressable>
          </View>

          <Pressable
            onPress={onSaveContinue}
            disabled={!canContinue || saving}
            style={({ pressed }) => [
              styles.primaryBtn,
              (!canContinue || saving) && styles.primaryBtnDisabled,
              pressed && canContinue && !saving && styles.pressed,
            ]}
          >
            <Text style={styles.primaryBtnText}>{saving ? 'Saving…' : 'Save & Continue'}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F9FA' },
  container: { padding: 16, paddingBottom: 24 },
  header: { marginTop: 8, marginBottom: 16 },
  h1: { fontSize: 32, fontWeight: '800', color: '#2D3436' },
  subhead: { marginTop: 6, color: '#636E72', fontSize: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(15,76,92,0.10)',
  },
  label: { marginTop: 12, color: '#0F4C5C', fontWeight: '800', fontSize: 12, textTransform: 'uppercase' },
  caption: { marginTop: 6, color: '#636E72', fontSize: 14 },
  input: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(15,76,92,0.18)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#fff',
    color: '#2D3436',
  },
  photoRow: { marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  primaryBtn: {
    marginTop: 18,
    backgroundColor: '#0F4C5C',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryBtnText: { color: '#F8F9FA', fontWeight: '900', fontSize: 16 },
  secondaryBtn: {
    backgroundColor: 'rgba(0,212,170,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(0,212,170,0.35)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
  },
  secondaryBtnText: { color: '#0F4C5C', fontWeight: '900' },
  pressed: { opacity: 0.9 },
});
