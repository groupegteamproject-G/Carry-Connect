"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, listenToUserOrders } from "../../lib/db";
import styles from "./myorders.module.css";

export default function MyOrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const user = auth.currentUser;

        if (!user) {
            router.push("/auth");
            return;
        }

        const unsubscribe = listenToUserOrders(user.uid, (userOrders) => {
            setOrders(userOrders);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [router]);

    return (
        <main className={styles.container}>
            <header className={styles.header}>
                <h1>My Orders</h1>
                <p>Track the trips you have booked and their status</p>
            </header>

            <div className={styles.content}>
                {loading ? (
                    <div className={styles.loading}>
                        <div className={styles.spinner}></div>
                        <p>Loading your orders...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className={styles.emptyState}>
                        <i className="fa-solid fa-box-open"></i>
                        <h3>No orders yet</h3>
                        <p>You haven't booked any trips yet. Find a carrier to send your package!</p>
                        <button className={styles.browseBtn} onClick={() => router.push("/find-a-carrier")}>
                            Find a Carrier
                        </button>
                    </div>
                ) : (
                    <div className={styles.ordersGrid}>
                        {orders.map((order) => (
                            <OrderCard key={order.id} order={order} />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}

function OrderCard({ order }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className={styles.orderCard}>
            <div className={styles.orderHeader}>
                <div>
                    <h3>{order.from} → {order.to}</h3>
                    <p className={styles.date}>{order.date}</p>
                    <p className={styles.transport}>{order.transportType}</p>
                </div>
                <div className={styles.carrierInfo}>
                    <p className={styles.carrierName}>{order.carrierName || "Carrier"}</p>
                    <p className={styles.carrierEmail}>{order.carrierEmail}</p>
                </div>
            </div>

            <div className={styles.actions}>
                <span className={`${styles.status} ${order.status === 'accepted' ? styles.statusAccepted :
                    order.status === 'rejected' ? styles.statusRejected :
                        styles.statusPending
                    }`}>
                    {order.status || "Pending"}
                </span>

                <span className={styles.price}>${order.price}</span>

                <button
                    className={styles.detailsBtn}
                    onClick={() => setExpanded(!expanded)}
                >
                    {expanded ? "Hide Details" : "View Details"}
                </button>
                <button
                    className={styles.detailsBtn}
                    onClick={async () => {
                        const { cancelBooking } = await import("../../lib/db");
                        await cancelBooking(order.id);
                    }}
                    disabled={order.status !== 'pending' && order.status !== 'accepted'}
                >
                    Cancel
                </button>
            </div>

            {expanded && (
                <div style={{
                    gridColumn: '1 / -1',
                    marginTop: '20px',
                    paddingTop: '20px',
                    borderTop: '1px solid #eee',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '15px',
                    fontSize: '14px',
                    color: '#555'
                }}>
                    <div>
                        <p><strong>Available Weight:</strong> {order.availableWeight} kg</p>
                        <p><strong>Description:</strong> {order.description || "No description"}</p>
                    </div>
                    <div>
                        <p><strong>Pickup:</strong> {order.pickupLocation || "Not specified"}</p>
                        <p><strong>Dropoff:</strong> {order.dropoffLocation || "Not specified"}</p>
                    </div>
                    <div>
                        <p><strong>Package Weight:</strong> {order.weight || "Not specified"} kg</p>
                        <p><strong>Reward:</strong> ${order.reward || "Not specified"}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
