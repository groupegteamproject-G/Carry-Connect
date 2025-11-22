import styles from "./footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        {/* LEFT SECTION */}
        <div className={styles.brand}>
          <div className={styles.logoRow}>
            <i className="fa-regular fa-globe"></i>
            <h3>CarryConnect</h3>
          </div>

          <p className={styles.brandText}>
            Connecting travelers with senders for global package delivery.
          </p>

          <div className={styles.socials}>
            <i className="fa-brands fa-facebook"></i>
            <i className="fa-brands fa-twitter"></i>
            <i className="fa-brands fa-instagram"></i>
            <i className="fa-brands fa-linkedin"></i>
          </div>
        </div>

        {/* CENTER COLUMNS */}
        <div className={styles.columns}>
          <div>
            <h4>For Travelers</h4>
            <a href="#">Add a Trip</a>
            <a href="#">How It Works</a>
            <a href="#">Earning Potential</a>
            <a href="#">Insurance & Protection</a>
          </div>

          <div>
            <h4>For Senders</h4>
            <a href="#">Find a Carrier</a>
            <a href="#">Shipping Guidelines</a>
            <a href="#">Package Safety</a>
            <a href="#">Tracking & Updates</a>
          </div>

          <div>
            <h4>Company</h4>
            <a href="#">About Us</a>
            <a href="#">Trust & Safety</a>
            <a href="#">Help Center</a>
            <a href="#">Terms of Service</a>
            <a href="#">Privacy Policy</a>
          </div>
        </div>
      </div>

      {/* FOOTER BOTTOM */}
      <div className={styles.bottom}>
        © 2025 CarryConnect. All rights reserved.
      </div>
    </footer>
  );
}
