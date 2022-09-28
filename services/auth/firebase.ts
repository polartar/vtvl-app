import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const credentials = {
  apiKey: process.env.NEXT_PUBLIC_FIRESTORE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIRESTORE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIRESTORE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIRESTORE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIRESTORE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIRESTORE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIRESTORE_MEASUREMENT_ID,
};

export const firebase = !getApps().length
  ? initializeApp(credentials)
  : getApp();
export const auth = getAuth(firebase);
export default firebase;
