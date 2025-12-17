import {
  collection,
  addDoc,
  doc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  deleteDoc,
  serverTimestamp,
  runTransaction
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, db } from "./firebase";

// Re-export auth and db
export { auth, db };

// Sign Out
export const logout = () => signOut(auth);

// Ensure auth is loaded before calling auth.currentUser
export const waitForAuth = () => {
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

// Create user profile in Firestore
export const createUserProfile = async (user, additionalData = {}) => {
  if (!user) return;

  const userRef = doc(db, "users", user.uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    const { email, displayName } = user;
    const createdAt = new Date();

    try {
      await setDoc(userRef, {
        displayName: displayName || additionalData.displayName || "",
        email,
        createdAt,
        ...additionalData
      });
    } catch (error) {
      console.error("Error creating user profile:", error);
    }
  }
};

// Update user profile
export const updateUserProfile = async (uid, updatedData) => {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, updatedData);
};

// Get user profile
export const getUserProfile = async (uid) => {
  const userRef = doc(db, "users", uid);
  const docSnap = await getDoc(userRef);
  return docSnap.exists() ? docSnap.data() : null;
};

// Post a new trip
export const postTrip = async (tripData) => {
  if (!auth.currentUser) throw new Error("Login required");

  try {
    const tripRef = await addDoc(collection(db, "trips"), {
      ...tripData,
      carrierUid: auth.currentUser.uid,
      carrierEmail: auth.currentUser.email,
      carrierName: auth.currentUser.displayName || auth.currentUser.email.split("@")[0],
      createdAt: serverTimestamp(),
      status: "available"
    });
    console.log("postTrip: Trip created with ID:", tripRef.id);
    return tripRef.id;
  } catch (error) {
    console.error("postTrip: Error posting trip:", error);
    throw error;
  }
};

// Get all trips
export const getTrips = async () => {
  const tripsRef = collection(db, "trips");
  const q = query(tripsRef, orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// Listen to trips in realtime
export const listenToTrips = (callback) => {
  const tripsRef = collection(db, "trips");
  const q = query(tripsRef, orderBy("createdAt", "desc"));

  return onSnapshot(
    q,
    (snapshot) => {
      const trips = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(trips);
    },
    (error) => {
      console.error("listenToTrips: Firestore listener error:", error);
    }
  );
};

// Get a single trip by ID
export const getTripById = async (tripId) => {
  const tripRef = doc(db, "trips", tripId);
  const tripSnap = await getDoc(tripRef);
  if (!tripSnap.exists()) throw new Error("Trip not found");
  return { id: tripSnap.id, ...tripSnap.data() };
};

// Book a trip (Shipper books)
export const bookTrip = async (tripId, { weight, pickupLocation, dropoffLocation, reward }) => {
  // Ensure auth is ready
  const user = auth.currentUser;

  if (!user) {
    console.error("bookTrip: User is not authenticated.");
    throw new Error("Login required");
  }

  console.log("bookTrip: Proceeding with user:", user.uid);
  const tripRef = doc(db, "trips", tripId); // Restore tripRef definition
  console.log("bookTrip: tripRef path:", tripRef.path);

  try {
    await runTransaction(db, async (transaction) => {
      console.log("bookTrip: Transaction started");

      const tripSnap = await transaction.get(tripRef);

      if (!tripSnap.exists()) {
        console.warn("bookTrip: Trip does not exist:", tripId);
        throw new Error("Trip does not exist");
      }

      const tripData = tripSnap.data();
      console.log("bookTrip: Current trip data:", tripData);

      if (tripData.status !== "available") {
        console.warn("bookTrip: Trip is not available:", tripData.status);
        throw new Error("Trip is no longer available");
      }

      console.log("bookTrip: Attempting to update trip with booking data");

      transaction.update(tripRef, {
        status: "pending",
        bookedByUid: user.uid,
        bookedByEmail: user.email,
        weight: Number(weight),
        pickupLocation,
        dropoffLocation,
        reward: Number(reward),
        bookedAt: serverTimestamp()
      });
      console.log("bookTrip: Update queued");
    });
    console.log("bookTrip: Transaction committed successfully");
  } catch (e) {
    console.error("bookTrip: Transaction failed:", e);
    console.error("bookTrip: Error code:", e.code);
    console.error("bookTrip: Error message:", e.message);
    throw e;
  }
};

// Delete a trip
export const deleteTrip = async (tripId) => {
  if (!auth.currentUser) throw new Error("Login required");
  const tripRef = doc(db, "trips", tripId);
  await deleteDoc(tripRef);
};

// Listen to a user's trips
export const listenToUserTrips = (uid, callback) => {
  const tripsRef = collection(db, "trips");
  const q = query(tripsRef, where("carrierUid", "==", uid), orderBy("createdAt", "desc"));

  return onSnapshot(
    q,
    (snapshot) => {
      const trips = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(trips);
    },
    (error) => {
      console.error("listenToUserTrips: listener error:", error);
    }
  );
};

// Listen to a user's booked trips (orders)
export const listenToUserOrders = (uid, callback) => {
  const tripsRef = collection(db, "trips");
  const q = query(tripsRef, where("bookedByUid", "==", uid), orderBy("bookedAt", "desc"));

  return onSnapshot(
    q,
    (snapshot) => {
      const orders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(orders);
    },
    (error) => {
      console.error("listenToUserOrders: listener error:", error);
    }
  );
};

// Send a message in a trip chat
export const sendMessage = async (tripId, message) => {
  if (!auth.currentUser) throw new Error("Login required");

  const messagesRef = collection(db, "trips", tripId, "messages");
  await addDoc(messagesRef, {
    text: message,
    senderUid: auth.currentUser.uid,
    senderEmail: auth.currentUser.email,
    createdAt: serverTimestamp()
  });
};

// Listen to messages for a trip
export const listenToMessages = (tripId, callback) => {
  const messagesRef = collection(db, "trips", tripId, "messages");
  const q = query(messagesRef, orderBy("createdAt", "asc"));

  return onSnapshot(
    q,
    (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(messages);
    },
    (error) => {
      console.error("listenToMessages: listener error:", error);
    }
  );
};

// Get conversations for current user
export const listenToConversations = (uid, callback) => {
  const tripsRef = collection(db, "trips");
  const q = query(tripsRef, orderBy("createdAt", "desc"));

  return onSnapshot(
    q,
    async (snapshot) => {
      const trips = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));

      const relevantTrips = trips.filter((trip) => trip.carrierUid === uid || trip.bookedByUid === uid);

      callback(relevantTrips);
    },
    (error) => {
      console.error("listenToConversations: listener error:", error);
    }
  );
};

export const acceptBooking = async (tripId) => {
  const tripRef = doc(db, "trips", tripId);
  await updateDoc(tripRef, { status: "accepted" });
};

export const rejectBooking = async (tripId) => {
  const tripRef = doc(db, "trips", tripId);
  await updateDoc(tripRef, {
    status: "available",
    bookedByUid: null,
    bookedByEmail: null,
    weight: null,
    pickupLocation: null,
    dropoffLocation: null,
    reward: null,
    bookedAt: null
  });
};

export const cancelBooking = async (tripId) => {
  const tripRef = doc(db, "trips", tripId);
  await updateDoc(tripRef, {
    status: "available",
    bookedByUid: null,
    bookedByEmail: null,
    weight: null,
    pickupLocation: null,
    dropoffLocation: null,
    reward: null,
    bookedAt: null
  });
};
