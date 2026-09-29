import { initializeApp, getApps } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const app = getApps()[0] || initializeApp({
  apiKey: "AIzaSyBdIsuV3e9ZFQpdL40gh-j7kIU3nPkljGw",
  authDomain: "wallet-9e30c.firebaseapp.com",
  databaseURL: "https://wallet-9e30c-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "wallet-9e30c",
  storageBucket: "wallet-9e30c.firebasestorage.app",
  messagingSenderId: "881366691515",
  appId: "1:881366691515:web:b858e296e792e6d563039e"
});

export const db = getDatabase(app);
