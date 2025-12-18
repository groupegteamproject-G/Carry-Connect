"use client";
import { useState, useEffect, useRef } from "react";
import styles from "./messages.module.css";

import {
  setCurrentTripId,
  sendTripMessage,
  listenToTripChat,
  listenToTripLastMessage,
  auth,
  onAuthChange,
  getUserTrips,
  getUserOrders
} from "../../lib/db";

export default function MessagesPage() {
  const [user, setUser] = useState(null);
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const messagesBoxRef = useRef(null);

  useEffect(() => {
    const unsub = onAuthChange(setUser);
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) {
      setConversations([]);
      return;
    }

    const fetchConversations = async () => {
      const postedTrips = await getUserTrips(user.uid);
      const bookedOrders = await getUserOrders(user.uid);

      const combined = [...postedTrips, ...bookedOrders].filter(
        t => t.status === "booked"
      );

      const chats = combined.map(trip => {
        const isCarrier = trip.carrierUid === user.uid;
        const otherName = isCarrier ? trip.bookedByEmail : trip.carrierName;

        return {
          tripId: trip.id,
          name: otherName,
          route: `${trip.from} → ${trip.to}`,
          lastMessage: "Tap to open chat...",
          lastMessageAt: null,
          unread: false,
          avatar: otherName?.[0]?.toUpperCase() || "?"
        };
      });

      setConversations(
        Array.from(new Set(chats.map(c => c.tripId))).map(id =>
          chats.find(c => c.tripId === id)
        )
      );
    };

    fetchConversations();
  }, [user]);

  const getSeenKey = (uid, tripId) => `cc_seen_${uid}_${tripId}`;

  const getLastSeen = (uid, tripId) => {
    try {
      return Number(localStorage.getItem(getSeenKey(uid, tripId))) || 0;
    } catch {
      return 0;
    }
  };

  const setLastSeen = (uid, tripId) => {
    try {
      localStorage.setItem(getSeenKey(uid, tripId), Date.now());
    } catch {}
  };

  useEffect(() => {
    if (!user || conversations.length === 0) return;

    const unsubs = conversations.map(chat =>
      listenToTripLastMessage(chat.tripId, msg => {
        setConversations(prev =>
          prev.map(c => {
            if (c.tripId !== chat.tripId) return c;

            const msgTime = msg?.sentAt?.toMillis?.() || 0;
            const unread =
              msg &&
              msg.senderUid !== user.uid &&
              msgTime > getLastSeen(user.uid, chat.tripId);

            return {
              ...c,
              lastMessage: msg?.text || "Tap to open chat...",
              lastMessageAt: msg?.sentAt || null,
              unread
            };
          })
        );
      })
    );

    return () => unsubs.forEach(u => u && u());
  }, [user, conversations.length]);

  useEffect(() => {
    if (!selectedTripId) {
      setMessages([]);
      return;
    }

    setCurrentTripId(selectedTripId);

    const unsub = listenToTripChat(msgs => {
      setMessages(msgs);
      requestAnimationFrame(() => {
        if (messagesBoxRef.current) {
          messagesBoxRef.current.scrollTop =
            messagesBoxRef.current.scrollHeight;
        }
      });
    });

    return () => {
      unsub();
      setCurrentTripId(null);
    };
  }, [selectedTripId]);

  const openChat = tripId => {
    if (user) setLastSeen(user.uid, tripId);
    setSelectedTripId(tripId);
  };

  const send = () => {
    if (!input.trim()) return;
    sendTripMessage(input);
    setInput("");
  };

  const currentChat = conversations.find(c => c.tripId === selectedTripId);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.sidebar}>
          <h3 className={styles.sidebarTitle}>Messages</h3>

          {conversations.map(chat => (
            <div
              key={chat.tripId}
              className={
                chat.tripId === selectedTripId
                  ? `${styles.chatItem} ${styles.selectedChat}`
                  : styles.chatItem
              }
              onClick={() => openChat(chat.tripId)}
            >
              <div className={styles.chatAvatar}>{chat.avatar}</div>
              <div className={styles.chatInfo}>
                <p className={styles.chatName}>
                  {chat.name}
                  {chat.unread && <span className={styles.unreadDot} />}
                </p>
                <p className={styles.chatRoute}>{chat.route}</p>
                <p
                  className={
                    chat.unread
                      ? `${styles.chatMsg} ${styles.chatMsgUnread}`
                      : styles.chatMsg
                  }
                >
                  {chat.lastMessage}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.chatWindow}>
          {selectedTripId && currentChat ? (
            <>
              <div className={styles.header}>
                <div className={styles.headerAvatar}>
                  {currentChat.avatar}
                </div>
                <div>
                  <p className={styles.headerName}>{currentChat.name}</p>
                  <p className={styles.headerRoute}>{currentChat.route}</p>
                </div>
              </div>

              <div className={styles.messages} ref={messagesBoxRef}>
                {messages.map(m => {
                  const isMine =
                    m.senderUid === auth?.currentUser?.uid;

                  const seen =
                    isMine &&
                    m.sentAt?.toMillis?.() <=
                      getLastSeen(user.uid, selectedTripId);

                  return (
                    <div
                      key={m.id}
                      className={isMine ? styles.msgBoxRight : styles.msgBox}
                    >
                      <div
                        className={
                          isMine
                            ? styles.msgBubbleBlue
                            : styles.msgBubbleGray
                        }
                      >
                        {m.text}
                        {isMine && (
                          <div className={styles.msgTime}>
                            {seen ? "✔✔ Seen" : "✔ Delivered"}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className={styles.inputArea}>
                <div className={styles.inputWrapper}>
                  <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && send()}
                    className={styles.inputField}
                    placeholder="Type a message..."
                  />
                  <button onClick={send} className={styles.sendBtn}>
                    Send
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className={styles.noChatSelected}>
              <h3>Select a chat</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
