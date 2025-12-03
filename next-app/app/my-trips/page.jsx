"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./mytrips.module.css";

export default function MyTripsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserTrips() {
      try {
        const { getCurrentUser } = await import("../../lib/auth");
        const currentUser = await getCurrentUser();

        if (!currentUser) {
          alert("Please login first!");
          router.push("/auth");
          return;
        }

        setUser(currentUser);

        const { getUserTrips } = await import("../../lib/db");
        const userTrips = await getUserTrips(currentUser.uid);
        setTrips(userTrips);
      } catch (error) {
        console.error("Error loading trips:", error);
      } finally {
        setLoading(false);
      }
    }

    loadUserTrips();
  }, [router]);

  const handleDelete = async (tripId) => {
    if (!confirm("Are you sure you want to delete this trip?")) return;

    try {
      const { deleteTrip } = await import("../../lib/db");
      await deleteTrip(tripId);
      setTrips(trips.filter(trip => trip.id !== tripId));
      alert("Trip deleted successfully!");
    } catch (error) {
      console.error("Error deleting trip:", error);
      alert("Failed to delete trip");
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading your trips...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>My Trips</h1>
        <Link href="/add-trip" className={styles.addBtn}>
          + Add New Trip
        </Link>
      </div>

      {trips.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>✈️</div>
          <h2>No trips yet</h2>
          <p>Start by posting your first trip!</p>
          <Link href="/add-trip" className={styles.emptyBtn}>
            Post a Trip
          </Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {trips.map((trip) => (
            <div key={trip.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.badge}>{trip.transportType}</span>
                <span className={styles.status}>{trip.status}</span>
              </div>

              <div className={styles.route}>
                <div className={styles.location}>
                  <i className="fa-solid fa-location-dot"></i>
                  <span>{trip.from}</span>
                </div>
                <div className={styles.arrow}>→</div>
                <div className={styles.location}>
                  <i className="fa-solid fa-location-dot"></i>
                  <span>{trip.to}</span>
                </div>
              </div>

              <div className={styles.details}>
                <div className={styles.detail}>
                  <i className="fa-solid fa-calendar"></i>
                  <span>{trip.date}</span>
                </div>
                <div className={styles.detail}>
                  <i className="fa-solid fa-box"></i>
                  <span>{trip.packageSize}</span>
                </div>
                <div className={styles.detail}>
                  <i className="fa-solid fa-dollar-sign"></i>
                  <span>${trip.price}</span>
                </div>
              </div>

              {trip.description && (
                <p className={styles.description}>{trip.description}</p>
              )}

              <div className={styles.actions}>
                <button
                  onClick={() => handleDelete(trip.id)}
                  className={styles.deleteBtn}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
