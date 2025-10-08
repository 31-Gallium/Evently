import { createApp } from './server.js';
import admin from 'firebase-admin';

// Parse the service account from the environment variable
const serviceAccountString = process.env.FIREBASE_CREDENTIALS;
if (!serviceAccountString) {
  throw new Error('FIREBASE_CREDENTIALS environment variable is not set.');
}
// Programmatically fix the private key formatting before parsing
const correctedString = serviceAccountString.replace(/\n/g, '\\n');
const serviceAccount = JSON.parse(correctedString);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const app = createApp(admin);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
