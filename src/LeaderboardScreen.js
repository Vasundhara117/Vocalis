// src/LeaderboardScreen.js
import React, { useState, useEffect } from 'react';
import './App.css'; // Use existing styles

function LeaderboardScreen({ onGoToMenu }) {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        setLoading(true);
        const res = await fetch('http://localhost:3001/api/leaderboard');
        if (!res.ok) {
          throw new Error('Failed to fetch scores');
        }
        const data = await res.json();
        setScores(data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Could not load leaderboard. Try again later.');
      }
      setLoading(false);
    };
    fetchScores();
  }, []);

  return (
    <div className="App-header">
      <h1 style={{ color: '#ff7b00', marginBottom: '10px' }}>🏆 Global Leaderboard 🏆</h1>
      <p style={{ fontSize: '1.1rem', marginTop: 0, color: '#555' }}>Top 10 Time Attack Scores</p>
      
      <button onClick={onGoToMenu} className="back-btn" style={{ position: 'static', marginBottom: '20px' }}>
        ⬅ Back to Menu
      </button>

      {loading && <p>Loading...</p>}
      {error && <p className="auth-error-text">{error}</p>}
      
      {!loading && !error && (
        <ol className="leaderboard-list">
          {scores.map((entry, index) => (
            <li key={entry._id} className="leaderboard-item">
              <span className="leaderboard-rank">
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
              </span>
              <span className="leaderboard-avatar">{entry.user ? entry.user.avatar : '?'}</span>
              <span className="leaderboard-name">{entry.user ? entry.user.name : '???'}:</span>
              <strong className="leaderboard-score">{entry.score} pts</strong>
              <small className="leaderboard-combo">(Combo: {entry.maxCombo})</small>
            </li>
          ))}
        </ol>
      )}
      {!loading && !error && scores.length === 0 && (
        <p>No scores yet. Be the first!</p>
      )}
    </div>
  );
}

export default LeaderboardScreen;