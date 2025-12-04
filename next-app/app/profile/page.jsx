"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./profile.module.css";

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("trips");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);

  useEffect(() => {
    let unsubscribeAuth;

    async function init() {
      try {
        const { onAuthChange } = await import("../../lib/auth");
        const { getUserProfile } = await import("../../lib/db");

        unsubscribeAuth = onAuthChange(async (currentUser) => {
          if (!currentUser) {
            router.push("/auth");
            return;
          }

          setUser(currentUser);
          setEmail(currentUser.email);
          setFullName(currentUser.displayName || "");

          // Fetch additional profile data from Firestore
          const profile = await getUserProfile(currentUser.uid);
          if (profile) {
            setFullName(profile.name || currentUser.displayName || "");
            setPhone(profile.phone || "");
            setLocation(profile.location || "");
            setBio(profile.bio || "");
            setAvatarUrl(profile.avatarUrl || "");
            if (profile.emailNotifications !== undefined) setEmailNotifications(profile.emailNotifications);
            if (profile.smsNotifications !== undefined) setSmsNotifications(profile.smsNotifications);
          }
          setLoading(false);
        });
      } catch (error) {
        console.error("Error initializing profile:", error);
        setLoading(false);
      }
    }

    init();
    return () => {
      if (unsubscribeAuth) unsubscribeAuth();
    };
  }, [router]);

  const handleSave = async () => {
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");
    try {
      const { setUserProfile } = await import("../../lib/db");
      await setUserProfile(user.uid, {
        name: fullName,
        phone,
        location,
        bio,
        avatarUrl,
        emailNotifications,
        smsNotifications
      });
      setSuccessMsg("Profile updated successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (error) {
      console.error("Error saving profile:", error);
      setErrorMsg("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { logOut } = await import("../../lib/auth");
      await logOut();
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      // In a real app, we would call a cloud function to delete auth + data
      // For MVP, we'll just sign out and maybe flag the user.
      alert("Account deletion request received. Please contact support for immediate removal.");
    }
  };

  if (loading) {
    return <div style={{ padding: "50px", textAlign: "center" }}>Loading profile...</div>;
  }

  return (
    <main className={styles.page}>
      {/* Blue header background */}
      <div className={styles.headerBg}></div>

      {/* White profile card */}
      <div className={styles.profileCard}>
        <div className={styles.topSection}>
          {/* Left: avatar */}
          <div
            className={styles.avatar}
            style={{
              backgroundImage: avatarUrl ? `url(${avatarUrl})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {!avatarUrl && <i className="fa-solid fa-user" style={{ fontSize: '40px', color: '#999', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}></i>}
          </div>

          {/* Middle: user info */}
          <div className={styles.userInfo}>
            <h2 className={styles.name}>{fullName || "User"}</h2>

            <div className={styles.ratingRow}>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star-half-stroke"></i>

              <span className={styles.ratingText}>No ratings yet</span>

              <span className={styles.verified}>
                {user?.emailVerified ? (
                  <>
                    <i className="fa-solid fa-circle-check"></i> Verified
                  </>
                ) : (
                  <>
                    <i className="fa-regular fa-circle"></i> Unverified
                  </>
                )}
              </span>
            </div>

            <p className={styles.joined}>Member since {user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : "Recently"}</p>

            <p className={styles.bio}>
              {bio || "No bio yet. Click 'Edit Profile' to add one!"}
            </p>
          </div>

          {/* Right: Edit profile button */}
          <button
            className={styles.editBtn}
            onClick={() => {
              setActiveTab("settings");
              setTimeout(() => {
                const settingsSection = document.getElementById("settings-section");
                if (settingsSection) {
                  settingsSection.scrollIntoView({ behavior: "smooth" });
                }
              }, 100);
            }}
          >
            <i className="fa-solid fa-gear"></i> Edit Profile
          </button>
        </div>

        {/* Stats grid (Placeholder for now, but dynamic in spirit) */}
        <div className={styles.statsGrid}>
          <div className={styles.statBox}>
            <i className="fa-solid fa-plane-departure"></i>
            <h3>0</h3>
            <p>Completed Trips</p>
          </div>

          <div className={styles.statBoxGreen}>
            <i className="fa-solid fa-box"></i>
            <h3>0</h3>
            <p>Packages Delivered</p>
          </div>

          <div className={styles.statBoxPurple}>
            <i className="fa-solid fa-location-dot"></i>
            <h3>{location ? 1 : 0}</h3>
            <p>Locations</p>
          </div>

          <div className={styles.statBoxYellow}>
            <i className="fa-solid fa-wallet"></i>
            <h3>$0</h3>
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
              <p>{user?.emailVerified ? "Verified" : "Pending"}</p>
            </div>
          </div>

          <div className={styles.verifyBox}>
            <i className="fa-solid fa-phone"></i>
            <div>
              <h4>Phone Number</h4>
              <p>{phone ? "Verified" : "Add Phone"}</p>
            </div>
          </div>

          <div className={styles.verifyBox}>
            <i className="fa-solid fa-id-card"></i>
            <div>
              <h4>ID Verification</h4>
              <p>Unverified</p>
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
          <div style={{ padding: "20px 0", color: "#666" }}>
            <p>No trips history available yet.</p>
          </div>
        )}

        {/* ---------------------- REVIEWS TAB ---------------------- */}
        {activeTab === "reviews" && (
          <div style={{ padding: "20px 0", color: "#666" }}>
            <p>No reviews yet.</p>
          </div>
        )}

        {/* ---------------------- SETTINGS TAB ---------------------- */}
        {activeTab === "settings" && (
          <div className={styles.settingsWrapper} id="settings-section">
            <div className={styles.settingsCard}>
              <h2 className={styles.settingsTitle}>Account Settings</h2>

              {/* PERSONAL INFORMATION */}
              <h4 className={styles.settingsSubtitle}>Personal Information</h4>

              {successMsg && (
                <div style={{ padding: "10px", background: "#d4edda", color: "#155724", borderRadius: "5px", marginBottom: "15px" }}>
                  {successMsg}
                </div>
              )}
              {errorMsg && (
                <div style={{ padding: "10px", background: "#f8d7da", color: "#721c24", borderRadius: "5px", marginBottom: "15px" }}>
                  {errorMsg}
                </div>
              )}

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
                    disabled
                    style={{ opacity: 0.7, cursor: 'not-allowed' }}
                  />
                </div>

                {/* PHONE */}
                <div>
                  <label>Phone Number</label>
                  <input
                    className={styles.inputField}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 234 567 890"
                  />
                </div>

                {/* LOCATION */}
                <div>
                  <label>Location</label>
                  <input
                    className={styles.inputField}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City, Country"
                  />
                </div>

                {/* AVATAR URL */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label>Avatar URL (Image Link)</label>
                  <input
                    className={styles.inputField}
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/my-photo.jpg"
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
                  placeholder="Tell us a bit about yourself..."
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
                <button
                  className={styles.saveBtn}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>

              {/* DANGER ZONE */}
              <div className={styles.dangerZone}>
                <h3>Danger Zone</h3>
                <button
                  className={styles.logoutBtn}
                  onClick={handleDeleteAccount}
                  style={{ background: '#ff000011', borderColor: '#ff000033' }}
                >
                  <i className="fa-solid fa-trash"></i> Delete Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
