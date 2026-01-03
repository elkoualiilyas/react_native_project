// src/views/screens/LoginScreen.js

import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { AuthController } from '../../controllers/AuthController';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('alex@student.edu');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);

  async function onLogin() {
    setLoading(true);
    try {
      await AuthController.signIn(email.trim(), password);
    } catch (e) {
      Alert.alert('Login failed', e?.message ?? 'Please try again');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Event Finder</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
          style={styles.input}
        />

        <Pressable
          onPress={onLogin}
          disabled={loading}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        >
          <Text style={styles.buttonText}>{loading ? 'Signing in…' : 'Sign In'}</Text>
        </Pressable>

        <Pressable onPress={() => navigation.navigate('Register')} style={styles.linkBtn}>
          <Text style={styles.linkText}>Create an account</Text>
        </Pressable>

        {Platform.OS === 'web' ? (
          <Pressable onPress={() => navigation.navigate('AdminLogin')} style={styles.adminBtn}>
            <Text style={styles.adminText}>Admin dashboard</Text>
          </Pressable>
        ) : null}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 14,
    color: '#6B7280',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginTop: 10,
  },
  button: {
    marginTop: 14,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '800',
  },
  linkBtn: {
    marginTop: 14,
    alignItems: 'center',
  },
  linkText: {
    color: '#2563EB',
    fontWeight: '700',
  },
  adminBtn: {
    marginTop: 10,
    alignItems: 'center',
  },
  adminText: {
    color: '#111827',
    fontWeight: '800',
  },
});
