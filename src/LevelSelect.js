// src/LevelSelect.js
import React, { useState, useEffect } from "react";
import "./App.css";

function LevelSelect({ onSelectLevel, onGoToMenu }) {
  const [levels, setLevels] = useState([]); // Will be filled from API

  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/levels');
        const data = await res.json();
        setLevels(data);
      } catch (err) {
        console.error("Failed to fetch levels", err);
      }
    };
    fetchLevels();
  }, []);

  return (
    <div className="App-header">
      <button onClick={onGoToMenu} className="back-btn">⬅ Menu</button>
      <h1>🎯 Choose a Challenge</h1>
      <div className="level-grid">
        
        {/* This maps all the levels from your database FIRST */}
        {levels.map((level) => (
          <div
            key={level.id}
            className="level-card"
            style={{ backgroundColor: level.color || '#DDD' }}
          >
            <h2>{level.name}</h2>
            <p>{level.description}</p>
            <button
              className="start-level-btn"
              onClick={() => onSelectLevel(level.id)}
            >
              Start 🚀
            </button>
          </div>
        ))}

        {/* --- MOVED TO THE END! --- */}
        <div
          className="level-card"
          style={{ backgroundColor: "#00c896" }} // Your green color
        >
          <h2>🧠 Personalized Practice</h2>
          <p>A special deck made just from your "Practice Later" words.</p>
          <button
            className="start-level-btn"
            onClick={() => onSelectLevel("PRACTICE_DECK")} // Special ID
          >
            Start 🚀
          </button>
        </div>
        {/* --- END OF MOVE --- */}

      </div>
    </div>
  );
}

export default LevelSelect;
