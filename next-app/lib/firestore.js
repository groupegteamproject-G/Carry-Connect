// Firestore database helper functions
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  limit,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';

// ============ CARRIERS ============

/**
 * Get all available carriers
 */
export async function getCarriers(filters = {}) {
  try {
    let q = collection(db, 'carriers');
    
    // Apply filters if provided
    if (filters.from) {
      q = query(q, where('from', '==', filters.from));
    }
    if (filters.to) {
      q = query(q, where('to', '==', filters.to));
    }
    if (filters.date) {
      q = query(q, where('date', '>=', filters.date));
    }
    
    const querySnapshot = await getDocs(q);
    const carriers = [];
    querySnapshot.forEach((doc) => {
      carriers.push({ id: doc.id, ...doc.data() });
    });
    return carriers;
  } catch (error) {
    console.error('Error getting carriers:', error);
    return [];
  }
}

/**
 * Get a single carrier by ID
 */
export async function getCarrier(carrierId) {
  try {
    const docRef = doc(db, 'carriers', carrierId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting carrier:', error);
    return null;
  }
}

/**
 * Create a new carrier listing
 */
export async function createCarrier(carrierData) {
  try {
    const docRef = await addDoc(collection(db, 'carriers'), {
      ...carrierData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating carrier:', error);
    throw error;
  }
}

/**
 * Update a carrier listing
 */
export async function updateCarrier(carrierId, updates) {
  try {
    const docRef = doc(db, 'carriers', carrierId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
    return true;
  } catch (error) {
    console.error('Error updating carrier:', error);
    return false;
  }
}

// ============ USERS / PROFILES ============

/**
 * Get user profile
 */
export async function getUserProfile(userId) {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

/**
 * Create or update user profile
 */
export async function setUserProfile(userId, profileData) {
  try {
    const docRef = doc(db, 'users', userId);
    await updateDoc(docRef, {
      ...profileData,
      updatedAt: Timestamp.now()
    });
    return true;
  } catch (error) {
    console.error('Error setting user profile:', error);
    return false;
  }
}

// ============ MESSAGES ============

/**
 * Get all conversations for a user
 */
export async function getConversations(userId) {
  try {
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', userId),
      orderBy('lastMessageAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const conversations = [];
    querySnapshot.forEach((doc) => {
      conversations.push({ id: doc.id, ...doc.data() });
    });
    return conversations;
  } catch (error) {
    console.error('Error getting conversations:', error);
    return [];
  }
}

/**
 * Get messages in a conversation
 */
export async function getMessages(conversationId) {
  try {
    const q = query(
      collection(db, 'conversations', conversationId, 'messages'),
      orderBy('timestamp', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    const messages = [];
    querySnapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() });
    });
    return messages;
  } catch (error) {
    console.error('Error getting messages:', error);
    return [];
  }
}

/**
 * Send a message
 */
export async function sendMessage(conversationId, senderId, messageText) {
  try {
    // Add message to conversation
    await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
      senderId,
      text: messageText,
      timestamp: Timestamp.now(),
      read: false
    });
    
    // Update conversation last message
    const conversationRef = doc(db, 'conversations', conversationId);
    await updateDoc(conversationRef, {
      lastMessage: messageText,
      lastMessageAt: Timestamp.now()
    });
    
    return true;
  } catch (error) {
    console.error('Error sending message:', error);
    return false;
  }
}

// ============ TRIPS ============

/**
 * Get user's trips
 */
export async function getUserTrips(userId) {
  try {
    const q = query(
      collection(db, 'trips'),
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const trips = [];
    querySnapshot.forEach((doc) => {
      trips.push({ id: doc.id, ...doc.data() });
    });
    return trips;
  } catch (error) {
    console.error('Error getting trips:', error);
    return [];
  }
}

/**
 * Create a new trip
 */
export async function createTrip(tripData) {
  try {
    const docRef = await addDoc(collection(db, 'trips'), {
      ...tripData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating trip:', error);
    throw error;
  }
}

/**
 * Delete a trip
 */
export async function deleteTrip(tripId) {
  try {
    const docRef = doc(db, 'trips', tripId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Error deleting trip:', error);
    throw error;
  }
}

// ============ BOOKINGS ============

/**
 * Create a booking
 */
export async function createBooking(bookingData) {
  try {
    const docRef = await addDoc(collection(db, 'bookings'), {
      ...bookingData,
      createdAt: Timestamp.now(),
      status: 'pending'
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
}

/**
 * Get user bookings
 */
export async function getUserBookings(userId) {
  try {
    const q = query(
      collection(db, 'bookings'),
      where('senderId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const bookings = [];
    querySnapshot.forEach((doc) => {
      bookings.push({ id: doc.id, ...doc.data() });
    });
    return bookings;
  } catch (error) {
    console.error('Error getting bookings:', error);
    return [];
  }
}
