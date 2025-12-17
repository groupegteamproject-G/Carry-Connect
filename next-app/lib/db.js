import {
  collection,
  addDoc,
  doc,
  updateDoc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  where,
  limit,
  serverTimestamp,
  deleteDoc,
  Timestamp,
  runTransaction
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, auth, storage } from "./firebase";

export { auth, db };

// =======================
// AUTH
// =======================

export const signUp = (email, password) =>
  createUserWithEmailAndPassword(auth, email, password);

export const signIn = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

export const logOut = () => signOut(auth);

export const onAuthChange = (callback) =>
  onAuthStateChanged(auth, callback);

// =======================
// USER PROFILES
// =======================

export const saveUserProfile = async (name, phone) => {
  if (!auth.currentUser) return;
  await updateDoc(doc(db, "users", auth.currentUser.uid), {
    name,
    phone,
    email: auth.currentUser.email,
    createdAt: serverTimestamp()
  });
};

export async function getUserProfile(userId) {
  const docSnap = await getDoc(doc(db, "users", userId));
  return docSnap.exists()
    ? { id: docSnap.id, ...docSnap.data() }
    : null;
}

export async function setUserProfile(userId, profileData) {
  await updateDoc(doc(db, "users", userId), {
    ...profileData,
    updatedAt: serverTimestamp()
  });
  return true;
}

export const updateUserProfile = setUserProfile;

export const uploadProfileImage = async (userId, file) => {
  const storageRef = ref(storage, `profile_images/${userId}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
};

// =======================
// TRIPS
// =======================

export const postTrip = async ({
  from,
  to,
  date,
  transportType,
  packageSize,
  price,
  description = ""
}) => {
  if (!auth.currentUser) throw new Error("Login required");

  const tripRef = await addDoc(collection(db, "trips"), {
    from,
    to,
    date: new Date(date),
    transportType,
    packageSize,
    price: Number(price),
    description,
    carrierUid: auth.currentUser.uid,
    carrierEmail: auth.currentUser.email,
    carrierName: auth.currentUser.displayName || auth.currentUser.email,
    status: "available",
    createdAt: serverTimestamp()
  });

  return tripRef.id;
};

export const deleteTrip = async (tripId) => {
  if (!auth.currentUser) throw new Error("Login required");
  await deleteDoc(doc(db, "trips", tripId));
};

export const getTrip = async (tripId) => {
  const docSnap = await getDoc(doc(db, "trips", tripId));
  if (!docSnap.exists()) return null;
  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    date: data.date?.toDate ? data.date.toDate() : new Date(data.date)
  };
};

export const getUserTrips = async (userId) => {
  const q = query(
    collection(db, "trips"),
    where("carrierUid", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getUserOrders = async (userId) => {
  const q = query(
    collection(db, "trips"),
    where("bookedByUid", "==", userId)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const listenToAvailableTrips = (callback) => {
  const q = query(collection(db, "trips"), where("status", "==", "available"));
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
};

export const listenToMyTrips = (callback) => {
  if (!auth.currentUser) return () => {};
  const q = query(
    collection(db, "trips"),
    where("carrierUid", "==", auth.currentUser.uid),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
};

// =======================
// BOOKING REQUEST SYSTEM
// =======================

export const submitBookingRequest = async (
  tripId,
  { weight, pickupLocation, dropoffLocation, reward }
) => {
  const user = auth.currentUser;
  if (!user) throw new Error("Login required");

  const tripDoc = await getDoc(doc(db, "trips", tripId));
  if (!tripDoc.exists()) throw new Error("Trip not found");

  const tripData = tripDoc.data();
  if (tripData.status === "booked") throw new Error("Trip already booked");

  const reqRef = await addDoc(collection(db, "booking_requests"), {
    tripId,
    shipperId: user.uid,
    shipperEmail: user.email,
    shipperName: user.displayName || user.email,
    carrierUid: tripData.carrierUid,
    status: "pending",
    weight: Number(weight),
    pickupLocation,
    dropoffLocation,
    reward: Number(reward),
    createdAt: serverTimestamp(),
    respondedAt: null
  });

  return reqRef.id;
};

export const acceptBookingRequest = async (requestId) => {
  const user = auth.currentUser;
  if (!user) throw new Error("Login required");

  const requestRef = doc(db, "booking_requests", requestId);
  const requestDoc = await getDoc(requestRef);
  if (!requestDoc.exists()) throw new Error("Request not found");

  const request = requestDoc.data();
  if (request.carrierUid !== user.uid) throw new Error("Not authorized");

  await runTransaction(db, async (tx) => {
    const tripRef = doc(db, "trips", request.tripId);
    const tripDoc = await tx.get(tripRef);
    if (tripDoc.data().status !== "available") throw new Error("Not available");

    tx.update(tripRef, {
      status: "booked",
      bookedByUid: request.shipperId,
      bookedByEmail: request.shipperEmail,
      weight: request.weight,
      pickupLocation: request.pickupLocation,
      dropoffLocation: request.dropoffLocation,
      reward: request.reward,
      bookedAt: serverTimestamp()
    });

    tx.update(requestRef, {
      status: "accepted",
      respondedAt: serverTimestamp()
    });

    const others = await getDocs(
      query(
        collection(db, "booking_requests"),
        where("tripId", "==", request.tripId),
        where("status", "==", "pending")
      )
    );

    others.forEach(d => {
      if (d.id !== requestId) {
        tx.update(d.ref, {
          status: "rejected",
          respondedAt: serverTimestamp()
        });
      }
    });
  });
};

export const rejectBookingRequest = async (requestId) => {
  await updateDoc(doc(db, "booking_requests", requestId), {
    status: "rejected",
    respondedAt: serverTimestamp()
  });
};

export const listenToMyBookingRequests = (callback) => {
  if (!auth.currentUser) return () => {};
  const q = query(
    collection(db, "booking_requests"),
    where("carrierUid", "==", auth.currentUser.uid),
    where("status", "==", "pending"),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
};

export const listenToMyBookingRequestStatus = (tripId, callback) => {
  if (!auth.currentUser) return () => {};
  const q = query(
    collection(db, "booking_requests"),
    where("tripId", "==", tripId),
    where("shipperId", "==", auth.currentUser.uid)
  );
  return onSnapshot(q, snap => {
    callback(snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() });
  });
};

// =======================
// MESSAGING (RESTORED)
// =======================

let currentTripId = null;
export const setCurrentTripId = (id) => (currentTripId = id);

export const sendTripMessage = async (text) => {
  if (!currentTripId || !auth.currentUser) return;
  await addDoc(collection(db, "trips", currentTripId, "messages"), {
    text,
    sender: auth.currentUser.displayName || auth.currentUser.email,
    senderUid: auth.currentUser.uid,
    sentAt: serverTimestamp()
  });
};

export const listenToTripChat = (callback) => {
  if (!currentTripId) return () => {};
  const q = query(
    collection(db, "trips", currentTripId, "messages"),
    orderBy("sentAt", "asc")
  );
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
};

export const listenToTripLastMessage = (tripId, callback) => {
  const q = query(
    collection(db, "trips", tripId, "messages"),
    orderBy("sentAt", "desc"),
    limit(1)
  );
  return onSnapshot(q, snap => {
    callback(snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() });
  });
};

console.log("CarryConnect db.js loaded");
