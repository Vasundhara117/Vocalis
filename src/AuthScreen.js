// src/AuthScreen.js
import React, { useState } from "react";
import "./App.css";
import { motion } from "framer-motion";

function AuthScreen({ onLogin }) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState("🦜");
  const [error, setError] = useState("");

  const avatars = ["🦜", "🐼", "🦊", "🐯", "🐸", "🐰", "🐻", "🐶", "🐧"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const url = isLoginMode
      ? "http://localhost:3001/api/auth/login"
      : "http://localhost:3001/api/auth/signup";

    const body = isLoginMode
      ? { email, password }
      : { name, email, password, avatar };

    if (!email || !password || (!isLoginMode && !name)) {
      return setError("Please fill out all required fields.");
    }

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");

      onLogin(data.user, data.token);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="sky-wrapper">
      {/* Floating clouds */}
      <div className="cloud cloud1"></div>
      <div className="cloud cloud2"></div>
      <div className="cloud cloud3"></div>

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 140 }}
        className="child-card"
      >
        <h1 className="child-title">
          {isLoginMode ? "👋 Hello There!" : "🎉 Create Your Profile"}
        </h1>

        <p className="child-subtitle">
          {isLoginMode
            ? "Log in to start your speaking adventure!"
            : "Let's set things up to begin learning!"}
        </p>

        <form onSubmit={handleSubmit} className="form-container">
          {!isLoginMode && (
            <>
              <div className="input-group">
                <label>Your Name:</label>
                <input
                  type="text"
                  value={name}
                  placeholder="Enter your name"
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label>Choose Your Avatar:</label>
                <div className="avatar-grid">
                  {avatars.map((icon) => (
                    <span
                      key={icon}
                      className={`avatar-option ${
                        avatar === icon ? "selected-avatar" : ""
                      }`}
                      onClick={() => setAvatar(icon)}
                    >
                      {icon}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="input-group">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              placeholder="Enter your email"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Password:</label>
            <input
              type="password"
              value={password}
              placeholder="Enter your password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="auth-error-text">{error}</p>}

          <button type="submit" className="child-btn">
            {isLoginMode ? "🚀 Log In" : "🎈 Sign Up"}
          </button>
        </form>

        <button
          className="switch-mode-btn"
          onClick={() => {
            setIsLoginMode(!isLoginMode);
            setError("");
          }}
        >
          {isLoginMode
            ? "Need an account? Sign Up"
            : "Already have an account? Log In"}
        </button>
      </motion.div>
    </div>
  );
}

export default AuthScreen;