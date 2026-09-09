import { getApp, getApps, initializeApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

const firebaseConfig: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY?.trim(),
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim(),
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim(),
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET?.trim(),
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim(),
  appId: import.meta.env.VITE_FIREBASE_APP_ID?.trim()
};

const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'appId'] as const;
const missingFirebaseConfigKeys = Object.entries(firebaseConfig)
  .filter(([key, value]) => requiredKeys.includes(key as typeof requiredKeys[number]) && !value)
  .map(([key]) => key);
const isConfigured = missingFirebaseConfigKeys.length === 0;
const existingApps = getApps();
const hasDefaultApp = existingApps.some(({ name }) => name === '[DEFAULT]');

let app: FirebaseApp | null = null;
try {
  app = hasDefaultApp ? getApp() : isConfigured ? initializeApp(firebaseConfig) : null;
} catch (error) {
  console.error('Firebase initialization error:', error);
}

if (!app) {
  if (missingFirebaseConfigKeys.length > 0) {
    console.warn(
      `Firebase missing required configuration variables: ${missingFirebaseConfigKeys.join(', ')}.`
    );
  } else if (!isConfigured) {
    console.warn('Firebase configuration is invalid or incomplete.');
  }
}

export const firebaseApp = app;
export const firebaseAuth: Auth | null = app ? getAuth(app) : null;
export const firebaseDb: Firestore | null = app ? getFirestore(app) : null;
export const firebaseStorage: FirebaseStorage | null = app ? getStorage(app) : null;
export const isFirebaseReady = Boolean(app);
