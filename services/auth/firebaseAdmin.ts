import admin from 'firebase-admin';
import serviceAccount from 'secrets.json';

export const firebaseAdmin = admin.apps.length
  ? admin.apps[0]
  : admin.initializeApp({
      credential: admin.credential.cert({
        privateKey: serviceAccount.private_key,
        projectId: serviceAccount.project_id,
        clientEmail: serviceAccount.client_email
      })
    });
