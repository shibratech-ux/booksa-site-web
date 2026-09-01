import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

// Environment variables can override the default Booksa Firebase project per deployment.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCdyOpovGJG9jJsZtt-dC7-Y91gT9LYQ7s',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'booksa-21aad.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'booksa-21aad',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'booksa-21aad.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '121507097631',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:121507097631:web:b80b415a3c7fbfb505392a'
};

const isConfigured = Object.values(firebaseConfig).every(Boolean);

const app: FirebaseApp | null =
  isConfigured && !getApps().length ? initializeApp(firebaseConfig) : getApps()[0] ?? null;

export const firebaseApp = app;
export const firebaseAuth: Auth | null = app ? getAuth(app) : null;
export const firebaseDb: Firestore | null = app ? getFirestore(app) : null;
export const firebaseStorage: FirebaseStorage | null = app ? getStorage(app) : null;
export const isFirebaseReady = Boolean(app);
