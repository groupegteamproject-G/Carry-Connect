"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import SearchBox from "../components/SearchBox";
import styles from "./find.module.css";

function FindCarrierContent() {
  const searchParams = useSearchParams();
  const [carriers, setCarriers] = useState([]);
  const [filteredCarriers, setFilteredCarriers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);

  const [priceRange, setPriceRange] = useState(1000);
  const [selectedTransport, setSelectedTransport] = useState("All");

  // ✅ ADDED: helper to format carrier name (email → readable name)
  const formatName = (carrier) => {
    const raw =
      carrier.carrierName ||
      carrier.userName ||
      carrier.name ||
      "Carrier";

    if (typeof raw === "string" && raw.includes("@")) {
      const namePart = raw.split("@")[0];
      return namePart
        .replace(/[._-]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
    }

    return raw;
  };

  useEffect(() => {
    let unsubscribeAuth;
    let unsubscribeTrips;

    (async () => {
      try {
        const { listenToAvailableTrips, onAuthChange } = await import("../../lib/db");

        unsubscribeAuth = onAuthChange((u) => setUser(u));
        unsubscribeTrips = listenToAvailableTrips((data) => {
          setCarriers(data);
          setLoading(false);
        });
      } catch (error) {
        console.error("Error loading carriers:", error);
        setLoading(false);
      }
    })();

    return () => {
      if (unsubscribeAuth) unsubscribeAuth();
      if (unsubscribeTrips) unsubscribeTrips();
    };
  }, []);

  useEffect(() => {
    if (!carriers.length) {
      setFilteredCarriers([]);
      return;
    }

    const fromQuery = searchParams.get("from")?.toLowerCase() || "";
    const toQuery = searchParams.get("to")?.toLowerCase() || "";
    const dateQuery = searchParams.get("date");
    const sizeQuery = searchParams.get("size");

    const filtered = carriers.filter((trip) => {
      const matchesFrom = !fromQuery || trip.from.toLowerCase().includes(fromQuery);
      const matchesTo = !toQuery || trip.to.toLowerCase().includes(toQuery);

      let matchesDate = true;
      if (dateQuery) {
        const tripDateObj = trip.date?.toDate ? trip.date.toDate() : new Date(trip.date);
        const tripDate = tripDateObj.setHours(0, 0, 0, 0);
        const queryDate = new Date(dateQuery).setHours(0, 0, 0, 0);
        matchesDate = tripDate >= queryDate;
      }

      const matchesSize = !sizeQuery || trip.packageSize === sizeQuery;
      const matchesPrice = trip.price <= priceRange;
      const matchesTransport =
        selectedTransport === "All" || trip.transportType === selectedTransport;

      return matchesFrom && matchesTo && matchesDate && matchesSize && matchesPrice && matchesTransport;
    });

    setFilteredCarriers(filtered);
  }, [carriers, searchParams, priceRange, selectedTransport]);

  if (loading) {
    return <div className={styles.loading}>Loading carriers...</div>;
  }

  return (
    <>
      <SearchBox className={styles.searchBoxFind} />

      <div className={styles.topActions}>
        <button
          className={`${styles.filterBtn} ${showFilters ? styles.active : ""}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <i className="fa-solid fa-filter"></i> Filters
        </button>
        <button
          className={styles.listBtn}
          onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
        >
          <i className={`fa-solid ${viewMode === "grid" ? "fa-list" : "fa-border-all"}`}></i>
          {viewMode === "grid" ? " List View" : " Grid View"}
        </button>
      </div>

      {showFilters && (
        <div className={styles.filtersPanel}>
          <div className={styles.filterGroup}>
            <label>Max Price: ${priceRange}</label>
            <input
              type="range"
              min="0"
              max="1000"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className={styles.rangeInput}
            />
          </div>
          <div className={styles.filterGroup}>
            <label>Transport Type</label>
            <select
              value={selectedTransport}
              onChange={(e) => setSelectedTransport(e.target.value)}
              className={styles.selectInput}
            >
              <option value="All">All Types</option>
              <option value="Flight">Flight</option>
              <option value="Train">Train</option>
              <option value="Car">Car</option>
              <option value="Ship">Ship</option>
            </select>
          </div>
          <button
            onClick={() => {
              setPriceRange(1000);
              setSelectedTransport("All");
            }}
            className={styles.clearFiltersBtn}
          >
            <i className="fa-solid fa-rotate-right"></i>
          </button>
        </div>
      )}

      <h2 className={styles.sectionTitle}>Available Carriers</h2>
      <p className={styles.resultCount}>{filteredCarriers.length} carriers found</p>

      {filteredCarriers.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📦</div>
          <h3 className={styles.emptyTitle}>No trips found</h3>
          <p className={styles.emptyText}>Try adjusting your search or filters.</p>
          <button
            onClick={() => {
              setPriceRange(1000);
              setSelectedTransport("All");
            }}
            className={styles.clearBtn}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className={viewMode === "grid" ? styles.cardsGrid : styles.cardsList}>
          {filteredCarriers.map((carrier) => {
            const isMyTrip = user && carrier.carrierUid === user.uid;
            return (
              <div
                key={carrier.id}
                className={`${styles.card} ${viewMode === "list" ? styles.cardList : ""}`}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.avatar}>
                    {carrier.avatar || formatName(carrier).charAt(0) || "U"}
                  </div>
                  <div className={styles.headerInfo}>
                    <h3 className={styles.cardName}>
                      {formatName(carrier)}
                      {isMyTrip && <span className={styles.youBadge}>(You)</span>}
                    </h3>
                    <div className={styles.routeInfo}>
                      <span className={styles.routeText}>
                        {carrier.from} → {carrier.to}
                      </span>
                      <span className={styles.cardDate}>
                        {(carrier.date?.toDate
                          ? carrier.date.toDate()
                          : new Date(carrier.date)
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <span className={styles.badge}>{carrier.transportType}</span>
                </div>

                <div className={styles.cardBody}>
                  <p className={styles.packageSize}>
                    <i className="fa-solid fa-box"></i> {carrier.packageSize}
                  </p>
                  {carrier.description && (
                    <p className={styles.description}>{carrier.description}</p>
                  )}
                </div>

                <div className={styles.cardFooter}>
                  <h3 className={styles.price}>${carrier.price}</h3>
                  {isMyTrip ? (
                    <button disabled className={styles.bookBtnDisabled}>
                      Your Trip
                    </button>
                  ) : (
                    <Link
                      href={`/booking?tripId=${carrier.id}`}
                      className={styles.bookBtn}
                    >
                      Book Now
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

export default function FindCarrierPage() {
  return (
    <main className={styles.pageWrapper}>
      <Suspense fallback={<div>Loading...</div>}>
        <FindCarrierContent />
      </Suspense>
    </main>
  );
}
