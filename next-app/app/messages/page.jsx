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
  const [sending, setSending] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  const messagesBoxRef = useRef(null);
  const lastMessageCountRef = useRef(0);
  const inputRef = useRef(null);

  const toMillisSafe = (ts) => {
    if (!ts) return 0;
    if (typeof ts.toMillis === "function") return ts.toMillis();
    if (typeof ts.toDate === "function") return ts.toDate().getTime();
    const d = new Date(ts);
    return isNaN(d.getTime()) ? 0 : d.getTime();
  };

  const scrollToBottom = (force = false) => {
    setTimeout(() => {
      if (messagesBoxRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = messagesBoxRef.current;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
        if (force || isNearBottom) {
          messagesBoxRef.current.scrollTop = messagesBoxRef.current.scrollHeight;
        }
      }
    }, 100);
  };

  useEffect(() => {
    const unsub = onAuthChange((u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const tripIdFromUrl = searchParams.get("tripId");
    if (tripIdFromUrl && tripIdFromUrl !== selectedTripId) {
      setSelectedTripId(tripIdFromUrl);
      setShowSidebar(false);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!user) {
      setConversations([]);
      return;
    }

    const fetchConversations = async () => {
      const postedTrips = await getUserTrips(user.uid);
      const bookedOrders = await getUserOrders(user.uid);

      const combined = [...postedTrips, ...bookedOrders].filter(
        (t) => t.status === "booked"
      );

      const chats = combined.map((trip) => {
        const isCarrier = trip.carrierUid === user.uid;
        const otherName = isCarrier ? trip.bookedByEmail : trip.carrierName;
        const otherUid = isCarrier ? trip.bookedByUid : trip.carrierUid;

        return {
          tripId: trip.id,
          name: otherName,
          otherUid,
          route: `${trip.from} → ${trip.to}`,
          lastMessage: "No messages yet",
          lastMessageAt: null,
          unread: false,
          avatar: otherName?.[0]?.toUpperCase() || "?"
        };
      });

      const unique = Array.from(new Set(chats.map((c) => c.tripId))).map((id) =>
        chats.find((c) => c.tripId === id)
      );

      setConversations(unique);
    };

    fetchConversations();
  }, [user]);

  useEffect(() => {
    if (!user || conversations.length === 0) return;

    const unsubs = conversations.map((chat) =>
      listenToTripLastMessage(chat.tripId, (msg) => {
        setConversations((prev) => {
          const updated = prev.map((c) => {
            if (c.tripId !== chat.tripId) return c;

            const seenBy = Array.isArray(msg?.seenBy) ? msg.seenBy : [];
            const unread =
              selectedTripId !== chat.tripId &&
              msg &&
              msg.senderUid !== user.uid &&
              !seenBy.includes(user.uid);

            return {
              ...c,
              lastMessage: msg?.text || "No messages yet",
              lastMessageAt: msg?.sentAt || c.lastMessageAt,
              unread: Boolean(unread)
            };
          });

          updated.sort((a, b) => {
            const ta = toMillisSafe(a.lastMessageAt);
            const tb = toMillisSafe(b.lastMessageAt);
            return tb - ta;
          });

          return [...updated];
        });
      })
    );

    return () => unsubs.forEach((u) => u && u());
  }, [user, conversations.length, selectedTripId]);

  useEffect(() => {
    if (!selectedTripId || !user) {
      setMessages([]);
      lastMessageCountRef.current = 0;
      return;
    }

    setCurrentTripId(selectedTripId);

    const unsub = listenToTripChat((msgs) => {
      setMessages(msgs);
      lastMessageCountRef.current = msgs.length;
      markTripMessagesSeen(selectedTripId);
      scrollToBottom(true);
    });

    return () => {
      unsub();
      setCurrentTripId(null);
      lastMessageCountRef.current = 0;
    };
  }, [selectedTripId, user]);

  const openChat = (tripId) => {
    setSelectedTripId(tripId);
    setShowSidebar(false);
    window.history.pushState(null, "", `/messages?tripId=${tripId}`);
  };

  const send = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    const text = input;
    setInput("");
    await sendTripMessage(text);
    setSending(false);
    scrollToBottom(true);
  };

  const formatTime = (ts) => {
    if (!ts) return "";
    const d = ts?.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const currentChat = conversations.find((c) => c.tripId === selectedTripId);
  const otherUid = currentChat?.otherUid;

  if (!user) {
    return <div className={styles.page}><h3>Please login</h3></div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {showSidebar && (
          <div className={styles.sidebar}>
            <h3 className={styles.sidebarTitle}>Messages</h3>
            {conversations.map((chat) => (
              <div
                key={chat.tripId}
                className={`${styles.chatItem} ${chat.tripId === selectedTripId ? styles.selectedChat : ""}`}
                onClick={() => openChat(chat.tripId)}
              >
                <div className={styles.chatAvatar}>{chat.avatar}</div>
                <div className={styles.chatInfo}>
                  <p className={styles.chatName}>{chat.name}</p>
                  <p className={styles.chatRoute}>{chat.route}</p>
                  <p className={styles.chatMsg}>{chat.lastMessage}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className={styles.chatWindow}>
          {selectedTripId && currentChat ? (
            <>
              <div className={styles.header}>
                <button onClick={() => setShowSidebar(true)}>←</button>
                <div>
                  <p className={styles.headerName}>{currentChat.name}</p>
                  <p className={styles.headerRoute}>{currentChat.route}</p>
                </div>
              </div>

              <div className={styles.messages} ref={messagesBoxRef}>
                {messages.map((m) => {
                  const isMine = m.senderUid === user.uid;
                  const seen = isMine && otherUid && m.seenBy?.includes(otherUid);
                  return (
                    <div key={m.id} className={isMine ? styles.msgBoxRight : styles.msgBox}>
                      <div className={isMine ? styles.msgBubbleBlue : styles.msgBubbleGray}>
                        <div className={styles.msgText}>{m.text}</div>
                        <div className={styles.msgMeta}>
                          <span className={styles.msgClock}>{formatTime(m.sentAt)}</span>
                          {isMine && <span>{seen ? "✓✓" : "✓"}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className={styles.inputArea}>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  className={styles.inputField}
                />
                <button onClick={send} disabled={sending}>Send</button>
              </div>
            </>
          ) : (
            <div className={styles.noChatSelected}>
              <h3>Select a chat to start messaging</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MessagesContent />
    </Suspense>
  );
}
