import fs from 'node:fs';
import path from 'node:path';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

// Load env
try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const val = parts.slice(1).join('=').trim(); // Handle values with =
            if (key && val) process.env[key] = val;
        }
    });
} catch (e) {
    console.error("Could not read .env.local", e);
}

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

console.log("Config Project ID:", firebaseConfig.projectId);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
    try {
        console.log("Attempting to read trip 1b5JNpNbPeCpQVWUmDcM...");
        const tripRef = doc(db, 'trips', '1b5JNpNbPeCpQVWUmDcM');
        const snap = await getDoc(tripRef);
        if (snap.exists()) {
            console.log("SUCCESS: Trip found.");
            console.log("Status:", snap.data().status);
        } else {
            console.log("SUCCESS: Trip not found (but read access works).");
        }
    } catch (e) {
        console.error("FAILURE:", e.code, e.message);
    }
}

test();
