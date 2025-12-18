"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./my-orders.module.css";

export default function MyOrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("requests");

    useEffect(() => {
        let unsubOrders;
        let unsubRequests;

        async function init() {
            try {
                const { onAuthChange } = await import("../../lib/auth");
                const { listenToMyBookings, listenToMySentRequests } = await import("../../lib/db");

                onAuthChange((user) => {
                    if (!user) {
                        router.push("/auth");
                        return;
                    }

                    unsubOrders = listenToMyBookings((bookings) => {
                        setOrders(bookings);
                    });

                    unsubRequests = listenToMySentRequests((requests) => {
                        setSentRequests(requests);
                    });

                    setLoading(false);
                });
            } catch (error) {
                console.error("Error initializing orders:", error);
                setLoading(false);
            }
        }

        init();

        return () => {
            if (unsubOrders) unsubOrders();
            if (unsubRequests) unsubRequests();
        };
    }, [router]);

    if (loading) {
        return <div style={{ padding: "50px", textAlign: "center" }}>Loading your orders...</div>;
    }

    return (
        <main className={styles.page}>
            <div className={styles.headerBg}></div>

            <div className={styles.container}>
                <h1 className={styles.pageTitle}>My Orders</h1>

                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${activeTab === "requests" ? styles.activeTab : ""}`}
                        onClick={() => setActiveTab("requests")}
                    >
                        Booking Requests ({sentRequests.length})
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === "booked" ? styles.activeTab : ""}`}
                        onClick={() => setActiveTab("booked")}
                    >
                        Booked Trips ({orders.length})
                    </button>
                </div>

                {activeTab === "requests" && (
                    sentRequests.length === 0 ? (
                        <div className={styles.emptyState}>
                            <i className="fa-solid fa-inbox"></i>
                            <h3>No booking requests yet</h3>
                            <p>Find a carrier and send a booking request to get started!</p>
                            <button
                                className={styles.browseBtn}
                                onClick={() => router.push("/find-a-carrier")}
                            >
                                Find a Carrier
                            </button>
                        </div>
                    ) : (
                        <div className={styles.requestsGrid}>
                            {sentRequests.map((req) => (
                                <RequestCard key={req.id} request={req} />
                            ))}
                        </div>
                    )
                )}

                {activeTab === "booked" && (
                    orders.length === 0 ? (
                        <div className={styles.emptyState}>
                            <i className="fa-solid fa-box-open"></i>
                            <h3>No booked trips yet</h3>
                            <p>Once a carrier accepts your booking request, it will appear here.</p>
                            <button
                                className={styles.browseBtn}
                                onClick={() => router.push("/find-a-carrier")}
                            >
                                Find a Carrier
                            </button>
                        </div>
                    ) : (
                        <div className={styles.ordersGrid}>
                            {orders.map((order) => (
                                <OrderCard key={order.id} order={order} />
                            ))}
                        </div>
                    )
                )}
            </div>
        </main>
    );
}

function RequestCard({ request }) {
    const [expanded, setExpanded] = useState(false);

    const getStatusColor = (status) => {
        switch (status) {
            case "pending": return "#ffc107";
            case "accepted": return "#4caf50";
            case "rejected": return "#f44336";
            default: return "#999";
        }
    };

    return (
        <div className={styles.requestCard}>
            <div className={styles.requestHeader}>
                <div className={styles.requestStatus} style={{ backgroundColor: getStatusColor(request.status) }}>
                    <span>{request.status.toUpperCase()}</span>
                </div>
                <span className={styles.requestPrice}>${request.reward}</span>
            </div>

            <div className={styles.requestBody}>
                <p><strong>Weight:</strong> {request.weight} kg</p>
                <p><strong>Pickup:</strong> {request.pickupLocation}</p>
                <p><strong>Dropoff:</strong> {request.dropoffLocation}</p>
            </div>

            <button
                className={styles.expandBtn}
                onClick={() => setExpanded(!expanded)}
            >
                {expanded ? "Hide Details" : "View Details"}
            </button>

            {expanded && (
                <div className={styles.expandedDetails}>
                    <p><strong>Request ID:</strong> {request.id}</p>
                </div>
            )}
        </div>
    );
}

function OrderCard({ order }) {
    const router = useRouter();
    const [expanded, setExpanded] = useState(false);

    return (
        <div className={styles.orderCard}>
            <div className={styles.orderHeader}>
                <span className={styles.badge}>{order.transportType}</span>
                <span className={styles.status}>{order.status}</span>
            </div>

            <div className={styles.route}>
                <span>{order.from}</span>
                <span>→</span>
                <span>{order.to}</span>
            </div>

            <div className={styles.details}>
                <span>{order.weight} kg</span>
                <span>${order.reward}</span>
            </div>

            <div className={styles.carrierInfo}>
                <p><strong>Carrier:</strong> {order.carrierName}</p>
                <p><strong>Email:</strong> {order.carrierEmail}</p>
            </div>

            {order.status === "booked" && (
                <button
                    className={styles.browseBtn}
                    onClick={() => router.push(`/messages?tripId=${order.id}`)}
                >
                    Message
                </button>
            )}

            <button
                className={styles.expandBtn}
                onClick={() => setExpanded(!expanded)}
            >
                {expanded ? "Hide Details" : "View Details"}
            </button>

            {expanded && (
                <div className={styles.expandedDetails}>
                    <p><strong>Order ID:</strong> {order.id}</p>
                </div>
            )}
        </div>
    );
}
