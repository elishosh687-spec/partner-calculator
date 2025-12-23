// Firebase Configuration
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';

// הגדרות Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBmJ8qLT_H57e5gEbqraRBYvwr4vVntOpk",
  authDomain: "partner-calcilator.firebaseapp.com",
  projectId: "partner-calcilator",
  storageBucket: "partner-calcilator.firebasestorage.app",
  messagingSenderId: "293226336340",
  appId: "1:293226336340:web:067fe4d92747fb58d21dc1",
  measurementId: "G-MGS5TNBR9S"
};

// אתחול Firebase
const app = initializeApp(firebaseConfig);

// אתחול Firestore
export const db = getFirestore(app);

// אתחול Authentication
export const auth = getAuth(app);

// אתחול Analytics (אופציונלי)
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { analytics };
export default app;

