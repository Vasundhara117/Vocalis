// src/SpaceshipRevisionGame.js
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css'; // We can reuse the main CSS for styling

// --- Game Settings ---
const GAME_SPEED = 0.5;
const SPACESHIP_SPEED = 20;
const LASER_SPEED = 12;

// --- Helper Functions ---
const getRandomX = (gameWidth) => Math.floor(Math.random() * (gameWidth - 150)) + 50;
const createWord = (word, id, gameWidth) => ({
  id: id,
  word: word,
  x: getRandomX(gameWidth),
  y: -50, // Start just off-screen
});

function SpaceshipRevisionGame({ words, token, onGameEnd }) {
  // --- Game State ---
  const [wordsHit, setWordsHit] = useState(0); 
  const [gameWords, setGameWords] = useState([]); // Active words on screen
  const [wordQueue, setWordQueue] = useState([]); // Words waiting to spawn
  const [spaceshipX, setSpaceshipX] = useState(window.innerWidth / 2 - 25);
  const [lasers, setLasers] = useState([]);
  const [gameState, setGameState] = useState("PLAYING"); // PLAYING, WON, LOST
  
  // --- UI/Feedback State ---
  const [isRecording, setIsRecording] = useState(false);
  const [feedback, setFeedback] = useState("Speak the words to destroy them!");

  // --- Refs ---
  const gameAreaRef = useRef(null);
  const gameLoopRef = useRef(null);
  const gameWidthRef = useRef(window.innerWidth);
  
  // --- Audio Recording Refs ---
  const recorderRef = useRef(null);
  const streamRef = useRef(null);

  // --- 1. Initialize Game ---
  useEffect(() => {
    if (words.length > 0) {
      gameWidthRef.current = gameAreaRef.current ? gameAreaRef.current.clientWidth : window.innerWidth;
      const initialWords = words.map((w, i) => createWord(w, i, gameWidthRef.current));
      setWordQueue(initialWords);
      setGameWords([]); // Start with no words on screen
      setSpaceshipX(gameWidthRef.current / 2 - 25); // Center ship
    }
  }, [words]); // Only runs once when words are loaded

  // --- 2. Keyboard Controls for Spaceship ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState !== "PLAYING") return;
      const gameWidth = gameWidthRef.current;

      setSpaceshipX((prevX) => {
        if (e.key === 'ArrowLeft') {
          return Math.max(0, prevX - SPACESHIP_SPEED); // Move left
        }
        if (e.key === 'ArrowRight') {
          return Math.min(gameWidth - 50, prevX + SPACESHIP_SPEED); // Move right
        }
        return prevX;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);


  // --- 3. Main Game Loop (The "Engine") ---
  useEffect(() => {
    if (gameState !== "PLAYING") {
       if(gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
       return;
    }

    const gameTick = () => {
      if (gameState !== "PLAYING") {
        cancelAnimationFrame(gameLoopRef.current);
        return;
      }

      const gameHeight = gameAreaRef.current ? gameAreaRef.current.clientHeight : window.innerHeight;
      let wordsHitFloor = 0;
      let wordsToDestroy = new Set();
      
      // --- LOGIC RE-ORDERED: STEP A: Move Lasers & Check Hits ---
      // We also make the collision logic more generous
      setLasers(currentLasers => 
        currentLasers.filter(laser => {
          laser.y -= LASER_SPEED;
          
          const targetWord = gameWords.find(w => w.id === laser.targetId);

          // --- MORE GENEROUS COLLISION LOGIC ---
          if (targetWord && 
              laser.y <= targetWord.y + 20 && // Laser is at or above the word
              laser.y >= targetWord.y - 20 && // Laser is not too far past
              laser.x >= targetWord.x - 20 && // Laser can be 20px left
              laser.x <= targetWord.x + (targetWord.word.length * 20) + 40) // Generous width check
          {
            wordsToDestroy.add(targetWord.id);
            return false; // Laser hit, remove it
          }
          
          return laser.y > 0; // Remove laser if it's off-screen
        })
      );

      // --- LOGIC RE-ORDERED: STEP B: Move Words & Check Floor ---
      setGameWords(currentGameWords => 
        currentGameWords.filter(word => {
          // If word is in the 'toDestroy' set, just remove it
          if (wordsToDestroy.has(word.id)) {
            return false;
          }
          
          // Otherwise, move it and check for floor collision
          word.y += GAME_SPEED;
          if (word.y > gameHeight - 80) { 
            wordsHitFloor++;
            return false; // Remove word
          }
          return true;
        })
      );
      
      // --- LOGIC RE-ORDERED: STEP C: Update Words Hit Counter ---
      // This now happens *before* the game over check
      if (wordsToDestroy.size > 0) {
        setWordsHit(prevHit => prevHit + wordsToDestroy.size);
        playSound("success"); // Word destroyed sound
      }

      // --- LOGIC RE-ORDERED: STEP D: Check Win/Loss State ---
      if (wordsHitFloor > 0) {
        // Game Over
        setGameState("LOST"); 
        playSound("retry");
      } else if (gameWords.length === 0 && lasers.length === 0 && wordQueue.length === 0 && words.length > 0) {
        // You Won
        setGameState("WON");
        playSound("complete");
      }

      // Continue loop
      gameLoopRef.current = requestAnimationFrame(gameTick);
    };
    
    // Start the loop
    gameLoopRef.current = requestAnimationFrame(gameTick);

    // Cleanup
    return () => {
      if(gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    }

  }, [gameState, gameWords, lasers, wordQueue, words.length]);


  // --- 4. Spawner Effect (One-by-one) ---
  useEffect(() => {
    if (gameState === 'PLAYING' && gameWords.length === 0 && wordQueue.length > 0) {
      // Spawn the next word
      const nextWord = wordQueue[0];
      const remainingQueue = wordQueue.slice(1);
      
      setWordQueue(remainingQueue);
      setGameWords([nextWord]); // Add the single new word to the game
    }
  }, [gameWords, wordQueue, gameState]);


  // --- 5. Voice Logic ---
  const playSound = (type) => {
    const sounds = {
      success: new Audio("https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3"),
      retry: new Audio("https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3"),
      complete: new Audio("https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3"),
      laser: new Audio("https://assets.mixkit.co/active_storage/sfx/3016/3016-preview.mp3"),
    };
    if (sounds[type]) {
      sounds[type].volume = 0.3;
      sounds[type].play().catch((e) => console.warn("Audio play failed", e));
    }
  };

  const handleSpokenWord = (spokenWord) => {
    if (gameState !== "PLAYING" || gameWords.length === 0) return;

    // Sanitize the spoken word
    const sanitizedSpokenWord = spokenWord.toUpperCase().trim().replace(/[^A-Z ]/g, "");

    if (!sanitizedSpokenWord) {
      setFeedback("💬 Didn't catch that. Try again!");
      return;
    }
    
    // Find the word on screen that is *included* in what you said.
    const targetWord = [...gameWords]
      .sort((a, b) => b.y - a.y) 
      .find(w => sanitizedSpokenWord.includes(w.word.toUpperCase()));

    if (targetWord) {
      // FIRE LASER!
      setFeedback(`🔥 Firing at ${targetWord.word}!`);
      playSound("laser");
      setLasers(prevLasers => [
        ...prevLasers,
        {
          id: Date.now(),
          x: spaceshipX + 22, 
          y: gameAreaRef.current.clientHeight - 80, 
          targetId: targetWord.id,
        },
      ]);
    } else {
      setFeedback(`💬 "${sanitizedSpokenWord}" not found! Try again!`);
    }
  };

  const sendToDeepgram = async (audioBlob) => {
    // This is now just a helper, it doesn't set state
    try {
      const formData = new FormData();
      formData.append('audioBlob', audioBlob, 'speech.webm');
      
      const res = await fetch("http://localhost:3001/api/check-speech", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      const alt = (data.results?.channels[0]?.alternatives[0]) || {};
      const spoken = alt.transcript || "";
      
      if(spoken) {
        handleSpokenWord(spoken);
      } else {
        setFeedback("💬 Didn't catch that. Try again!");
      }
      
    } catch (err) {
      console.error("Deepgram error", err);
      setFeedback("⚠️ Error. Try again!");
    }
  };

  // --- FASTER, NON-BLOCKING handleMicClick FUNCTION ---
  const handleMicClick = async () => {
    if (isRecording) return; // Don't allow clicking while already recording
    
    // Stop any old, lingering tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }

    // --- START RECORDING ---
    setIsRecording(true);
    setFeedback("🎙️ Listening...");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream; // Save stream
      
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder; // Save recorder
      
      const chunks = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      
      // --- THIS IS THE NEW LOGIC ---
      recorder.onstop = () => {
        // 1. Stop all tracks & clean up refs
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }
        recorderRef.current = null;
        
        // 2. Create the audio blob
        const audioBlob = new Blob(chunks, { type: "audio/webm" });
        
        // 3. RE-ENABLE THE BUTTON IMMEDIATELY
        setIsRecording(false); 
        setFeedback("Analyzing...");

        // 4. Send to server in the background (fire and forget)
        //    This does not block the user from clicking "Speak" again
        sendToDeepgram(audioBlob).then(() => {
          // When analysis is done, only update feedback if we are still "Analyzing"
          // This stops a late response from overwriting a new "Firing at..." message
          setFeedback(prev => (prev === "Analyzing..." ? "Ready!" : prev));
        });
      };
      
      recorder.start();
      
      // --- Auto-stop timer ---
      setTimeout(() => {
        if (recorderRef.current && recorderRef.current.state === "recording") {
          recorderRef.current.stop();
        }
      }, 1500); // 1.5 second recording

    } catch (err) {
      console.error("Mic access error", err);
      setFeedback("🎤 Mic error. Check permissions!");
      setIsRecording(false); // Allow retry
    }
  };
  // --- END OF NEW FUNCTION ---


  // --- 6. Render Logic (Updated for "Words Hit") ---
  const renderGameArea = () => {
    if (gameState === "WON") {
      return (
        <div className="game-end-screen">
          <h1>🎉 Spaceship Safe! 🎉</h1>
          {/* --- TEXT UPDATED --- */}
          <h2>You hit {wordsHit} words!</h2>
          <button className="next-btn" onClick={onGameEnd}>Continue</button>
        </div>
      );
    }

    if (gameState === "LOST") {
      return (
        <div className="game-end-screen">
          <h1>💥 Game Over 💥</h1>
          <h2>A word got past you!</h2>
          {/* --- TEXT UPDATED --- */}
          <h2>You hit {wordsHit} words.</h2>
          <button className="next-btn" onClick={onGameEnd}>Continue</button>
        </div>
      );
    }

    // --- This is the "PLAYING" state ---
    return (
      <div className="spaceship-game-area" ref={gameAreaRef}>
        <div className="stars-bg"></div>
        <div className="stars-bg-mid"></div>
        <div className="stars-bg-far"></div>
      
        <AnimatePresence>
          {gameWords.map((word) => (
            <motion.div
              key={word.id}
              className="word-obstacle-game"
              initial={{ x: word.x, y: word.y }}
              animate={{ x: word.x, y: word.y }}
              exit={{ scale: 0, opacity: 0, transition: { duration: 0.3 } }}
              transition={{ type: 'linear', duration: 0.05 }}
            >
              {word.word}
            </motion.div>
          ))}
        </AnimatePresence>
        
        <AnimatePresence>
          {lasers.map((laser) => (
            <motion.div
              key={laser.id}
              className="laser-beam-game"
              initial={{ x: laser.x, y: laser.y }}
              animate={{ y: laser.y }}
              exit={{ opacity: 0 }}
              transition={{ type: 'linear', duration: 0.05 }}
            />
          ))}
        </AnimatePresence>
        
        <motion.div
          className="spaceship-game"
          animate={{ x: spaceshipX }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        >
          {/* This is a CSS-only spaceship */}
          <div className="ship-body"></div>
          <div className="ship-wing-l"></div>
          <div className="ship-wing-r"></div>
          <div className="ship-engine"></div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="App-header" style={{ justifyContent: 'flex-start', paddingTop: '0', height: '100vh', position: 'relative', background: '#000', width: '100%' }}>
      <div className="spaceship-hud">
        {/* --- UPDATED HUD --- */}
        <h2>Words Hit: {wordsHit}</h2>
        <div className="feedback-banner" style={{ minHeight: '50px', background: 'transparent', color: 'white' }}>{feedback}</div>
        
        {/* --- UPDATED BUTTON --- */}
        <button className="mic-btn" onClick={handleMicClick} disabled={isRecording || gameState !== 'PLAYING'}>
          {isRecording ? "🎙️..." : "🎙️ Speak"}
        </button>
      </div>

      {renderGameArea()}

      {/* --- CSS is all the same as before --- */}
      <style>{`
        .spaceship-hud {
          width: 100%;
          text-align: center;
          padding: 10px;
          background: rgba(0,0,0,0.5);
          position: absolute;
          top: 0;
          left: 0;
          z-index: 10;
          color: white;
        }
        .spaceship-game-area {
          width: 100%;
          flex-grow: 1;
          position: relative;
          overflow: hidden;
          background: #000;
          border-radius: 15px;
          margin-top: 130px; /* Make space for the HUD */
          height: calc(100vh - 130px);
        }
        
        .word-obstacle-game {
          position: absolute;
          background: linear-gradient(145deg, #d90429, #ef233c);
          color: white;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: bold;
          font-size: 1.5rem;
          border: 2px solid #ff7f8c;
          white-space: nowrap;
          box-shadow: 0 0 15px #d90429, 0 0 5px #fff inset;
          text-shadow: 0 0 5px #fff;
        }

        .spaceship-game {
          position: absolute;
          bottom: 20px;
          left: 0;
          width: 50px;
          height: 60px;
        }
        .ship-body {
          width: 30px;
          height: 40px;
          background: #e0e0e0;
          border-radius: 15px 15px 0 0;
          position: absolute;
          left: 10px;
          border: 2px solid #aaa;
        }
        .ship-body::before { /* Cockpit */
          content: '';
          position: absolute;
          width: 16px;
          height: 10px;
          background: #00c896;
          border-radius: 5px;
          top: 10px;
          left: 5px;
          box-shadow: 0 0 10px #00c896 inset;
        }
        .ship-wing-l, .ship-wing-r {
          width: 0;
          height: 0;
          border-style: solid;
          position: absolute;
          bottom: 10px;
        }
        .ship-wing-l {
          border-width: 0 15px 25px 0;
          border-color: transparent #c0392b transparent transparent;
          left: -5px;
        }
        .ship-wing-r {
          border-width: 0 0 25px 15px;
          border-color: transparent transparent transparent #c0392b;
          right: -5px;
        }
        .ship-engine {
          width: 16px;
          height: 10px;
          background: #f39c12;
          border-radius: 0 0 5px 5px;
          position: absolute;
          bottom: -10px;
          left: 17px;
          box-shadow: 0 0 15px #f39c12;
          animation: engine-flicker 0.1s infinite alternate;
        }
        @keyframes engine-flicker {
          from { box-shadow: 0 0 15px #f39c12, 0 0 25px #ff7b00; }
          to { box-shadow: 0 0 10px #f39c12, 0 0 20px #ff7b00; }
        }

        .laser-beam-game {
          position: absolute;
          width: 6px;
          height: 25px;
          background-color: #00c896;
          box-shadow: 0 0 10px #00c896, 0 0 20px #00c896;
          border-radius: 3px;
          left: 0;
        }
        
        .game-end-screen {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: white;
          z-index: 5; /* Above stars */
          position: relative;
        }

        /* --- STARFIELD BACKGROUND --- */
        @keyframes move-stars-far {
          from { background-position: 0 0; }
          to { background-position: 0 10000px; }
        }
        @keyframes move-stars-mid {
          from { background-position: 0 0; }
          to { background-position: 0 20000px; }
        }
        @keyframes move-stars-near {
          from { background-position: 0 0; }
          to { background-position: 0 30000px; }
        }
        
        .stars-bg, .stars-bg-mid, .stars-bg-far {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          height: 100%;
        }

        .stars-bg-far {
          background-image: 
            radial-gradient(1px 1px at 20px 30px, #fff, rgba(0,0,0,0)),
            radial-gradient(1px 1px at 40px 70px, #fff, rgba(0,0,0,0)),
            radial-gradient(1px 1px at 90px 40px, #fff, rgba(0,0,0,0)),
            radial-gradient(1px 1px at 130px 80px, #fff, rgba(0,0,0,0)),
            radial-gradient(1px 1px at 160px 120px, #fff, rgba(0,0,0,0));
          background-repeat: repeat;
          background-size: 200px 200px;
          animation: move-stars-far 200s linear infinite;
          z-index: 1;
        }

        .stars-bg-mid {
          background-image: 
            radial-gradient(1px 1px at 50px 100px, #fff, rgba(0,0,0,0)),
            radial-gradient(1px 1px at 100px 150px, #fff, rgba(0,0,0,0)),
            radial-gradient(2px 2px at 150px 50px, #fff, rgba(0,0,0,0));
          background-repeat: repeat;
          background-size: 250px 250px;
          animation: move-stars-mid 100s linear infinite;
          z-index: 2;
        }
        
        .stars-bg {
          background-image: 
            radial-gradient(2px 2px at 30px 120px, #fff, rgba(0,0,0,0)),
            radial-gradient(2px 2px at 80px 40px, #fff, rgba(0,0,0,0)),
            radial-gradient(3px 3px at 170px 180px, #fff, rgba(0,0,a,0));
          background-repeat: repeat;
          background-size: 300px 300px;
          animation: move-stars-near 50s linear infinite;
          z-index: 3;
        }
      `}</style>
    </div>
  );
}

export default SpaceshipRevisionGame;