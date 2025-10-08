import admin from 'firebase-admin';

export const initializeFirebaseAdmin = (serviceAccount) => {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
};

export default admin;