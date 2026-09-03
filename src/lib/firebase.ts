import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot, 
  serverTimestamp,
  DocumentReference,
  Unsubscribe 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { NourOSState } from '../types';

// 1. Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// 2. Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// 3. Initialize Firestore with specific database ID if configured
export const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Authentication Helpers
export async function signInWithGoogle(): Promise<User> {
  const credential = await signInWithPopup(auth, googleProvider);
  return credential.user;
}

export async function signOutUser(): Promise<void> {
  await firebaseSignOut(auth);
}

// Firestore Document Reference for User's Personal OS
export function getUserOSDocRef(userId: string): DocumentReference {
  return doc(db, 'users', userId, 'personal_os', 'state');
}

/**
 * Deeply sanitizes state objects so Firestore doesn't reject undefined values.
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === undefined) {
    return null as unknown as T;
  }
  if (data === null || typeof data !== 'object') {
    return data;
  }
  if (data instanceof Date) {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map(item => sanitizeForFirestore(item)) as unknown as T;
  }
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (value !== undefined) {
      result[key] = sanitizeForFirestore(value);
    }
  }
  return result as T;
}

/**
 * Reads user's Personal OS state from Firestore
 */
export async function fetchRemoteState(userId: string): Promise<NourOSState | null> {
  try {
    const docRef = getUserOSDocRef(userId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      return null;
    }
    const data = snap.data();
    // Exclude metadata fields when converting to NourOSState
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _updatedAt, _schemaVersion, ...stateData } = data;
    return stateData as NourOSState;
  } catch (err) {
    console.error('Error fetching remote state from Firestore:', err);
    throw err;
  }
}

/**
 * Writes user's Personal OS state to Firestore with server timestamp
 */
export async function saveRemoteState(userId: string, state: NourOSState): Promise<void> {
  try {
    const docRef = getUserOSDocRef(userId);
    const sanitized = sanitizeForFirestore(state);
    await setDoc(docRef, {
      ...sanitized,
      _updatedAt: serverTimestamp(),
      _schemaVersion: 2
    }, { merge: true });
  } catch (err) {
    console.error('Error saving state to Firestore:', err);
    throw err;
  }
}

/**
 * Subscribes to real-time updates of user's Personal OS in Firestore
 */
export function subscribeToRemoteState(
  userId: string, 
  onData: (state: NourOSState) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const docRef = getUserOSDocRef(userId);
  return onSnapshot(
    docRef, 
    (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _updatedAt, _schemaVersion, ...stateData } = data;
        onData(stateData as NourOSState);
      }
    },
    (err) => {
      console.error('Firestore snapshot listener error:', err);
      if (onError) onError(err);
    }
  );
}
