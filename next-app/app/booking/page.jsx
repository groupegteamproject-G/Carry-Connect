"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import styles from "./booking.module.css";

function BookingContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const tripId = searchParams.get("tripId");

    const [user, setUser] = useState(null);
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [requestStatus, setRequestStatus] = useState(null); // NEW: Track request status

    const [formData, setFormData] = useState({
        weight: "",
        pickupLocation: "",
        dropoffLocation: "",
        reward: ""
    });

    useEffect(() => {
        async function init() {
            if (!tripId) {
                setLoading(false);
                return;
            }

            try {
                const { getCurrentUser } = await import("../../lib/auth");
                const currentUser = await getCurrentUser();

                if (currentUser) {
                    setUser(currentUser);
                }

                const pendingData = sessionStorage.getItem(`pendingBooking_${tripId}`);

                const { getTrip, listenToMyBookingRequestStatus } = await import("../../lib/db");
                const tripData = await getTrip(tripId);

                if (!tripData) {
                    setErrorMsg("Trip not found");
                } else {
                    setTrip(tripData);
                    if (pendingData) {
                        setFormData(JSON.parse(pendingData));
                    } else {
                        setFormData(prev => ({ ...prev, reward: tripData.price }));
                    }

                    // NEW: Listen to booking request status
                    if (currentUser) {
                        const unsubscribe = listenToMyBookingRequestStatus(tripId, (request) => {
                            setRequestStatus(request);
                        });
                        return () => unsubscribe();
                    }
                }
            } catch (error) {
                console.error("Error loading booking page:", error);
                setErrorMsg("Failed to load trip details");
            } finally {
                setLoading(false);
            }
        }
        init();
    }, [tripId]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user) {
            sessionStorage.setItem(`pendingBooking_${tripId}`, JSON.stringify(formData));
            router.push(`/auth?redirect=/booking?tripId=${tripId}`);
            return;
        }

        setSubmitting(true);
        setErrorMsg("");
        setSuccessMsg("");

        try {
            // NEW: Use submitBookingRequest instead of bookTrip
            const { submitBookingRequest } = await import("../../lib/db");
            await submitBookingRequest(tripId, formData);

            setSuccessMsg("Booking request sent! Wait for carrier to accept.");
            sessionStorage.removeItem(`pendingBooking_${tripId}`);
            setTimeout(() => {
                router.push("/my-orders");
            }, 2000);
        } catch (error) {
            console.error("Booking error:", error);
            setErrorMsg("Failed to send booking request: " + error.message);
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className={styles.loading}>Loading trip details...</div>;
    }

    if (!tripId || !trip) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>
                    <h2>{tripId ? "Trip not found" : "Invalid Trip"}</h2>
                    <button onClick={() => router.push("/find-a-carrier")} className={styles.backBtn}>
                        Back to Search
                    </button>
                </div>
            </div>
        );
    }

    // NEW: Show message if already requested
    if (requestStatus) {
        return (
            <div className={styles.container}>
                <div className={styles.content}>
                    <h1 className={styles.title}>Booking Request Status</h1>
                    <div className={styles.tripCard}>
                        <div className={styles.route}>
                            <div className={styles.location}>
                                <span className={styles.label}>From</span>
                                <span className={styles.city}>{trip.from}</span>
                            </div>
                            <div className={styles.arrow}>→</div>
                            <div className={styles.location}>
                                <span className={styles.label}>To</span>
                                <span className={styles.city}>{trip.to}</span>
                            </div>
                        </div>

                        <div style={{ marginTop: "30px", padding: "20px", backgroundColor: "#f0f0f0", borderRadius: "8px" }}>
                            <p><strong>Status:</strong> {requestStatus.status.toUpperCase()}</p>
                            <p><strong>Sent:</strong> {new Date(requestStatus.createdAt).toLocaleString()}</p>
                            {requestStatus.status === "pending" && (
                                <p style={{ color: "#ff9800" }}>⏳ Waiting for carrier to accept...</p>
                            )}
                            {requestStatus.status === "accepted" && (
                                <p style={{ color: "#4caf50" }}>✅ Carrier accepted! Check messages.</p>
                            )}
                            {requestStatus.status === "rejected" && (
                                <p style={{ color: "#f44336" }}>❌ Carrier rejected. Try another trip.</p>
                            )}
                        </div>

                        <button onClick={() => router.push("/my-orders")} className={styles.backBtn} style={{ marginTop: "20px" }}>
                            Back to My Orders
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <h1 className={styles.title}>Book this Trip</h1>

                <div className={styles.tripCard}>
                    <div className={styles.route}>
                        <div className={styles.location}>
                            <span className={styles.label}>From</span>
                            <span className={styles.city}>{trip.from}</span>
                        </div>
                        <div className={styles.arrow}>→</div>
                        <div className={styles.location}>
                            <span className={styles.label}>To</span>
                            <span className={styles.city}>{trip.to}</span>
                        </div>
                    </div>

                    <div className={styles.details}>
                        <div className={styles.detailItem}>
                            <i className="fa-solid fa-calendar"></i>
                            <span>{trip.date ? new Date(trip.date).toLocaleDateString() : 'N/A'}</span>
                        </div>
                        <div className={styles.detailItem}>
                            <i className="fa-solid fa-plane"></i>
                            <span>{trip.transportType}</span>
                        </div>
                        <div className={styles.detailItem}>
                            <i className="fa-solid fa-box"></i>
                            <span>{trip.packageSize}</span>
                        </div>
                        <div className={styles.detailItem}>
                            <i className="fa-solid fa-tag"></i>
                            <span>${trip.price}</span>
                        </div>
                    </div>

                    {trip.description && (
                        <div className={styles.description}>
                            <p>"{trip.description}"</p>
                        </div>
                    )}
                </div>

                <div className={styles.formSection}>
                    <h2>Shipment Details</h2>
                    <form onSubmit={handleSubmit} className={styles.form}>
                        {errorMsg && <div className={styles.errorAlert}>{errorMsg}</div>}
                        {successMsg && <div className={styles.successAlert}>{successMsg}</div>}

                        <div className={styles.inputGroup}>
                            <label>Package Weight (kg)</label>
                            <input
                                type="number"
                                name="weight"
                                value={formData.weight}
                                onChange={handleChange}
                                required
                                min="0.1"
                                step="0.1"
                                placeholder="e.g. 2.5"
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label>Pickup Location</label>
                            <input
                                type="text"
                                name="pickupLocation"
                                value={formData.pickupLocation}
                                onChange={handleChange}
                                required
                                placeholder="Where should the carrier pick it up?"
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label>Dropoff Location</label>
                            <input
                                type="text"
                                name="dropoffLocation"
                                value={formData.dropoffLocation}
                                onChange={handleChange}
                                required
                                placeholder="Where should it be delivered?"
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label>Offer Price ($)</label>
                            <input
                                type="number"
                                name="reward"
                                value={formData.reward}
                                onChange={handleChange}
                                required
                                min="1"
                                step="1"
                            />
                            <small>The carrier asked for ${trip.price}</small>
                        </div>

                        <button
                            type="submit"
                            className={styles.submitBtn}
                            disabled={submitting}
                        >
                            {submitting ? "Sending Request..." : (user ? "Send Booking Request" : "Login to Book")}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function BookingPage() {
    return (
        <Suspense fallback={<div className={styles.loading}>Loading...</div>}>
            <BookingContent />
        </Suspense>
    );
}
