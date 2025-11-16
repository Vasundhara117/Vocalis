// src/ProgressScreen.js
import React, { useEffect, useState } from "react";
import "./App.css";

function ProgressScreen({ onGoToMenu, token }) {
  const [progress, setProgress] = useState([]);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/progress', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (res.ok) {
          setProgress(data.progress || []); // <-- FIX: Default to []
          setStreak(data.streak || 0); // <-- FIX: Default to 0
        } else {
          throw new Error(data.error || 'Failed to fetch progress');
        }
      } catch (err) {
        console.error(err);
        setProgress([]); // Set to empty array on any error
      }
    };
    
    if (token) {
      fetchProgress();
    }
  }, [token]);

  const mastered = (progress || []).filter((w) => w.mastered);
  const practiceLater = (progress || []).filter((w) => !w.mastered);

  const avg =
    progress && progress.length > 0
      ? Math.round(progress.reduce((a, b) => a + b.accuracy, 0) / progress.length)
      : 0;

  const clearProgress = () => {
    alert("This button is disabled. Progress is now saved to your account.");
  };

  return (
    <div className="App-header">
      <button onClick={onGoToMenu} className="back-btn">⬅ Menu</button>
      <h1>📊 Your Progress</h1>

      <div className="progress-summary">
        <p>Current Streak: <strong>🔥 {streak} Days</strong></p> 
        <p>Average Accuracy: <strong>{avg}%</strong></p>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${avg}%` }}
          ></div>
        </div>
      </div>

      <div className="progress-section">
        <h3>⭐ Mastered Words</h3>
        {mastered.length > 0 ? (
          <ul>{mastered.map((w) => <li key={w.word}>{w.word}</li>)}</ul>
        ) : <p>None yet — keep practicing!</p>}
      </div>

      <div className="progress-section">
        <h3>🔁 Practice Later</h3>
        {practiceLater.length > 0 ? (
          <ul>{practiceLater.map((w) => <li key={w.word}>{w.word}</li>)}</ul>
        ) : <p>No words to practice later!</p>}
      </div>

      <button onClick={clearProgress} className="clear-button">
        Clear Progress
      </button>
    </div>
  );
}

export default ProgressScreen;
