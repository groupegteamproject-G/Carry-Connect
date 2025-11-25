// next-app/lib/firebase.ts   ← REAL FIREBASE CONFIG
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBlYdXduw0F2PeqSIitcX038Ct8nCWI4rs",
  authDomain: "carry-connect-g-1d438.firebaseapp.com",
  projectId: "carry-connect-g-1d438",
  storageBucket: "carry-connect-g-1d438.appspot.com",
  messagingSenderId: "678996484347",
  appId: "1:678996484347:web:28f6039cc9b61030a6905e"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
