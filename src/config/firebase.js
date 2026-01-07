import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

function getFirebaseConfig() {
  const apiKey = "AIzaSyAJL_CdOJjyOKNVSexpoz1M6wptmj3V4lM";
  const authDomain = "eventfinder-e8d1f.firebaseapp.com";
  const projectId = "eventfinder-e8d1f";
  const storageBucket = "eventfinder-e8d1f.firebasestorage.app";
  const messagingSenderId = "542306448840";
  const appId = "1:542306448840:web:37ddc74f29e9c29924fcfd";

  return { apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId };
}

export function getFirebaseApp() {
  const apps = getApps();
  if (apps.length > 0) return apps[0];
  const cfg = getFirebaseConfig();
  if (!cfg.apiKey || !cfg.projectId || !cfg.appId) {
    throw new Error(
      'Firebase not configured. Set EXPO_PUBLIC_FIREBASE_API_KEY, EXPO_PUBLIC_FIREBASE_PROJECT_ID, EXPO_PUBLIC_FIREBASE_APP_ID.'
    );
  }
  return initializeApp(cfg);
}

export function getFirestoreDb() {
  return getFirestore(getFirebaseApp());
}
