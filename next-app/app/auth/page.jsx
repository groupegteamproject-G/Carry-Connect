"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./auth.module.css";

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    phone: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const { signIn, signUp } = await import("../../lib/auth");
      const searchParams = new URLSearchParams(window.location.search);
      const redirectUrl = searchParams.get("redirect") || "/";

      if (isLogin) {
        await signIn(formData.email, formData.password);
        setSuccessMsg("Login successful!");
        router.push(redirectUrl);
      } else {
        await signUp(formData.email, formData.password, formData.name, formData.phone);
        setSuccessMsg("Account created successfully!");
        router.push(redirectUrl);
      }
    } catch (err) {
      setError(err.message || "An error occurred");
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.authBox}>
        <h1 className={styles.title}>
          {isLogin ? "Welcome Back!" : "Create Account"}
        </h1>
        <p className={styles.subtitle}>
          {isLogin ? "Login to continue" : "Sign up to get started"}
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          {!isLogin && (
            <>
              <div className={styles.inputGroup}>
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your name"
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="Enter your phone"
                />
              </div>
            </>
          )}

          <div className={styles.inputGroup}>
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              minLength="6"
            />
          </div>

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          {successMsg && (
            <div className={styles.success} style={{ color: 'green', background: '#e6fffa', padding: '10px', borderRadius: '5px', marginBottom: '15px', textAlign: 'center' }}>
              {successMsg}
            </div>
          )}

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading ? "Please wait..." : (isLogin ? "Login" : "Sign Up")}
          </button>
        </form>

        <p className={styles.switchText}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
            className={styles.switchBtn}
          >
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}
