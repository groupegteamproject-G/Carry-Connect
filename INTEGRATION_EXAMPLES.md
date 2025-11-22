# Firebase Integration Examples

This document shows how to integrate the Firebase backend with your existing Next.js pages.

## 📋 Table of Contents

1. [Find a Carrier Page - Load from Firestore](#1-find-a-carrier-page)
2. [Profile Page - User Authentication](#2-profile-page)
3. [Messages Page - Real-time Chat](#3-messages-page)
4. [Add Trip Form](#4-add-trip-form)
5. [Authentication Context](#5-authentication-context)

---

## 1. Find a Carrier Page

### Current Code (Static Data)
Your current `find-a-carrier/page.jsx` has hardcoded carriers.

### Updated Code (Firebase Data)

```javascript
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SearchBox from "../components/SearchBox";
import styles from "./find.module.css";
import { getCarriers } from "../lib/firestore";

export default function FindCarrierPage() {
  const [carriers, setCarriers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});

  // Load carriers from Firestore
  useEffect(() => {
    async function loadCarriers() {
      try {
        setLoading(true);
        const data = await getCarriers(filters);
        setCarriers(data);
      } catch (error) {
        console.error("Error loading carriers:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadCarriers();
  }, [filters]);

  const handleSearch = (searchFilters) => {
    setFilters(searchFilters);
  };

  if (loading) {
    return (
      <main className={styles.pageWrapper}>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>Loading carriers...</p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.pageWrapper}>
      <SearchBox className={styles.searchBoxFind} onSearch={handleSearch} />

      <div className={styles.topActions}>
        <button className={styles.filterBtn}>
          <i className="fa-solid fa-filter"></i> Filters
        </button>
        <button className={styles.listBtn}>
          <i className="fa-solid fa-list"></i> List
        </button>
      </div>

      <h2 className={styles.sectionTitle}>Available Carriers</h2>
      <p className={styles.resultCount}>{carriers.length} carriers found</p>

      <div className={styles.cardsGrid}>
        {carriers.map((carrier) => (
          <div key={carrier.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.avatar}>{carrier.avatar || carrier.name[0]}</div>
              <div>
                <h3 className={styles.cardName}>{carrier.name}</h3>
                <p className={styles.cardSub}>
                  {carrier.from} → {carrier.to}
                </p>
                <p className={styles.cardDate}>
                  {carrier.date?.toDate?.().toLocaleDateString() || carrier.date}
                </p>
              </div>
              <span className={styles.badge}>{carrier.transportType}</span>
            </div>

            <div className={styles.cardBody}>
              <p>
                <i className="fa-solid fa-box"></i> {carrier.packageSize}
              </p>
            </div>

            <div className={styles.cardFooter}>
              <h3 className={styles.price}>${carrier.price}</h3>
              <Link href={`/booking/${carrier.id}`} className={styles.bookBtn}>
                Book Now
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
```

---

## 2. Profile Page

### Add Authentication Check

```javascript
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./profile.module.css";
import { getCurrentUser } from "../lib/auth";
import { getUserProfile, getUserTrips } from "../lib/firestore";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("trips");

  useEffect(() => {
    async function loadUserData() {
      try {
        const currentUser = getCurrentUser();
        
        if (!currentUser) {
          // Redirect to login if not authenticated
          router.push('/login');
          return;
        }

        setUser(currentUser);

        // Load profile data
        const profileData = await getUserProfile(currentUser.uid);
        setProfile(profileData);

        // Load trips
        const tripsData = await getUserTrips(currentUser.uid);
        setTrips(tripsData);
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, [router]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>;
  }

  if (!profile) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Profile not found</div>;
  }

  return (
    <main className={styles.page}>
      <div className={styles.headerBg}></div>

      <div className={styles.profileCard}>
        <div className={styles.topSection}>
          <div className={styles.avatar}>
            {profile.displayName?.[0] || 'U'}
          </div>

          <div className={styles.userInfo}>
            <h2 className={styles.name}>{profile.displayName}</h2>

            <div className={styles.ratingRow}>
              {[...Array(5)].map((_, i) => (
                <i
                  key={i}
                  className={
                    i < Math.floor(profile.rating || 0)
                      ? "fa-solid fa-star"
                      : "fa-regular fa-star"
                  }
                ></i>
              ))}
              <span className={styles.ratingText}>
                {profile.rating?.toFixed(1) || '0.0'} ({profile.reviewCount || 0} reviews)
              </span>

              {profile.verified && (
                <span className={styles.verified}>
                  <i className="fa-solid fa-circle-check"></i> Verified
                </span>
              )}
            </div>

            <p className={styles.joined}>
              Member since {profile.createdAt?.toDate?.().toLocaleDateString() || 'N/A'}
            </p>

            <p className={styles.bio}>{profile.bio || 'No bio yet'}</p>
          </div>

          <button className={styles.editBtn}>
            <i className="fa-solid fa-gear"></i> Edit Profile
          </button>
        </div>

        {/* Stats grid */}
        <div className={styles.statsGrid}>
          <div className={styles.statBox}>
            <i className="fa-solid fa-plane-departure"></i>
            <h3>{profile.completedTrips || 0}</h3>
            <p>Completed Trips</p>
          </div>

          <div className={styles.statBoxGreen}>
            <i className="fa-solid fa-box"></i>
            <h3>{profile.packagesDelivered || 0}</h3>
            <p>Packages Delivered</p>
          </div>

          <div className={styles.statBoxPurple}>
            <i className="fa-solid fa-location-dot"></i>
            <h3>{profile.countriesVisited || 0}</h3>
            <p>Countries Visited</p>
          </div>

          <div className={styles.statBoxYellow}>
            <i className="fa-solid fa-wallet"></i>
            <h3>${profile.totalEarnings || 0}</h3>
            <p>Total Earnings</p>
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={activeTab === "trips" ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab("trips")}
          >
            Trips
          </button>
          <button
            className={activeTab === "reviews" ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab("reviews")}
          >
            Reviews
          </button>
          <button
            className={activeTab === "settings" ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab("settings")}
          >
            Settings
          </button>
        </div>

        {/* Trips Tab */}
        {activeTab === "trips" && (
          <>
            <h2 className={styles.sectionTitle}>Your Trips</h2>
            <div className={styles.tripGrid}>
              {trips.map((trip) => (
                <div key={trip.id} className={styles.tripCard}>
                  <div className={styles.tripHeader}>
                    <i className="fa-solid fa-plane"></i>
                    <span className={styles.statusUpcoming}>
                      {trip.status || 'Upcoming'}
                    </span>
                  </div>

                  <div className={styles.tripInfo}>
                    <p>
                      <i className="fa-regular fa-circle-dot"></i> {trip.from} → {trip.to}
                    </p>
                    <p>
                      <i className="fa-regular fa-calendar"></i>{" "}
                      {trip.date?.toDate?.().toLocaleDateString() || trip.date}
                    </p>
                    {trip.packageSize && (
                      <p>
                        <i className="fa-solid fa-box"></i> {trip.packageSize}
                      </p>
                    )}
                  </div>

                  <button className={styles.detailsBtn}>View Details</button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
```

---

## 3. Messages Page

### Real-time Messages

```javascript
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./messages.module.css";
import { getCurrentUser } from "../lib/auth";
import { getConversations, getMessages, sendMessage } from "../lib/firestore";

export default function MessagesPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    loadConversations(currentUser.uid);
  }, [router]);

  async function loadConversations(userId) {
    const convos = await getConversations(userId);
    setConversations(convos);
    if (convos.length > 0) {
      selectConversation(convos[0]);
    }
  }

  async function selectConversation(conversation) {
    setSelectedConversation(conversation);
    const msgs = await getMessages(conversation.id);
    setMessages(msgs);
  }

  async function handleSendMessage() {
    if (!newMessage.trim() || !selectedConversation) return;

    await sendMessage(selectedConversation.id, user.uid, newMessage);
    setNewMessage("");
    
    // Reload messages
    const msgs = await getMessages(selectedConversation.id);
    setMessages(msgs);
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Chat List */}
        <div className={styles.sidebar}>
          <h3 className={styles.sidebarTitle}>Messages</h3>
          {conversations.map((convo) => (
            <div
              key={convo.id}
              className={styles.chatItem}
              onClick={() => selectConversation(convo)}
            >
              <div className={styles.chatAvatar}>
                {convo.otherUserName?.[0] || 'U'}
              </div>
              <div className={styles.chatInfo}>
                <p className={styles.chatName}>{convo.otherUserName}</p>
                <p className={styles.chatMsg}>{convo.lastMessage}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Chat Window */}
        <div className={styles.chatWindow}>
          {selectedConversation && (
            <>
              <div className={styles.header}>
                <div className={styles.headerAvatar}>
                  {selectedConversation.otherUserName?.[0] || 'U'}
                </div>
                <div>
                  <p className={styles.headerName}>
                    {selectedConversation.otherUserName}
                  </p>
                </div>
              </div>

              <div className={styles.messages}>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={
                      msg.senderId === user.uid
                        ? styles.msgBoxRight
                        : styles.msgBox
                    }
                  >
                    {msg.senderId !== user.uid && (
                      <span className={styles.msgSender}>
                        {msg.senderName?.[0] || 'U'}
                      </span>
                    )}
                    <div
                      className={
                        msg.senderId === user.uid
                          ? styles.msgBubbleBlue
                          : styles.msgBubbleGray
                      }
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.inputArea}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                />
                <button onClick={handleSendMessage}>Send</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## 4. Add Trip Form

### Create New Trip

```javascript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "../lib/auth";
import { createTrip, createCarrier } from "../lib/firestore";

export default function AddTripPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    from: "",
    to: "",
    date: "",
    transportType: "Flight",
    packageSize: "",
    price: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const user = getCurrentUser();
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      // Create trip
      await createTrip({
        userId: user.uid,
        ...formData,
        status: 'upcoming'
      });

      // Also create carrier listing
      await createCarrier({
        userId: user.uid,
        name: user.displayName,
        ...formData
      });

      alert('Trip added successfully!');
      router.push('/profile');
    } catch (error) {
      console.error('Error adding trip:', error);
      alert('Failed to add trip');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px' }}>
      <h1>Add Your Trip</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>From:</label>
          <input
            type="text"
            value={formData.from}
            onChange={(e) => setFormData({...formData, from: e.target.value})}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>To:</label>
          <input
            type="text"
            value={formData.to}
            onChange={(e) => setFormData({...formData, to: e.target.value})}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Date:</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Transport Type:</label>
          <select
            value={formData.transportType}
            onChange={(e) => setFormData({...formData, transportType: e.target.value})}
            style={{ width: '100%', padding: '8px' }}
          >
            <option>Flight</option>
            <option>Train</option>
            <option>Bus</option>
            <option>Car</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Package Size:</label>
          <input
            type="text"
            value={formData.packageSize}
            onChange={(e) => setFormData({...formData, packageSize: e.target.value})}
            placeholder="e.g., Small package (2kg)"
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Price ($):</label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: e.target.value})}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <button type="submit" style={{ padding: '10px 30px', fontSize: '16px' }}>
          Add Trip
        </button>
      </form>
    </div>
  );
}
```

---

## 5. Authentication Context

### Create Auth Context

Create `app/contexts/AuthContext.jsx`:

```javascript
"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthChange, getCurrentUser } from '../lib/auth';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
```

### Use in Layout

Update `app/layout.tsx`:

```typescript
import { AuthProvider } from './contexts/AuthContext';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
```

### Use in Components

```javascript
import { useAuth } from '../contexts/AuthContext';

export default function SomePage() {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please login</div>;

  return <div>Welcome {user.displayName}!</div>;
}
```

---

## 🎯 Summary

These examples show you how to:

1. ✅ Load data from Firestore instead of hardcoded arrays
2. ✅ Check user authentication before showing pages
3. ✅ Create new data (trips, carriers)
4. ✅ Send and receive messages
5. ✅ Use authentication context across your app

Copy these examples and adapt them to your existing pages!
