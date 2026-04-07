// src/AchievementScreen.js
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

// Helper function to format the date
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export default function AchievementScreen({ token, onGoToMenu }) {
  const [allAchievements, setAllAchievements] = useState({});
  const [earnedAchievements, setEarnedAchievements] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("ACHIEVEMENT_SCREEN: useEffect running."); // DEBUG 1

    const fetchAchievements = async () => {
      try {
        setLoading(true);
        console.log("ACHIEVEMENT_SCREEN: Fetching data from server..."); // DEBUG 2
        const res = await axios.get('http://localhost:3001/api/achievements', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log("ACHIEVEMENT_SCREEN: API Success. Data received:", res.data); // DEBUG 3

        if (!res.data || !res.data.allAchievements) {
          console.error("ACHIEVEMENT_SCREEN: Data format from server is WRONG.", res.data);
          setError("Received invalid data from server.");
        } else {
          console.log("ACHIEVEMENT_SCREEN: Setting state with allAchievements:", res.data.allAchievements); // DEBUG 4
          setAllAchievements(res.data.allAchievements);
          
          const earnedMap = new Map(
            res.data.earnedAchievements.map(ach => [ach.achievementId, ach])
          );
          setEarnedAchievements(earnedMap);
          setError(null);
        }

      } catch (err) {
        console.error("Error fetching achievements:", err);
        setError("Could not load achievements.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      console.log("ACHIEVEMENT_SCREEN: Token exists. Calling fetchAchievements."); // DEBUG 5
      fetchAchievements();
    } else {
      setLoading(false);
      setError("You are not logged in. Please return to the menu.");
    }
  }, [token]);

  // Get the list of achievement keys to render
  const achievementKeys = Object.keys(allAchievements);
  console.log("ACHIEVEMENT_SCREEN: Rendering with achievementKeys:", achievementKeys); // DEBUG 6

  return (
    <div className="achievement-screen screen-container">
      <div className="header">
        <button onClick={onGoToMenu} className="back-button">← Menu</button>
        <h1>My Trophies</h1>
      </div>

      {loading && <p>Loading Trophies...</p>}
      {error && <p className="error-message">{error}</p>}

      {/* Only render grid if not loading and no error */}
      {!loading && !error && (
        <motion.div 
          className="achievement-grid"
          // --- THIS IS THE LAYOUT FIX ---
          style={{
            maxWidth: '900px',
            gridTemplateColumns: 'repeat(3, 250px)',
            justifyContent: 'center'
          }}
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.05 } }
          }}
        >
          {achievementKeys.map(key => {
            const achievementInfo = allAchievements[key];
            const earnedData = earnedAchievements.get(key);
            const isEarned = !!earnedData;

            return (
              <motion.div 
                key={key} 
                className={`achievement-card ${isEarned ? 'earned' : 'locked'}`}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
              >
                {/* THIS IS THE UPDATED ICON CODE */}
                <div className="achievement-icon">{isEarned ? '🏆' : '🔒'}</div>
                <h3 className="achievement-name">{achievementInfo.name}</h3>
                <p className="achievement-desc">{achievementInfo.description}</p>
                {isEarned && (
                  <p className="achievement-date">
                    Earned: {formatDate(earnedData.date)}
                  </p>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* DEBUG 7: Show this if everything else fails */}
      {!loading && !error && achievementKeys.length === 0 && (
        <p style={{ color: 'orange', textAlign: 'center' }}>
          Debug: API call succeeded but no achievements were found to display.
        </p>
      )}
    </div>
  );
}