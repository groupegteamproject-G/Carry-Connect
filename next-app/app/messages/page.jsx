"use client";

import styles from "./messages.module.css";

export default function MessagesPage() {
  const chats = [
    {
      id: 1,
      name: "Alex Johnson",
      route: "New York → London, Aug 15",
      lastMessage:
        "For a book of that size, I can do $45. That includes pickup in New York...",
      time: "10:42 AM",
      avatar: "A",
    },
    {
      id: 2,
      name: "Maria Garcia",
      route: "Paris → Berlin, Aug 18",
      lastMessage: "Thanks for your message, I'll get back!",
      time: "Yesterday",
      avatar: "M",
    },
    {
      id: 3,
      name: "David Smith",
      route: "Tokyo → Seoul, Aug 22",
      lastMessage: "I can deliver your package by the 23rd.",
      time: "2 days ago",
      avatar: "D",
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* LEFT CHAT LIST */}
        <div className={styles.sidebar}>
          <h3 className={styles.sidebarTitle}>Messages</h3>

          {chats.map((chat) => (
            <div key={chat.id} className={styles.chatItem}>
              <div className={styles.chatAvatar}>{chat.avatar}</div>

              <div className={styles.chatInfo}>
                <p className={styles.chatName}>{chat.name}</p>
                <p className={styles.chatRoute}>{chat.route}</p>
                <p className={styles.chatMsg}>{chat.lastMessage}</p>
              </div>

              <p className={styles.chatTime}>{chat.time}</p>
            </div>
          ))}
        </div>

        {/* RIGHT CHAT WINDOW */}
        <div className={styles.chatWindow}>
          {/* Selected Chat Header */}
          <div className={styles.header}>
            <div className={styles.headerAvatar}>A</div>
            <div>
              <p className={styles.headerName}>Alex Johnson</p>
              <p className={styles.headerRoute}>New York → London, Aug 15</p>
            </div>
          </div>

          {/* CHAT MESSAGES */}
          <div className={styles.messages}>
            {/* Incoming message */}
            <div className={styles.msgBox}>
              <span className={styles.msgSender}>A</span>
              <div className={styles.msgBubbleGray}>
                Hello. I saw you`re interested in sending a package to London.
                What would you like to send?
              </div>
            </div>

            <span className={styles.msgTime}>10:30 AM</span>

            {/* Outgoing */}
            <div className={styles.msgBoxRight}>
              <div className={styles.msgBubbleBlue}>
                Hi Alex! I need to send a small gift to my friend in London.
                It`s a book, about 1kg.
              </div>
              <span className={styles.msgSenderRight}>M</span>
            </div>

            <span className={styles.msgTime}>10:32 AM</span>

            {/* Incoming */}
            <div className={styles.msgBox}>
              <span className={styles.msgSender}>A</span>
              <div className={styles.msgBubbleGray}>
                That should be no problem! I have space in my luggage. When do
                you need it delivered by?
              </div>
            </div>

            <span className={styles.msgTime}>10:35 AM</span>

            {/* Outgoing */}
            <div className={styles.msgBoxRight}>
              <div className={styles.msgBubbleBlue}>
                Ideally by August 18th. Is that possible?
              </div>
              <span className={styles.msgSenderRight}>M</span>
            </div>

            <span className={styles.msgTime}>10:36 AM</span>

            {/* More messages… */}
          </div>
        </div>
      </div>
    </div>
  );
}
