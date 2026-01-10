import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  type Auth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (firebaseApp) return firebaseApp;

  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
  const messagingSenderId =
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
  const emailRedirectUrl =
    process.env.NEXT_PUBLIC_FIREBASE_EMAIL_REDIRECT_URL || undefined;

  if (!apiKey || !authDomain || !projectId || !appId || !messagingSenderId) {
    throw new Error(
      "Firebase client env vars are missing. Please set NEXT_PUBLIC_FIREBASE_* in .env.local."
    );
  }

  const config = {
    apiKey,
    authDomain,
    projectId,
    appId,
    messagingSenderId,
  };

  firebaseApp = getApps().length ? getApp() : initializeApp(config);
  return firebaseApp;
}

export function getFirebaseAuth(): Auth {
  if (firebaseAuth) return firebaseAuth;
  const app = getFirebaseApp();
  firebaseAuth = getAuth(app);
  return firebaseAuth;
}

export async function loginWithEmailPassword(email: string, password: string) {
  const auth = getFirebaseAuth();
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const idToken = await cred.user.getIdToken();
  return { user: cred.user, idToken };
}

export async function loginWithGoogle() {
  const auth = getFirebaseAuth();
  const provider = new GoogleAuthProvider();
  const cred = await signInWithPopup(auth, provider);
  const idToken = await cred.user.getIdToken();
  return { user: cred.user, idToken };
}
// Additional auth helpers (email/password, Google, etc.) can be added here
