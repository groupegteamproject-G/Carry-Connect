"use client";

import { useState } from "react";
import styles from "./profile.module.css";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("trips");

  const [fullName, setFullName] = useState("Saidali");
  const [email, setEmail] = useState("saidali@example.com");
  const [phone, setPhone] = useState("+48 123-456-789");
  const [location, setLocation] = useState("Lodz, Poland");
  const [bio, setBio] = useState(
    "Frequent traveler between US and Europe for business. Happy to help deliver packages on my regular routes!"
  );

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);

  return (
    <main className={styles.page}>
      {/* Blue header background */}
      <div className={styles.headerBg}></div>

      {/* White profile card */}
      <div className={styles.profileCard}>
        <div className={styles.topSection}>
          {/* Left: avatar */}
          <div className={styles.avatar}></div>

          {/* Middle: user info */}
          <div className={styles.userInfo}>
            <h2 className={styles.name}>Alex Johnson</h2>

            <div className={styles.ratingRow}>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <i className="fa-regular fa-star"></i>

              <span className={styles.ratingText}>4.8 (24 reviews)</span>

              <span className={styles.verified}>
                <i className="fa-solid fa-circle-check"></i> Verified
              </span>
            </div>

            <p className={styles.joined}>Member since March 2020</p>

            <p className={styles.bio}>
              Frequent traveler between US and Europe for business. Happy to
              help deliver packages on my regular routes!
            </p>
          </div>

          {/* Right: Edit profile button */}
          <button className={styles.editBtn}>
            <i className="fa-solid fa-gear"></i> Edit Profile
          </button>
        </div>

        {/* Stats grid */}
        <div className={styles.statsGrid}>
          <div className={styles.statBox}>
            <i className="fa-solid fa-plane-departure"></i>
            <h3>18</h3>
            <p>Completed Trips</p>
          </div>

          <div className={styles.statBoxGreen}>
            <i className="fa-solid fa-box"></i>
            <h3>36</h3>
            <p>Packages Delivered</p>
          </div>

          <div className={styles.statBoxPurple}>
            <i className="fa-solid fa-location-dot"></i>
            <h3>12</h3>
            <p>Countries Visited</p>
          </div>

          <div className={styles.statBoxYellow}>
            <i className="fa-solid fa-wallet"></i>
            <h3>$820</h3>
            <p>Total Earnings</p>
          </div>
        </div>

        {/* Verification Status */}
        <h2 className={styles.sectionTitle}>Verification Status</h2>

        <div className={styles.verifyGrid}>
          <div className={styles.verifyBox}>
            <i className="fa-solid fa-envelope"></i>
            <div>
              <h4>Email</h4>
              <p>Verified</p>
            </div>
          </div>

          <div className={styles.verifyBox}>
            <i className="fa-solid fa-phone"></i>
            <div>
              <h4>Phone Number</h4>
              <p>Verified</p>
            </div>
          </div>

          <div className={styles.verifyBox}>
            <i className="fa-solid fa-id-card"></i>
            <div>
              <h4>ID Verification</h4>
              <p>Verified</p>
            </div>
          </div>

          <div className={styles.verifyBox}>
            <i className="fa-solid fa-house"></i>
            <div>
              <h4>Address</h4>
              <p>Verified</p>
            </div>
          </div>
        </div>

        {/* ---------------------- TABS ---------------------- */}
        <div className={styles.tabs}>
          <button
            className={activeTab === "trips" ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab("trips")}
          >
            Trips
          </button>

          <button
            className={activeTab === "reviews" ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab("reviews")}
          >
            Reviews
          </button>

          <button
            className={activeTab === "settings" ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab("settings")}
          >
            Settings
          </button>
        </div>

        {/* ---------------------- TRIPS TAB ---------------------- */}
        {activeTab === "trips" && (
          <>
            <h2 className={styles.sectionTitle}>Upcoming Trips</h2>
            <div className={styles.tripGrid}>
              <div className={styles.tripCard}>
                <div className={styles.tripHeader}>
                  <i className="fa-solid fa-plane"></i>
                  <span className={styles.statusUpcoming}>Upcoming</span>
                </div>

                <div className={styles.tripInfo}>
                  <p>
                    <i className="fa-regular fa-circle-dot"></i> New York, USA →
                    London, UK
                  </p>
                  <p>
                    <i className="fa-regular fa-calendar"></i> Aug 15, 2023
                  </p>
                  <p>
                    <i className="fa-solid fa-box"></i> Small package (2kg)
                  </p>
                </div>

                <button className={styles.detailsBtn}>View Details</button>
              </div>

              <div className={styles.tripCard}>
                <div className={styles.tripHeader}>
                  <i className="fa-solid fa-plane"></i>
                  <span className={styles.statusUpcoming}>Upcoming</span>
                </div>

                <div className={styles.tripInfo}>
                  <p>
                    <i className="fa-regular fa-circle-dot"></i> London, UK →
                    New York, USA
                  </p>
                  <p>
                    <i className="fa-regular fa-calendar"></i> Aug 25, 2023
                  </p>
                  <p>
                    <i className="fa-solid fa-box"></i> Medium package (4kg)
                  </p>
                </div>

                <button className={styles.detailsBtn}>View Details</button>
              </div>
            </div>

            {/* PAST TRIPS */}
            <h2 className={styles.sectionTitle}>Past Trips</h2>
            <div className={styles.tripGrid}>
              <div className={styles.tripCard}>
                <div className={styles.tripHeader}>
                  <i className="fa-solid fa-plane"></i>
                  <span className={styles.statusCompleted}>Completed</span>
                </div>

                <div className={styles.tripInfo}>
                  <p>
                    <i className="fa-regular fa-circle-dot"></i> New York, USA →
                    Paris, France
                  </p>
                  <p>
                    <i className="fa-regular fa-calendar"></i> Jun 10, 2023
                  </p>
                </div>

                <button className={styles.detailsBtn}>View Details</button>
              </div>

              <div className={styles.tripCard}>
                <div className={styles.tripHeader}>
                  <i className="fa-solid fa-plane"></i>
                  <span className={styles.statusCompleted}>Completed</span>
                </div>

                <div className={styles.tripInfo}>
                  <p>
                    <i className="fa-regular fa-circle-dot"></i> Paris, France →
                    New York, USA
                  </p>
                  <p>
                    <i className="fa-regular fa-calendar"></i> Jun 20, 2023
                  </p>
                </div>

                <button className={styles.detailsBtn}>View Details</button>
              </div>

              <div className={styles.tripCard}>
                <div className={styles.tripHeader}>
                  <i className="fa-solid fa-plane"></i>
                  <span className={styles.statusCompleted}>Completed</span>
                </div>

                <div className={styles.tripInfo}>
                  <p>
                    <i className="fa-regular fa-circle-dot"></i> New York, USA →
                    Berlin, Germany
                  </p>
                  <p>
                    <i className="fa-regular fa-calendar"></i> May 5, 2023
                  </p>
                </div>

                <button className={styles.detailsBtn}>View Details</button>
              </div>
            </div>
          </>
        )}

        {/* ---------------------- REVIEWS TAB ---------------------- */}
        {activeTab === "reviews" && (
          <div className={styles.reviewsSection}>
            <h2 className={styles.sectionTitle}>Reviews (2)</h2>

            {/* Review 1 */}
            <div className={styles.reviewCard}>
              <div className={styles.reviewHeader}>
                <h4>Sarah M.</h4>
                <span className={styles.reviewDate}>July 15, 2023</span>
              </div>

              <div className={styles.reviewStars}>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-regular fa-star"></i>
              </div>

              <p className={styles.reviewText}>
                Alex delivered my package on time and in perfect condition.
                Great communication throughout!
              </p>
            </div>

            {/* Review 2 */}
            <div className={styles.reviewCard}>
              <div className={styles.reviewHeader}>
                <h4>James P.</h4>
                <span className={styles.reviewDate}>June 3, 2023</span>
              </div>

              <div className={styles.reviewStars}>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-regular fa-star"></i>
                <i className="fa-regular fa-star"></i>
              </div>

              <p className={styles.reviewText}>
                Reliable carrier, took good care of my package. Would use again.
              </p>
            </div>
          </div>
        )}

        {/* ---------------------- SETTINGS TAB ---------------------- */}
        {activeTab === "settings" && (
          <div className={styles.settingsWrapper}>
            <div className={styles.settingsCard}>
              <h2 className={styles.settingsTitle}>Account Settings</h2>

              {/* PERSONAL INFORMATION */}
              <h4 className={styles.settingsSubtitle}>Personal Information</h4>

              <div className={styles.settingsGrid}>
                {/* FULL NAME */}
                <div>
                  <label>Full Name</label>
                  <input
                    className={styles.inputField}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                {/* EMAIL */}
                <div>
                  <label>Email Address</label>
                  <input
                    className={styles.inputField}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {/* PHONE */}
                <div>
                  <label>Phone Number</label>
                  <input
                    className={styles.inputField}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                {/* LOCATION */}
                <div>
                  <label>Location</label>
                  <input
                    className={styles.inputField}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>

              {/* BIO */}
              <div style={{ marginTop: "20px" }}>
                <label>Bio</label>
                <textarea
                  className={styles.textareaField}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>

              <hr className={styles.settingsDivider} />

              {/* NOTIFICATION SETTINGS */}
              <h4 className={styles.settingsSubtitle}>Notification Settings</h4>

              <div className={styles.checkboxRow}>
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={() => setEmailNotifications(!emailNotifications)}
                />
                <div>
                  <h4>Email Notifications</h4>
                  <p>Receive updates about new messages and trip requests.</p>
                </div>
              </div>

              <div className={styles.checkboxRow}>
                <input
                  type="checkbox"
                  checked={smsNotifications}
                  onChange={() => setSmsNotifications(!smsNotifications)}
                />
                <div>
                  <h4>SMS Notifications</h4>
                  <p>Receive text alerts for important updates.</p>
                </div>
              </div>

              <hr className={styles.settingsDivider} />

              {/* SAVE BUTTON */}
              <div className={styles.saveRow}>
                <button className={styles.saveBtn}>Save Changes</button>
              </div>

              {/* DANGER ZONE */}
              <div className={styles.dangerZone}>
                <h3>Danger Zone</h3>
                <button className={styles.logoutBtn}>
                  <i className="fa-solid fa-right-from-bracket"></i> Log Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
