// db.js — Carry Connect v2: Travelers post trips, shippers book them
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getFirestore, collection, addDoc, doc, updateDoc, getDoc, getDocs,
  onSnapshot, orderBy, query, where, serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// === CONFIG (yours) ===
const firebaseConfig = {
  apiKey: "AIzaSyBlYdXduw0F2PeqSIitcX038Ct8nCWI4rs",
  authDomain: "carry-connect-g-1d438.firebaseapp.com",
  projectId: "carry-connect-g-1d438",
  storageBucket: "carry-connect-g-1d438.appspot.com",
  messagingSenderId: "678996484347",
  appId: "1:678996484347:web:28f6039cc9b61030a6905e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// === EXPORTS ===
export { auth, db, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword };

// === USER PROFILE ===
export const saveUserProfile = async (name, phone) => {
  if (!auth.currentUser) throw new Error("Not logged in");
  await updateDoc(doc(db, "users", auth.currentUser.uid), {
    name, phone, email: auth.currentUser.email,
    createdAt: new Date()
  });
};

// === CARRIER: POST A TRIP ===
export const postTrip = async ({ from, to, date, availableKg, pricePerKg }) => {
  if (!auth.currentUser) throw new Error("Login required");

  const tripRef = await addDoc(collection(db, "trips"), {
    from,
    to,
    date: new Date(date),
    availableKg: Number(availableKg),
    pricePerKg: Number(pricePerKg),
    carrierUid: auth.currentUser.uid,
    carrierEmail: auth.currentUser.email,
    status: "available", // available, booked, completed
    createdAt: new Date()
  });

  return tripRef.id;
};

// === SHIPPER: SEARCH & BOOK A TRIP ===
export const bookTrip = async (tripId, { weight, pickupLocation, dropoffLocation, reward }) => {
  if (!auth.currentUser) throw new Error("Login required");

  const tripRef = doc(db, "trips", tripId);
  const tripSnap = await getDoc(tripRef);
  if (!tripSnap.exists()) throw new Error("Trip not found");
  const trip = tripSnap.data();

  if (trip.availableKg < weight) throw new Error("Not enough space");

  await updateDoc(tripRef, {
    status: "booked",
    bookedByUid: auth.currentUser.uid,
    bookedByEmail: auth.currentUser.email,
    weight,
    pickupLocation,
    dropoffLocation,
    reward: Number(reward),
    bookedAt: new Date(),
    availableKg: trip.availableKg - weight
  });
};

// === LISTEN: AVAILABLE TRIPS (for shippers) ===
export const listenToAvailableTrips = (callback) => {
  const q = query(
    collection(db, "trips"),
    where("status", "==", "available"),
    orderBy("date", "asc")
  );
  return onSnapshot(q, (snapshot) => {
    const trips = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate()
    }));
    callback(trips);
  });
};

// === LISTEN: MY TRIPS (as carrier) ===
export const listenToMyTrips = (callback) => {
  if (!auth.currentUser) return;
  const q = query(
    collection(db, "trips"),
    where("carrierUid", "==", auth.currentUser.uid),
    orderBy("date", "desc")
  );
  return onSnapshot(q, callback);
};

// === LISTEN: MY BOOKINGS (as shipper) ===
export const listenToMyBookings = (callback) => {
  if (!auth.currentUser) return;
  const q = query(
    collection(db, "trips"),
    where("bookedByUid", "==", auth.currentUser.uid),
    orderBy("date", "desc")
  );
  return onSnapshot(q, callback);
};

// === CHAT (per trip) ===
let currentTripId = null;
export const setCurrentTripId = (id) => currentTripId = id;

export const sendTripMessage = async (text) => {
  if (!currentTripId || !auth.currentUser) return;
  await addDoc(collection(db, "trips", currentTripId, "messages"), {
    text,
    sender: auth.currentUser.email,
    sentAt: new Date()
  });
};

export const listenToTripChat = (callback) => {
  if (!currentTripId) return;
  const q = query(
    collection(db, "trips", currentTripId, "messages"),
    orderBy("sentAt")
  );
  return onSnapshot(q, (snap) => {
    const messages = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(messages);
  });
};
