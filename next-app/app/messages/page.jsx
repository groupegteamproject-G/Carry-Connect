"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./messages.module.css";
import { setCurrentTripId, sendTripMessage, listenToTripChat, listenToTripLastMessage } from "../../lib/db";

export default function MessagesPage() {
  const [user, setUser] = useState(null);
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthChange((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchConversations = async () => {
      const postedTrips = await getUserTrips(user.uid);
      const bookedOrders = await getUserOrders(user.uid);
      const combinedChats = [...postedTrips, ...bookedOrders].filter((trip) => trip.status === 'booked');
      const formattedChats = combinedChats.map((trip) => {
        const isCarrier = trip.carrierUid === user.uid;
        const otherPersonName = isCarrier ? trip.bookedByEmail : trip.carrierName;
        const route = `${trip.from} → ${trip.to}`;
        return {
          tripId: trip.id,
          name: otherPersonName,
          route,
          lastMessage: "Tap to open chat...",
          unread: false,
          avatar: otherPersonName ? otherPersonName[0].toUpperCase() : '?',
          tripData: trip
        };
      });
      setConversations(formattedChats);
    };
    fetchConversations();
  }, [user]);

  useEffect(() => {
    if (!user || conversations.length === 0) return;
    const unsubs = conversations.map((chat) => listenToTripLastMessage(chat.tripId, (msg) => {
      setConversations((prev) => prev.map((c) => c.tripId === chat.tripId ? { ...c, lastMessage: msg?.text || "Tap to open chat..." } : c));
    }));
    return () => unsubs.forEach(u => u());
  }, [user, conversations]);

  useEffect(() => {
    if (!selectedTripId) return;
    setCurrentTripId(selectedTripId);
    const unsubscribe = listenToTripChat((msgs) => setMessages(msgs));
    return () => unsubscribe();
  }, [selectedTripId]);

  const openChat = (tripId) => {
    setSelectedTripId(tripId);
  };

  const send = () => {
    if (!input.trim()) return;
    sendTripMessage(input.trim());
    setInput("");
  };

  return (
    <div className={styles.page}>
      <div className={styles.sidebar}>
        <h3>Messages</h3>
        {conversations.map((chat) => (
          <div key={chat.tripId} onClick={() => openChat(chat.tripId)}>
            <p>{chat.name}</p>
            <p>{chat.route}</p>
            <p>{chat.lastMessage}</p>
          </div>
        ))}
      </div>

      <div className={styles.chatWindow}>
        {messages.map((msg) => (
          <div key={msg.id}>
            <p>{msg.text}</p>
          </div>
        ))}
        <div ref={messagesEndRef} />
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
      </div>
    </div>
  );
}
