"use client";
import { useState, useEffect, useRef } from "react";
import styles from "./messages.module.css";

import {
  setCurrentTripId,
  sendTripMessage,
  listenToTripChat,
  auth,
  onAuthChange,
} from "/db.js";

export default function MessagesPage() {
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  // ←←← YOUR REAL CHATS WILL COME FROM HERE LATER (my trips + bookings) ←←←
  // For now we use fake data + real tripId so chat works instantly
  const chats = [
    { tripId: "demo123", name: "Alex Johnson", route: "New York → London, Aug 15", lastMessage: "Yes I can take your book", avatar: "A" },
    { tripId: "demo456", name: "Maria Garcia", route: "Paris → Berlin, Aug 18", lastMessage: "Thanks!", avatar: "M" },
    { tripId: "demo789", name: "David Smith",   route: "Tokyo → Seoul, Aug 22",   lastMessage: "Package ready", avatar: "D" },
  ];

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // When user clicks a chat
  const openChat = (tripId) => {
    setSelectedTrip(tripId);
    setCurrentTripId(tripId); // ← THIS ACTIVATES THE REAL DATABASE

    const unsubscribe = listenToTripChat((msgs) => {
      setMessages(msgs);
    });

    // Cleanup when leaving chat
    return () => {
      unsubscribe();
      setCurrentTripId(null);
    };
  };

  // Send message
  const send = () => {
    if (!input.trim() || !selectedTrip) return;
    sendTripMessage(input);
    setInput("");
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* LEFT CHAT LIST – 100% YOUR DESIGN */}
        <div className={styles.sidebar}>
          <h3 className={styles.sidebarTitle}>Messages</h3>
          {chats.map((chat) => (
            <div
              key={chat.tripId}
              className={styles.chatItem}
              onClick={() => openChat(chat.tripId)}
              style={{ cursor: "pointer" }}
            >
              <div className={styles.chatAvatar}>{chat.avatar}</div>
              <div className={styles.chatInfo}>
                <p className={styles.chatName}>{chat.name}</p>
                <p className={styles.chatRoute}>{chat.route}</p>
                <p className={styles.chatMsg}>{chat.lastMessage}</p>
              </div>
              <p className={styles.chatTime}>now</p>
            </div>
          ))}
        </div>

        {/* RIGHT CHAT WINDOW – YOUR DESIGN + REAL MESSAGES */}
        <div className={styles.chatWindow}>
          {selectedTrip ? (
            <>
              {/* Header */}
              <div className={styles.header}>
                <div className={styles.headerAvatar}>
                  {chats.find(c => c.tripId === selectedTrip)?.avatar}
                </div>
                <div>
                  <p className={styles.headerName}>
                    {chats.find(c => c.tripId === selectedTrip)?.name}
                  </p>
                  <p className={styles.headerRoute}>
                    {chats.find(c => c.tripId === selectedTrip)?.route}
                  </p>
                </div>
              </div>

              {/* Messages Area */}
              <div className={styles.messages}>
                {messages.length === 0 ? (
                  <div style={{ textAlign: "center", color: "#aaa", marginTop: "50px" }}>
                    Start the conversation
                  </div>
                ) : (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      className={
                        m.senderUid === auth?.currentUser?.uid
                          ? styles.msgBoxRight
                          : styles.msgBox
                      }
                    >
                      <span className={
                        m.senderUid === auth?.currentUser?.uid
                          ? styles.msgSenderRight
                          : styles.msgSender
                      }>
                        {m.senderUid === auth?.currentUser?.uid ? "You" : m.sender?.[0]}
                      </span>
                      <div
                        className={
                          m.senderUid === auth?.currentUser?.uid
                            ? styles.msgBubbleBlue
                            : styles.msgBubbleGray
                        }
                      >
                        {m.text}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div style={{ padding: "20px", background: "#f9f9f9", borderTop: "1px solid #eee" }}>
                <div style={{ display: "flex", gap: "10px" }}>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && send()}
                    placeholder="Type a message..."
                    style={{
                      flex: 1,
                      padding: "12px 16px",
                      borderRadius: "25px",
                      border: "1px solid #ddd",
                      outline: "none"
                    }}
                  />
                  <button
                    onClick={send}
                    style={{
                      padding: "12px 24px",
                      background: "#0077ff",
                      color: "white",
                      border: "none",
                      borderRadius: "25px",
                      cursor: "pointer"
                    }}
                  >
                    Send
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#999" }}>
              <h3>Select a chat to start messaging</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
