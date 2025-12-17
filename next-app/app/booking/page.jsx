"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { bookTrip, getTripById, auth } from "../../lib/db";
import styles from "./booking.module.css";
import Image from "next/image";

export default function BookingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tripId = searchParams.get("tripId");

  const [trip, setTrip] = useState(null);
  const [form, setForm] = useState({
    weight: "",
    pickupLocation: "",
    dropoffLocation: "",
    reward: ""
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadTrip = async () => {
      if (!tripId) {
        setError("No trip selected. Please go back and select a trip.");
        setLoading(false);
        return;
      }

      try {
        const tripData = await getTripById(tripId);
        if (mounted) {
          setTrip(tripData);
        }
      } catch (err) {
        console.error("Error loading trip:", err);
        if (mounted) setError("Failed to load trip details.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadTrip();

    return () => {
      mounted = false;
    };
  }, [tripId]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const validateForm = () => {
    if (!form.weight || Number(form.weight) <= 0) return "Please enter a valid weight.";
    if (!form.pickupLocation.trim()) return "Please enter pickup location.";
    if (!form.dropoffLocation.trim()) return "Please enter dropoff location.";
    if (!form.reward || Number(form.reward) <= 0) return "Please enter a valid reward.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!auth.currentUser) {
      setError("You must be logged in to book a trip.");
      return;
    }

    setSubmitting(true);

    try {
      await bookTrip(tripId, {
        weight: form.weight,
        pickupLocation: form.pickupLocation,
        dropoffLocation: form.dropoffLocation,
        reward: form.reward
      });

      setSuccessMessage("Booking request sent successfully!");
      setTimeout(() => {
        router.push("/my-orders");
      }, 1200);
    } catch (err) {
      console.error("Booking failed:", err);
      setError(err?.message || "Booking failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading trip details...</p>
      </div>
    );
  }

  if (error && !trip) {
    return (
      <div className={styles.errorContainer}>
        <h2>Oops!</h2>
        <p>{error}</p>
        <button onClick={() => router.push("/find-a-carrier")} className={styles.backBtn}>
          Back to Trips
        </button>
      </div>
    );
  }

  return (
    <main className={styles.bookingPage}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1>Book Your Trip</h1>
          <p>Fill in package details to request this carrier.</p>
        </header>

        <div className={styles.content}>
          {trip && (
            <div className={styles.tripCard}>
              <div className={styles.tripHeader}>
                <div className={styles.tripInfo}>
                  <h2>
                    {trip.from} → {trip.to}
                  </h2>
                  <p className={styles.date}>{trip.date}</p>
                  <p className={styles.transport}>{trip.transportType}</p>
                </div>
                <div className={styles.carrier}>
                  <div className={styles.avatar}>
                    <Image src="/user.png" alt="Carrier" width={50} height={50} />
                  </div>
                  <div>
                    <p className={styles.carrierName}>
                      {trip.carrierName || "Carrier"}
                    </p>
                    <p className={styles.carrierEmail}>{trip.carrierEmail}</p>
                  </div>
                </div>
              </div>

              <div className={styles.tripDetails}>
                <p><strong>Available Weight:</strong> {trip.availableWeight} kg</p>
                <p><strong>Price:</strong> ${trip.price}</p>
                <p><strong>Description:</strong> {trip.description || "No description provided."}</p>
              </div>
            </div>
          )}

          <form className={styles.form} onSubmit={handleSubmit}>
            <h3>Package Details</h3>

            <label>
              Package Weight (kg)
              <input
                type="number"
                name="weight"
                value={form.weight}
                onChange={handleChange}
                placeholder="e.g. 2"
              />
            </label>

            <label>
              Pickup Location
              <input
                type="text"
                name="pickupLocation"
                value={form.pickupLocation}
                onChange={handleChange}
                placeholder="e.g. Warsaw"
              />
            </label>

            <label>
              Dropoff Location
              <input
                type="text"
                name="dropoffLocation"
                value={form.dropoffLocation}
                onChange={handleChange}
                placeholder="e.g. Berlin"
              />
            </label>

            <label>
              Reward ($)
              <input
                type="number"
                name="reward"
                value={form.reward}
                onChange={handleChange}
                placeholder="e.g. 20"
              />
            </label>

            {error && <p className={styles.errorMsg}>{error}</p>}
            {successMessage && <p className={styles.successMsg}>{successMessage}</p>}

            <button type="submit" className={styles.submitBtn} disabled={submitting}>
              {submitting ? "Submitting..." : "Send Booking Request"}
            </button>

            <button type="button" className={styles.backBtn} onClick={() => router.push("/find-a-carrier")}>
              Back to Trips
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
