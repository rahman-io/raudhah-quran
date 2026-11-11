import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, signOut, type Auth } from 'firebase/auth';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET
};

export const firebaseConfigured = Boolean(config.apiKey && config.authDomain && config.projectId && config.appId);
export const firebaseApp: FirebaseApp | null = firebaseConfigured ? initializeApp(config) : null;
export const firebaseAuth: Auth | null = firebaseApp ? getAuth(firebaseApp) : null;
export const firebaseStorage: FirebaseStorage | null = firebaseApp && config.storageBucket ? getStorage(firebaseApp) : null;

export const firestore: Firestore | null = firebaseApp ? (() => {
  try {
    return initializeFirestore(firebaseApp, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
    });
  } catch {
    // Private browsing may disable IndexedDB; Firestore still works online.
    return getFirestore(firebaseApp);
  }
})() : null;

export async function signInWithGoogle() {
  if (!firebaseAuth) throw new Error('Firebase belum dikonfigurasi.');
  const provider = new GoogleAuthProvider();
  try {
    await signInWithPopup(firebaseAuth, provider);
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code === 'auth/popup-blocked' || code === 'auth/operation-not-supported-in-this-environment') {
      await signInWithRedirect(firebaseAuth, provider);
      return;
    }
    throw error;
  }
}

export async function signOutFromFirebase() {
  if (firebaseAuth) await signOut(firebaseAuth);
}
