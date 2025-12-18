"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import styles from "./messages.module.css";

import {
  setCurrentTripId,
  sendTripMessage,
  listenToTripChat,
  listenToTripLastMessage,
  auth,
  onAuthChange,
  getUserTrips,
  getUserOrders,
  markTripMessagesSeen
} from "../../lib/db";

function MessagesContent() {
  const searchParams = useSearchParams();

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
    const tripIdFromUrl = searchParams.get("tripId");
    if (tripIdFromUrl && tripIdFromUrl !== selectedTripId) {
      setSelectedTripId(tripIdFromUrl);
    }
  }, [searchParams, selectedTripId]);

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
        const otherUid = isCarrier ? trip.bookedByUid : trip.carrierUid;

        return {
          tripId: trip.id,
          name: otherName,
          otherUid,
          route: `${trip.from} → ${trip.to}`,
          lastMessage: "Tap to open chat...",
          lastMessageAt: null,
          unread: false,
          avatar: otherName?.[0]?.toUpperCase() || "?"
        };
      });

      const unique = Array.from(new Set(chats.map(c => c.tripId))).map(id =>
        chats.find(c => c.tripId === id)
      );

      setConversations(unique);
    };

    fetchConversations();
  }, [user]);

  const toMillisSafe = (ts) => {
    if (!ts) return 0;
    if (typeof ts.toMillis === "function") return ts.toMillis();
    const d = new Date(ts);
    return isNaN(d.getTime()) ? 0 : d.getTime();
  };

  // Sidebar preview + unread + stable sorting (NO random reorder on click)
  useEffect(() => {
    if (!user || conversations.length === 0) return;

    const unsubs = conversations.map(chat =>
      listenToTripLastMessage(chat.tripId, msg => {
        setConversations(prev => {
          const updated = prev.map(c => {
            if (c.tripId !== chat.tripId) return c;

            const isOpenChat = selectedTripId === chat.tripId;
            const seenBy = Array.isArray(msg?.seenBy) ? msg.seenBy : [];
            const unread =
              !isOpenChat &&
              msg &&
              msg.senderUid !== user.uid &&
              !seenBy.includes(user.uid);

            return {
              ...c,
              lastMessage: msg?.text || "Tap to open chat...",
              lastMessageAt: msg?.sentAt || null,
              unread: Boolean(unread)
            };
          });

          // ✅ Sort ONLY by lastMessageAt (Messenger rule). Never random.
          updated.sort((a, b) => {
            const ta = toMillisSafe(a.lastMessageAt);
            const tb = toMillisSafe(b.lastMessageAt);
            if (tb !== ta) return tb - ta;
            return String(a.tripId).localeCompare(String(b.tripId));
          });

          return [...updated];
        });
      })
    );

    return () => unsubs.forEach(u => u && u());
  }, [user, conversations.length, selectedTripId]);

  // Chat messages listener + mark seen when chat is OPEN
  useEffect(() => {
    if (!selectedTripId || !user) return;

    setCurrentTripId(selectedTripId);

    // When opening a chat, immediately mark messages as seen
    markTripMessagesSeen(selectedTripId);

    const unsub = listenToTripChat(msgs => {
      setMessages(msgs);

      // If user is viewing this chat, mark incoming messages seen immediately
      markTripMessagesSeen(selectedTripId);

      // Clear unread dot instantly for the open chat
      setConversations(prev => {
        const updated = prev.map(c =>
          c.tripId === selectedTripId ? { ...c, unread: false } : c
        );

        updated.sort((a, b) => {
          const ta = toMillisSafe(a.lastMessageAt);
          const tb = toMillisSafe(b.lastMessageAt);
          if (tb !== ta) return tb - ta;
          return String(a.tripId).localeCompare(String(b.tripId));
        });

        return [...updated];
      });

      requestAnimationFrame(() => {
        if (messagesBoxRef.current) {
          messagesBoxRef.current.scrollTo({
            top: messagesBoxRef.current.scrollHeight
          });
        }
      });
    });

    return () => {
      unsub();
      setCurrentTripId(null);
    };
  }, [selectedTripId, user]);

  // Facebook-style switching: NO Next navigation refresh, URL still changes
  const openChat = tripId => {
    if (tripId === selectedTripId) return;

    setSelectedTripId(tripId);

    // Clear unread instantly when you click
    setConversations(prev =>
      prev.map(c => (c.tripId === tripId ? { ...c, unread: false } : c))
    );

    try {
      window.history.pushState(null, "", `/messages?tripId=${tripId}`);
    } catch {}
  };

  const send = () => {
    if (!input.trim()) return;
    sendTripMessage(input);
    setInput("");
  };

  const formatTime = ts => {
    const d = ts?.toDate ? ts.toDate() : ts ? new Date(ts) : null;
    if (!d) return "";
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const currentChat = conversations.find(c => c.tripId === selectedTripId);
  const otherUid = currentChat?.otherUid || null;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.sidebar}>
          <h3 className={styles.sidebarTitle}>Messages</h3>

          {conversations.map(chat => (
            <div
              key={chat.tripId}
              className={`${styles.chatItem} ${
                chat.tripId === selectedTripId ? styles.selectedChat : ""
              }`}
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
          {selectedTripId ? (
            <>
              <div className={styles.messages} ref={messagesBoxRef}>
                {messages.map(m => {
                  const isMine = m.senderUid === auth?.currentUser?.uid;
                  const seenBy = Array.isArray(m.seenBy) ? m.seenBy : [];

                  // ✅ REAL SEEN:
                  // My message is seen only when OTHER user uid is inside seenBy.
                  const seen = isMine && otherUid && seenBy.includes(otherUid);

                  return (
                    <div
                      key={m.id}
                      className={isMine ? styles.msgBoxRight : styles.msgBox}
                    >
                      <div
                        className={
                          isMine ? styles.msgBubbleBlue : styles.msgBubbleGray
                        }
                      >
                        <div className={styles.msgText}>{m.text}</div>

                        <div className={styles.msgMeta}>
                          <span className={styles.msgClock}>
                            {formatTime(m.sentAt)}
                          </span>

                          {isMine && (
                            <span
                              className={
                                seen
                                  ? styles.statusDoubleSeen
                                  : styles.statusSingleDelivered
                              }
                            >
                              <svg viewBox="0 0 24 24">
                                <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" />
                              </svg>
                              {seen && (
                                <svg viewBox="0 0 24 24">
                                  <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" />
                                </svg>
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className={styles.inputArea}>
                <div className={styles.inputWrapper}>
                  <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && send()}
                    placeholder="Type a message…"
                    className={styles.inputField}
                  />
                  <button onClick={send} className={styles.sendBtn}>
                    Send
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className={styles.noChatSelected}>Select a chat</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={null}>
      <MessagesContent />
    </Suspense>
  );
}
