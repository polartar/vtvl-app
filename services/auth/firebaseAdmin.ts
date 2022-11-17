import dotenv from 'dotenv';
import admin from 'firebase-admin';

dotenv.config();

export const firebaseAdmin = admin.apps.length
  ? admin.apps[0]
  : admin.initializeApp({
      credential: admin.credential.cert({
        privateKey: process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY ? process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n') : '',
        projectId: process.env.FIREBASE_SERVICE_ACCOUNT_PROJECT_ID,
        clientEmail: process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL
      })
    });
