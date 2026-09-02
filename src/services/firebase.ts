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

const missingFirebaseConfigKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);
const isConfigured = missingFirebaseConfigKeys.length === 0;
const hasDefaultApp = getApps().some(({ name }) => name === '[DEFAULT]');

const app: FirebaseApp | null =
  hasDefaultApp ? getApp() : isConfigured ? initializeApp(firebaseConfig) : null;

if (import.meta.env.DEV && !app) {
  console.warn(
    `Firebase was not initialized. Missing configuration: ${missingFirebaseConfigKeys.join(', ')}.`
  );
}

export const firebaseApp = app;
export const firebaseAuth: Auth | null = app ? getAuth(app) : null;
export const firebaseDb: Firestore | null = app ? getFirestore(app) : null;
export const firebaseStorage: FirebaseStorage | null = app ? getStorage(app) : null;
export const isFirebaseReady = Boolean(app);
